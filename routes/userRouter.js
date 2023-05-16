const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

const userDb = require("../models/user")
const DB = require("../db")
const validateId = require("../middleware/validateId")
const reqBodyValidations = require("../validations/userValidation")
const auth = require("../middleware/auth")
const authorize = require("../middleware/authorize")
const roles = require("../middleware/roles")

router.get("/", auth, authorize(roles.ADMIN), async (req, res) => {
    try {
        const users = await userDb.find();
        res.status(200).json({ noOfRows: users.length, data: users });
    } catch (err) {
        res.status(500).json({ err: err });
    }
});

function generateAccessToken({ username, userId, roleId }) {
    return jwt.sign(user = { username, userId, roleId }, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

router.get("/login", async (req, res) => {
    const { username, password } = req.body
    const error = reqBodyValidations.validateUsernamePass(username, password)
    if (error.length > 0) {
        return res.status(400).json({ error });
    }
    try {
        const [user] = await userDb.findByUsername(username);
        if (!user) res.status(404).json({ message: "User not found" });
        else
            bcrypt.compare(password, user.password, async (err, result) => {
                if (!result)
                    res.status(401).json({ message: "Wrong Password" });
                else {
                    let [userRole] = await DB("userRoles").select().where("userId", user.id)
                    if (!userRole) {
                        [userRole] = await DB("userRoles").insert({ userId: user.id, roleId: 1 }).returning("*")
                    }
                    const token = generateAccessToken({ username, userId: user.id, roleId: userRole.roleId });
                    res.status(200).json({ status: `Welcome ${username}`, token });
                }
            });
    } catch (err) {
        res.status(500).json({ err: err });
    }
});

// router.get("/logout", async (req, res) => {
//     const userId = req.session.userId
//     if (userId)
//         try {
//             delete req.session.userId;
//             res.status(200).json({ status: `User logged out successfully` });
//         } catch (err) {
//             res.status(500).json({ err: err });
//         }
//     else
//         res.status(404).json({ status: `No user is logged in` });
// });

router.get("/:id", auth, validateId, async (req, res) => {
    const userId = req.params.id
    if (userId == req.user.userId)
        try {
            const [user] = await userDb.findById(userId);
            if (!user)
                res.status(404).json({ status: `User with id ${userId} not found` });
            else {
                const { password, id, deletedAt, ...userD } = user
                res.status(200).json(userD);
            }
        } catch (err) {
            res.status(500).json({ err: err });
        }
    else
        res.status(403).json({ message: "Not allowed!" });
});

router.post("/signup", async (req, res) => {
    const { firstName, lastName, phone, address, username, password } = req.body
    const errors = reqBodyValidations.validate(firstName, lastName, phone, address, username, password)
    if (errors.length > 0) {
        return res.status(400).json({ error: errors });
    }
    bcrypt.hash(password, 10).then(async (hashedPassword) => {
        try {
            const user = await userDb.findByUsername(username);
            if (user.length === 0) {
                const [user] = await userDb.addUser({ firstName, lastName, phone, address, username, password: hashedPassword });
                const token = generateAccessToken({ username, userId: user.id });
                res.status(201).json({ status: "Successfully added new user", token });
            }
            else
                res.status(400).json({ status: "Username already taken" });
        } catch (err) {
            res.status(500).json({ err: err });
        }
    });
});

router.put("/updatePassword", auth, validateId, async (req, res) => {
    const userId = req.user.userId
    const { oldPassword, newPassword } = req.body
    const error = reqBodyValidations.validatePasswords(oldPassword, newPassword)
    if (error.length > 0) {
        return res.status(400).json({ error });
    }
    try {
        const [user] = await userDb.findById(userId);
        if (!user)
            res.status(404).json({ status: `User with id ${userId} not found` });
        else {
            bcrypt.compare(oldPassword, user.password, (err, result) => {
                if (!result)
                    res.status(401).json({ message: "Wrong Password" });
                else {
                    bcrypt.hash(newPassword, 10).then(async (hashedPassword) => {
                        await userDb.updateUser(userId, { password: hashedPassword });
                        res.status(201).json({ status: `Successfully updated password for user with id ${userId}` });

                    });
                }
            });
        }
    } catch (err) {
        res.status(500).json({ err: err });
    }
});

router.put("/:id", auth, validateId, async (req, res) => {
    const userId = req.user.userId
    const { firstName, lastName, phone, address } = req.body
    const error = reqBodyValidations.updateUser(firstName, lastName, phone, address)
    if (error.length > 0) {
        return res.status(400).json({ error });
    }
    try {
        const user = await userDb.updateUser(userId, { firstName, lastName, phone, address });
        res.status(201).json({ status: `Successfully updated user with id ${userId}` });
    } catch (err) {
        res.status(500).json({ err: err });
    }
});

router.delete("/:id", auth, authorize(roles.ADMIN), validateId, async (req, res) => {
    const userId = req.params.id
    const user = await userDb.findById(userId);
    if (user.length !== 0) {
        try {
            await userDb.updateUser(userId, { deletedAt: new Date() });
            res.status(200).json({ status: `Successfully deleted user with id ${userId}` });
        } catch (err) {
            res.status(500).json({ err: err });
        }
    }
    else
        res.status(404).json({ status: `No user found with id ${userId}` });
});

module.exports = router;