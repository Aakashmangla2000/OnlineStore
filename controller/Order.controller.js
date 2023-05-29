const orderDb = require("../models/order")
const DB = require("../db")
const elasticClient = require("../elasticClient")

const orderValidations = require("../validations/orderValidation")

const getAll = async (req, res) => {
    const userId = req.user.userId
    try {
        const fitleredOrders = await orderDb.findAllWithFilters(req.query, userId)
        const orders = fitleredOrders.map((hit) => {
            let order = hit._source;
            return order
        })
        res.status(200).json({ noOfRows: orders.length, data: orders });
    } catch (err) {
        res.status(500).json({ err: err });
    }
};

const index = async (req, res) => {
    const userId = req.user.userId
    try {
        const orders = await orderDb.findAllWithFilters({}, userId);
        body = bulkIndexData(orders)
        const ress = await elasticClient.bulk({
            refresh: true,
            index: 'orders',
            body,
        });

        if (ress.errors != false) {
            console.error('Bulk indexing errors:');
            for (const item of bulkResponse.items) {
                if (item.index && item.index.error) {
                    console.error(
                        `Error indexing document ${item.index._id}:`,
                        item.index.error
                    );
                }
            }
        } else {
            console.log('Bulk indexing completed successfully.');
        }
        res.status(200).json({ noOfRows: orders.length, data: orders, ress });
    } catch (err) {
        console.log(err)
        res.status(500).json({ err: err });
    }
};

const bulkIndexData = (data) => {
    const body = [];
    for (const document of data) {
        body.push(
            { index: { _index: 'orders', _id: document.id } },
            document,
        );
    }
    return body;
};

const getById = async (req, res) => {
    const userId = req.user.userId
    const orderId = req.params.id
    try {
        const data = await elasticClient.search({
            index: "orders",
            query: { match: { id: orderId } },
        });
        if (data.hits.total.value == 0)
            res.status(404).json({ message: `No order with id ${orderId} found` });
        else {
            const order = data.hits.hits[0]._source
            if (order.userId == userId || req.user.roleId == roles.ADMIN) {
                delete order.userId;
                res.status(200).json({ data: order });
            } else {
                res.status(403).json({ message: "Not Authorised" });
            }
        }
    } catch (err) {
        res.status(500).json({ err: err });
    }
};

const add = async (req, res) => {
    const userId = req.user.userId;
    const { totalPrice, productDetails, location } = req.body
    const errors = orderValidations.validate(totalPrice, productDetails, location);
    if (errors.length != 0) {
        return res.status(400).json({ error: errors });
    }
    const { lat, lon } = location;
    const ids = productDetails.map(p => p.productId)
    await DB('product')
        .whereIn('id', ids)
        .then(async products => {
            try {
                if (productDetails.length !== products.length)
                    throw 'Product ids are not valid'
                else {
                    productDetails.map((product) => {
                        const result = products.find(p => p.id == product.productId)
                        if (result.quantity < product.quantity)
                            throw 'Stock not available'
                        else if (product.quantity == 0)
                            throw 'Quantity invalid'
                        return result;
                    })
                    const [order] = await DB.transaction(async trx => {
                        productDetails.forEach(async (product) => {
                            const prod = products.find(p => p.id == product.productId);
                            product.price = prod.price;
                            const [updatedProduct] = await trx('product')
                                .where({ id: prod.id })
                                .update({ quantity: prod.quantity - product.quantity }).returning("*");
                            await elasticClient.update({
                                index: "products",
                                id: prod.id,
                                doc: updatedProduct,
                            });
                        })
                        return await trx("order").insert({ totalPrice, productDetails, location: `POINT(${lon} ${lat})`, userId }).returning("*");
                    })
                    const result = await elasticClient.index({
                        index: "orders",
                        id: order.id,
                        document: {
                            id: order.id, userId: order.userId, createdAt: order.createdAt, totalPrice, location, productDetails
                        },
                    });
                    res.status(201).json({ status: "Successfully added new order", data: order });
                }
            }
            catch (err) {
                res.status(400).json({ err: err });
            }
        })
};

