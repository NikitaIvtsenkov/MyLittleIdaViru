// models/PlaceCategory.js
import db from '../config/database.js';
import { DataTypes, Model } from 'sequelize';

class PlaceCategory extends Model {}

PlaceCategory.init(
  {
    place_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'places', // Имя таблицы Place
        key: 'id'
      },
      onDelete: 'CASCADE' // Добавляем каскадное удаление
    },
    category_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'categories', // Имя таблицы Category
        key: 'id'
      },
      onDelete: 'CASCADE' // Добавляем каскадное удаление
    }
  },
  {
    sequelize: db,
    tableName: 'many_to_many_categories',
    timestamps: false,
    freezeTableName: true,
    modelName: 'PlaceCategory',
  }
);

export default PlaceCategory;