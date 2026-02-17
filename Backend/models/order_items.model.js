const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderItem = sequelize.define(
    'order_items',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      }
    },
    {
      timestamps: false,
      indexes: [
        {
          fields: ['order_id']
        },
        {
          fields: ['product_id']
        }
      ]
    }
  );

  return OrderItem;
};

