const DB = require('../db');

const find = () => DB('customer').select().where("deletedAt", null);

const findById = (id) => DB('customer').select().where("id", id).andWhere("deletedAt", null);

const findByUsername = (username) => DB('customer').select("id", "username", "password").where("username", username).andWhere("deletedAt", null);

const addUser = (user) => DB('customer').insert(user);

const updateUser = (id, updatedDetails) => DB('customer').where("id", id).where("deletedAt", null).update(updatedDetails)

const deleteById = (id) => DB('customer').where("id", id).del();

module.exports = {
    find,
    findById,
    addUser,
    updateUser,
    deleteById,
    findByUsername
}