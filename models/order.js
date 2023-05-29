const DB = require('../db');
const queryBuilder = require("../validations/queryBuilder")
const elasticClient = require("../elasticClient")

const find = () =>
    DB.select(DB.raw(`o.id,o."userId",o."createdAt",o."totalPrice",jsonb_build_object('lon', ST_X("location"::geometry),'lat', ST_Y("location"::geometry)) as "location" ,array_agg(distinct x.v || jsonb_build_object('name', p."name") || jsonb_build_object('description', p."description")) as "productDetails"`))
        .from(DB.raw('"order" as o'))
        .crossJoin(DB.raw(`lateral unnest(o."productDetails") as x(v)`))
        .join(DB.raw(`product as p`), DB.raw(`p.id`), '=', DB.raw(`cast(x.v->>'productId' as integer)`))
        .groupBy('o.id')
        .orderBy('id');

const findAllWithFilters = async ({ createdAt, totalPrice, productsId, productsPrice, productsQuantity, latitude, longitude, distance }, userId) => {
    if (productsId) {
        productsId = productsId.split(',');
    }
    let query = [];
    let filter;
    if (createdAt) {
        query.push(queryBuilder.filter(createdAt, "createdAt"))
    }
    if (totalPrice)
        query.push(queryBuilder.filter(totalPrice, "totalPrice"))
    if (productsId) {
        filter = {
            terms: {
                "productDetails.productId": productsId
            }
        }
    }
    if (productsPrice)
        query.push(queryBuilder.filter(productsPrice, "productDetails.price"))
    if (productsQuantity)
        query.push(queryBuilder.filter(productsQuantity, "productDetails.quantity"))
    if (latitude && longitude && distance)
        query.push({
            "geo_distance": {
                "distance": distance,
                "location": {
                    "lat": latitude,
                    "lon": longitude
                }
            }
        })
    const data = await elasticClient.search({
        size: 1000,
        index: "orders",
        query: { bool: { must: query, filter } },
    });
    return data.hits.hits
}

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
    findAllWithFilters
}