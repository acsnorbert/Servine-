const { User } = require('../models');

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'phone', 'address', 'role', 'createdAt']
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
    const { name, email, phone, address } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Felhasználó nem található' });
    }

    await user.update({ name, email, phone, address });
    res.json({ message: 'Profil sikeresen frissítve', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Szerver hiba' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, currentPassword, newPassword } = req.body;
    const providedOldPassword = oldPassword ?? currentPassword;

    const user = await User.scope('withPassword').findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Felhasználó nem található' });
    }

    const isMatch = await user.comparePassword(providedOldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Helytelen régi jelszó' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Jelszó sikeresen megváltoztatva' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Szerver hiba' });
  }
};

const getUserOrders = async (req, res) => {
  res.json([]);
};

const getAllUsers = async (req, res) => {
  const users = await User.findAll({
    attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt']
  });
  res.json(users);
};

const getUserById = async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt']
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