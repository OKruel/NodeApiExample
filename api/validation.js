// Este arquivo serve para criar algumas validações que todo sistema deve ter como por Exemplo:
// verificar se um ID é valido, se o usuario inseriu o valor, se a senha tem mais de 6 digitos, se o email é realmente um email.

module.exports = app => {
    //1 - Esta validação confere apenas se um valor existe e caso não exista joga um erro.
    function existsOrError(value, msg) {
        if(!value) throw msg;
        if(Array.isArray(value) && value.length === 0) throw msg;
        if(typeof value === 'string' && !value.trim()) throw msg;
    }
    //==================================================================================
    
    //2 - Esta validação confere apenas se um valor não existe e caso exista joga um erro.
    function notExistsOrError (value, msg) {
        try {
            existsOrError(value, msg);
        } catch(msg) {
            return;
        } throw msg;
    }
    //==================================================================================
    
    //3 - Esta validação confere se dois valores são iguais e caso não sejam joga um erro.
    function equalsOrError(valueA, valueB, msg) {
        if(valueA !== valueB) throw msg;
        console.log(valueA , valueB , msg)
        console.log('Estou conferindo se as senhas são iguais')
    }

    return {existsOrError, notExistsOrError, equalsOrError};
};
