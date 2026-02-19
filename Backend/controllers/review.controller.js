const { Review, User, Product } = require('../models/index');


// Egy termék összes értékelése
async function getProductReviews(req, res) {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Termék nem található.' });

    const reviews = await Review.findAll({
      where: { product_id: productId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']]
    });

    // Átlagos értékelés kiszámítása
    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    return res.status(200).json({ reviews, avgRating, count: reviews.length });
  } catch (err) {
    console.error('getProductReviews error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

// Értékelés hozzáadása egy termékhez
 async function createReview(req, res) {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Termék nem található.' });

    // Egy user csak egyszer értékelhet egy terméket
    const existing = await Review.findOne({ where: { product_id: productId, user_id: userId } });
    if (existing) {
      return res.status(409).json({ message: 'Ezt a terméket már értékelted.' });
    }

    const review = await Review.create({
      product_id: productId,
      user_id: userId,
      rating,
      comment: comment || null
    });

    const fullReview = await Review.findByPk(review.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
    });

    return res.status(201).json({ message: 'Értékelés elküldve.', review: fullReview });
  } catch (err) {
    console.error('createReview error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

//Saját értékelés módosítása
async function updateReview(req, res) {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Értékelés nem található.' });

    // Csak saját értékelést módosíthat, kivéve admin
    if (req.user.role !== 'admin' && review.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Hozzáférés megtagadva.' });
    }

    const { rating, comment } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();
    return res.status(200).json({ message: 'Értékelés frissítve.', review });
  } catch (err) {
    console.error('updateReview error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}


// Értékelés törlése (saját vagy admin)

async function deleteReview(req, res) {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Értékelés nem található.' });

    if (req.user.role !== 'admin' && review.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Hozzáférés megtagadva.' });
    }

    await review.destroy();
    return res.status(200).json({ message: 'Értékelés törölve.' });
  } catch (err) {
    console.error('deleteReview error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

module.exports = { getProductReviews, createReview, updateReview, deleteReview };
