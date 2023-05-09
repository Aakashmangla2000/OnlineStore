exports.up = function (knex) {
    return knex.schema.alterTable('table_name', function (table) {
        table.timestamp('createdAt').defaultTo(knex.fn.now());
    });
};