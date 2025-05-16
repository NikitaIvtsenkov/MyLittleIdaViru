import db from '../config/database.js';
import { DataTypes, Model } from 'sequelize';

class City extends Model {}

City.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    city_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(16, 14),
    },
    longitude: {
      type: DataTypes.DECIMAL(16, 14),
    },
  },
  {
    sequelize: db,
    tableName: 'cities',
    freezeTableName: true,
    modelName: 'City',
    timestamps: false,
  }
);

export default City;