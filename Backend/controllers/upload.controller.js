const path = require('path');
const fs = require('fs');

// Ha van modelled:
const { Product } = require('../models'); // opcionális

const uploadDir = path.join(__dirname, '../public/products');

// Egy kép feltöltése
async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nincs fájl feltöltve!' });
    }

    const filePath = `${req.protocol}://${req.get('host')}/products/${req.file.filename}`;

    return res.status(200).json({
      message: 'Fájl sikeresen feltöltve',
      filename: req.file.filename,
      path: filePath
    });

  } catch (err) {
    console.error('uploadImage error:', err);
    return res.status(500).json({ message: 'Szerverhiba' });
  }
}

// Több kép feltöltése
async function uploadMultipleImages(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Nincs fájl feltöltve!' });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      path: `/products/${file.filename}`
    }));

    return res.status(200).json({
      message: 'Fájlok feltöltve',
      files
    });

  } catch (err) {
    console.error('uploadMultipleImages error:', err);
    return res.status(500).json({ message: 'Szerverhiba' });
  }
}

// Kép törlése
async function deleteImage(req, res) {
  try {
    const { filename } = req.params;

    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fájl nem található' });
    }

    fs.unlinkSync(filePath);

    return res.status(200).json({
      message: 'Fájl törölve'
    });

  } catch (err) {
    console.error('deleteImage error:', err);
    return res.status(500).json({ message: 'Szerverhiba' });
  }
}

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage
};