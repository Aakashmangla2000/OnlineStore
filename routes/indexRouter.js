const elasticClient = require("../elasticClient")
const router = require("express").Router();

router.get("/:index", async (req, res) => {
    const index = req.params.index;
    try {
        const exists = await elasticClient.indices.exists({
            index
        })
        if (exists) {
            const result = await elasticClient.indices.getMapping({ index });
            res.status(200).json(result);
        }
        else {
            res.status(404).json({ message: "Index not found" })
        }
    }
    catch (error) {
        res.status(500).json({ error })
    }
});

router.post("/:index", async (req, res) => {
    const index = req.params.index;
    const properties = req.body
    try {
        const exists = await elasticClient.indices.exists({
            index
        })
        if (!exists) {
            const result = await elasticClient.indices.create({
                index,
                mappings: properties
            });
            res.status(201).json({ message: "Created mapping successfully", result });
        }
        else {
            res.status(400).json({ message: "Index already exists" })
        }
    }
    catch (error) {
        res.status(500).json({ error });
    }
});

router.delete("/:index", async (req, res) => {
    const index = req.params.index;
    try {
        const exists = await elasticClient.indices.exists({
            index
        })
        if (exists) {
            const result = await elasticClient.indices.delete({
                index
            });
            res.json({ message: "Deleted index successfully", result });
        }
        else {
            res.status(404).json({ message: "Index not found" })
        }
    } catch (error) {
        res.status(500).json({ error });
    }

});

module.exports = router;