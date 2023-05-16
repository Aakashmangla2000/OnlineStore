const DB = require('../db');
const queryBuilder = require("../validations/queryBuilder")

const find = () => DB('product').select().orderBy('id');

const findAllWithFilters = ({ name, price, quantity }) => DB('product')
    .where((qb) => {
        if (name)
            qb.where('name', 'like', `%${name}%`);
        if (price)
            queryBuilder.filter(qb, price, '"price"')
        if (quantity)
            queryBuilder.filter(qb, quantity, '"quantity"')
    })
    .orderBy('id');

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