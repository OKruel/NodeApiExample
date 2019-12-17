//É neste arquivo que é criado os metodos de CRUD para a rota '/users'.
//=====================================================================

//Biblioteca utilizada para criptografar a senha do usuário.
const bcrypt = require('bcrypt-nodejs');
//=====================================================================

//Utilizando a arquitetura do consign para centralizar tudo dentro da variavel APP.
module.exports = app => {

    const { existsOrError, notExistsOrError, equalsOrError } = app.api.validation;

    //Utilização da biblioteca BCRYPT-NODEJS.
    //Dois metodos são utilizados para criptografar a senha.
    const encryptPassword = password => {
        //1 - Salt() - Aceita um parametro que define quantas rodadas de criptografia vc deseja (custo computacional, segurança da criptografia)
        const salt = bcrypt.genSaltSync(10);
        //2 - Hash() - Exige 2 parametros que é a senha do usuario e a opção salt de criptografia.
        return bcrypt.hashSync(password, salt);
    }

    //CRUD - A função SAVE contem as operações de CREATE e UPDATE.
    //ESTAS OPERAÇÕES SÃO ASSINCRONAS pois dependem de uma operação realizada no servidor. 
    const save = async (req, res) => {
        //Cria-se um novo objeto USER para enviar ao servidor.
        //A criação ocorre pela clonagem do BODY da requisição.
        const user = { ...req.body };

        //Aqui a função inclui a operação UPDATE avaliando se a requisição possui um ID como parametros
        //Neste caso a rota utilizada deverá prever tambem a existencia do parametro em sua url.
        //Caso exista um ID como parametro ele será incluído no objeto USER que foi clonado do BODY da requisição.
        if (req.params.id) user.id = req.params.id;

        if(!req.originalUrl.startsWith('/users')) user.admin = false
        if(!req.user || !req.user.admin) user.admin = false

        //Inicia a fase de verificação de erros e validações.
        try {
            //Aplicam-se todas as validações criada no arquivo VALIDATION.JS e inseridas na variavel APP
            existsOrError(user.name, 'Please, enter a valid name!');
            existsOrError(user.email, 'Please, enter a valid e-mail address!');
            existsOrError(user.password, 'Please, enter a valid password!');
            existsOrError(user.confirmPassword, 'Please, enter the confirmation of the password!');
            equalsOrError(user.password, user.confirmPassword, 'The passwords do not match!');

            //IDA AO BANCO DE DADOS ATRAVES DO KNEX QUE ESTA DENTRO DE APP.DB. SINTAXE DO KNEX.
            //Busca na tabela 'users' o primeiro registro que tenha o valor email igual ao do objeto clonado 
            const userFromDb = await app.db('users').where({ email: user.email }).first();
            console.log(userFromDb);

            //Validação - Caso não tenha objeto clonado USER não tenha ID verifica se ja existe o email no Bando de Dados
            //Caso já exista impede que seja salvo.
            if (!user.id) { notExistsOrError(userFromDb, 'User already registered!') }

            //Caso não passe na validação envia uma resposta com a mensagem para cada situação.
        } catch (msg) { return res.status(400).send(msg) }

        //Criptografa o password com o metodo criado acima.
        user.password = encryptPassword(user.password);
        //Deleta o atributo de confirmação do password do objeto clonado.
        delete user.confirmPassword;

        //Aqui executa-se efetivamente as operações de CREATE/UPDATE.
        if (user.id) {
            //Caso tenha ID faz um UPDATE usando a sintaxe do KNEX
            app.db('users')
                //Recebe como parametro o objeto clonado para update
                .update(user)
                //Localiza por ID o objeto a ser atualizado e efetivamente ATUALIZA
                .where({ id: user.id })
                //Filtra o select para somente quando a coluna deletedAt estiver nula por causa do Soft Delete de usuario
                .whereNull('deletedAt')
                //Responde com um status de sucesso
                .then(_ => res.status(204).send())
                //Caso haja um erro poe a culpa no servidor e manda a resposta do erro.
                .catch(err => res.status(500).send(err))
        } else {
            app.db('users')
                //Recebe como parametro o objeto clonado e efetivamente realiza a inserção
                .insert(user)
                //Responde com um status de sucesso
                .then(_ => res.status(204).send())
                //Caso haja um erro poe a culpa no servidor e manda a resposta do erro.
                .catch(err => res.status(500).send(err))
        }
    };

    //CRUD - A função GET realiza as operações de REQUEST/REQUESTPORID.
    const get = (req, res) => {
        //Verifica se a requisição não chegou com parametro Id na URL.
        if (!req.params.id) {
            //Acessa a tabela 'users' com a sintaxe do KNEX(Parecida com a sintaxe do SQL)
            app.db('users')
                //Faz um select buscando as colunas abaixo indicadas.
                .select('id', 'name', 'email', 'admin')
                //Filtra o select para somente quando a coluna deletedAt estiver nula por causa do Soft Delete de usuario
                .whereNull('deletedAt')
                //Envia a resposta ao FrontEnd no formato Json de tudo que encontrou no SELECT
                .then(users => res.json(users))
                //Caso haja um erro poe a culpa no servidor e manda a resposta do erro.
                .catch(err => res.status(500).send(err))
            //Caso a url da requisição tenha chegado com Id nos parametros
        } else {
            //Acessa a tabela 'users' com a sintaxe do KNEX(Parecida com a sintaxe do SQL)
            app.db('users')
                //Faz um select buscando as colunas abaixo indicadas.
                .select('id', 'name', 'email', 'admin')
                //Filtra o select para somente quando a coluna deletedAt estiver nula por causa do Soft Delete de usuario
                .whereNull('deletedAt')
                //Utiliza um filtro no parametro
                .where({ id: req.params.id })
                .first()
                //Envia a resposta ao FrontEnd no formato Json de tudo que encontrou no SELECT
                .then(users => res.json(users))
                //Caso haja um erro poe a culpa no servidor e manda a resposta do erro.
                .catch(err => res.status(500).send(err))
        }
    }

    //DELETE - O usuário é removido por completo do sistema
    // const remove = (req, res) => {
    //     try {
    //         app.db('users')
    //             .where({ id: req.params.id })
    //             .del()
    //             .then(rowsDeleted => rowsDeleted > 0 ? res.json(`${rowsDeleted} deleted!`) : res.json('User does not exist!'))
    //     } catch (err) {
    //         res.status(500).send(err)
    //     }
    // }

    //SOFT DELETE - O usuário não é removido do sistema e sim desassociado e substituido de seus relacionamentos do DB(data marcada) mas 
    const remove = async (req, res) => {
        try {
            const articles = app.db('articles').where({UserId: req.params.id})
            notExistsOrError(articles, 'User has articles.')

            const rowsUpdated = await app.db('users').update({deletedAt: new Date()}).where({id: req.params.id})
            existsOrError(rowsUpdated, 'User not found!')

            res.status(204).send()
        } catch(msg) {
            res.status(400).send(msg)
        }
    }

    //Retorna as funçoes SAVE, GET e REMOVE para uso público da aplicação.
    return { save, get, remove };
};