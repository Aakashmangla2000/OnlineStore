const router = require("express").Router();

const productController = require("../controller/Product.controller")

const validateId = require("../middleware/validateId")
const authorize = require("../middleware/authorize")
const roles = require("../middleware/roles")

router.get("/", productController.getAll);
router.get("/:id", validateId, productController.getById);
router.post("/", authorize(roles.ADMIN), productController.add);
router.post("/upsert", authorize(roles.ADMIN), productController.upsert);
router.put("/:id", authorize(roles.ADMIN), validateId, productController.update);
router.delete("/:id", authorize(roles.ADMIN), validateId, productController.deleteProduct);

module.exports = router;