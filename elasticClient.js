const { Client } = require("@elastic/elasticsearch");
const fs = require("fs")
require("dotenv").config({ path: ".elastic.env" });

const elasticClient = new Client({
    node: 'https://localhost:9200',
    auth: {
        username: process.env.ELASTIC_USERNAME,
        password: process.env.ELASTIC_PASSWORD,
    },
    caFingerprint: 'E5:35:DA:62:6A:88:72:BE:E2:BF:0A:AB:9B:B1:99:BE:88:71:07:1B:BD:65:92:12:13:5A:8A:86:88:09:F6:03',
    tls: {
        ca: fs.readFileSync('./http_ca.crt'),
        rejectUnauthorized: false
    }
});

module.exports = elasticClient;