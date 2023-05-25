const elasticClient = require("../elasticClient")
const router = require("express").Router();

router.get("/:index", async (req, res) => {
    const index = req.params.index;
    try {
        const resp = await elasticClient.indices.exists({
            index
        })
        if (resp) {
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

// router.post("/", async (req, res) => {
//     const result = await elasticClient.index({
//         index: "posts",
//         document: {
//             title: req.body.title,
//             author: req.body.author,
//             content: req.body.content,
//         },
//     });

//     res.send(result);
// });

// router.delete("/", async (req, res) => {
//     const result = await elasticClient.delete({
//         index: "posts",
//         id: req.query.id,
//     });

//     res.json(result);
// });

module.exports = router;