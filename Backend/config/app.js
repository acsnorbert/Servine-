const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:4200'
}));

// statikus fajlok kiszolgalasa
app.use('/products', express.static(path.join(__dirname, '../public/products')));

// Routes
const authRoutes = require('../routes/auth.routes');
const userRoutes = require('../routes/user.routes');
const productRoutes = require('../routes/product.routes');
const categoryRoutes = require('../routes/category.routes');
const orderRoutes = require('../routes/order.routes');
const reviewRoutes = require('../routes/review.routes');
const uploadRoutes = require('../routes/upload.routes')
const order_itemRoutes  = require('../routes/order_items.routes');
const mailRoutes = require('../routes/mail.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-items', order_itemRoutes);
app.use('/api/upload',uploadRoutes)
app.use('/api/reviews', reviewRoutes);
app.use('/api/mail', mailRoutes);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

module.exports = app;