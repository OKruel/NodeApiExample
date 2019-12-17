const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/knowledge_base', { useNewUrlParser: true })
    .catch(err => {
        const errMsg = 'Unable to connect to MongoDb'
        const sucMsg = 'MongoDb connected'
        if (err) {
            console.log('\x1b[41m%s\x1b[37m', errMsg, '\x1b[0m');
            console.log(err);
        } else {
            console.log('\x1b[41m%s\x1b[37m', sucMsg, '\x1b[0m');
        }
    })