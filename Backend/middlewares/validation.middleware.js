const { body, validationResult } = require('express-validator');

//Validációs hibák kezelése

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// Auth validációk
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('A név megadása kötelező.')
    .isLength({ max: 100 }).withMessage('A név legfeljebb 100 karakter lehet.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Az email megadása kötelező.')
    .isEmail().withMessage('Érvénytelen email cím.'),
  body('password')
    .notEmpty().withMessage('A jelszó megadása kötelező.')
    .isLength({ min: 6 }).withMessage('A jelszó legalább 6 karakter legyen.')
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Az email megadása kötelező.').isEmail().withMessage('Érvénytelen email.'),
  body('password').notEmpty().withMessage('A jelszó megadása kötelező.')
];

const forgotPasswordValidation = [
  body('email').trim().notEmpty().withMessage('Az email megadása kötelező.').isEmail().withMessage('Érvénytelen email.')
];

const resetPasswordValidation = [
  body('password')
    .notEmpty().withMessage('Az új jelszó megadása kötelező.')
    .isLength({ min: 6 }).withMessage('A jelszó legalább 6 karakter legyen.')
];

// User validációk
const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('A név legfeljebb 100 karakter lehet.'),
  body('phone').optional({ nullable: true }).trim().isLength({ max: 20 }).withMessage('A telefonszám legfeljebb 20 karakter lehet.'),
  body('address').optional({ nullable: true }).trim()
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('A jelenlegi jelszó megadása kötelező.'),
  body('newPassword')
    .notEmpty().withMessage('Az új jelszó megadása kötelező.')
    .isLength({ min: 6 }).withMessage('Az új jelszó legalább 6 karakter legyen.')
];

// Product validációk
const createProductValidation = [
  body('name').trim().notEmpty().withMessage('A termék neve kötelező.').isLength({ max: 100 }),
  body('price').notEmpty().withMessage('Az ár megadása kötelező.').isDecimal({ decimal_digits: '0,2' }).withMessage('Érvénytelen ár.'),
  body('category_id').notEmpty().withMessage('A kategória megadása kötelező.').isInt(),
  body('sku').trim().notEmpty().withMessage('A SKU megadása kötelező.').isLength({ max: 50 }),
  body('stock').optional().isInt({ min: 0 }).withMessage('A készlet nem lehet negatív.'),
  body('description').optional().trim()
];

const updateProductValidation = [
  body('name').optional().trim().isLength({ max: 100 }),
  body('price').optional().isDecimal({ decimal_digits: '0,2' }).withMessage('Érvénytelen ár.'),
  body('category_id').optional().isInt(),
  body('stock').optional().isInt({ min: 0 }).withMessage('A készlet nem lehet negatív.'),
  body('description').optional().trim()
];

// Review validációk
const createReviewValidation = [
  body('rating').notEmpty().withMessage('Az értékelés megadása kötelező.').isInt({ min: 1, max: 5 }).withMessage('Az értékelés 1-5 között kell legyen.'),
  body('comment').optional().trim()
];

// Order validációk
const createOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Legalább egy termék szükséges a rendeléshez.'),
  body('items.*.product_id').isInt().withMessage('Érvénytelen termék azonosító.'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('A mennyiség legalább 1 kell legyen.')
];

// Category validációk
const createCategoryValidation = [
  body('name').trim().notEmpty().withMessage('A kategória neve kötelező.').isLength({ max: 50 }),
  body('parent_id').optional({ nullable: true }).isInt().withMessage('Érvénytelen szülő kategória.')
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
  changePasswordValidation,
  createProductValidation,
  updateProductValidation,
  createReviewValidation,
  createOrderValidation,
  createCategoryValidation
};
