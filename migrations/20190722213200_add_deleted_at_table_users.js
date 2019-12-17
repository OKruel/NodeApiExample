
exports.up = function(knex, Promise) {
    return knex.schema.alterTable('users', table => {
        table.timestamp('deletedAt')
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('users', table => {
        table.dropColumn('deletedAt')
    })
  
};
