exports.up = async (knex) => {
    await
        knex.raw('CREATE EXTENSION IF NOT EXISTS postgis;')
            .then(() =>

                knex.schema.createTable('customer', (table) => {
                    table.increments('id').primary();
                    table.string('firstName', 50).notNullable();
                    table.string('lastName', 50);
                    table.text('username').notNullable().unique();
                    table.text('phone').notNullable();
                    table.text('address').notNullable();
                    table.text('password').notNullable();
                })
            )
            .then(() =>
                knex.schema.createTable('product', (table) => {
                    table.increments('id').primary();
                    table.string('name', 50).notNullable();
                    table.text('description');
                    table.decimal('price', 10, 2).notNullable();
                    table.integer('quantity').notNullable().defaultsTo(0)
                })
            )
            .then(() =>
                knex.schema.createTable('order', (table) => {
                    table.increments('id').primary();
                    table.integer('userId')
                        .notNullable()
                        .references('customer.id')
                        .onDelete('CASCADE');
                    table.timestamp('createdAt', { useTz: true }).notNullable().defaultTo(knex.fn.now());
                    table.decimal('totalPrice', 14, 2).notNullable();
                    table.specificType('productDetails', 'jsonb[]').notNullable().defaultsTo("{}");
                    table.geography('location').notNullable();
                })
            )
};

exports.down = async (knex) => {
    await knex.schema.dropTable('order')
        .then(() => knex.schema.dropTable('product'))
        .then(() => knex.schema.dropTable('customer'))
        .then(() => knex.raw('DROP EXTENSION IF EXISTS postgis;'));
};