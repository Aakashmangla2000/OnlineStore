const elasticClient = require("../elasticClient")

const getAll = async (indexName) =>
    await elasticClient.search({
        size: 1000,
        index: indexName,
        query: { match_all: {} },
    });


const getById = async (indexName, docId) =>
    await elasticClient.get({
        index: indexName,
        id: docId
    });


const index = async (indexName, doc, docId) =>
    await elasticClient.index({
        index: indexName,
        id: docId,
        document: doc,
    });

const update = async (indexName, document, docId) =>
    await elasticClient.update({
        index: indexName,
        id: docId,
        doc: document,
    });

const deleteDoc = async (indexName, docId) =>
    await elasticClient.delete({
        index: indexName,
        id: docId
    });

const termSearch = async (indexName, columnName, val) =>
    await elasticClient.search({
        index: indexName,
        query: { term: { [columnName]: { value: val } } },
    });

module.exports = {
    getAll,
    getById,
    index,
    update,
    deleteDoc,
    termSearch
}