const router = require("express").Router();
const bcrypt = require("bcrypt");

const userDb = require("../models/user")
const validateId = require("../middleware/validateId")
const reqBodyValidations = require("../validations/userValidation")

router.get("/", async (req, res) => {
    try {
        const users = await userDb.find();
        res.status(200).json({ noOfRows: users.length, data: users });
    } catch (err) {
        res.status(500).json({ err: err });
    }
});

router.get("/session", async (req, res) => {
    const userId = req.session.userId
    if (userId)
        try {
            const user = await userDb.findById(userId);
            if (user.length == 0)
                res.status(404).json({ status: `User not found` });
            else
                res.status(200).json(user);
        } catch (err) {
            res.status(500).json({ err: err });
        }
    else
        res.status(404).json({ status: `No user is logged in` });

});

router.get("/login", async (req, res) => {
    const { username, password } = req.body
    const error = reqBodyValidations.validateUsernamePass(username, password)
    if (error) {
        return res.status(400).json({ error });
    }
    try {
        const [user] = await userDb.findByUsername(username);
        if (!user) res.status(404).json({ message: "User not found" });
        else
            bcrypt.compare(password, user.password, (err, result) => {
                if (!result)
                    res.status(401).json({ message: "Wrong Password" });
                else {
                    req.session.userId = user.id;
                    res.status(200).json({ status: `Welcome ${username}` });
                }
            });
    } catch (err) {
        res.status(500).json({ err: err });
    }
});

router.get("/logout", async (req, res) => {
    const userId = req.session.userId
    if (userId)
        try {
            delete req.session.userId;
            res.status(200).json({ status: `User logged out successfully` });
        } catch (err) {
            res.status(500).json({ err: err });
        }
    else
        res.status(404).json({ status: `No user is logged in` });
});

router.get("/:id", validateId, async (req, res) => {
    const userId = req.params.id
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
});

router.post("/signup", async (req, res) => {
    const { firstName, lastName, phone, address, username, password } = req.body
    const error = reqBodyValidations.validate(firstName, lastName, phone, address, username, password)
    if (error) {
        return res.status(400).json({ error });
    }
    bcrypt.hash(password, 10).then(async (hashedPassword) => {
        try {
            const user = await userDb.findByUsername(username);
            if (user.length === 0) {
                await userDb.addUser({ firstName, lastName, phone, address, username, password: hashedPassword });
                res.status(201).json({ status: "Successfully added new user" });
            }
            else
                res.status(400).json({ status: "Username already taken" });
        } catch (err) {
            res.status(500).json({ err: err });
        }
    });
});

router.put("/updatePassword/:id", validateId, async (req, res) => {
    const userId = req.params.id
    const { oldPassword, newPassword } = req.body
    const error = reqBodyValidations.validatePasswords(oldPassword, newPassword)
    if (error) {
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

router.put("/:id", validateId, async (req, res) => {
    const userId = req.params.id
    const { firstName, lastName, phone, address } = req.body
    const error = reqBodyValidations.updateUser(firstName, lastName, phone, address)
    if (error) {
        return res.status(400).json({ error });
    }
    try {
        const user = await userDb.updateUser(userId, { firstName, lastName, phone, address });
        res.status(201).json({ status: `Successfully updated user with id ${userId}` });
    } catch (err) {
        res.status(500).json({ err: err });
    }
});

router.delete("/:id", validateId, async (req, res) => {
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