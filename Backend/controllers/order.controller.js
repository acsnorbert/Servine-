const { Order, OrderItem, Product, User, sequelize } = require('../models/index');
const { sendMail } = require('../services/mail.service');
const path = require('path');
const ejs = require('ejs');

// Új rendelés (transaction-nel a konzisztencia miatt)
async function createOrder(req, res) {
  const t = await sequelize.transaction();
  try {
    const { items } = req.body;
    const userId = req.user.id;

    // Rendelés létrehozása
    const order = await Order.create({ user_id: userId }, { transaction: t });

    // Item-ek hozzáadása, készlet csökkentése
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (!product || product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ message: `Nem elegendő készlet: ${product ? product.name : 'Ismeretlen termék'}` });
      }

      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: product.price
      }, { transaction: t });

      product.stock -= item.quantity;
      await product.save({ transaction: t });
    }

    await t.commit();

    // Email küldés (order confirmation)
    const user = await User.findByPk(userId);
    const orderDetails = await Order.findByPk(order.id, { include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }] });
    const totalPrice = orderDetails.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const html = await ejs.renderFile(
      path.join(__dirname, '../Emailtemplates/orderconfirmation.email.ejs'), // Feltételezem, van ilyen template, hasonlóan a forgotpass-hoz
      { orderId: order.id, orderDate: order.order_date, items: orderDetails.items.map(i => ({ name: i.product.name, quantity: i.quantity, price: i.price })), totalPrice }
    );
    await sendMail({ to: user.email, subject: 'SERVINE – Rendelés megerősítés', message: html });

    return res.status(201).json({ message: 'Rendelés létrehozva.', order });
  } catch (err) {
    await t.rollback();
    console.error('createOrder error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

// Saját rendelések
async function getMyOrders(req, res) {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
      order: [['order_date', 'DESC']]
    });
    return res.status(200).json(orders);
  } catch (err) {
    console.error('getMyOrders error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

// Egy rendelés
async function getOrderById(req, res) {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }, { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
    });
    if (!order) return res.status(404).json({ message: 'Rendelés nem található.' });

    // Csak saját vagy admin
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Hozzáférés megtagadva.' });
    }

    return res.status(200).json(order);
  } catch (err) {
    console.error('getOrderById error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

// Összes rendelés (admin)
async function getAllOrders(req, res) {
  try {
    const orders = await Order.findAll({
      include: [{ model: User, as: 'user' }, { model: OrderItem, as: 'items' }],
      order: [['order_date', 'DESC']]
    });
    return res.status(200).json(orders);
  } catch (err) {
    console.error('getAllOrders error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

// Státusz frissítés (admin)
async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Rendelés nem található.' });

    order.status = status;
    await order.save();

    // Email küldés státusz változásról (opcionális)
    const user = await User.findByPk(order.user_id);
    const html = await ejs.renderFile(
      path.join(__dirname, '../Emailtemplates/orderstatus.email.ejs'), // Feltételezem template
      { orderId: order.id, newStatus: status }
    );
    await sendMail({ to: user.email, subject: 'SERVINE – Rendelés státusz frissítés', message: html });

    return res.status(200).json({ message: 'Státusz frissítve.', order });
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };