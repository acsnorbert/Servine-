const { Sequelize, Op } = require('sequelize');
const dbConfig = require("../config/database");

// Initialize Sequelize
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.user,
    dbConfig.pass,
    {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        port: dbConfig.port,
        logging: dbConfig.logging
    }
);

// Import models
const User = require('./users.model')(sequelize);
const Product = require('./product.model')(sequelize);
const Category = require('./categories.model')(sequelize);
const Review = require('./reviews.model')(sequelize);
const Order = require('./orders.model')(sequelize);
const OrderItem = require('./order_items.model')(sequelize);

// User ↔ Order (1:N)
    User.hasMany(Order, {
        foreignKey: 'user_id',
        as: 'orders',
        onDelete: 'CASCADE'
    });
    Order.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });

// Order ↔ OrderItem (1:N)
    Order.hasMany(OrderItem, {
        foreignKey: 'order_id',
        as: 'items',
        onDelete: 'CASCADE'
    });
    OrderItem.belongsTo(Order, {
        foreignKey: 'order_id',
        as: 'order'
    });

// OrderItem ↔ Product (N:1)
    Product.hasMany(OrderItem, {
        foreignKey: 'product_id',
        as: 'order_items',
        onDelete: 'CASCADE'
    });
    OrderItem.belongsTo(Product, {
        foreignKey: 'product_id',
        as: 'product'
    });

// Product ↔ Review (1:N)
    Product.hasMany(Review, {
        foreignKey: 'product_id',
        as: 'reviews',
        onDelete: 'CASCADE'
    });
    Review.belongsTo(Product, {
        foreignKey: 'product_id',
        as: 'product'
    });

// User ↔ Review (1:N)
    User.hasMany(Review, {
        foreignKey: 'user_id',
        as: 'reviews',
        onDelete: 'CASCADE'
    });
    Review.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });

// Category ↔ Product (1:N)
    Category.hasMany(Product, {
        foreignKey: 'category_id',
        as: 'products',
        onDelete: 'CASCADE'
    });
    Product.belongsTo(Category, {
        foreignKey: 'category_id',
        as: 'category'
    });

// Category ↔ self (parent/child)
    Category.hasMany(Category, {
        foreignKey: 'parent_id',
        as: 'subcategories',
        onDelete: 'SET NULL'
    });
    Category.belongsTo(Category, {
        foreignKey: 'parent_id',
        as: 'parent'
    });

// ========================
// Operator map 
    const operatorMap = {
        eq: Op.eq,
        lt: Op.lt,
        lte: Op.lte,
        gt: Op.gt,
        gte: Op.gte,
        lk: Op.like,
        not: Op.not
    };

module.exports = {
    sequelize,
    User,
    Product,
    Category,
    Review,
    Order,
    OrderItem,
    operatorMap
};
