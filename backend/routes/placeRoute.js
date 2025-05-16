import express from 'express';
import {
  getAllPlaces,
  createPlace,
  deletePlace,
  updatePlace,
  getPlace,
  getPlaceCategories,
  addCategoryToPlace,
  removeCategoryFromPlace,
  parseEventsFromWeb,
  getPlacesByCityId
} from '../controllers/placeController.js';
import { checkAuth } from '../validations/checkAuth.js';
import multer from 'multer';

const placeroute = express.Router();

const upload = multer({ dest: 'public/assets/uploads/' });

/**
 * @swagger
 * tags:
 *   name: Места
 *   description: Работа с местами
 */

/**
 * @swagger
 * /places:
 *   get:
 *     summary: Получить все места
 *     tags: [Места]
 *     responses:
 *       200:
 *         description: Список всех мест
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Ресторан"
 *                   location:
 *                     type: string
 *                     example: "Pargi st 40"
 *                   description:
 *                     type: string
 *                     example: "Очень уютный ресторан с видом на реку."
 *                   latitude:
 *                     type: number
 *                     example: 59.35408949380664
 *                   longitude:
 *                     type: number
 *                     example: 27.42316780284446
 *                   working_hours:
 *                     type: string
 *                     example: "10:00-18:00"
 *                   web:
 *                     type: string
 *                     example: "https://johvi.concert.ee/en/"
 *                   photo:
 *                     type: string
 *                     example: "https://johvi.concert.ee/wp-content/uploads/sites/5/2021/09/GLaak_07Jun17Nr0010-maja-e1510139283744-800x665-1.jpg"
 *                   city:
 *                     type: integer
 *                     example: 1
 *                   cityData:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       city_name:
 *                         type: string
 *                         example: "Jõhvi"
 */
placeroute.get('/', getAllPlaces);

/**
 * @swagger
 * /places:
 *   post:
 *     summary: Создать новое место
 *     tags:
 *       - Места
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Название места
 *               description:
 *                 type: string
 *                 description: Описание места
 *               latitude:
 *                 type: number
 *                 description: Широта места
 *               longitude:
 *                 type: number
 *                 description: Долгота места
 *               working_hours:
 *                 type: string
 *                 description: Рабочие часы (например, "10:00-18:00")
 *               location:
 *                 type: string
 *                 description: Адрес места
 *               web:
 *                 type: string
 *                 description: Веб-сайт места
 *               city:
 *                 type: integer
 *                 description: ID города из таблицы `cities`
 *                 example: 1
 *               photoFile:
 *                 type: string
 *                 format: binary
 *                 description: Фото места
 *               categoryIds:
 *                 type: string
 *                 description: |
 *                   Список ID категорий, передаётся как строка.
 *                   Поддерживаются форматы:
 *                     - через запятую: `1,2,3`
 *                     - JSON-массив: `[1,2,3]`
 *                   Ваш контроллер сначала пытается `JSON.parse`, а затем — `split(',')`.
 *                 example: "1,2,3"
 *             required:
 *               - name
 *               - description
 *               - latitude
 *               - longitude
 *               - working_hours
 *               - location
 *               - city
 *               - photoFile
 *               - categoryIds
 *     responses:
 *       201:
 *         description: Место успешно создано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Место создано"
 *                 place:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Ресторан"
 *                     description:
 *                       type: string
 *                       example: "Очень уютный ресторан с видом на реку."
 *                     latitude:
 *                       type: number
 *                       example: 59.35408949380664
 *                     longitude:
 *                       type: number
 *                       example: 27.42316780284446
 *                     working_hours:
 *                       type: string
 *                       example: "10:00-18:00"
 *                     location:
 *                       type: string
 *                       example: "Pargi st 40"
 *                     web:
 *                       type: string
 *                       example: "https://johvi.concert.ee/en/"
 *                     photo:
 *                       type: string
 *                       example: "/assets/uploads/photo.jpg"
 *                     city:
 *                       type: integer
 *                       example: 1
 *                     cityData:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         city_name:
 *                           type: string
 *                           example: "Jõhvi"
 *       400:
 *         description: Неверный формат данных (например, `Неверный формат categoryIds`)
 *       500:
 *         description: Ошибка сервера
 */
placeroute.post('/', checkAuth, upload.single('photoFile'), (req, res, next) => {
  console.log('Загружен файл:', req.file);
  console.log('Данные формы:', req.body);
  next();
}, createPlace);

/**
 * @swagger
 * /places/{id}:
 *   get:
 *     summary: Получить одно место по ID
 *     tags: [Места]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID места, которое нужно получить
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Место найдено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Ресторан"
 *                 location:
 *                   type: string
 *                   example: "Pargi st 40"
 *                 description:
 *                   type: string
 *                   example: "Очень уютный ресторан с видом на реку."
 *                 latitude:
 *                   type: number
 *                   example: 59.35408949380664
 *                 longitude:
 *                   type: number
 *                   example: 27.42316780284446
 *                 working_hours:
 *                   type: string
 *                   example: "10:00-18:00"
 *                 web:
 *                   type: string
 *                   example: "https://johvi.concert.ee/en/"
 *                 photo:
 *                   type: string
 *                   example: "https://johvi.concert.ee/wp-content/uploads/sites/5/2021/09/GLaak_07Jun17Nr0010-maja-e1510139283744-800x665-1.jpg"
 *                 city:
 *                   type: integer
 *                   example: 1
 *                 cityData:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     city_name:
 *                       type: string
 *                       example: "Jõhvi"
 *       404:
 *         description: Место не найдено
 *       500:
 *         description: Ошибка сервера
 */
