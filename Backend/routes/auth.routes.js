const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const {
  validate,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../middlewares/validation.middleware');

// POST /api/auth/register – Regisztráció
router.post('/register', registerValidation, validate, authController.register);

// POST /api/auth/login – Bejelentkezés
router.post('/login', loginValidation, validate, authController.login);

// POST /api/auth/forgot-password – Elfelejtett jelszó
router.post('/forgot-password', forgotPasswordValidation, validate, authController.forgotPassword);

// POST /api/auth/reset-password – Jelszó visszaállítása
router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword);

module.exports = router;
