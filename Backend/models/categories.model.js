const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define(
    'categories',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false
      }
    },
    {
      timestamps: false,
      indexes: [
        {
          fields: ['parent_id']
        }
      ]
    }
  );

  return Category;
};
