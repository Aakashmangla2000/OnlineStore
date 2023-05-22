const DB = require('../db');

const find2 = () => DB('customer').select("id", "username", "firstName", "lastName", "phone", "address").where("deletedAt", null).orderBy('id');

const find = () => DB('customer').join('userRoles', 'customer.id', '=', 'userRoles.userId').select("customer.id", "username", "firstName", "lastName", "phone", "address", "userRoles.roleId").where("deletedAt", null).orderBy('id');

const findById = (id) => DB('customer').select("id", "username", "firstName", "lastName", "phone", "address").where("id", id).andWhere("deletedAt", null);

const findByUsername = (username) => DB('customer').select("id", "username", "password").where("username", username).andWhere("deletedAt", null);

const getUserRole = (userId) => DB("userRoles").select().where("userId", userId);

const addUserRole = (userId) => DB("userRoles").insert({ userId, roleId: 1 }).returning("*");

const addUser = (user) => DB('customer').insert(user).returning(["id", "username", "firstName", "lastName", "phone", "address"]);

const updateUser = (id, updatedDetails) => DB('customer').where("id", id).where("deletedAt", null).update(updatedDetails).returning(["id", "username", "firstName", "lastName", "phone", "address"]);

const deleteById = (id) => DB('customer').where("id", id).del();

module.exports = {
    find,
    findById,
    addUser,
    updateUser,
    deleteById,
    findByUsername,
    getUserRole,
    addUserRole
}