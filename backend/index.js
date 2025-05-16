import express from 'express';
import db from './config/database.js';
import categoryRoute from './routes/categoryRoutes.js';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoute from './routes/userRoute.js';
import placeRoute from './routes/placeRoute.js';
import cityRoute from './routes/citiesRoute.js';
import eventRoute from './routes/eventRoute.js';
import cookieParser from 'cookie-parser';
import swaggerDocs from './swagger.js';
import { parseEvents } from './controllers/eventController.js';
import cron from 'node-cron';

dotenv.config();

const app = express();

// Логирование всех входящих запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
  },
}));

// Маршруты
app.use('/users', userRoute);
app.use('/categories', categoryRoute);
app.use('/places', placeRoute);
app.use('/cities', cityRoute);
app.use('/events', eventRoute);

// Проверка подключения к базе данных
try {
  await db.authenticate();
  console.log('Database Connected ....');
} catch (error) {
  console.error('Connection error:', error);
}

// Настройка Swagger
swaggerDocs(app);

// Периодический парсинг (каждые 6 часов)
cron.schedule('0 */1 * * *', parseEvents);

// Запуск парсинга при старте сервера
// parseEvents();

// Запуск сервера
app.listen(5000, () => console.log('Server running at port 5000'));