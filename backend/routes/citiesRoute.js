import express from 'express';
import { getAllCities, createCity, updateCity, deleteCity } from '../controllers/citiesController.js';

const citiesRoute = express.Router();

/**
 * @swagger
 * /cities:
 *   get:
 *     summary: Получить все города
 *     tags: [Города]
 *     responses:
 *       200:
 *         description: Список всех городов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   city_name:
 *                     type: string
 *                   latitude:
 *                     type: string
 *                   longitude:
 *                     type: string
 */
citiesRoute.get('/', getAllCities);

/**
 * @swagger
 * /cities:
 *   post:
 *     summary: Создать новый город
 *     tags: [Города]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - city_name
 *               - latitude
 *               - longitude
 *             properties:
 *               city_name:
 *                 type: string
 *               latitude:
 *                 type: string
 *               longitude:
 *                 type: string
 *     responses:
 *       201:
 *         description: Город успешно создан
 */
citiesRoute.post('/', createCity);

/**
 * @swagger
 * /cities/{id}:
 *   put:
 *     summary: Обновить город
 *     tags: [Города]
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
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - city_name
 *               - latitude
 *               - longitude
 *             properties:
 *               city_name:
 *                 type: string
 *               latitude:
 *                 type: string
 *               longitude:
 *                 type: string
 *     responses:
 *       200:
 *         description: Город успешно обновлен
 */
citiesRoute.put('/:id', updateCity);

/**
 * @swagger
 * /cities/{id}:
 *   delete:
 *     summary: Удалить город
 *     tags: [Города]
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
 *         description: Город успешно удален
 */
citiesRoute.delete('/:id', deleteCity);

export default citiesRoute;