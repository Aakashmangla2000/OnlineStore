const { Client } = require("@elastic/elasticsearch");
const fs = require("fs")
require("dotenv").config();

const elasticClient = new Client({
    node: 'https://localhost:9200',
    auth: {
        username: process.env.ELASTIC_USERNAME,
        password: process.env.ELASTIC_PASSWORD,
    },
    log: 'trace',
    tls: {
        ca: fs.readFileSync('./http_ca.crt'),
        rejectUnauthorized: false
    }
});

module.exports = elasticClient;