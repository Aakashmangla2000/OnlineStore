const router = require("express").Router();

const orderDb = require("../models/order")
const productDb = require("../models/product")
const DB = require("../db")

const validateId = require("../middleware/validateId")
const orderValidations = require("../validations/orderValidation")

router.get("/", async (req, res) => {
    const userId = req.session.userId
    try {
        const fitleredOrders = await filter(req.query, userId)
        res.status(200).json({ noOfRows: fitleredOrders.length, data: fitleredOrders });
    } catch (err) {
        res.status(500).json({ err: err });
    }
});

const filter = async ({ createdAt, totalPrice, productsId, productsPrice, productsQuantity, latitude, longitude, distance }, userId) => {
    if (productsId) {
        productsId = productsId.split(',');
    }
    const fitleredProducts = orderDb.findAll(userId)
        .where((qb) => {
            if (createdAt) {
                const { gt, lt, eq, bt } = createdAt;
                if (gt)
                    qb.where('createdAt', '>', new Date(gt));
                else if (lt)
                    qb.where('createdAt', '<', new Date(lt));
                else if (eq)
                    qb.where('createdAt', '=', new Date(eq));
                else if (bt) {
                    dts = bt.split(',').map(dt => new Date(dt))
                    qb.whereBetween('createdAt', [dts[0], dts[1]])
                }
            }
            if (totalPrice) {
                const { gt, lt, eq } = totalPrice;
                if (gt)
                    qb.where('totalPrice', '>', gt);
                else if (lt)
                    qb.where('totalPrice', '<', lt);
                else if (eq)
                    qb.where('totalPrice', '=', eq);
            }
            if (productsId) {
                qb.whereIn(DB.raw(`x.v->>'productId'`), productsId)
            }
            if (productsPrice) {
                const { gt, lt, eq } = productsPrice;
                if (gt)
                    qb.where(DB.raw(`x.v->'price'`), '>', gt);
                else if (lt)
                    qb.where(DB.raw(`x.v->'price'`), '<', lt);
                else if (eq)
                    qb.where(DB.raw(`x.v->'price'`), '=', eq);
            }
            if (productsQuantity) {
                const { gt, lt, eq } = productsQuantity;
                if (gt)
                    qb.where(DB.raw(`x.v->'quantity'`), '>', gt);
                else if (lt)
                    qb.where(DB.raw(`x.v->'quantity'`), '<', lt);
                else if (eq)
                    qb.where(DB.raw(`x.v->'quantity'`), '=', eq);
            }
            if (latitude && longitude && distance) {
                qb.where(DB.raw(`ST_DWithin(o.location, ST_GeomFromText('POINT(${longitude} ${latitude})'), ${distance})`), '=', true);
            }
        });
    return fitleredProducts
}

router.get("/:id", validateId, async (req, res) => {
    const userId = req.session.userId
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
});

router.post("/", async (req, res) => {
    const userId = req.session.userId;
    const { totalPrice, productDetails, location } = req.body
    const errors = orderValidations.validate(totalPrice, productDetails, location);
    if (errors.length != 0) {
        return res.status(400).json({ error: errors });
    }
    const { latitude, longitude } = location;
    Promise.all(productDetails.map(async (product) => {
        const [prod] = await DB('product')
            .where('quantity', '>', product.quantity)
            .where('id', product.productId);
        if (!prod || product.quantity == 0)
            throw 'Product id is not valid / Stock not available'
        return prod[0];
    })).then(async (products) => {
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
    }).catch((err) => {
        res.status(404).json({ err: err });
    })
});

router.put("/:id", validateId, async (req, res) => {
    const userId = req.session.userId
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
                Promise.all(updatedProductDetails.map(async (updatedProduct) => {
                    const prevProd = prevOrder.productdetails.find(p => p.productId == updatedProduct.productId)
                    if (!prevProd || updatedProduct.quantity == 0)
                        throw 'Product id is not valid / Invalid Quantity'
                    const [product] = await DB('product')
                        .where('id', updatedProduct.productId)
                        .where((qb) => {
                            if (prevProd && updatedProduct.quantity > prevProd.quantity)
                                qb.where('quantity', '>', updatedProduct.quantity - prevProd.quantity);
                        })
                    if (!product)
                        throw 'Stock not available'
                    return product;
                })).then(async (products) => {
                    const newOrder = await DB.transaction(async trx => {
                        updatedProductDetails.forEach(async (updatedProduct) => {
                            const product = products.find(p => p.id == updatedProduct.productId);
                            const prevProd = prevOrder.productdetails.find(p => p.productId == updatedProduct.productId)
                            updatedProduct.price = product.price;
                            let inc = 0;
                            if (prevProd)
                                inc = prevProd.quantity
                            await trx('product')
                                .where({ id: updatedProduct.productId })
                                .update({ quantity: product.quantity - updatedProduct.quantity + inc });
                        })
                        return await trx("order").update(updatedOrder).where('id', orderId).returning("*");
                    })
                    res.status(200).json({ status: `Successfully updated order with id ${orderId}`, data: newOrder });
                }).catch((err) => {
                    res.status(404).json({ err: err });
                })
            } else {
                res.status(403).json({ message: "Not Authorised" });
            }
        }
    } catch (err) {
        res.status(500).json({ err: err });
    }
});

// router.delete("/:id", async (req, res) => {
//     const orderId = req.params.id
//     try {
//         const order = await orderDb.deleteById(orderId);
//         res.status(201).json({ status: `Successfully deleted order with id ${orderId}` });
//     } catch (err) {
//         res.status(500).json({ err: err });
//     }
// });

module.exports = router;