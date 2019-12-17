const schedule = require('node-schedule')

module.exports = app => {
    schedule.scheduleJob('UpdateMongoDb', '*/1 * * * * ', async function () {
        const usersCount = await app.db('users').count('id').first()
        const categoriesCount = await app.db('categories').count('id').first()
        const articlesCount = await app.db('articles').count('id').first()

        const { Status } = app.api.status

        const lastStatus = await Status.findOne({}, {}, { sort: { 'createdAt': -1 } })
        console.log(lastStatus);

        const status = new Status({
            users: usersCount.count,
            categories: categoriesCount.count,
            articles: articlesCount.count,
            createdAt: new Date()
        })

        const changeUsers = !lastStatus || status.users !== lastStatus.users;
        const changeCategories = !lastStatus || status.categories !== lastStatus.categories
        const changeArticles = !lastStatus || status.articles !== lastStatus.articles

        if(changeUsers || changeCategories || changeArticles) {
            status.save().then(() => console.log('[Status] Estatistics updated!'))
        }

    })
}