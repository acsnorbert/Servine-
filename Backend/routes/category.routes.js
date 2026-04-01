const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { auth, isAdmin } = require('../middlewares/auth.middleware');
const { validate, createCategoryValidation } = require('../middlewares/validation.middleware');

// GET /api/categories – Összes kategória (nyilvános, fa struktúra)
router.get('/', categoryController.getAllCategories);

// GET /api/categories/:id – Egy kategória (nyilvános)
router.get('/:id', categoryController.getCategoryById);

// POST /api/categories – Új kategória (admin)
router.post('/', auth, isAdmin, createCategoryValidation, validate, categoryController.createCategory);

// PATCH /api/categories/:id – Frissítés (admin)
router.patch('/:id', auth, isAdmin, createCategoryValidation, validate, categoryController.updateCategory);

// DELETE /api/categories/:id – Törlés (admin)
router.delete('/:id', auth, isAdmin, categoryController.deleteCategory);

module.exports = router;