const router = require("express").Router();

const productDb = require("../models/product")
const DB = require("../db")
const queryBuilder = require("../validations/queryBuilder")

const validateId = require("../middleware/validateId")
const productValidations = require("../validations/productValidation")

router.get("/", async (req, res) => {
    try {
        const fitleredProducts = await filter(req.query)
        res.status(200).json({ noOfRows: fitleredProducts.length, data: fitleredProducts });
    } catch (err) {
        res.status(500).json({ err: err });
    }
});

const filter = async ({ name, price, quantity }) => {
    const fitleredProducts = await DB('product')
        .where((qb) => {
            if (name)
                qb.where('name', 'like', `%${name}%`);
            if (price)
                queryBuilder.filter(qb, price, '"price"')
            if (quantity)
                queryBuilder.filter(qb, quantity, '"quantity"')
        }).orderBy('id');
    return fitleredProducts
}

router.get("/:id", validateId, async (req, res) => {
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
});

router.post("/", async (req, res) => {
    const { name, description, price, quantity } = req.body
    const errors = productValidations.validate({ name, description, price, quantity });
    if (errors.length != 0) {
        return res.status(400).json({ error: errors });
    }
    try {
        const product = await productDb.addProduct({ name, description, price, quantity });
        res.status(201).json({ status: "Successfully added new product" });
    } catch (err) {
        res.status(500).json({ err: err });
    }
});

router.post("/upsert", async (req, res) => {
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
});

router.put("/:id", validateId, async (req, res) => {
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
});

router.delete("/:id", validateId, async (req, res) => {
    const productId = req.params.id
    try {
        const product = await productDb.deleteById(productId);
        res.status(201).json({ status: `Successfully deleted product with id ${productId}` });
    } catch (err) {
        res.status(500).json({ err: err });
    }
});

module.exports = router;