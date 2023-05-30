const elasticClient = require("../../elasticClient")

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    let exists = await elasticClient.indices.exists({
        index: "users"
    });
    if (!exists) {
        await elasticClient.indices.create({
            index: "users",
            mappings: {
                "properties": {
                    "address": {
                        "type": "text"
                    },
                    "firstName": {
                        "type": "text",
                        "fields": {
                            "keyword": {
                                "type": "keyword"
                            }
                        }
                    },
                    "id": {
                        "type": "integer"
                    },
                    "lastName": {
                        "type": "text",
                        "fields": {
                            "keyword": {
                                "type": "keyword"
                            }
                        }
                    },
                    "phone": {
                        "type": "keyword"
                    },
                    "username": {
                        "type": "keyword"
                    }
                }
            }
        });
    }
    exists = await elasticClient.indices.exists({
        index: "products"
    });
    if (!exists) {
        await elasticClient.indices.create({
            index: "products",
            mappings: {
                "properties": {
                    "description": {
                        "type": "text"
                    },
                    "id": {
                        "type": "integer"
                    },
                    "name": {
                        "type": "text",
                        "fields": {
                            "keyword": {
                                "type": "keyword"
                            }
                        }
                    },
                    "price": {
                        "type": "long"
                    },
                    "quantity": {
                        "type": "integer"
                    }
                }
            }
        })
    }
    exists = await elasticClient.indices.exists({
        index: "orders"
    });
    if (!exists) {
        await elasticClient.indices.create({
            index: "orders",
            mappings: {
                "properties": {
                    "createdAt": {
                        "type": "date"
                    },
                    "id": {
                        "type": "integer"
                    },
                    "location": {
                        "type": "geo_point"
                    },
                    "productDetails": {
                        "properties": {
                            "description": {
                                "type": "text"
                            },
                            "name": {
                                "type": "text",
                                "fields": {
                                    "keyword": {
                                        "type": "keyword"
                                    }
                                }
                            },
                            "price": {
                                "type": "long"
                            },
                            "productId": {
                                "type": "integer"
                            },
                            "quantity": {
                                "type": "integer"
                            }
                        }
                    },
                    "totalPrice": {
                        "type": "long"
                    }
                }
            }
        })
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    let exists = await elasticClient.indices.exists({
        index: "users"
    })
    if (exists) {
        await elasticClient.indices.delete({
            index: "users"
        });
    }
    exists = await elasticClient.indices.exists({
        index: "products"
    })
    if (exists) {
        await elasticClient.indices.delete({
            index: "products"
        });
    }
    exists = await elasticClient.indices.exists({
        index: "orders"
    })
    if (exists) {
        await elasticClient.indices.delete({
            index: "orders"
        });
    }
};
