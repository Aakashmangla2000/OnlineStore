const elasticClient = require("../elasticClient")
const router = require("express").Router();

router.get("/", (req, res) => {
    res.redirect("http://localhost:3000/");
});

router.post("/create-post", async (req, res) => {
    const result = await elasticClient.index({
        index: "posts",
        document: {
            title: req.body.title,
            author: req.body.author,
            content: req.body.content,
        },
    });

    res.send(result);
});
router.delete("/remove-post", async (req, res) => {
    const result = await elasticClient.delete({
        index: "posts",
        id: req.query.id,
    });

    res.json(result);
});
router.get("/search", async (req, res) => {
    const result = await elasticClient.search({
        index: "posts",
        query: { fuzzy: { title: req.query.query } },
    });

    res.json(result);
});
router.get("/posts", async (req, res) => {
    try {
        const result = await elasticClient.search({
            index: "posts",
            query: { match_all: {} },
        });

        res.send(result);
    }
    catch (err) {
        res.status(500).json({ message: err.message, error: err })
    }
});

module.exports = router;