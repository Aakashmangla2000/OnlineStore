const DB = require('../db');
const queryBuilder = require("../validations/queryBuilder")
const elasticClient = require("../elasticClient")

const find = () => DB('product').select().orderBy('id');

const findAllWithFilters = async ({ name, price, quantity }) => {
    let query = [];
    if (name)
        query.push({
            match: {
                name
            }
        })
    if (price)
        query.push(queryBuilder.filter(price, "price"))
    if (quantity)
        query.push(queryBuilder.filter(quantity, "quantity"))
    const data = await elasticClient.search({
        size: 1000,
        index: "products",
        query: { bool: { must: query } },
    });
    return data.hits.hits
}

const findById = (id) => DB('product').select().where("id", id);

const addProduct = (product) => DB('product').insert(product).returning("*");

const updateProduct = (id, updatedDetails) => DB('product').returning("*").where("id", id).update(updatedDetails);

const upsertProduct = (updatedDetails) => {
    return DB("product")
        .returning(DB.raw(`*, case when xmax::text::int > 0 then 'update' else 'insert' end "opType"`))
        .insert(updatedDetails)
        .onConflict("id")
        .merge()
}

const deleteById = (id) => DB('product').where("id", id).del();

module.exports = {
    find,
    findById,
    addProduct,
    updateProduct,
    deleteById,
    upsertProduct,
    findAllWithFilters
}