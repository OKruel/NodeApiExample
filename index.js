const app = require('express')();
const consign = require('consign');
const db = require('./config/db');
const mongoose = require('mongoose')

require('./config/mongodb')

app.db = db;
app.mongoose = mongoose


consign()
.include('./config/passport.js')
.then('./config/middlewares.js')
.then('./api/validation.js')
.then('./api')
.then('./schedule')
.then('./config/routes.js')
.into(app);

app.db('users')
    .count('id')
    .then(x => {
        if(x) {console.log(x, 'PostGresDB access successful!')} else {console.log('DB access unavailable!!')} 
    })

mongoose.connect('mongodb://localhost/knowledge_base', {useNewUrlParse: true})
    .then(x => {
        if(x) {console.log(x, 'MongoDB access successful!')} else {console.log('DB access unavailable!!')} 
    })
        


app.listen('3000', () => console.log('Servidor Versão Inicial - Projeto ----knowledge_final---- executando na porta 3000'));