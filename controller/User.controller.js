const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const elasticClient = require("../elasticClient")

const userDb = require("../models/user")
const reqBodyValidations = require("../validations/userValidation")
const roles = require("../middleware/roles");

const getAll = async (req, res) => {
    try {
        const data = await elasticClient.search({
            size: 1000,
            index: "users",
            query: { match_all: {} },
        });
        res.status(200).json({ noOfRows: data.hits.hits.length, data: data.hits.hits });
    } catch (err) {
        res.status(500).json({ err: err });
    }
};

const index = async (req, res) => {
    try {
        const users = await userDb.find();
        body = bulkIndexData(users)
        const ress = await elasticClient.bulk({
            refresh: true,
            index: 'users',
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
        res.status(200).json({ noOfRows: users.length, data: users, ress });
    } catch (err) {
        console.log(err)
        res.status(500).json({ err: err });
    }
};

const bulkIndexData = (data) => {
    const body = [];
    for (const document of data) {
        delete document.deletedAt
        body.push(
            { index: { _index: 'users', _id: document.id } },
            document,
        );
    }
    return body;
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
        const result = await elasticClient.search({
            index: "users",
            query: { match: { username: username } },
        });
        if (result.hits.total.value == 0) res.status(404).json({ message: "User not found" });
        else {
            const user = result.hits.hits[0]._source;
            bcrypt.compare(password, user.password, async (err, result) => {
                if (!result)
                    res.status(401).json({ message: "Wrong Password" });
                else {
                    const [userRoles] = await userDb.getUserRole(user.id)
                    const token = generateAccessToken({ username, userId: user.id, roleId: userRoles.roleId });
                    res.status(200).json({ status: `Welcome ${username}`, token, data: user });
                }
            });
        }
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
                const { password, id, deletedAt, ...userD } = user
                res.status(200).json(userD);
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
                delete user.deletedAt;
                const result = await elasticClient.index({
                    index: "users",
                    id: user.id,
                    document: user,
                });
                res.status(201).json({ status: "Successfully added new user", token, user });
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
            const user = await userDb.updateUser(userId, { firstName, lastName, phone, address });
            res.status(201).json({ status: `Successfully updated user with id ${userId}` });
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
    deleteUser,
    index
};