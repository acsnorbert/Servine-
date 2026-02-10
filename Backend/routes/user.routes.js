const express = require('express');
const router = express.Router();


// User routes (védett)

// GET /api/users/profile - Saját profil lekérése
router.get('/profile', auth, userController.getProfile);

// PUT /api/users/profile - Profil módosítása
router.put('/profile', auth, updateProfileValidation, validate, userController.updateProfile);

// PUT /api/users/change-password - Jelszó változtatás
router.put('/change-password', auth, changePasswordValidation, validate, userController.changePassword);

// GET /api/users/orders - Saját rendelések lekérése
router.get('/orders', auth, userController.getUserOrders);

// Admin routes

// GET /api/users - Összes user (csak admin)
router.get('/', auth, isAdmin, userController.getAllUsers);

// GET /api/users/:id - Egy user adatai (csak admin)
router.get('/:id', auth, isAdmin, userController.getUserById);

// PUT /api/users/:id/role - User szerepkör módosítása (csak admin)
router.put('/:id/role', auth, isAdmin, userController.updateUserRole);

// DELETE /api/users/:id - User törlése (csak admin)
router.delete('/:id', auth, isAdmin, userController.deleteUser);

module.exports = router;