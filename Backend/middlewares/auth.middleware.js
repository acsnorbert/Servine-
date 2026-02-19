const jwt = require('jsonwebtoken');
const { User } = require('../models/index');

//A kérés Authorization fejlécéből olvassa ki a tokent: "Bearer <token>"
async function auth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Nincs megadva token.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Felhasználó lekérése adatbázisból (jelszó nélkül)
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Érvénytelen token.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Érvénytelen vagy lejárt token.' });
  }
}

// Admin jogosultság ellenőrző middleware.
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Hozzáférés megtagadva. Csak adminok számára elérhető.' });
}

module.exports = { auth, isAdmin };
