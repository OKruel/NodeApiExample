module.exports = app => {
    const Status = app.mongoose.model('Status', {
        users: Number,
        categories: Number,
        articles: Number,
        createdAt: Date
    })

    const get = (req, res) => {
        Status.findOne({}, {}, { sort: { 'createdAt': -1 } })
            .then(status => {
                const defaultStatus = {
                    users: 0,
                    categories: 0,
                    articles: 0,
                }
                res.json(status || defaultStatus)
            })
    }

    return { get, Status }
}