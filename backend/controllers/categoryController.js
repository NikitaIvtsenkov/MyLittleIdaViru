import Category from '../models/category.js';
import fs from 'fs';
import path from 'path';

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']],
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const icon = req.file ? `/uploads/categoriesIcons/${req.file.filename}` : null;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const newCategory = await Category.create({ name, icon });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Ошибка при создании категории:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update a category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const icon = req.file ? `/uploads/categoriesIcons/${req.file.filename}` : undefined;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // If a new icon is uploaded, delete the old icon file
    if (icon && category.icon) {
      const oldIconPath = path.join(process.cwd(), 'public', category.icon);
      if (fs.existsSync(oldIconPath)) {
        fs.unlinkSync(oldIconPath);
      }
    }

    await category.update({
      name,
      icon: icon || category.icon, // Keep the old icon if no new one is uploaded
    });

    res.json(category);
  } catch (error) {
    console.error('Ошибка при обновлении категории:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete the icon file if it exists
    if (category.icon) {
      const iconPath = path.join(process.cwd(), 'public', category.icon);
      if (fs.existsSync(iconPath)) {
        fs.unlinkSync(iconPath);
      }
    }

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Ошибка при удалении категории:', error);
    res.status(500).json({ message: error.message });
  }
};