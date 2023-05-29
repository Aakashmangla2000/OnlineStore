const orderDb = require("../models/order")
const DB = require("../db")

const orderValidations = require("../validations/orderValidation")

const getAll = async (req, res) => {
    const userId = req.user.userId
    try {
        const fitleredOrders = await orderDb.findAllWithFilters(req.query, userId)
        res.status(200).json({ noOfRows: fitleredOrders.length, data: fitleredOrders });
    } catch (err) {
        res.status(500).json({ err: err });
    }
};

const getById = async (req, res) => {
    const userId = req.user.userId
    const orderId = req.params.id
    try {
        const order = await orderDb.findById(orderId);
        if (order.length == 0)
            res.status(404).json({ message: `No order with id ${orderId} found` });
        else {
            if (order[0].userId == userId) {
                delete order[0].userId;
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
    const { latitude, longitude } = location;
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
                    const order = await DB.transaction(async trx => {
                        productDetails.forEach(async (product) => {
                            const prod = products.find(p => p.id == product.productId);
                            product.price = prod.price;
                            await trx('product')
                                .where({ id: prod.id })
                                .update({ quantity: prod.quantity - product.quantity });
                        })
                        return await trx("order").insert({ totalPrice, productDetails, location: `POINT(${longitude} ${latitude})`, userId }).returning("*");
                    })
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
        const { latitude, longitude } = location;
        updatedOrder.location = `POINT(${longitude} ${latitude})`;
    }
    try {
        const [prevOrder] = await orderDb.findById(orderId);
        if (!prevOrder)
            res.status(404).json({ message: `No order with id ${orderId} found` });
        else {
            if (prevOrder.userId == userId) {
                const ids = updatedProductDetails.map(p => p.productId)
                await DB('product')
                    .whereIn('id', ids)
                    .then(async (products) => {
                        if (updatedProductDetails.length !== products.length)
                            throw 'Product ids are not valid'
                        else {
                            updatedProductDetails.map((updatedProduct) => {
                                const result = products.find(p => p.id == updatedProduct.productId)
                                const prevProd = prevOrder.productDetails.find(p => p.productId == updatedProduct.productId)
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
                                const product = products.find(p => p.id == updatedProduct.productId);
                                let index = -1;
                                const prevProd = prevOrder.productDetails.find((p, ind) => { if (p.productId == updatedProduct.productId) { index = ind; return true; } });
                                updatedProduct.price = product.price;
                                let inc = 0;
                                if (prevProd) {
                                    prevOrder.productDetails.splice(index, 1)
                                    inc = prevProd.quantity
                                }
                                await trx('product')
                                    .where({ id: updatedProduct.productId })
                                    .update({ quantity: product.quantity - updatedProduct.quantity + inc });
                            })
                            if (prevOrder.productDetails.length > 0) {
                                const ids = prevOrder.productDetails.map(p => p.productId)
                                await DB('product')
                                    .whereIn('id', ids)
                                    .then(async (products) => {
                                        prevOrder.productDetails.forEach(async (prevProduct) => {
                                            const product = products.find(p => p.id == prevProduct.productId);
                                            await trx('product')
                                                .where({ id: prevProduct.productId })
                                                .update({ quantity: product.quantity + prevProduct.quantity });
                                        })
                                    })
                            }
                            return await trx("order").update(updatedOrder).where('id', orderId).returning("*");
                        })
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
    getAll,
    getById,
    add,
    update,
    deleteOrder
};