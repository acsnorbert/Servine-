const { Order, OrderItem, Product, User, sequelize } = require('../models/index');
const { Op } = require('sequelize');
const { sendMail } = require('../services/mail.service');
const ejs = require('ejs');
const path = require('path');

async function createOrder(req, res) {
  const t = await sequelize.transaction();
  try {
    const { items } = req.body;

    // Termékek előzetes lekérése és stock ellenőrzés
    const resolvedItems = [];
    for (const item of items) {
      const product = await Product.findByPk(item.product_id, { transaction: t });
      if (!product || product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ message: `Nincs elegendő készlet: ${product?.name ?? 'ismeretlen termék'}` });
      }
      resolvedItems.push({ product, quantity: item.quantity });
    }
    
    const totalPrice = resolvedItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

    const order = await Order.create({ user_id: req.user.id, total_price: totalPrice }, { transaction: t });

    for (const { product, quantity } of resolvedItems) {
      await OrderItem.create({
        order_id: order.id,
        product_id: product.id,
        quantity,
        price: product.price
      }, { transaction: t });

      product.stock -= quantity;
      await product.save({ transaction: t });
    }

    await t.commit();

    // Rendelés visszaigazoló email küldése
    try {
      const user = await User.findByPk(req.user.id);
      const emailItems = await OrderItem.findAll({
        where: { order_id: order.id },
        include: [{ model: Product, as: 'product' }]
      });
      const html = await ejs.renderFile(
        path.join(__dirname, '../Emailtemplates/order.email.ejs'),
        {
          username: user.name,
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          orderDate: new Date().toLocaleDateString('hu-HU'),
          location: user.address ?? 'Nincs megadva',
          items: emailItems.map(i => ({
            name: i.product.name,
            quantity: i.quantity,
            price: `${i.price.toLocaleString('hu-HU')} Ft`
          })),
          totalPrice: `${totalPrice.toLocaleString('hu-HU')} Ft`
        }
      );
      await sendMail({ to: user.email, subject: 'SERVINE – Rendelés visszaigazolása', message: html });
    } catch (mailErr) {
      console.error('Order email sending error:', mailErr.message);
    }

    return res.status(201).json({ message: 'Rendeles létrehozva.', order });

  } catch (err) {
    if (!t.finished) await t.rollback();
    console.error('createOrder error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

async function getMyOrders(req, res) {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
      order: [['createdAt', 'DESC']]
    });
    return res.status(200).json(orders);
  } catch (err) {
    console.error('getMyOrders error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

async function getOrderById(req, res) {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user' },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    });
    if (!order) return res.status(404).json({ message: 'Rendelés nem található.' });
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Hozzáférés megtagadva.' });
    }
    return res.status(200).json(order);
  } catch (err) {
    console.error('getOrderById error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

async function getAllOrders(req, res) {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: 'user' },
        { model: OrderItem, as: 'items' }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.status(200).json(orders);
  } catch (err) {
    console.error('getAllOrders error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Rendelés nem található.' });
    order.status = req.body.status;
    await order.save();
    return res.status(200).json({ message: 'Státusz frissítve.', order });
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

async function updateOrderTotal(req, res) {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Rendelés nem található.' });
    }

    const total = order.items.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);

    order.total_price = total;
    await order.save();

    return res.status(200).json({
      message: 'Total price frissítve.',
      total_price: total,
      order
    });

  } catch (err) {
    console.error('updateOrderTotal error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}
//DELETE order
async function deleteOrder(req, res) {
  const t = await sequelize.transaction();

  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }],
      transaction: t
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: 'Rendelés nem található.' });
    }

    // jogosultság check
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      await t.rollback();
      return res.status(403).json({ message: 'Hozzáférés megtagadva.' });
    }
    
    // Order törlése
    await order.destroy({ transaction: t });

    await t.commit();

    return res.status(200).json({ message: 'Rendelés törölve.' });

  } catch (err) {
    if (!t.finished) await t.rollback();
    console.error('deleteOrder error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}
async function getMonthlyRevenue(req, res) {
  try {
    const result = await Order.findAll({
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('createdAt')), 'year'],
        [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('SUM', sequelize.col('total_price')), 'total']
      ],

      where: {
        status: {
          [Op.not]: 'törölve'
        }
      },

      group: ['year', 'month'],
      order: [
        [sequelize.literal('year'), 'ASC'],
        [sequelize.literal('month'), 'ASC']
      ]
    });

    return res.status(200).json(result);

  } catch (err) {
    console.error('getMonthlyRevenue error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}
module.exports = {
   createOrder, 
   getMyOrders, 
   getOrderById, 
   getAllOrders, 
   updateOrderStatus,
   updateOrderTotal,
   deleteOrder,
   getMonthlyRevenue

  };