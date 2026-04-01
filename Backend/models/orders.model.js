
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define(
    'orders',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      user_id: {
        type: DataTypes.UUID,
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
      timestamps: true,
      indexes: [
        {
          fields: ['user_id']
        }
      ]
    }
  );

  return Order;
};
