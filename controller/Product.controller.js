const productDb = require("../models/product")
const DB = require('../db');

const productValidations = require("../validations/productValidation")

const getAll = async (req, res) => {
    try {
        const fitleredProducts = await productDb.findAllWithFilters(req.query)
        res.status(200).json({ noOfRows: fitleredProducts.length, data: fitleredProducts });
    } catch (err) {
        res.status(500).json({ err: err });
    }
};

const getById = async (req, res) => {
    const productId = req.params.id
    try {
        const product = await productDb.findById(productId);
        if (product.length == 0)
            res.status(404).json({ message: `No product with id ${productId} found` });
        else
            res.status(200).json({ data: product });
    } catch (err) {
        res.status(500).json({ err: err });
    }
};

const add = async (req, res) => {
    // const { name, description, price, quantity } = req.body
    // const errors = productValidations.validate({ name, description, price, quantity });
    // if (errors.length != 0) {
    //     return res.status(400).json({ error: errors });
    // }
    try {
        const rows = [{ name: "p1", description: "d1", price: 100, quantity: 100, extraData: [1, 2] }, { name: "p1", description: "d1", price: 100, quantity: 100, extraData: [1, 2] }]
        const chunkSize = 30;
        DB.batchInsert('product', rows, chunkSize)
            .returning(['id'])
            .then(function (data) { console.log(data) })
            .catch(function (error) { console.log(error) });
        // const product = await productDb.addProduct({ name, description, price, quantity });
        res.status(201).json({ status: "Successfully added new product" });
    } catch (err) {
        res.status(500).json({ err: err });
    }
};

const upsert = async (req, res) => {
    const newProduct = req.body
    try {
        let flag = undefined;
        if (newProduct.id !== undefined) {
            flag = await productDb.findById(newProduct.id);
            flag = flag.length > 0 ? flag : undefined
        }
        const product = await productDb.upsertProduct(newProduct);
        res.status(201).json({ status: product[0].opType === 'insert' ? "Successfully added new product" : "Updated product details", product });
    } catch (err) {
        res.status(500).json({ err: err });
    }
};

const update = async (req, res) => {
    const productId = req.params.id
    const { name, description, price, quantity } = req.body
    const errors = productValidations.validateOnUpdate({ name, description, price, quantity });
    if (errors.length != 0) {
        return res.status(400).json({ error: errors });
    }
    try {
        const product = await productDb.findById(productId);
        if (product.length == 0)
            res.status(404).json({ message: `No product with id ${productId} found` });
        else {
            const updatedProduct = await productDb.updateProduct(productId, { name, description, price, quantity });
            res.status(201).json({ status: `Successfully updated product with id ${productId}`, updatedProduct });
        }
    } catch (err) {
        res.status(500).json({ err: err });
    }
};

const deleteProduct = async (req, res) => {
    const productId = req.params.id
    try {
        const product = await productDb.deleteById(productId);
        res.status(201).json({ status: `Successfully deleted product with id ${productId}` });
    } catch (err) {
        res.status(500).json({ err: err });
    }
};

module.exports = {
    getAll,
    getById,
    upsert,
    add,
    update,
    deleteProduct
};