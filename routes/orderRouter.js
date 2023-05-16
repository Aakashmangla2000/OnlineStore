const router = require("express").Router();

const orderController = require("../controller/Order.controller")

const validateId = require("../middleware/validateId")
const authorize = require("../middleware/authorize")
const roles = require("../middleware/roles")

router.get("/", orderController.getAll);
router.get("/:id", validateId, orderController.getById);
router.post("/", orderController.add);
router.put("/:id", validateId, orderController.update);
router.delete("/:id", authorize(roles.ADMIN), orderController.deleteOrder);

module.exports = router;