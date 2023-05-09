// Update with your config settings.
const PGDB_PASSWORD = process.env.PGDB_PASSWORD;

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: 'localhost',
      database: 'onlinestore',
      user: 'postgres',
      password: PGDB_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    parseNumeric: true,
    migrations: {
      tableName: 'knex_migrations',
      directory: `${__dirname}/db/migrations`
    },
    seeds: {
      directory: `${__dirname}/db/seeds`
    }
  }
};