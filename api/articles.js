const queries = require('./queries')

module.exports = app => {
    const { existsOrError, notExistsOrError } = app.api.validation

    const save = (req, res) => {
        const article = { ...req.body }
        if (req.params.id) article.id = req.params.id

        try {
            existsOrError(article.name, 'Please, insert a valid name!')
            existsOrError(article.description, 'Please, insert a valid description!')
            existsOrError(article.categoryId, 'Please, insert a category!')
            existsOrError(article.userId, 'Please, insert a user name!')
            existsOrError(article.content, 'Please, insert the content!')
        } catch (msg) {
            return res.json(msg)
        }

        if (article.id) {
            app.db('articles')
                .update(article)
                .where({ id: article.id })
                .then(x => res.status(204).send('Article updated!'))
                .catch(err => res.status(500).send(err))
        } else {
            app.db('articles')
                .insert(article)
                .then(x => res.status(204).send('Article saved'))
                .catch(err => res.status(500).send(err))
        }
    }

    const remove = (req, res) => {
        try {
            app.db('articles')
                .where({ id: req.params.id })
                .del()
                .then(rowsDeleted => rowsDeleted > 0 ? res.json(`${rowsDeleted} deleted`) : res.json('Article not found!'))
        } catch (err) {
            res.status(500).send(err)
        }
    }

    const limit = 10;

    const get = async (req, res) => {
        const page = req.query.page || 1

        const resultDb = await app.db('articles').count('id').first()

        const count = parseInt(resultDb.count)

        app.db('articles')
            .select('id', 'name', 'description')
            .limit(limit).offset(page * limit - limit)
            .then(articles => res.json({ data: articles, count, limit }))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('articles')
            .where({ id: req.params.id })
            .first()
            .then(article => {
                article.content = article.content.toString()
                return res.json(article)
            })
            .catch(err => res.status(500).send(err))
    }

    const getByCategory = async (req, res) => {
        const categoryId = req.params.id
        const page = req.query.page || 1
        const categories = await app.db.raw(queries.categoryWithChildren, categoryId)
        const ids = categories.rows.map(c => c.id)

        app.db({a: 'articles', u: 'users'})
            .select('a.id', 'a.name', 'a.description', 'a.imageUrl', { author: 'u.name' })
            .limit(limit).offset(page * limit - limit)
            .whereRaw('?? = ??', ['u.id', 'a.userId'])
            .whereIn('categoryId', ids)
            .orderBy('a.id', 'desc')
            .then(articles => res.json(articles))
            .catch(err => res.status(500).send(err))
    }
    return { save, remove, get, getById, getByCategory }
}