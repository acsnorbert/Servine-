const { Product, Category, Review, Sequelize, operatorMap } = require('../models/index');
const { Op } = Sequelize;

// Összes termék lekérése szűrőkkel
async function getAllProducts(req, res) {
  try {
    const { category_id, min_price, max_price, sort } = req.query;
    const where = {};
    if (category_id) where.category_id = category_id;
    if (min_price) where.price = { [Op.gte]: parseFloat(min_price) };
    if (max_price) where.price = { [Op.lte]: parseFloat(max_price) };

    const order = sort === 'price_asc' ? [['price', 'ASC']] : sort === 'price_desc' ? [['price', 'DESC']] : [['created_at', 'DESC']];

    const products = await Product.findAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      order
    });

    return res.status(200).json(products);
  } catch (err) {
    console.error('getAllProducts error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

// Egy termék lekérése
async function getProductById(req, res) {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Review, as: 'reviews', include: [{ model: User, as: 'user', attributes: ['id', 'name'] }] }
      ]
    });
    if (!product) return res.status(404).json({ message: 'Termék nem található.' });

    // Átlagos rating
    const avgRating = product.reviews.length ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1) : null;

    return res.status(200).json({ ...product.toJSON(), avgRating });
  } catch (err) {
    console.error('getProductById error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

// Keresés
async function searchProducts(req, res) {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Keresőszó szükséges.' });

    const products = await Product.findAll({
      where: { name: { [Op.like]: `%${q}%` } },
      include: [{ model: Category, as: 'category' }]
    });

    return res.status(200).json(products);
  } catch (err) {
    console.error('searchProducts error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

// Új termék
async function createProduct(req, res) {
  try {
    const { name, description, price, stock, sku, image, category_id } = req.body;
    const product = await Product.create({ name, description, price, stock, sku, image, category_id });
    return res.status(201).json({ message: 'Termék létrehozva.', product });
  } catch (err) {
    console.error('createProduct error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

// Frissítés
async function updateProduct(req, res) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Termék nem található.' });

    await product.update(req.body);
    return res.status(200).json({ message: 'Termék frissítve.', product });
  } catch (err) {
    console.error('updateProduct error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

// Törlés
async function deleteProduct(req, res) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Termék nem található.' });

    await product.destroy();
    return res.status(200).json({ message: 'Termék törölve.' });
  } catch (err) {
    console.error('deleteProduct error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

module.exports = { getAllProducts, getProductById, searchProducts, createProduct, updateProduct, deleteProduct };