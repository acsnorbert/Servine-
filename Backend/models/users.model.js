const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'users',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING(40),
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: null
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: true,
        defaultValue: 'user'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
      }
    },
    {
      timestamps: false, 
      hooks: {
        beforeCreate: async (user) => {
          user.password = await bcrypt.hash(user.password, 10);
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        }
      },
      defaultScope: {
        attributes: { exclude: ['password'] }
      },
      scopes: {
        withPassword: { attributes: {} }
      }
    }
  );

  User.prototype.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
  };

  return User;
};
