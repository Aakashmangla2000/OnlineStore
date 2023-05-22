const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

const userDb = require("../models/user")
const reqBodyValidations = require("../validations/userValidation")
const roles = require("../middleware/roles")

const getAll = async (req, res) => {
    try {
        const users = await userDb.find();
        res.status(200).json({ noOfRows: users.length, data: users });
    } catch (err) {
        res.status(500).json({ err: err });
    }
};

const generateAccessToken = ({ username, userId, roleId }) => {
    return jwt.sign(user = { username, userId, roleId }, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

const login = async (req, res) => {
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
                    let [userRole] = await userDb.getUserRole(user.id);
                    if (!userRole) {
                        [userRole] = await userDb.addUserRole(user.id);
                    }
                    const token = generateAccessToken({ username, userId: user.id, roleId: userRole.roleId });
                    res.status(200).json({ status: `Welcome ${username}`, token });
                }
            });
    } catch (err) {
        res.status(500).json({ err: err });
    }
};

const getById = async (req, res) => {
    const userId = req.params.id
    if (userId == req.user.userId || req.user.roleId == roles.ADMIN)
        try {
            const [user] = await userDb.findById(userId);
            if (!user)
                res.status(404).json({ status: `User with id ${userId} not found` });
            else {
                const { password, deletedAt, ...userD } = user
                res.status(200).json({ data: userD });
            }
        } catch (err) {
            res.status(500).json({ err: err });
        }
    else
        res.status(403).json({ message: "Not allowed!" });
};

const signup = async (req, res) => {
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
                const [userRole] = await userDb.addUserRole(user.id);
                const token = generateAccessToken({ username, userId: user.id, roleId: userRole.roleId });
                res.status(201).json({ status: "Successfully added new user", token, data: user });
            }
            else
                res.status(400).json({ status: "Username already taken" });
        } catch (err) {
            res.status(500).json({ err: err });
        }
    });
};

const updatePassword = async (req, res) => {
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
};

const update = async (req, res) => {
    const userId = req.user.userId
    const { firstName, lastName, phone, address } = req.body
    const error = reqBodyValidations.updateUser(firstName, lastName, phone, address)
    if (error.length > 0) {
        return res.status(400).json({ error });
    }
    if (userId == req.user.userId || req.user.roleId == roles.ADMIN)
        try {
            const [user] = await userDb.updateUser(userId, { firstName, lastName, phone, address });
            res.status(201).json({ status: `Successfully updated user with id ${userId}`, data: user });
        } catch (err) {
            res.status(500).json({ err: err });
        }
    else
        res.status(403).json({ message: "Not allowed!" });
};

const deleteUser = async (req, res) => {
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
};

module.exports = {
    getAll,
    login,
    getById,
    signup,
    updatePassword,
    update,
    deleteUser
};