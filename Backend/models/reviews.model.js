const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Review = sequelize.define(
    'reviews',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      comment: {
        type: DataTypes.TEXT,
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
          fields: ['product_id']
        },
        {
          fields: ['user_id']
        }
      ]
    }
  );

  return Review;
};
