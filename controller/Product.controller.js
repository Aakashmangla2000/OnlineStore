const productDb = require("../models/product")
const elasticService = require("../models/es-queries")
const elasticClient = require("../elasticClient")

const productValidations = require("../validations/productValidation")

const getAll = async (req, res) => {
    try {
        const fitleredProducts = await productDb.findAllWithFilters(req.query)
        const products = fitleredProducts.map((hit) => {
            let product = hit._source;
            return product
        })
        res.status(200).json({ noOfRows: products.length, data: products });
    } catch (err) {
        res.status(500).json({ err: err });
    }
};

const index = async (req, res) => {
    try {
        const fitleredProducts = await productDb.find()
        console.log(fitleredProducts)
        body = bulkIndexData(fitleredProducts)
        const ress = await elasticClient.bulk({
            refresh: true,
            index: 'products',
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
        res.status(200).json({ noOfRows: fitleredProducts.length, data: fitleredProducts, ress });
    } catch (err) {
        console.log(err)
        res.status(500).json({ err: err });
    }
};

const bulkIndexData = (data) => {
    const body = [];
    for (const document of data) {
        body.push(
            { index: { _index: 'products', _id: document.id } },
            document,
        );
    }
    return body;
};

const getById = async (req, res) => {
    const productId = req.params.id
    try {
        await elasticService.getById("products", productId)
            .then((data) => {
                const product = data._source
                res.status(200).json({ data: product });
            })
            .catch((err) => {
                return res.status(404).json({ message: `No product with id ${productId} found` });
            })
    } catch (err) {
        res.status(500).json({ err: err });
    }
};

const add = async (req, res) => {
    const { name, description, price, quantity } = req.body
    const errors = productValidations.validate({ name, description, price, quantity });
    if (errors.length != 0) {
        return res.status(400).json({ error: errors });
    }
    try {
        const [product] = await productDb.addProduct({ name, description, price, quantity });
        await elasticService.index("products", product, product.id);
        res.status(201).json({ status: "Successfully added new product", data: product });
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
            const [updatedProduct] = await productDb.updateProduct(productId, { name, description, price, quantity });
            updatedProduct.price = +updatedProduct.price
            await elasticService.index("products", updatedProduct, productId);
            res.status(200).json({ status: `Successfully updated product with id ${productId}`, updatedProduct });
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
    index,
    getAll,
    getById,
    upsert,
    add,
    update,
    deleteProduct
};