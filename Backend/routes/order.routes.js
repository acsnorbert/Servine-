const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { auth, isAdmin } = require('../middlewares/auth.middleware');
const { validate, createOrderValidation } = require('../middlewares/validation.middleware');

// POST /api/orders – Új rendelés létrehozása (auth)
router.post('/', auth, createOrderValidation, validate, orderController.createOrder);

// GET /api/orders/my – Saját rendelések (auth)
router.get('/my', auth, orderController.getMyOrders);

// GET /api/orders/:id – Egy rendelés részletei (auth, saját vagy admin)
router.get('/:id', auth, orderController.getOrderById);

// GET /api/orders – Összes rendelés (admin)
router.get('/', auth, isAdmin, orderController.getAllOrders);

// PUT /api/orders/:id/status – Státusz frissítése (admin)
router.put('/:id/status', auth, isAdmin, orderController.updateOrderStatus);

module.exports = router;