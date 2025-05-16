import Place from './place.js';
import Category from './category.js';
import City from './city.js';
import Event from './event.js';

// Настройка связи "многие ко многим" между Place и Category
Place.belongsToMany(Category, {
  through: 'many_to_many_categories',
  foreignKey: 'place_id',
  otherKey: 'category_id',
  as: 'categories',
});

Category.belongsToMany(Place, {
  through: 'many_to_many_categories',
  foreignKey: 'category_id',
  otherKey: 'place_id',
  as: 'places',
});

// Настройка связи "один ко многим" между City и Place
City.hasMany(Place, {
  foreignKey: 'city',
  as: 'places',
});

Place.belongsTo(City, {
  foreignKey: 'city',
  as: 'cityData',
});

// Настройка связи "один ко многим" между City и Event
City.hasMany(Event, {
  foreignKey: 'cityId',
  as: 'events',
});

Event.belongsTo(City, {
  foreignKey: 'cityId',
  as: 'city',
});

// Настройка связи "один ко многим" между Place и Event
Place.hasMany(Event, {
  foreignKey: 'placeId',
  as: 'events',
});

Event.belongsTo(Place, {
  foreignKey: 'placeId',
  as: 'place',
});

export { Place, Category, City, Event };