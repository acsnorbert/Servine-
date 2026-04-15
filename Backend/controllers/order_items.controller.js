const { OrderItem, Product } = require('../models/index');

// Összes order item lekérése
async function getAllOrderItems(req, res) {
  try {
    const items = await OrderItem.findAll({
      include: [{ model: Product, as: 'product' }],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(items);
  } catch (err) {
    console.error('getAllOrderItems error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

// Order itemek lekérése order_id alapján
async function getOrderItemsByOrderId(req, res) {
  try {
    const items = await OrderItem.findAll({
      where: { order_id: req.params.orderId },
      include: [{ model: Product, as: 'product' }]
    });

    if (!items.length) {
      return res.status(404).json({ message: 'Nincsenek tételek ehhez a rendeléshez.' });
    }

    return res.status(200).json(items);
  } catch (err) {
    console.error('getOrderItemsByOrderId error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}
// order item hozzáadása
async function insertOrderItem(req, res) {
  try {
    const { order_id, product_id, quantity, price } = req.body;

    const item = await OrderItem.create({
      order_id,
      product_id,
      quantity,
      price
    });

    return res.status(201).json({
      message: 'Order item létrehozva.',
      item
    });

  } catch (err) {
    console.error('insertOrderItem error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

// Order item frissítése
async function updateOrderItem(req, res) {
  try {
    const item = await OrderItem.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Order item nem található.' });
    }

    const { quantity } = req.body;

    // opcionális: stock ellenőrzés
    if (quantity) {
      const product = await Product.findByPk(item.product_id);

      if (!product || product.stock < quantity) {
        return res.status(400).json({ message: 'Nincs elegendő készlet.' });
      }

      item.quantity = quantity;
    }

    await item.save();

    return res.status(200).json({
      message: 'Order item frissítve.',
      item
    });

  } catch (err) {
    console.error('updateOrderItem error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

// Order item törlése
async function deleteOrderItem(req, res) {
  try {
    const item = await OrderItem.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Order item nem található.' });
    }

    await item.destroy();

    return res.status(200).json({ message: 'Order item törölve.' });

  } catch (err) {
    console.error('deleteOrderItem error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

// Order item darabjainak megszerzése orderId alapján
async function getQuantityById(req, res) {
  try {
    const { id } = req.params;

    const item = await OrderItem.findByPk(id);

    if (!item) {
      return res.status(404).json({
        message: 'Order item nem található.'
      });
    }

    return res.status(200).json({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      quantity: item.quantity
    });

  } catch (err) {
    console.error('getQuantityById error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

module.exports = {
  getAllOrderItems,
  getOrderItemsByOrderId,
  insertOrderItem,
  updateOrderItem,
  deleteOrderItem,
  getQuantityById
};