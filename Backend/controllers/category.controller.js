const { Category } = require('../models/index');

// Összes kategória fa struktúrában
async function getAllCategories(req, res) {
  try {
    const categories = await Category.findAll({
      include: [{ model: Category, as: 'subcategories', include: [{ model: Category, as: 'subcategories' }] }]
    });
    return res.status(200).json(categories);
  } catch (err) {
    console.error('getAllCategories error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

// Egy kategória
async function getCategoryById(req, res) {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Category, as: 'subcategories' }, { model: Category, as: 'parent' }]
    });
    if (!category) return res.status(404).json({ message: 'Kategória nem található.' });
    return res.status(200).json(category);
  } catch (err) {
    console.error('getCategoryById error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

// Új kategória
async function createCategory(req, res) {
  try {
    const { name, parent_id } = req.body;
    const category = await Category.create({ name, parent_id });
    return res.status(201).json({ message: 'Kategória létrehozva.', category });
  } catch (err) {
    console.error('createCategory error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

// Frissítés
async function updateCategory(req, res) {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Kategória nem található.' });

    await category.update(req.body);
    return res.status(200).json({ message: 'Kategória frissítve.', category });
  } catch (err) {
    console.error('updateCategory error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

// Törlés
async function deleteCategory(req, res) {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Kategória nem található.' });

    await category.destroy();
    return res.status(200).json({ message: 'Kategória törölve.' });
  } catch (err) {
    console.error('deleteCategory error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };