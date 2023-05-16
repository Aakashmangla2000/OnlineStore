/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable('roles', (table) => {
        table.increments('id').primary();
        table.string('name', 50).notNullable();
    }).then(async () =>
        await knex.schema.createTable('userRoles', (table) => {
            table.increments('id').primary();
            table.integer('userId').notNullable().references('customer.id')
                .onDelete('CASCADE');
            table.integer('roleId').notNullable().references('roles.id')
                .onDelete('RESTRICT');
        })).then(() =>
            knex('roles').insert([
                { name: "customer" },
                { name: "admin" },
            ])
        )
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTable('userRoles')
        .then(() => knex.schema.dropTable('roles'))
};
