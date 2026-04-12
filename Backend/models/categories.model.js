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
      },
      createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
      },
      updatedAt: {
          type: DataTypes.DATE,
          allowNull: true,
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
