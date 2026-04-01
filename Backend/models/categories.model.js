const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define(
    'categories',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: null
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false
      }
    },
    {
      timestamps: true,
      indexes: [
        {
          fields: ['parent_id']
        }
      ]
    }
  );

  return Category;
};
