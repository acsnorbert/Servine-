const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define(
    'products',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      sku: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
      }
    },
    {
      timestamps: false,
      indexes: [
        {
          fields: ['category_id']
        },
        {
          fields: ['sku']
        }
      ]
    }
  );

  return Product;
};
