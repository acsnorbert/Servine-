// controllers/user.controller.js
const { User } = require('../models');

const getProfile = async (req, res) => {
  try {
    // req.user már benne van az auth middleware miatt
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'phone', 'address', 'role', 'created_at']
    });

    if (!user) {
      return res.status(404).json({ message: 'Felhasználó nem található' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Szerver hiba' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Felhasználó nem található' });
    }

    await user.update({ name, phone, address });
    res.json({ message: 'Profil sikeresen frissítve', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Szerver hiba' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.scope('withPassword').findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Felhasználó nem található' });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Helytelen régi jelszó' });
    }

    user.password = newPassword;           // a hook hasheli
    await user.save();

    res.json({ message: 'Jelszó sikeresen megváltoztatva' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Szerver hiba' });
  }
};

const getUserOrders = async (req, res) => {
  // később implementálható, ha van Order modell
  res.json({ message: 'Saját rendelések (később implementálva)' });
};

const getAllUsers = async (req, res) => {
  const users = await User.findAll({
    attributes: ['id', 'name', 'email', 'role', 'created_at']
  });
  res.json(users);
};

const getUserById = async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: ['id', 'name', 'email', 'role', 'created_at']
  });
  if (!user) return res.status(404).json({ message: 'Nem található' });
  res.json(user);
};

const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'Nem található' });

  user.role = role;
  await user.save();
  res.json({ message: 'Szerepkör frissítve', user });
};

const deleteUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'Nem található' });

  await user.destroy();
  res.json({ message: 'Felhasználó törölve' });
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getUserOrders,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
};