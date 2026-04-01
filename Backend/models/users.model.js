const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'users',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
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
        type: DataTypes.STRING(255),
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
      timestamps: true, 
      hooks: {
        beforeCreate: async (user) => {
          user.password = await bcrypt.hash(user.password, 10);
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10);
            user.secret = uuidv4();
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
    return bcrypt.compare(password, this.getDataValue('password'));
  };

  return User;
};
