pg_dump -U postgres -h localhost -p 5432 -t "customer" -t "order" -t "product" --data-only onlinestore > onlinestoredata.sql


pg_dump -U postgres -h localhost -p 5432 onlinestore > onlinestore.sql

psql -U myuser -h localhost -p 5432 onlinestore < onlinestore.sql
psql -U myuser -h localhost -p 5435 onlinestore-expressjs-db
 < onlinestoredata.sql



const table = 'mytable';
const data = await knex.select().table(table);
const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'db/seeds', `${table}.js`);

fs.writeFileSync(
  seedPath,
  `exports.seed = function(knex) {
    return knex('${table}').insert(${JSON.stringify(data)});
  };`
);