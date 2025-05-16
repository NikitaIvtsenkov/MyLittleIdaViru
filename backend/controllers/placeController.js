import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { Place, Category, City } from '../models/index.js'; // Добавляем модель City
import db from '../config/database.js';
import NodeCache from 'node-cache';
import { parseConfig } from '../config/parseConfigs.js';
import fs from 'fs/promises';
import dotenv from "dotenv";

// Получить все места
export const getAllPlaces = async (req, res) => {
  try {
    const places = await Place.findAll({
      order: [['name', 'ASC']],
      include: [
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
        {
          model: City,
          as: 'cityData', // Псевдоним из модели Place
          attributes: ['id', 'city_name'], // Возвращаем только id и название города
        },
      ],
    });

    res.json(places);
  } catch (error) {
    console.error('Ошибка при получении мест:', error);
    res.status(500).json({ message: 'Ошибка при получении мест' });
  }
};

// Создать место
export const createPlace = async (req, res) => {
  const transaction = await db.transaction();
  try {
    let categoryIds = req.body.categoryIds;
    if (typeof categoryIds === 'string') {
      try {
        categoryIds = JSON.parse(categoryIds);
      } catch (e) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Неверный формат categoryIds' });
      }
    }
    if (!Array.isArray(categoryIds)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Необходим массив categoryIds' });
    }

    const photo = req.file ? `/assets/uploads/${req.file.filename}` : req.body.photo;
    if (!photo) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Необходимо предоставить фото' });
    }

    // Переименовываем city в city_id для соответствия базе данных
    const { categoryIds: _, city: city_id, ...placeData } = req.body;
    const newPlace = await Place.create({ ...placeData, photo, city: city_id }, { transaction });

    await Promise.all(categoryIds.map(categoryId =>
      db.query(
        'INSERT INTO many_to_many_categories (place_id, category_id) VALUES (?, ?)',
        {
          replacements: [newPlace.id, categoryId],
          transaction
        }
      )
    ));

    await transaction.commit();

    const placeWithCategories = await Place.findByPk(newPlace.id, {
      include: [
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
        },
        {
          model: City,
          as: 'cityData',
          attributes: ['id', 'city_name'],
        },
      ],
    });

    res.status(201).json({
      message: 'Место создано',
      place: placeWithCategories
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Ошибка:', error);
    res.status(500).json({
      message: 'Ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};
// места по ид города
export const getPlacesByCityId = async (req, res) => {
  const { cityId } = req.params;

  // Валидация cityId
  if (!cityId || isNaN(cityId)) {
    return res.status(400).json({ message: 'Invalid city ID' });
  }

  try {
    // Проверка существования города
    const city = await City.findByPk(cityId);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    // Получение мест для указанного города
    const places = await Place.findAll({
      where: { city: cityId },
      include: [
        {
          model: City,
          as: 'cityData',
          attributes: ['id', 'city_name']
        }
      ],
      order: [['name', 'ASC']]
    });

    res.json(places);
  } catch (error) {
    console.error('Error fetching places by city ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Получить одно место
export const getPlace = async (req, res) => {
  console.log(`[DEBUG] Запрос места ID: ${req.params.id}`);
  try {
    const place = await Place.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
        },
        {
          model: City,
          as: 'cityData',
          attributes: ['id', 'city_name'],
        },
      ],
    });

    console.log(`[DEBUG] Результат запроса: ${JSON.stringify(place)}`);
    if (!place) {
      return res.status(404).json({ message: 'Место не найдено' });
    }
    res.json(place);
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновить место
export const updatePlace = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { id } = req.params;
    let { categoryIds, city: city_id, ...placeData } = req.body;

    if (typeof categoryIds === 'string') {
      categoryIds = JSON.parse(categoryIds);
    }

    await db.query('DELETE FROM many_to_many_categories WHERE place_id = ?', {
      replacements: [id],
      transaction,
    });

    if (categoryIds?.length > 0) {
      await Promise.all(
        categoryIds.map(categoryId =>
          db.query(
            'INSERT INTO many_to_many_categories (place_id, category_id) VALUES (?, ?)',
            { replacements: [id, categoryId], transaction }
          )
        )
      );
    }

    const place = await Place.findByPk(id, { transaction });
    if (!place) throw new Error('Место не найдено');

    let needsUpdate = false;
    const updates = {};

    Object.keys(placeData).forEach(key => {
      if (place[key] !== placeData[key]) {
        updates[key] = placeData[key];
        needsUpdate = true;
      }
    });

    // Проверяем изменение city (city_id)
    if (city_id !== undefined && place.city !== city_id) {
      updates.city = city_id;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await Place.update(updates, {
        where: { id },
        transaction
      });
    }

    await transaction.commit();

    const updatedPlace = await Place.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] },
        },
        {
          model: City,
          as: 'cityData',
          attributes: ['id', 'city_name'],
        },
      ],
    });

    res.json({
      message: 'Изменения сохранены',
      place: updatedPlace
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Ошибка обновления:', error);
    res.status(500).json({
      message: 'Ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Остальные методы остаются без изменений
export const getPlaceCategories = async (req, res) => {
  try {
    const place = await Place.findByPk(req.params.id, {
      include: {
        model: Category,
        as: 'categories',
        through: { attributes: [] },
      },
    });

    if (!place) {
      return res.status(404).json({ message: 'Место не найдено' });
    }

    res.json(place.categories);
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({
      message: 'Ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

export const addCategoryToPlace = async (req, res) => {
  try {
    const { placeId, categoryId } = req.params;

    await db.query(
      'INSERT INTO many_to_many_categories (place_id, category_id) VALUES (?, ?)',
      { replacements: [placeId, categoryId] }
    );

    const updatedCategories = await db.query(
      `SELECT c.* FROM categories c
       JOIN many_to_many_categories mc ON c.id = mc.category_id
       WHERE mc.place_id = ?`,
      { replacements: [placeId], type: db.QueryTypes.SELECT }
    );

    res.json(updatedCategories);
  } catch (error) {
    console.error('Ошибка добавления:', error);
    res.status(500).json({
      message: 'Ошибка добавления категории',
      error: error.original?.message || error.message
    });
  }
};

export const removeCategoryFromPlace = async (req, res) => {
  try {
    const place = await Place.findByPk(req.params.placeId);
    const category = await Category.findByPk(req.params.categoryId);

    if (!place || !category) {
      return res.status(404).json({ message: 'Ресурс не найден' });
    }

    await place.removeCategory(category);

    const updatedPlace = await Place.findByPk(place.id, {
      include: {
        model: Category,
        as: 'categories',
        through: { attributes: [] },
      },
    });

    res.json(updatedPlace.categories);
  } catch (error) {
    res.status(500).json({
      message: 'Ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

export const deletePlace = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const place = await Place.findByPk(req.params.id, { transaction });
    if (!place) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Place not found' });
    }

    if (place.photo && !place.photo.startsWith('http')) {
      try {
        await fs.unlink(`public${place.photo}`);
      } catch (err) {
        console.error('Error deleting photo:', err);
      }
    }

    await db.query('DELETE FROM many_to_many_categories WHERE place_id = ?', {
      replacements: [req.params.id],
      transaction
    });

    await place.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: 'Place deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete place error:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Парсинг событий (без изменений)
const eventsCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

const getCacheKey = (webUrl, config, offset = 0, limit = 3) => {
  return `${webUrl}:${JSON.stringify(config)}:${offset}:${limit}`;
};

const getImageFromSrcset = (srcset) => {
  if (!srcset) return null;
  return srcset.split(',').map(img => img.trim().split(' '))
    .reduce((max, [url, width]) => {
      const currWidth = width ? parseInt(width.replace('w', '')) : 0;
      return currWidth > max.width ? { url, width: currWidth } : max;
    }, { url: '', width: 0 }).url;
};

const sanitizeImageUrl = (url, baseDomain = '') => {
  if (!url || url.startsWith('data:image') || !url.trim()) {
    console.log(`Invalid image URL: ${url}`);
    return '/assets/no-image.png';
  }
  try {
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('/')) return `${baseDomain}${url}`;
    if (!url.startsWith('http')) return `${baseDomain}/${url.replace(/^\//, '')}`;
    return url;
  } catch (e) {
    console.error(`Error sanitizing URL ${url}:`, e);
    return '/assets/no-image.png';
  }
};

const parseDate = (dateStr) => {
  if (!dateStr || !dateStr.includes('Kehtib kuni')) return new Date(0);
  const match = dateStr.match(/Kehtib kuni (\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) return new Date(0);
  const [, day, month, year] = match;
  return new Date(`${year}-${month}-${day}`);
};

const loadAllEvents = async (page) => {
  let lastHeight = 0;
  let attempts = 0;
  while (attempts < 5) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(resolve => setTimeout(resolve, 500));
    const newHeight = await page.evaluate(() => document.body.scrollHeight);
    if (newHeight === lastHeight) break;
    lastHeight = newHeight;
    attempts++;
  }
  await page.evaluate(() => {
    document.querySelectorAll('img').forEach(img => {
      if (img.dataset.src || img.getAttribute('data-lazy-src')) {
        img.src = img.dataset.src || img.getAttribute('data-lazy-src');
      }
    });
  });
  await new Promise(resolve => setTimeout(resolve, 500));
};

export const parseEventsFromWeb = async (req, res) => {
  const { url: webUrl, offset = 0, limit = 3 } = req.body;
  const isFcPhoenix = webUrl.includes('fcphoenix.ee');

  if (!webUrl) {
    return res.status(400).json({ message: 'URL обязателен' });
  }

  const siteConfigKey = Object.keys(parseConfig).find(key => webUrl.startsWith(key));
  if (!siteConfigKey) {
    return res.status(400).json({ message: 'Configuration for this site not found.' });
  }
  const config = parseConfig[siteConfigKey];
  const cacheKey = getCacheKey(webUrl, config, offset, isFcPhoenix ? 1 : limit);

  const cachedData = eventsCache.get(cacheKey);
  if (cachedData) {
    console.log(`Returning cached data with ${cachedData.events.length} events, hasMore: ${cachedData.hasMore}`);
    return res.json({
      success: true,
      events: cachedData.events,
      cached: true,
      hasMore: cachedData.hasMore,
      total: cachedData.total
    });
  }

  const startTime = Date.now();
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disk-cache-dir=/tmp/puppeteer_cache']
    });
    const page = await browser.newPage();

    if (webUrl.includes('apollokino.ee') || webUrl.includes('pargikeskus.ee')) {
      await page.setRequestInterception(false);
    } else {
      await page.setRequestInterception(true);
      page.on('request', req => {
        if (['stylesheet', 'font', 'media', 'script'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });
    }

    await page.goto(webUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

    let allEvents = [];
    await loadAllEvents(page);
    const content = await page.content();
    const $ = cheerio.load(content);

    if (webUrl.includes('apollokino.ee')) {
      const eventBlocks = await page.$$(config.eventBlockSelector);
      for (const block of eventBlocks) {
        if (isFcPhoenix && allEvents.length >= 1) break;
        if (config.limit && allEvents.length >= config.limit) break;
        try {
          const [name, date, imageUrl] = await Promise.all([
            block.$eval(config.nameSelector, el => el.textContent.trim()),
            block.$eval(config.dateSelector, el => el.textContent.trim()),
            block.$eval(config.imageSelector, img => img.currentSrc || null)
          ]);
          if (!imageUrl) {
            console.log(`No image found for Apollo event: ${name}`);
          }
          allEvents.push({
            name,
            date,
            imageUrl: sanitizeImageUrl(imageUrl, 'https://apollokino.ee'),
            cinema: 'apollokino'
          });
        } catch (e) {
          console.error('Apollo parse error', e);
        }
      }
    } else if (webUrl.includes('fcphoenix.ee')) {
      const eventBlocks = await page.$$(config.eventBlockSelector);
      for (const block of eventBlocks) {
        if (allEvents.length >= 1) break;
        try {
          const [name, date, description, leftImageUrl, rightImageUrl] = await Promise.all([
            block.$eval(config.nameSelector, el => el.textContent.trim()),
            block.$eval(config.dateSelector, el => el.textContent.trim()),
            block.$eval(config.descriptionSelector, el => el.textContent.trim()),
            block.$eval(config.leftImageSelector, img => img.currentSrc || img.src || img.dataset.src || img.getAttribute('data-lazy-src') || null),
            block.$eval(config.rightImageSelector, img => img.currentSrc || img.src || img.dataset.src || img.getAttribute('data-lazy-src') || null)
          ]);
          if (!leftImageUrl || !rightImageUrl) {
            console.log(`Missing image for FC Phoenix event: ${name}, left: ${leftImageUrl}, right: ${rightImageUrl}`);
          }
          allEvents.push({
            name,
            date,
            description,
            leftImageUrl: sanitizeImageUrl(leftImageUrl),
            rightImageUrl: sanitizeImageUrl(rightImageUrl),
            cinema: 'fcphoenix'
          });
        } catch (e) {
          console.error('FC parse error', e);
        }
      }
    } else if (webUrl === 'https://pargikeskus.ee/kampaaniad/') {
      const eventBlocks = await page.$$('.column-quarter');
      for (const block of eventBlocks) {
        if (config.limit && allEvents.length >= config.limit) break;
        try {
          const [imageUrl, texts] = await Promise.all([
            block.$eval('img.img-fix-size', img => img.currentSrc || null).catch(() => null),
            block.evaluate(el => {
              const brs = Array.from(el.querySelectorAll('br'));
              return brs.map(br => br.nextSibling?.textContent?.trim() || '');
            })
          ]);
          const date = texts.find(t => t.startsWith('Kehtib kuni')) || null;
          const name = texts[texts.length - 1] || 'Unknown';
          if (!imageUrl) {
            console.log(`No image found for Pargikeskus event: ${name}`);
          }
          if (name && date) {
            allEvents.push({
              name,
              date,
              imageUrl: sanitizeImageUrl(imageUrl, 'https://pargikeskus.ee'),
              cinema: 'pargikeskus'
            });
          }
        } catch (e) {
          console.error('Pargikeskus parse error', e);
        }
      }
    } else {
      $(config.eventBlockSelector).each((index, element) => {
        if (config.limit && index >= config.limit) return false;
        try {
          const name = $(element).find(config.nameSelector).text().trim();
          const date = config.dateSelector ? $(element).find(config.dateSelector).text().trim() : null;
          const description = config.descriptionSelector ? $(element).find(config.descriptionSelector).text().trim() : null;

          let imageUrl = null;
          if (config.imageSelector) {
            const img = $(element).find(config.imageSelector);
            if (config.imageStyle === 'background-image') {
              const match = (img.attr('style') || '').match(/url\(["']?(.*?)["']?\)/);
              imageUrl = match ? match[1] : null;
            } else {
              imageUrl = img.attr(config.imageAttribute || 'src') || img.attr('data-src') || img.attr('data-lazy-src') || null;
            }
          }
          if (!imageUrl) {
            console.log(`No image found for generic event: ${name}`);
          }
          if (name && (date || description)) {
            allEvents.push({
              name,
              date,
              description,
              imageUrl: sanitizeImageUrl(imageUrl, siteConfigKey),
              cinema: 'other'
            });
          }
        } catch (e) {
          console.error('Generic parse error:', e);
        }
      });
    }

    allEvents.sort((a, b) => parseDate(a.date) - parseDate(b.date));
    const resultEvents = isFcPhoenix
      ? allEvents.slice(0, 1)
      : allEvents.slice(offset, offset + limit);

    const hasMore = isFcPhoenix
      ? false
      : allEvents.length > offset + limit;

    await browser.close();

    if (resultEvents.length > 0) {
      eventsCache.set(cacheKey, {
        events: resultEvents,
        hasMore,
        total: allEvents.length
      }, isFcPhoenix ? 600 : 3600);
    }

    console.log(`Парсинг завершен за ${(Date.now() - startTime) / 1000} сек, events: ${resultEvents.length}, hasMore: ${hasMore}`);
    res.json({
      success: true,
      events: resultEvents,
      cached: false,
      hasMore,
      total: allEvents.length
    });

  } catch (err) {
    console.error('Ошибка парсинга:', err);
    console.log(`Парсинг не удался после ${(Date.now() - startTime) / 1000} сек`);
    await browser?.close();
    res.status(500).json({
      success: false,
      message: 'Ошибка при парсинге мероприятий',
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};