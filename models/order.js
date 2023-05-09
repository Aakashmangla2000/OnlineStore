const DB = require('../db');

const find = () =>
    DB.select(DB.raw(`o.id,o."userId",o."createdAt",o."totalPrice",o."location",array_agg(distinct x.v || jsonb_build_object('name', p."name") || jsonb_build_object('description', p."description")) as "productDetails"`))
        .from(DB.raw('"order" as o'))
        .crossJoin(DB.raw(`lateral unnest(o."productDetails") as x(v)`))
        .join(DB.raw(`product as p`), DB.raw(`p.id`), '=', DB.raw(`cast(x.v->>'productId' as integer)`))
        .groupBy('o.id')
        .orderBy('id');

const findAll = (userId) => find().where(DB.raw(`o."userId"`), userId);

const findById = (id) => find().where(DB.raw(`o.id`), id);

const addOrder = (order) => DB('order').insert(order).returning("*");

const updateOrder = (id, updatedDetails) => DB('order').where("id", id).update(updatedDetails)

const deleteById = (id) => DB('order').where("id", id).del();

module.exports = {
    findAll,
    findById,
    addOrder,
    updateOrder,
    deleteById,
}