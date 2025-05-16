import db from '../config/database.js';
import { DataTypes, Model } from 'sequelize';

class Category extends Model {}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: 'categories',
    freezeTableName: true,
    modelName: 'Category',
    timestamps: false,
  }
);

Category.associate = (models) => {
  Category.belongsToMany(models.Place, {
    through: models.PlaceCategory,
    foreignKey: 'category_id',
    otherKey: 'place_id',
    as: 'places',
    onDelete: 'CASCADE' // Каскадное удаление связей
  });
};

export default Category;