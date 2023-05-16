const DB = require('../db');

const find = () => DB('customer').select("id", "username", "firstName", "lastName", "phone", "address").where("deletedAt", null).orderBy('id');

const findById = (id) => DB('customer').select("id", "username", "firstName", "lastName", "phone", "address").where("id", id).andWhere("deletedAt", null);

const findByUsername = (username) => DB('customer').select("id", "username", "password").where("username", username).andWhere("deletedAt", null);

const addUser = (user) => DB('customer').insert(user).returning("*");

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