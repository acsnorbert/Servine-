const express = require('express');
const router = express.Router();

const uploadController = require('../controllers/upload.controller');
const upload = require('../middlewares/upload.middleware');

const { auth, isAdmin } = require('../middlewares/auth.middleware');

// Egy fájl feltöltése (pl. termék kép)
router.post('/',  auth,  isAdmin,  upload.single('image'),  uploadController.uploadImage);

// Több kép feltöltése
router.post( '/multiple',auth,isAdmin,upload.array('images', 5),uploadController.uploadMultipleImages);

// Kép törlése filename alapján
router.delete( '/:filename',auth,  isAdmin,  uploadController.deleteImage);

module.exports = router;