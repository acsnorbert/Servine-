const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const productRoutes = require('./product.routes');
const categoryRoutes = require('./category.routes');
const orderRoutes = require('./order.routes');
const order_itemRoutes = require('./order_items.routes');
const reviewRoutes = require('./review.routes');

module.exports = {
  authRoutes,
  userRoutes,
  productRoutes,
  categoryRoutes,
  orderRoutes,
  order_itemRoutes,
  reviewRoutes
};