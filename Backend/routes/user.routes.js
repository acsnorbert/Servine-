const express = require('express');
const router = express.Router();

// Helyes importok – ugyanabból a middleware fájlból jön mindkettő
const { auth, isAdmin } = require('../middlewares/auth.middleware');

// Validation middleware-ek (feltételezem, hogy léteznek)
const {
  validate,
  updateProfileValidation,
  changePasswordValidation
} = require('../middlewares/validation.middleware');

const userController = require('../controllers/user.controller');

// User routes (védett)
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, updateProfileValidation, validate, userController.updateProfile);
router.put('/change-password', auth, changePasswordValidation, validate, userController.changePassword);
router.get('/orders', auth, userController.getUserOrders);

// Admin routes
router.get('/', auth, isAdmin, userController.getAllUsers);
router.get('/:id', auth, isAdmin, userController.getUserById);
router.put('/:id/role', auth, isAdmin, userController.updateUserRole);
router.delete('/:id', auth, isAdmin, userController.deleteUser);

module.exports = router;