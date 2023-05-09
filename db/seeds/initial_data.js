exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('customer')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('customer').insert([
        { firstName: 'Test User 1', username: "test-user-1", password: "password", phone: "9876543210", address: "Test User 1 Address" },
        { firstName: 'Test User 2', username: "test-user-2", password: "password", phone: "9876543210", address: "Test User 2 Address" },
      ]);
    });
};