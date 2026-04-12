const express = require('express');
const router = express.Router();
const orderItemController = require('../controllers/order_items.controller');
const { auth, isAdmin } = require('../middlewares/auth.middleware');

// GET /api/order-items – összes (admin)
router.get('/', auth, isAdmin, orderItemController.getAllOrderItems);

// GET /api/order-items/order/:orderId – adott rendelés tételei
router.get('/order/:orderId', auth, orderItemController.getOrderItemsByOrderId);
// Post /api/order-items – hozzáadás
router.post('/', auth, orderItemController.insertOrderItem);

// PATCH /api/order-items/:id – frissítés
router.patch('/:id', auth, orderItemController.updateOrderItem);

// DELETE /api/order-items/:id – törlés
router.delete('/:id', auth, isAdmin, orderItemController.deleteOrderItem);


module.exports = router;