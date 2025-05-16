import City from '../models/city.js';

// Get all cities (already exists)
export const getAllCities = async (req, res) => {
  try {
    const cities = await City.findAll({
      order: [['city_name', 'ASC']],
    });
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new city (already exists)
export const createCity = async (req, res) => {
  try {
    const { city_name, latitude, longitude } = req.body;

    if (!city_name || !latitude || !longitude) {
      return res.status(400).json({ message: 'City name, latitude, and longitude are required' });
    }

    const newCity = await City.create({ city_name, latitude, longitude });
    res.status(201).json(newCity);
  } catch (error) {
    console.error('Ошибка при создании города:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update a city
export const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { city_name, latitude, longitude } = req.body;

    const city = await City.findByPk(id);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    if (!city_name || !latitude || !longitude) {
      return res.status(400).json({ message: 'City name, latitude, and longitude are required' });
    }

    await city.update({ city_name, latitude, longitude });
    res.json(city);
  } catch (error) {
    console.error('Ошибка при обновлении города:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a city
export const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await City.findByPk(id);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    await city.destroy();
    res.json({ message: 'City deleted successfully' });
  } catch (error) {
    console.error('Ошибка при удалении города:', error);
    res.status(500).json({ message: error.message });
  }
};