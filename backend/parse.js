// parse.js
import dotenv from 'dotenv';
import { parseEvents } from './controllers/eventController.js';
import db from './config/database.js';

dotenv.config();

// Подключение к базе данных
(async () => {
  try {
    await db.authenticate();
    console.log('Database connected...');

    await parseEvents();
    console.log('Parsing completed successfully.');
    process.exit(0); // Успешное завершение
  } catch (error) {
    console.error('Error during parsing:', error);
    process.exit(1); // Завершение с ошибкой
  }
})();
