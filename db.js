const environment = process.env.DATABASE_ENVIRONMENT || 'production';
const configuration = require('./knexfile')[environment];
const knex = require('knex')(configuration);

module.exports = knex;