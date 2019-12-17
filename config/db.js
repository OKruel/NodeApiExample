//1 - É neste arquivo que estão os dados de configuração da conexão com o Banco de Dados.
const config = require('../knexfile');
//=====================================================

//2 - Inicia a biblioteca do Knex.
// O Knex retorna uma função igual ao Express e recebe como parametro as configuracoes de conexão ao Banco de Dados.
const knex = require('knex')(config);
//=====================================================

//3 - Ao iniciar o BackEnd(npm start) carrega automaticamente as migrations da primeira ate a ultima.
// Para as migrations serem realizadas automaticamente É PRECISO CRIAR O BANCO DE DADOS ANTES.
// SE VC TIVER UM SERVIDOR COM BALANCEAMENTO DE CARGA PODE NÃO SER INTERESSANTE CRIAR/EVOLUIR O BANCO DE DADOS DESSA FORMA.
knex.migrate.latest([config]);
//=====================================================


module.exports = knex;