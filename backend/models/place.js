import db from '../config/database.js';
import { DataTypes, Model } from 'sequelize';

class Place extends Model {}

Place.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    photo: { 
      type: DataTypes.STRING 
    },
    working_hours: { 
      type: DataTypes.STRING 
    },
    location: { 
      type: DataTypes.STRING 
    },
    web: { 
      type: DataTypes.STRING 
    },
    description: { 
      type: DataTypes.TEXT 
    },
    latitude: { 
      type: DataTypes.DECIMAL(16, 14), 
    },
    longitude: { 
      type: DataTypes.DECIMAL(16, 14), 
    },
    city: { 
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'cities',
        key: 'id',
      },
      onDelete: 'SET NULL', // Если город удаляется, установить city в NULL
      onUpdate: 'CASCADE',  // Если id города обновляется, обновить и здесь
    },
  },
  {
    sequelize: db,
    tableName: 'places',
    freezeTableName: true,
    modelName: 'Place',
    timestamps: false,
  }
);

Place.associate = (models) => {
  Place.belongsTo(models.City, {
    foreignKey: 'city',
    as: 'cityData', // Псевдоним для доступа к данным города
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  Place.belongsToMany(models.Category, {
    through: models.PlaceCategory,
    foreignKey: 'place_id',
    otherKey: 'category_id',
    as: 'categories',
    onDelete: 'CASCADE',
  });
};

export default Place;