const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { auth } = require('../middlewares/auth.middleware');
const { validate, createReviewValidation } = require('../middlewares/validation.middleware');

// GET /api/reviews/product/:productId - Termék értékelései
router.get('/product/:productId', reviewController.getProductReviews);

// POST /api/reviews/product/:productId - Értékelés hozzáadása (auth)
router.post('/product/:productId', auth, createReviewValidation, validate, reviewController.createReview);

// PUT /api/reviews/:id - Értékelés módosítása (saját)
router.put('/:id', auth, reviewController.updateReview);

// DELETE /api/reviews/:id - Értékelés törlése (saját vagy admin)
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;
