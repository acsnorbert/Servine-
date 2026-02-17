
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define(
    'orders',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      order_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'Feldolgozás alatt'
      }
    },
    {
      timestamps: false,
      indexes: [
        {
          fields: ['user_id']
        }
      ]
    }
  );

  return Order;
};
