exports.up = async (knex) => {
    await
        knex.schema.alterTable('customer', (table) => {
            table.timestamp('deletedAt', { useTz: true }).defaultsTo(null);
            table.dropUnique('username');
            table.unique(['username'], { indexName: 'customer_username_unique', predicate: knex.where('deletedAt', null) });
        })
};

exports.down = async (knex) => {
    await knex.schema.alterTable('customer', (table) => {
        table.dropIndex(['username'], 'customer_username_unique');
        table.dropColumn('deletedAt');
        table.unique('username');
    })
};