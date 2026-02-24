const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { auth, isAdmin } = require('../middlewares/auth.middleware');
const { validate, createProductValidation, updateProductValidation } = require('../middlewares/validation.middleware');

// GET /api/products – Összes termék lekérése (nyilvános, opcionális szűrők: ?category_id=1&min_price=100&sort=price_asc)
router.get('/', productController.getAllProducts);

// GET /api/products/:id – Egy termék részletei (nyilvános)
router.get('/:id', productController.getProductById);

// GET /api/products/search – Termék keresés (nyilvános, ?q=keresoszo)
router.get('/search', productController.searchProducts);

// POST /api/products – Új termék létrehozása (admin)
router.post('/', auth, isAdmin, createProductValidation, validate, productController.createProduct);

// PUT /api/products/:id – Termék frissítése (admin)
router.put('/:id', auth, isAdmin, updateProductValidation, validate, productController.updateProduct);

// DELETE /api/products/:id – Termék törlése (admin)
router.delete('/:id', auth, isAdmin, productController.deleteProduct);

module.exports = router;