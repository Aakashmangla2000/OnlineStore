const router = require("express").Router();

const userController = require("../controller/User.controller")

const validateId = require("../middleware/validateId")
const auth = require("../middleware/auth")
const authorize = require("../middleware/authorize")
const roles = require("../middleware/roles")

router.get("/index", userController.index);
router.get("/", auth, authorize(roles.ADMIN), userController.getAll);
router.get("/login", userController.login);
router.get("/:id", auth, validateId, userController.getById);
router.post("/signup", userController.signup);
router.put("/updatePassword", auth, validateId, userController.signup);
router.put("/:id", auth, validateId, userController.update);
router.delete("/:id", auth, authorize(roles.ADMIN), validateId, userController.deleteUser);

module.exports = router;