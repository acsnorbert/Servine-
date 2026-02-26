const express = require('express');
const cors = require('cors');

const app = express();

// Routes
const indexRoutes = require('../routes/index.routes');
const authRoutes = require('../routes/auth.routes');
const userRoutes = require('../routes/user.routes');
const productRoutes = require('../routes/product.routes');
const categoryRoutes = require('../routes/category.routes');
const orderRoutes = require('../routes/order.routes');
const reviewRoutes = require('../routes/review.routes');


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

module.exports = app;