placeroute.get('/:id', getPlace);

/**
 * @swagger
 * /places/{id}:
 *   patch:
 *     summary: Обновить место по ID
 *     tags: [Места]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Идентификатор места
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               working_hours:
 *                 type: string
 *               location:
 *                 type: string
 *               web:
 *                 type: string
 *               city:
 *                 type: integer
 *                 description: ID города из таблицы cities
 *                 example: 1
 *               photoFile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Место успешно обновлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Изменения сохранены"
 *                 place:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Ресторан"
 *                     location:
 *                       type: string
 *                       example: "Pargi st 40"
 *                     description:
 *                       type: string
 *                       example: "Очень уютный ресторан с видом на реку."
 *                     latitude:
 *                       type: number
 *                       example: 59.35408949380664
 *                     longitude:
 *                       type: number
 *                       example: 27.42316780284446
 *                     working_hours:
 *                       type: string
 *                       example: "10:00-18:00"
 *                     web:
 *                       type: string
 *                       example: "https://johvi.concert.ee/en/"
 *                     photo:
 *                       type: string
 *                       example: "https://johvi.concert.ee/wp-content/uploads/sites/5/2021/09/GLaak_07Jun17Nr0010-maja-e1510139283744-800x665-1.jpg"
 *                     city:
 *                       type: integer
 *                       example: 1
 *                     cityData:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         city_name:
 *                           type: string
 *                           example: "Jõhvi"
 *       404:
 *         description: Место с таким ID не найдено
 */
placeroute.patch('/:id', checkAuth, upload.single('photoFile'), updatePlace);

placeroute.post('/test-upload', upload.single('photoFile'), (req, res) => {
  console.log('Test upload file:', req.file);
  res.json({ success: true, file: req.file });
});

/**
 * @swagger
 * /places/{id}:
 *   delete:
 *     summary: Удалить место по ID
 *     tags: [Места]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Идентификатор места
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Место успешно удалено
 *       404:
 *         description: Место с таким ID не найдено
 */
placeroute.delete('/:id', deletePlace);

/**
 * @swagger
 * /places/{id}/categories:
 *   get:
 *     summary: Получить категории места по ID
 *     tags: [Места]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Идентификатор места
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Список категорий места
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Ресторан"
 *       404:
 *         description: Место с таким ID не найдено
 */
placeroute.get('/:id/categories', getPlaceCategories);

/**
 * @swagger
 * /places/city/{cityId}:
 *   get:
 *     summary: Получить все места по ID города
 *     tags: [Места]
 *     parameters:
 *       - in: path
 *         name: cityId
 *         required: true
 *         description: ID города для фильтрации мест
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Список мест для указанного города
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Ресторан"
 *                   location:
 *                     type: string
 *                     example: "Pargi st 40"
 *                   description:
 *                     type: string
 *                     example: "Очень уютный ресторан с видом на реку."
 *                   latitude:
 *                     type: number
 *                     example: 59.35408949380664
 *                   longitude:
 *                     type: number
 *                     example: 27.42316780284446
 *                   working_hours:
 *                     type: string
 *                     example: "10:00-18:00"
 *                   web:
 *                     type: string
 *                     example: "https://johvi.concert.ee/en/"
 *                   photo:
 *                     type: string
 *                     example: "https://johvi.concert.ee/wp-content/uploads/sites/5/2021/09/GLaak_07Jun17Nr0010-maja-e1510139283744-800x665-1.jpg"
 *                   city:
 *                     type: integer
 *                     example: 1
 *                   cityData:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       city_name:
 *                         type: string
 *                         example: "Jõhvi"
 *       400:
 *         description: Неверный ID города
 *       404:
 *         description: Город не найден
 *       500:
 *         description: Ошибка сервера
 */
placeroute.get('/city/:cityId', getPlacesByCityId);

/**
 * @swagger
 * /places/{placeId}/categories/{categoryId}:
 *   post:
 *     summary: Добавить категорию к месту
 *     tags: [Места]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         description: Идентификатор места
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: Идентификатор категории
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Категория успешно добавлена
 *       404:
 *         description: Место или категория не найдены
 */
placeroute.post('/:placeId/categories/:categoryId', checkAuth, addCategoryToPlace);

/**
 * @swagger
 * /places/{placeId}/categories/{categoryId}:
 *   delete:
 *     summary: Удалить категорию из места
 *     tags: [Места]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         description: Идентификатор места
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: Идентификатор категории
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Категория успешно удалена
 *       404:
 *         description: Место или категория не найдены
 */
placeroute.delete('/:placeId/categories/:categoryId', checkAuth, removeCategoryFromPlace);

/**
 * @swagger
 * /places/parse-events:
 *   post:
 *     summary: Парсинг событий с веб-ресурса
 *     tags: [Места]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 example: "https://johvi.concert.ee/en/"
 *     responses:
 *       200:
 *         description: Успешный парсинг событий
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Events parsed successfully"
 *       400:
 *         description: Ошибка в запросе
 *       500:
 *         description: Ошибка на сервере
 */
placeroute.post('/parse-events', parseEventsFromWeb);

export default placeroute;