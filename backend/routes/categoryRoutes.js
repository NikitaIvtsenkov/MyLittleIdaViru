import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';

const categoryRoute = express.Router();

const uploadDir = 'public/uploads/categoriesIcons/';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|svg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, svg) are allowed'));
  },
});

categoryRoute.get('/', getAllCategories);

categoryRoute.post('/', (req, res, next) => {
  upload.single('icon')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Обновить категорию
 *     tags: [Категории]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Рестораны"
 *               icon:
 *                 type: string
 *                 format: binary
 *                 description: Файл иконки (jpeg, jpg, png, svg) - необязательный
 *     responses:
 *       200:
 *         description: Категория успешно обновлена
 */
categoryRoute.put('/:id', (req, res, next) => {
  upload.single('icon')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Удалить категорию
 *     tags: [Категории]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Категория успешно удалена
 */
categoryRoute.delete('/:id', deleteCategory);

export default categoryRoute;