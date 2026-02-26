const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const ejs = require('ejs');
const { User } = require('../models/index');
const { sendMail } = require('../services/mail.service');

// Token generálás
function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// Regisztráció
 async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Ez az email cím már foglalt.' });
    }

    const user = await User.create({ name, email, password });

    // Regisztrációról email küldés
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify?email=${encodeURIComponent(email)}`;
      const html = await ejs.renderFile(
        path.join(__dirname, '../Emailtemplates/verifyregistration.email.ejs'),
        { username: name, verificationUrl }
      );
      await sendMail({ to: email, subject: 'SERVINE – Email megerősítés', message: html });
    } catch (mailErr) {
      console.error('Email küldési hiba (regisztráció):', mailErr.message);
    }

    const token = generateToken(user);
    return res.status(201).json({
      message: 'Sikeres regisztráció.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ message: 'Szerverhiba a regisztráció során.' });
  }
}

// Bejeelentkezés
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Hibás email vagy jelszó.' });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ message: 'Hibás email vagy jelszó.' });
    }

    const token = generateToken(user);
    return res.status(200).json({
      message: 'Sikeres bejelentkezés.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Szerverhiba a bejelentkezés során.' });
  }
}

// Elfelejtett jelszó (visszaállítási email küldése)
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({ message: 'Ha az email regisztrált, kiküldtük a visszaállítási linket.' });
    }

    // Reset token generálása
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = Date.now() + 60 * 60 * 1000; // 1 óraig érvényes

    const resetJwt = jwt.sign(
      { id: user.id, token: resetToken },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetJwt}`;

    const html = await ejs.renderFile(
      path.join(__dirname, '../Emailtemplates/forgotpass.email.ejs'),
      { username: user.name, resetUrl }
    );

    await sendMail({ to: email, subject: 'SERVINE- Jelszó visszaállítás', message: html });

    return res.status(200).json({ message: 'Ha az email regisztrált, kiküldtük a visszaállítási linket.' });
  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

// Jelszó visszaállítása
async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token és új jelszó szükséges.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Érvénytelen vagy lejárt token.' });
    }

    const user = await User.scope('withPassword').findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'Felhasználó nem található.' });
    }
    
    user.password = password;
    await user.save();

    return res.status(200).json({ message: 'Jelszó sikeresen megváltoztatva.' });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ message: 'Szerverhiba.' });
  }
}

module.exports = { register, login, forgotPassword, resetPassword };