const update = async (req, res) => {
    const userId = req.user.userId
    const orderId = req.params.id
    const { totalPrice, updatedProductDetails, location } = req.body
    const errors = orderValidations.validateOnUpdate(totalPrice, updatedProductDetails, location);
    if (errors.length != 0) {
        return res.status(400).json({ error: errors });
    }
    const updatedOrder = {};
    if (totalPrice !== undefined) {
        updatedOrder.totalPrice = totalPrice;
    }
    if (updatedProductDetails !== undefined) {
        updatedOrder.productDetails = updatedProductDetails;
    }
    if (location !== undefined) {
        const { lat, lon } = location;
        updatedOrder.location = `POINT(${lon} ${lat})`;
    }
    try {
        //get previous order
        const [prevOrder] = await orderDb.findById(orderId);
        if (!prevOrder)
            res.status(404).json({ message: `No order with id ${orderId} found` });
        else {
            if (prevOrder.userId == userId) {
                //get product ids
                const ids = updatedProductDetails.map(p => p.productId)
                //get details for all those products
                await DB('product')
                    .whereIn('id', ids)
                    .then(async (products) => {
                        //Some product id must not exist
                        if (updatedProductDetails.length !== products.length)
                            throw 'Product ids are not valid'
                        else {
                            updatedProductDetails.map((updatedProduct) => {
                                //find in products
                                const result = products.find(p => p.id == updatedProduct.productId)
                                //check if updated product exists in previous order
                                const prevProd = prevOrder.productDetails.find(p => p.productId == updatedProduct.productId)

                                //if yes and quantity is more than previous quantity otherwise no issues
                                if (prevProd && updatedProduct.quantity > prevProd.quantity) {
                                    // if stock is less than required
                                    if (result.quantity < (updatedProduct.quantity - prevProd.quantity))
                                        throw 'Stock not available for prod id ' + result.id
                                }
                                else if (updatedProduct.quantity == 0)
                                    throw 'Quantity invalid for product id ' + updatedProduct.productId
                                else if (!prevProd && result.quantity < updatedProduct.quantity)
                                    throw 'Stock not available for product id ' + result.id
                                return result;
                            });
                        }
                        const [newOrder] = await DB.transaction(async trx => {
                            updatedProductDetails.forEach(async (updatedProduct) => {
                                //find in products
                                const product = products.find(p => p.id == updatedProduct.productId);
                                let index = -1;
                                //check if updated product exists in previous order then return prev order and save index value
                                const prevProd = prevOrder.productDetails.find((p, ind) => { if (p.productId == updatedProduct.productId) { index = ind; return true; } });
                                updatedProduct.price = product.price;
                                let inc = 0;
                                //if prev product exists
                                if (prevProd) {
                                    //remove that previous product
                                    prevOrder.productDetails.splice(index, 1)
                                    //returning previously ordered stock
                                    inc = prevProd.quantity
                                }
                                const [uProd] = await trx('product')
                                    .where({ id: updatedProduct.productId })
                                    .update({ quantity: product.quantity - updatedProduct.quantity + inc }).returning("*");
                                await elasticClient.update({
                                    index: "products",
                                    id: updatedProduct.productId,
                                    doc: uProd,
                                });
                            })
                            //return remaining stock if product from previous order in not in the updated order
                            if (prevOrder.productDetails.length > 0) {
                                const ids = prevOrder.productDetails.map(p => p.productId)
                                await DB('product')
                                    .whereIn('id', ids)
                                    .then(async (products) => {
                                        prevOrder.productDetails.forEach(async (prevProduct) => {
                                            const product = products.find(p => p.id == prevProduct.productId);
                                            const [uProd] = await trx('product')
                                                .where({ id: prevProduct.productId })
                                                .update({ quantity: product.quantity + prevProduct.quantity }).returning("*");
                                            await elasticClient.update({
                                                index: "products",
                                                id: prevProduct.productId,
                                                doc: uProd,
                                            });
                                        })
                                    })
                            }
                            return await trx("order").update(updatedOrder).where('id', orderId).returning("*");
                        })
                        const result = await elasticClient.update({
                            index: "orders",
                            id: orderId,
                            doc: {
                                totalPrice, location, productDetails: updatedProductDetails
                            },
                        });
                        res.status(200).json({ status: `Successfully updated order with id ${orderId}`, data: newOrder });
                    })
            } else {
                res.status(403).json({ message: "Not Authorised" });
            }
        }
    } catch (err) {
        res.status(400).json({ err: err });
    }
};

const deleteOrder = async (req, res) => {
    const orderId = req.params.id
    try {
        const order = await orderDb.deleteById(orderId);
        res.status(201).json({ status: `Successfully deleted order with id ${orderId}` });
    } catch (err) {
        res.status(500).json({ err: err });
    }
};

module.exports = {
    index,
    getAll,
    getById,
    add,
    update,
    deleteOrder
};