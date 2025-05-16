// import puppeteer from 'puppeteer';
// import crypto from 'crypto';
// import { Event, Place, City } from '../models/index.js';
// import { Op } from 'sequelize';
// import db from '../config/database.js';
// // Конфигурация для парсинга
// const parseConfig = {
//   "https://www.apollokino.ee/eng/schedule?theatreAreaID=1019&fromLang=1001": { //Jõhvi
//     eventBlockSelector: '.schedule-card',
//     nameSelector: '.schedule-card__title',
//     dateSelector: '.schedule-card__time',
//     timeSelector: '.schedule-card__time',
//     imageSelector: '.image.schedule-card__image img',
//     imageAttribute: 'currentSrc',
//     descriptionSelector: '.schedule-card__details',
//     eventLinkSelector: '.schedule-card__link',
//     placeId: 2,
//     cityId: 1,
//   },
//   "https://www.apollokino.ee/eng/schedule?theatreAreaID=1008&fromLang=1001": { //Narva
//     eventBlockSelector: '.schedule-card',
//     nameSelector: '.schedule-card__title',
//     dateSelector: '.schedule-card__time',
//     timeSelector: '.schedule-card__time',
//     imageSelector: '.image.schedule-card__image img',
//     imageAttribute: 'currentSrc',
//     descriptionSelector: '.schedule-card__details',
//     eventLinkSelector: '.schedule-card__link',
//     placeId: 51,
//     cityId: 3,
//   },
 
//   "https://pargikeskus.ee/kampaaniad/": {
//     eventBlockSelector: '.campaign-item',
//     nameSelector: '.campaign-title',
//     dateSelector: '.campaign-date',
//     descriptionSelector: '.campaign-description',
//     imageSelector: '.campaign-image img',
//     placeId: 3,
//     cityId: 2,
//   },
//   "https://www.kjkk.ee/et/syndmused/kontsert": {
//     eventBlockSelector: '.zoo-item',
//     nameSelector: 'img',
//     linkSelector: 'a',
//     imageSelector: 'img',
//     imageAttribute: 'src',
//     placeId: 50,
//     cityId: 2,
//   },
//   "https://johvi.concert.ee": {
//     eventBlockSelector: '.event-list .col-1',
//     nameSelector: 'h2',
//     dateSelector: '.event-date',
//     timeSelector: '.event-time',
//     dateTimeCombined: true,
//     imageSelector: '.image',
//     imageStyle: 'background-image',
//     descriptionSelector: '.info',
//     eventLinkSelector: '.info a.btn.low',
//     eventPageImageSelector: '.event-image img',
//     eventPageImageAttribute: 'src',
//     placeId: 1,
//     cityId: 1,
//   },
//   "https://jalgpall.ee/voistlused/team/5160": {
//     eventBlockSelector: 'tr.upcoming-game',
//     homeTeamSelector: '.team.left .content a',
//     homeLogoSelector: '.team.left .content img',
//     awayTeamSelector: '.team.right .content a',
//     awayLogoSelector: '.team.right .content img',
//     dateTimeSelector: '.vs .time p:last-child',
//     eventLinkSelector: '.vs a',
//     placeId: 52,
//     cityId: 4,
//   },
// };

// // Функция для форматирования даты и времени в DateTime
// const formatEventDateTime = (dateString, timeString, url) => {
//   try {
//     if (!dateString) return null;

//     // Специфическая обработка для jalgpall.ee
//     if (url.includes('jalgpall.ee')) {
//       // Пример строки: "05.05.2025\nKell 19:00"
//       const [datePart, timePart] = dateString.split('\n').map(str => str.trim());
//       if (!datePart) return null;

//       const [day, month, year] = datePart.split('.');
//       if (!day || !month || !year) {
//         console.error(`Invalid date format: ${datePart}`);
//         return null;
//       }

//       const parsedDate = new Date(year, parseInt(month) - 1, parseInt(day));
//       if (isNaN(parsedDate.getTime())) {
//         console.error(`Invalid parsed date: ${datePart}`);
//         return null;
//       }

//       // Добавляем время, если есть
//       if (timePart && timePart.includes('Kell')) {
//         const time = timePart.replace('Kell', '').trim();
//         const timeMatch = time.match(/(\d{1,2}):(\d{2})/);
//         if (timeMatch) {
//           const hours = parseInt(timeMatch[1], 10);
//           const minutes = parseInt(timeMatch[2], 10);
//           parsedDate.setHours(hours, minutes, 0, 0);
//         } else {
//           parsedDate.setHours(0, 0, 0, 0);
//         }
//       } else {
//         parsedDate.setHours(0, 0, 0, 0);
//       }

//       return parsedDate;
//     }

//     // Специфическая обработка для johvi.concert.ee
//     if (url.includes('johvi.concert.ee')) {
//       let datePart = dateString;
//       let timePart = null;

//       // Пример строки: "Esmaspäev, 5.05, 19:00" или "5.05"
//       const parts = dateString.split(',').map(str => str.trim());
//       if (parts.length > 1 && parts[parts.length - 1].match(/\d{1,2}:\d{2}/)) {
//         timePart = parts.pop();
//         datePart = parts.join(',').trim();
//       }

//       let day, month;
//       const dateMatch = datePart.match(/(\d{1,2})\.(\d{2})/);
//       if (!dateMatch) {
//         console.error(`Invalid date format: ${datePart}`);
//         return null;
//       }
//       [, day, month] = dateMatch;

//       const now = new Date();
//       let year = now.getFullYear();
//       const parsedDate = new Date(year, parseInt(month) - 1, parseInt(day));

//       if (parsedDate < now) {
//         year += 1;
//         parsedDate.setFullYear(year);
//       }

//       if (timePart) {
//         const timeMatch = timePart.match(/(\d{1,2}):(\d{2})/);
//         if (timeMatch) {
//           const hours = parseInt(timeMatch[1], 10);
//           const minutes = parseInt(timeMatch[2], 10);
//           parsedDate.setHours(hours, minutes, 0, 0);
//         } else {
//           parsedDate.setHours(0, 0, 0, 0);
//         }
//       } else {
//         parsedDate.setHours(0, 0, 0, 0);
//       }

//       return parsedDate;
//     }

//     // Парсим дату для KJKK (формат "24 Mai 2025 - 19:00")
//    if (typeof dateString === 'string' && dateString.match(/\d{1,2}\s\w+\s\d{4}/)) {
//   console.log(`Parsing KJKK date: ${dateString}`);
//   let datePart = dateString;
//   let timePart = timeString;

//   if (dateString.includes(' - ')) {
//     [datePart, timePart] = dateString.split(' - ');
//   }

//   const [day, monthStr, year] = datePart.trim().split(/\s+/);
//   const months = {
//     'Jaanuar': 0, 'Veebruar': 1, 'März': 2, 'Aprill': 3, 'Mai': 4, 'Juuni': 5,
//     'Juuli': 6, 'August': 7, 'September': 8, 'Oktoober': 9, 'November': 10, 'Detsember': 11
//   };
//   const month = months[monthStr];

//   if (month === undefined) {
//     console.error(`Unknown month: ${monthStr}`);
//     return null;
//   }

//   const date = new Date(year, month, day);

//   if (timePart) {
//     const timeMatch = timePart.match(/(\d{1,2}):(\d{2})/);
//     if (timeMatch) {
//       const hours = parseInt(timeMatch[1], 10);
//       const minutes = parseInt(timeMatch[2], 10);
//       date.setHours(hours, minutes, 0, 0);
//     }
//   } else if (timeString) {
//     const timeMatch = timeString.match(/(\d{1,2}):(\d{2})/);
//     if (timeMatch) {
//       const hours = parseInt(timeMatch[1], 10);
//       const minutes = parseInt(timeMatch[2], 10);
//       date.setHours(hours, minutes, 0, 0);
//     }
//   }

//   return date;
// }

//     // Парсим стандартную дату
//     let date = new Date(dateString);
//     if (isNaN(date.getTime())) {
//       console.error(`Invalid date: ${dateString}`);
//       return null;
//     }

//     if (timeString) {
//       const timeMatch = timeString.match(/(\d{1,2}):(\d{2})/);
//       if (timeMatch) {
//         const hours = parseInt(timeMatch[1], 10);
//         const minutes = parseInt(timeMatch[2], 10);
//         date.setHours(hours, minutes, 0, 0);
//       }
//     } else {
//       date.setHours(0, 0, 0, 0);
//     }

//     return date;
//   } catch (error) {
//     console.error(`❌ Error formatting dateTime "${dateString} ${timeString}":`, error);
//     return null;
//   }
// };

// // Функция для форматирования отображаемой даты в "27 Apr HH:mm"
// const formatDisplayDateTime = (dateTime) => {
//   if (!dateTime) return 'Date not specified';

//   try {
//     const date = new Date(dateTime);
//     if (isNaN(date.getTime())) return 'Invalid date';

//     const day = date.getDate();
//     const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
//     const hours = String(date.getHours()).padStart(2, '0');
//     const minutes = String(date.getMinutes()).padStart(2, '0');
//     return `${day} ${month} ${hours}:${minutes}`;
//   } catch (error) {
//     console.error(`❌ Error formatting display dateTime "${dateTime}":`, error);
//     return 'Invalid date';
//   }
// };

// // Функция для получения событий из базы данных
// export const getEvents = async (req, res) => {
//   try {
//     const { place_id, offset = 0, limit = 3 } = req.query;

//     if (isNaN(offset) || isNaN(limit)) {
//       return res.status(400).json({ message: 'Invalid offset or limit' });
//     }

//     const queryOptions = {
//       offset: parseInt(offset),
//       limit: parseInt(limit),
//       include: [
//         {
//           model: Place,
//           as: 'place',
//           include: [{ model: City, as: 'cityData' }],
//         },
//         { model: City, as: 'city' },
//       ],
//     };

//     if (place_id) {
//       if (isNaN(place_id)) {
//         return res.status(400).json({ message: 'Invalid place_id' });
//       }
//       queryOptions.where = { placeId: parseInt(place_id) };
//     }

//     const events = await Event.findAll(queryOptions);
//     const hasMore = events.length === parseInt(limit);

//     const formattedEvents = events.map(event => ({
//       ...event.toJSON(),
//       cityName: event.city?.city_name || event.place?.cityData?.city_name || null,
//     }));

//     res.status(200).json({ events: formattedEvents, hasMore });
//   } catch (error) {
//     console.error('Error fetching events:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Функция для парсинга футбольных матчей без сохранения в БД
// export const parseFootballMatches = async (req, res) => {
//   res.status(200).json({
//     matches: [
//       {
//         name: "Mock Team A vs Mock Team B",
//         homeTeam: "Mock Team A",
//         homeLogo: "https://via.placeholder.com/50",
//         awayTeam: "Mock Team B",
//         awayLogo: "https://via.placeholder.com/50",
//         dateTimeText: "05.05.2025\nKell 19:00",
//         date_time: new Date("2025-05-05T19:00:00Z"),
//         displayDateTime: "5 May 19:00",
//         link: "https://example.com",
//       },
//     ],
//   });
// };

// // Функция для парсинга событий
// export const parseEvents = async () => {
//   for (const [url, config] of Object.entries(parseConfig)) {
//     let browser;
//     try {
//       browser = await puppeteer.launch({ headless: true });
//       const page = await browser.newPage();
//       await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

//       // Обработка для футбольных матчей
//       if (url.includes('jalgpall.ee')) {
//         await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

//         const eventsData = await page.evaluate((config) => {
//           const results = [];
//           const eventBlocks = document.querySelectorAll(config.eventBlockSelector);

//           eventBlocks.forEach((block) => {
//             const homeTeam = block.querySelector(config.homeTeamSelector)?.textContent.trim() || '';
//             const homeLogo = block.querySelector(config.homeLogoSelector)?.src || '';
//             const awayTeam = block.querySelector(config.awayTeamSelector)?.textContent.trim() || '';
//             const awayLogo = block.querySelector(config.awayLogoSelector)?.src || '';
//             const dateTimeText = block.querySelector(config.dateTimeSelector)?.textContent.trim() || '';
//             const link = block.querySelector(config.eventLinkSelector)?.href || '';

//             if (!homeTeam || !awayTeam || !dateTimeText) return;

//             results.push({
//               name: `${homeTeam} vs ${awayTeam}`,
//               homeTeam,
//               homeLogo,
//               awayTeam,
//               awayLogo,
//               dateTimeText,
//               link,
//             });
//           });
//           return results;
//         }, config);

//         const now = new Date();
//         const events = eventsData.map(event => {
//           const date_time = formatEventDateTime(event.dateTimeText, null, url);
//           return {
//             ...event,
//             date_time,
//             displayDateTime: formatDisplayDateTime(date_time),
//           };
//         }).filter(event => event.date_time && event.date_time >= now);

//         const hashes = [];
//         for (const event of events) {
//           const hash = crypto.createHash('md5').update(`${url}${event.name}${event.date_time}`).digest('hex');
//           hashes.push(hash);

//           await Event.upsert({
//             url,
//             name: event.name,
//             date_time: event.date_time,
//             description: `Football match: ${event.homeTeam} vs ${event.awayTeam}`,
//             image: event.homeLogo || event.awayLogo || null,
//             placeId: config.placeId,
//             cityId: config.cityId,
//             hash,
//             homeTeam: event.homeTeam,
//             homeLogo: event.homeLogo,
//             awayTeam: event.awayTeam,
//             awayLogo: event.awayLogo,
//             link: event.link,
//           });
//         }

//         await Event.destroy({
//           where: {
//             url,
//             hash: { [Op.notIn]: hashes },
//           },
//         });

//         console.log(`Parsed and updated football matches for ${url}`);
//         continue;
//       }

//       // Обработка для Apollo Kino
//       if (url.includes('apollokino.ee')) {
//         await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

//         const now = new Date();
//         const today = now.toISOString().split('T')[0];
//         const tomorrow = new Date(now);
//         tomorrow.setDate(now.getDate() + 1);
//         const tomorrowDate = tomorrow.toISOString().split('T')[0];

//         const dayInputs = await page.$$('input.day-picker__input[name="3062-dt"]');
//         const events = [];

//         for (const dayInput of dayInputs) {
//           const inputValue = await dayInput.evaluate(el => el.value);
//           const [day, month, year] = inputValue.split('.');
//           const inputDateStr = `${year}-${month}-${day}`;

//           if (inputDateStr !== today && inputDateStr !== tomorrowDate) continue;

//           console.log(`Selecting date: ${inputDateStr}`);
//           await dayInput.click();

//           try {
//             await page.waitForSelector('#article-ajax-content-3062', { timeout: 10000 });
//             console.log(`Content loaded for date ${inputDateStr}`);
//           } catch (error) {
//             console.error(`❌ Failed to load content for date ${inputDateStr}:`, error);
//             continue;
//           }

//           await page.evaluate(async () => {
//             await new Promise((resolve) => {
//               let totalHeight = 0;
//               const distance = 100;
//               const timer = setInterval(() => {
//                 const scrollHeight = document.body.scrollHeight;
//                 window.scrollBy(0, distance);
//                 totalHeight += distance;

//                 if (totalHeight >= scrollHeight) {
//                   clearInterval(timer);
//                   resolve();
//                 }
//               }, 100);
//             });
//           });

//           await page.waitForNetworkIdle({ timeout: 10000 });

//           const eventsData = await page.evaluate((config, inputDateStr) => {
//             const results = [];
//             const eventBlocks = document.querySelectorAll(config.eventBlockSelector);

//             eventBlocks.forEach((block) => {
//               const event = {
//                 name: block.querySelector(config.nameSelector)?.innerText.trim() || '',
//                 date: inputDateStr,
//                 displayDate: block.querySelector(config.dateSelector)?.innerText.trim() || '',
//                 description: block.querySelector(config.descriptionSelector)?.innerText.trim() || '',
//                 link: config.eventLinkSelector
//                   ? block.querySelector(config.eventLinkSelector)?.href || ''
//                   : '',
//                 image: '',
//                 time: '',
//               };

//               if (!event.name) return;

//               const timeMatch = event.displayDate.match(/\d{1,2}:\d{2}/);
//               event.time = timeMatch ? timeMatch[0] : '';

//               if (config.imageSelector) {
//                 const imageElement = block.querySelector(config.imageSelector);
//                 if (imageElement) {
//                   imageElement.scrollIntoView();
//                   event.image = imageElement.currentSrc || imageElement.src || '';
//                 }
//               }

//               results.push(event);
//             });
//             return results;
//           }, config, inputDateStr);

//           console.log(`Parsed ${eventsData.length} events for date ${inputDateStr}`);

//           const filteredEvents = eventsData.filter(event => {
//             if (!event.time) return true;
//             const [hours, minutes] = event.time.split(':').map(Number);
//             const sessionDateTime = new Date(event.date);
//             sessionDateTime.setHours(hours, minutes);

//             if (event.date === today && sessionDateTime < now) {
//               return false;
//             }
//             return true;
//           });

//           console.log(`After filtering, ${filteredEvents.length} events remain for date ${inputDateStr}`);

//           filteredEvents.forEach(event => {
//             event.date_time = formatEventDateTime(event.date, event.time, url);
//             event.displayDateTime = formatDisplayDateTime(event.date_time);
//           });

//           events.push(...filteredEvents);
//         }

//         console.log(`Total events to save for ${url}: ${events.length}`);

//         const hashes = [];
//         for (const event of events) {
//           const hash = crypto.createHash('md5').update(`${url}${event.name}${event.date_time}`).digest('hex');
//           hashes.push(hash);

//           console.log(`Saving event: ${event.name}, dateTime: ${event.displayDateTime}`);

//           try {
//             await Event.upsert({
//               url,
//               name: event.name,
//               date_time: event.date_time,
//               description: event.description,
//               image: event.image || null,
//               placeId: config.placeId,
//               cityId: config.cityId,
//               hash,
//             });
//             console.log(`🎉 Successfully saved event: ${event.name}`);
//           } catch (error) {
//             console.error(`❌ Failed to save event ${event.name}:`, error);
//           }
//         }

//         try {
//           await Event.destroy({
//             where: {
//               url,
//               hash: { [Op.notIn]: hashes },
//             },
//           });
//           console.log(`Deleted old events for ${url}`);
//         } catch (error) {
//           console.error(`❌ Failed to delete old events for ${url}:`, error);
//         }

//         continue;
//       }

//       // Обработка для kjkk.ee/et/syndmused/kontsert
//       // if (url.includes('kjkk.ee/et/syndmused/kontsert')) {
//       //   await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
//       //   await page.waitForSelector('img[class*="teaser_"]', { timeout: 15000 });
//       //   await page.waitForSelector('div.element.element-date', { timeout: 15000 });

//       //   const eventsData = await page.evaluate((pageUrl) => {
//       //     const imgNodes = Array.from(document.querySelectorAll('img[class*="teaser_"]'));
//       //     const dateNodes = Array.from(document.querySelectorAll('div.element.element-date'));
//       //     const results = [];

//       //     const count = Math.min(imgNodes.length, dateNodes.length);
//       //     for (let i = 0; i < count; i++) {
//       //       const imgNode = imgNodes[i];
//       //       const dateNode = dateNodes[i];

//       //       const name = imgNode.getAttribute('title') || imgNode.getAttribute('alt') || '';
//       //       const image = imgNode.src;
//       //       const date = dateNode.textContent.trim();

//       //       results.push({
//       //         name,
//       //         date,
//       //         image,
//       //         link: pageUrl,
//       //         description: '',
//       //       });
//       //     }
//       //     return results;
//       //   }, url);

//       //   if (!eventsData.length) {
//       //     console.log('❌ События не найдены на KJKK');
//       //     continue;
//       //   }

//       //   console.log(`🎉 Найдено ${eventsData.length} событий на KJKK`);

//       //   const hashes = [];
//       //   for (const ev of eventsData) {
//       //     const date_time = formatEventDateTime(ev.date, null, url);
//       //     const hash = crypto.createHash('md5')
//       //                       .update(`${url}${ev.name}${date_time || ''}`)
//       //                       .digest('hex');
//       //     hashes.push(hash);

//       //     try {
//       //       await Event.upsert({
//       //         url,
//       //         name: ev.name,
//       //         date_time: date_time || null,
//       //         description: ev.description || 'Нет описания',
//       //         image: ev.image || null,
//       //         placeId: config.placeId,
//       //         cityId: config.cityId,
//       //         hash,
//       //       });
//       //       console.log(`🎉 Сохранено: ${ev.name} — ${formatDisplayDateTime(date_time)}`);
//       //     } catch (err) {
//       //       console.error(`❌ Ошибка при сохранении ${ev.name}:`, err);
//       //     }
//       //   }

//       //   try {
//       //     await Event.destroy({
//       //       where: {
//       //         url,
//       //         hash: { [Op.notIn]: hashes },
//       //       },
//       //     });
//       //     console.log(`Удалены старые события для ${url}`);
//       //   } catch (err) {
//       //     console.error(`❌ Ошибка удаления старых событий:`, err);
//       //   }

//       //   continue;
//       // }
//       if (url.includes('kjkk.ee/et/syndmused/kontsert')) {
//   await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
//   await page.waitForSelector('img[class*="teaser_"]', { timeout: 15000 });
//   await page.waitForSelector('div.element.element-date', { timeout: 15000 });

//   const eventsData = await page.evaluate((pageUrl) => {
//     const imgNodes = Array.from(document.querySelectorAll('img[class*="teaser_"]'));
//     const dateNodes = Array.from(document.querySelectorAll('div.element.element-date'));
//     const results = [];

//     const count = Math.min(imgNodes.length, dateNodes.length);
//     for (let i = 0; i < count; i++) {
//       const imgNode = imgNodes[i];
//       const dateNode = dateNodes[i];

//       const name = imgNode.getAttribute('title') || imgNode.getAttribute('alt') || '';
//       const image = imgNode.src;
//       const date = dateNode.textContent.trim(); // Дата в формате "22 Mai 2025 - 10:00"

//       if (!name || !date) continue; // Пропускаем, если нет имени или даты

//       results.push({
//         name,
//         date,
//         image,
//         link: pageUrl,
//         description: '',
//       });
//     }
//     return results;
//   }, url);

//   if (!eventsData.length) {
//     console.log('❌ События не найдены на KJKK');
//     continue;
//   }

//   console.log(`🎉 Найдено ${eventsData.length} событий на KJKK`);

//   const hashes = [];
//   for (const ev of eventsData) {
//     console.log(`Processing event: ${ev.name}, date: ${ev.date}`);
//     const date_time = formatEventDateTime(ev.date, null, url);
//     console.log(`Parsed date_time: ${date_time}`);

//     if (!date_time) {
//       console.error(`❌ Failed to parse date for event: ${ev.name}, date: ${ev.date}`);
//       continue; // Пропускаем событие с некорректной датой
//     }

//     const hash = crypto.createHash('md5')
//       .update(`${url}${ev.name}${date_time}`)
//       .digest('hex');
//     hashes.push(hash);

//     try {
//       await Event.upsert({
//         url,
//         name: ev.name,
//         date_time: date_time,
//         description: ev.description || 'Нет описания',
//         image: ev.image || null,
//         placeId: config.placeId,
//         cityId: config.cityId,
//         hash,
//       });
//       console.log(`🎉 Сохранено: ${ev.name} — ${formatDisplayDateTime(date_time)}`);
//     } catch (err) {
//       console.error(`❌ Ошибка при сохранении ${ev.name}:`, err);
//     }
//   }

//   try {
//     await Event.destroy({
//       where: {
//         url,
//         hash: { [Op.notIn]: hashes },
//       },
//     });
//     console.log(`Удалены старые события для ${url}`);
//   } catch (err) {
//     console.error(`❌ Ошибка удаления старых событий:`, err);
//   }

//   continue;
// }

//       // Обработка для johvi.concert.ee и остальных сайтов
//       await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

//       const eventsData = await page.evaluate((config, url) => {
//         const results = [];
//         const eventBlocks = document.querySelectorAll(config.eventBlockSelector);
//         eventBlocks.forEach((block) => {
//           let event = {};

//           if (url === 'https://pargikeskus.ee/kampaaniad/') {
//             const titleElement = block.querySelector('.campaign-title');
//             const dateElement = block.querySelector('.campaign-date');
//             const descriptionElement = block.querySelector('.campaign-description');

//             event = {
//               name: titleElement?.innerText.trim() || 'Unknown Event',
//               date: dateElement?.innerText.trim() || '',
//               description: descriptionElement?.innerText.trim() || '',
//               image: config.imageAttribute
//                 ? block.querySelector(config.imageSelector)?.getAttribute(config.imageAttribute) || ''
//                 : block.querySelector(config.imageSelector)?.getAttribute('src') || '',
//               link: '',
//             };
//           } else {
//             const dateTimeText = block.querySelector(config.dateSelector)?.innerText.trim() || '';

//             event = {
//               name: block.querySelector(config.nameSelector)?.innerText.trim() || '',
//               date: dateTimeText,
//               description: block.querySelector(config.descriptionSelector)?.innerText.trim() || '',
//               link: config.eventLinkSelector
//                 ? block.querySelector(config.eventLinkSelector)?.href || ''
//                 : '',
//               image: '',
//             };

//             if (!config.eventPageImageSelector && config.imageSelector) {
//               const imageElement = block.querySelector(config.imageSelector);
//               if (imageElement) {
//                 if (config.imageStyle === 'background-image') {
//                   const style = window.getComputedStyle(imageElement);
//                   const backgroundImage = style.backgroundImage;
//                   event.image = backgroundImage ? backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1') : '';
//                 } else if (config.imageAttribute) {
//                   event.image = imageElement.getAttribute(config.imageAttribute) || '';
//                 } else {
//                   event.image = imageElement.getAttribute('src') || '';
//                 }
//               }
//             }
//           }

//           if (!event.name) return;
//           results.push(event);
//         });
//         return results;
//       }, config, url);

//       const events = [];
//       if (config.eventPageImageSelector) {
//         for (const event of eventsData) {
//           const date_time = formatEventDateTime(event.date, null, url);
//           event.date_time = date_time;
//           event.displayDateTime = formatDisplayDateTime(date_time);

//           if (!event.link) {
//             console.log(`❌ No link found for event: ${event.name}, skipping image extraction`);
//             events.push({ ...event, image: '' });
//             continue;
//           }

//           try {
//             const absoluteLink = event.link.startsWith('http')
//               ? event.link
//               : new URL(event.link, url).href;

//             console.log(`Navigating to event page: ${absoluteLink}`);
//             await page.goto(absoluteLink, { waitUntil: 'networkidle2', timeout: 60000 });

//             const image = await page.evaluate((eventPageImageSelector, eventPageImageAttribute) => {
//               const selectors = [
//                 eventPageImageSelector,
//                 '.col-1 img',
//                 '.event-image img',
//                 '.poster img',
//                 '.event-poster img',
//                 'img.event-image',
//                 '.event-detail img',
//                 '.content img',
//               ];

//               let imageUrl = '';
//               for (const selector of selectors) {
//                 const imageElement = document.querySelector(selector);
//                 if (imageElement) {
//                   imageUrl = eventPageImageAttribute
//                     ? imageElement.getAttribute(eventPageImageAttribute) || ''
//                     : imageElement.getAttribute('src') || '';
//                   break;
//                 }
//               }

//               return imageUrl;
//             }, config.eventPageImageSelector, config.eventPageImageAttribute);

//             events.push({ ...event, image });
//           } catch (error) {
//             console.error(`❌ Error navigating to ${absoluteLink}:`, error);
//             events.push({ ...event, image: '' });
//           }
//         }
//       } else {
//         eventsData.forEach(event => {
//           const date_time = formatEventDateTime(event.date, null, url);
//           event.date_time = date_time;
//           event.displayDateTime = formatDisplayDateTime(date_time);
//           events.push(event);
//         });
//       }

//       console.log(`Events to save for ${url}:`, events);

//       const hashes = [];
//       for (const event of events) {
//         const hash = crypto.createHash('md5').update(`${url}${event.name}${event.date_time || ''}`).digest('hex');
//         hashes.push(hash);

//         await Event.upsert({
//           url,
//           name: event.name,
//           date_time: event.date_time,
//           description: event.description,
//           image: event.image || null,
//           placeId: config.placeId,
//           cityId: config.cityId,
//           hash,
//         });
//       }

//       await Event.destroy({
//         where: {
//           url,
//           hash: { [Op.notIn]: hashes },
//         },
//       });

//       console.log(`Parsed and updated events for ${url}`);
//     } catch (error) {
//       console.error(`❌ Error parsing ${url}:`, error);
//     } finally {
//       if (browser) {
//         await browser.close();
//       }
//     }
//   }
// };

// export const createEvent = async (req, res) => {
//   const transaction = await db.transaction();
//   try {
//     const { name, description, date_time, url, placeId, cityId } = req.body;
//     const photo = req.file ? `/assets/uploads/${req.file.filename}` : req.body.image;

//     if (!name || !date_time || !placeId || !cityId) {
//       await transaction.rollback();
//       return res.status(400).json({ message: 'Name, date_time, placeId, and cityId are required' });
//     }

//     const hash = crypto.createHash('md5').update(`${url || ''}${name}${date_time}`).digest('hex');

//     const newEvent = await Event.create({
//       name,
//       description,
//       date_time: new Date(date_time),
//       url,
//       image: photo,
//       placeId,
//       cityId,
//       hash
//     }, { transaction });

//     await transaction.commit();

//     const eventWithDetails = await Event.findByPk(newEvent.id, {
//       include: [
//         {
//           model: Place,
//           as: 'place',
//           include: [{ model: City, as: 'cityData' }],
//         },
//         { model: City, as: 'city' },
//       ],
//     });

//     res.status(201).json({
//       message: 'Event created successfully',
//       event: {
//         ...eventWithDetails.toJSON(),
//         cityName: eventWithDetails.city?.city_name || eventWithDetails.place?.cityData?.city_name || null,
//       }
//     });
//   } catch (error) {
//     await transaction.rollback();
//     console.error('Error creating event:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Обновить событие
// export const updateEvent = async (req, res) => {
//   const transaction = await db.transaction();
//   try {
//     const { id } = req.params;
//     const { name, description, date_time, url, placeId, cityId } = req.body;
//     const photo = req.file ? `/assets/uploads/${req.file.filename}` : req.body.image;

//     const event = await Event.findByPk(id, { transaction });
//     if (!event) {
//       await transaction.rollback();
//       return res.status(404).json({ message: 'Event not found' });
//     }

//     const updates = {};
//     if (name && name !== event.name) updates.name = name;
//     if (description !== undefined && description !== event.description) updates.description = description;
//     if (date_time && new Date(date_time).getTime() !== event.date_time.getTime()) updates.date_time = new Date(date_time);
//     if (url !== undefined && url !== event.url) updates.url = url;
//     if (placeId && placeId !== event.placeId) updates.placeId = placeId;
//     if (cityId && cityId !== event.cityId) updates.cityId = cityId;
//     if (photo && photo !== event.image) updates.image = photo;

//     if (Object.keys(updates).length > 0) {
//       if (updates.name || updates.date_time || updates.url) {
//         updates.hash = crypto.createHash('md5').update(`${updates.url || event.url || ''}${updates.name || event.name}${updates.date_time || event.date_time}`).digest('hex');
//       }
//       await Event.update(updates, { where: { id }, transaction });
//     }

//     await transaction.commit();

//     const updatedEvent = await Event.findByPk(id, {
//       include: [
//         {
//           model: Place,
//           as: 'place',
//           include: [{ model: City, as: 'cityData' }],
//         },
//         { model: City, as: 'city' },
//       ],
//     });

//     res.status(200).json({
//       message: 'Event updated successfully',
//       event: {
//         ...updatedEvent.toJSON(),
//         cityName: updatedEvent.city?.city_name || updatedEvent.place?.cityData?.city_name || null,
//       }
//     });
//   } catch (error) {
//     await transaction.rollback();
//     console.error('Error updating event:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Удалить событие
// export const deleteEvent = async (req, res) => {
//   const transaction = await db.transaction();
//   try {
//     const { id } = req.params;
//     const event = await Event.findByPk(id, { transaction });

//     if (!event) {
//       await transaction.rollback();
//       return res.status(404).json({ message: 'Event not found' });
//     }

//     if (event.image && !event.image.startsWith('http')) {
//       try {
//         await fs.unlink(`public${event.image}`);
//       } catch (err) {
//         console.error('Error deleting event image:', err);
//       }
//     }

//     await event.destroy({ transaction });
//     await transaction.commit();

//     res.status(200).json({ message: 'Event deleted successfully' });
//   } catch (error) {
//     await transaction.rollback();
//     console.error('Error deleting event:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// export const getEventById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate ID
//     if (!Number.isInteger(parseInt(id))) {
//       return res.status(400).json({ message: 'Invalid event ID' });
//     }

//     // Fetch event from database using Sequelize
//     const event = await Event.findByPk(id);

//     if (!event) {
//       return res.status(404).json({ message: 'Event not found' });
//     }

//     // Format response to match EventEditPage.js expectations
//     const eventData = {
//       id: event.id,
//       name: event.name || '',
//       description: event.description || '',
//       date_time: event.date_time ? event.date_time.toISOString() : '',
//       url: event.url || '',
//       placeId: event.placeId ? event.placeId.toString() : '', // Ensure string for frontend
//       cityId: event.cityId ? event.cityId.toString() : '', // Ensure string for frontend
//       image: event.image || ''
//     };

//     res.status(200).json(eventData);
//   } catch (error) {
//     console.error('Error fetching event:', error);
//     res.status(500).json({ message: 'Server error while fetching event' });
//   }
// };

//v2

// import puppeteer from 'puppeteer';
// import crypto from 'crypto';
// import { Event, Place, City } from '../models/index.js';
// import { Op } from 'sequelize';
// import db from '../config/database.js';
// // Конфигурация для парсинга
// const parseConfig = {
//  "https://www.apollokino.ee/eng/schedule?theatreAreaID=1019&fromLang=1001": {
//     eventBlockSelector: '#article-ajax-content-3062 .schedule-card', // Уточненный селектор
//     nameSelector: '.schedule-card__title',
//     dateSelector: '.schedule-card__time',
//     timeSelector: '.schedule-card__time',
//     imageSelector: '.image.schedule-card__image img',
//     imageAttribute: 'currentSrc',
//     descriptionSelector: '.schedule-card__details',
//     eventLinkSelector: '.schedule-card__link',
//     placeId: 2,
//     cityId: 1,
//   },
//   "https://www.apollokino.ee/eng/schedule?theatreAreaID=1008&fromLang=1001": { //Narva
//     eventBlockSelector: '.schedule-card',
//     nameSelector: '.schedule-card__title',
//     dateSelector: '.schedule-card__time',
//     timeSelector: '.schedule-card__time',
//     imageSelector: '.image.schedule-card__image img',
//     imageAttribute: 'currentSrc',
//     descriptionSelector: '.schedule-card__details',
//     eventLinkSelector: '.schedule-card__link',
//     placeId: 51,
//     cityId: 3,
//   },
 
//   "https://pargikeskus.ee/kampaaniad/": {
//     eventBlockSelector: '.campaign-item',
//     nameSelector: '.campaign-title',
//     dateSelector: '.campaign-date',
//     descriptionSelector: '.campaign-description',
//     imageSelector: '.campaign-image img',
//     placeId: 3,
//     cityId: 2,
//   },
//   "https://www.kjkk.ee/et/syndmused/kontsert": {
//     eventBlockSelector: '.zoo-item',
//     nameSelector: 'img',
//     linkSelector: 'a',
//     imageSelector: 'img',
//     imageAttribute: 'src',
//     placeId: 50,
//     cityId: 2,
//   },
//   "https://johvi.concert.ee": {
//     eventBlockSelector: '.event-list .col-1',
//     nameSelector: 'h2',
//     dateSelector: '.event-date',
//     timeSelector: '.event-time',
//     dateTimeCombined: true,
//     imageSelector: '.image',
//     imageStyle: 'background-image',
//     descriptionSelector: '.info',
//     eventLinkSelector: '.info a.btn.low',
//     eventPageImageSelector: '.event-image img',
//     eventPageImageAttribute: 'src',
//     placeId: 1,
//     cityId: 1,
//   },
//   "https://jalgpall.ee/voistlused/team/5160": {
//     eventBlockSelector: 'tr.upcoming-game',
//     homeTeamSelector: '.team.left .content a',
//     homeLogoSelector: '.team.left .content img',
//     awayTeamSelector: '.team.right .content a',
//     awayLogoSelector: '.team.right .content img',
//     dateTimeSelector: '.vs .time p:last-child',
//     eventLinkSelector: '.vs a',
//     placeId: 52,
//     cityId: 4,
//   },
// };

// // Функция для форматирования даты и времени в DateTime
// const formatEventDateTime = (dateString, timeString, url) => {
//   try {
//     if (!dateString) return null;

//     // Специфическая обработка для jalgpall.ee
//     if (url.includes('jalgpall.ee')) {
//       // Пример строки: "05.05.2025\nKell 19:00"
//       const [datePart, timePart] = dateString.split('\n').map(str => str.trim());
//       if (!datePart) return null;

//       const [day, month, year] = datePart.split('.');
//       if (!day || !month || !year) {
//         console.error(`Invalid date format: ${datePart}`);
//         return null;
//       }

//       const parsedDate = new Date(year, parseInt(month) - 1, parseInt(day));
//       if (isNaN(parsedDate.getTime())) {
//         console.error(`Invalid parsed date: ${datePart}`);
//         return null;
//       }

//       // Добавляем время, если есть
//       if (timePart && timePart.includes('Kell')) {
//         const time = timePart.replace('Kell', '').trim();
//         const timeMatch = time.match(/(\d{1,2}):(\d{2})/);
//         if (timeMatch) {
//           const hours = parseInt(timeMatch[1], 10);
//           const minutes = parseInt(timeMatch[2], 10);
//           parsedDate.setHours(hours, minutes, 0, 0);
//         } else {
//           parsedDate.setHours(0, 0, 0, 0);
//         }
//       } else {
//         parsedDate.setHours(0, 0, 0, 0);
//       }

//       return parsedDate;
//     }

//     // Специфическая обработка для johvi.concert.ee
//     if (url.includes('johvi.concert.ee')) {
//       let datePart = dateString;
//       let timePart = null;

//       // Пример строки: "Esmaspäev, 5.05, 19:00" или "5.05"
//       const parts = dateString.split(',').map(str => str.trim());
//       if (parts.length > 1 && parts[parts.length - 1].match(/\d{1,2}:\d{2}/)) {
//         timePart = parts.pop();
//         datePart = parts.join(',').trim();
//       }

//       let day, month;
//       const dateMatch = datePart.match(/(\d{1,2})\.(\d{2})/);
//       if (!dateMatch) {
//         console.error(`Invalid date format: ${datePart}`);
//         return null;
//       }
//       [, day, month] = dateMatch;

//       const now = new Date();
//       let year = now.getFullYear();
//       const parsedDate = new Date(year, parseInt(month) - 1, parseInt(day));

//       if (parsedDate < now) {
//         year += 1;
//         parsedDate.setFullYear(year);
//       }

//       if (timePart) {
//         const timeMatch = timePart.match(/(\d{1,2}):(\d{2})/);
//         if (timeMatch) {
//           const hours = parseInt(timeMatch[1], 10);
//           const minutes = parseInt(timeMatch[2], 10);
//           parsedDate.setHours(hours, minutes, 0, 0);
//         } else {
//           parsedDate.setHours(0, 0, 0, 0);
//         }
//       } else {
//         parsedDate.setHours(0, 0, 0, 0);
//       }

//       return parsedDate;
//     }

//     // Парсим дату для KJKK (формат "24 Mai 2025 - 19:00")
//    if (typeof dateString === 'string' && dateString.match(/\d{1,2}\s\w+\s\d{4}/)) {
//   console.log(`Parsing KJKK date: ${dateString}`);
//   let datePart = dateString;
//   let timePart = timeString;

//   if (dateString.includes(' - ')) {
//     [datePart, timePart] = dateString.split(' - ');
//   }

//   const [day, monthStr, year] = datePart.trim().split(/\s+/);
//   const months = {
//     'Jaanuar': 0, 'Veebruar': 1, 'März': 2, 'Aprill': 3, 'Mai': 4, 'Juuni': 5,
//     'Juuli': 6, 'August': 7, 'September': 8, 'Oktoober': 9, 'November': 10, 'Detsember': 11
//   };
//   const month = months[monthStr];

//   if (month === undefined) {
//     console.error(`Unknown month: ${monthStr}`);
//     return null;
//   }

//   const date = new Date(year, month, day);

//   if (timePart) {
//     const timeMatch = timePart.match(/(\d{1,2}):(\d{2})/);
//     if (timeMatch) {
//       const hours = parseInt(timeMatch[1], 10);
//       const minutes = parseInt(timeMatch[2], 10);
//       date.setHours(hours, minutes, 0, 0);
//     }
//   } else if (timeString) {
//     const timeMatch = timeString.match(/(\d{1,2}):(\d{2})/);
//     if (timeMatch) {
//       const hours = parseInt(timeMatch[1], 10);
//       const minutes = parseInt(timeMatch[2], 10);
//       date.setHours(hours, minutes, 0, 0);
//     }
//   }

//   return date;
// }

//     // Парсим стандартную дату
//     let date = new Date(dateString);
//     if (isNaN(date.getTime())) {
//       console.error(`Invalid date: ${dateString}`);
//       return null;
//     }

//     if (timeString) {
//       const timeMatch = timeString.match(/(\d{1,2}):(\d{2})/);
//       if (timeMatch) {
//         const hours = parseInt(timeMatch[1], 10);
//         const minutes = parseInt(timeMatch[2], 10);
//         date.setHours(hours, minutes, 0, 0);
//       }
//     } else {
//       date.setHours(0, 0, 0, 0);
//     }

//     return date;
//   } catch (error) {
//     console.error(`❌ Error formatting dateTime "${dateString} ${timeString}":`, error);
//     return null;
//   }
// };

// // Функция для форматирования отображаемой даты в "27 Apr HH:mm"
// const formatDisplayDateTime = (dateTime) => {
//   if (!dateTime) return 'Date not specified';

//   try {
//     const date = new Date(dateTime);
//     if (isNaN(date.getTime())) return 'Invalid date';

//     const day = date.getDate();
//     const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
//     const hours = String(date.getHours()).padStart(2, '0');
//     const minutes = String(date.getMinutes()).padStart(2, '0');
//     return `${day} ${month} ${hours}:${minutes}`;
//   } catch (error) {
//     console.error(`❌ Error formatting display dateTime "${dateTime}":`, error);
//     return 'Invalid date';
//   }
// };

// // Функция для получения событий из базы данных
// export const getEvents = async (req, res) => {
//   try {
//     const { place_id, offset = 0, limit = 3 } = req.query;

//     if (isNaN(offset) || isNaN(limit)) {
//       return res.status(400).json({ message: 'Invalid offset or limit' });
//     }

//     const queryOptions = {
//       offset: parseInt(offset),
//       limit: parseInt(limit),
//       include: [
//         {
//           model: Place,
//           as: 'place',
//           include: [{ model: City, as: 'cityData' }],
//         },
//         { model: City, as: 'city' },
//       ],
//     };

//     if (place_id) {
//       if (isNaN(place_id)) {
//         return res.status(400).json({ message: 'Invalid place_id' });
//       }
//       queryOptions.where = { placeId: parseInt(place_id) };
//     }

//     const events = await Event.findAll(queryOptions);
//     const hasMore = events.length === parseInt(limit);

//     const formattedEvents = events.map(event => ({
//       ...event.toJSON(),
//       cityName: event.city?.city_name || event.place?.cityData?.city_name || null,
//     }));

//     res.status(200).json({ events: formattedEvents, hasMore });
//   } catch (error) {
//     console.error('Error fetching events:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Функция для парсинга футбольных матчей без сохранения в БД
// export const parseFootballMatches = async (req, res) => {
//   res.status(200).json({
//     matches: [
//       {
//         name: "Mock Team A vs Mock Team B",
//         homeTeam: "Mock Team A",
//         homeLogo: "https://via.placeholder.com/50",
//         awayTeam: "Mock Team B",
//         awayLogo: "https://via.placeholder.com/50",
//         dateTimeText: "05.05.2025\nKell 19:00",
//         date_time: new Date("2025-05-05T19:00:00Z"),
//         displayDateTime: "5 May 19:00",
//         link: "https://example.com",
//       },
//     ],
//   });
// };

// // Функция для парсинга событий
// export const parseEvents = async () => {
//   for (const [url, config] of Object.entries(parseConfig)) {
//     let browser;
//     try {
//       browser = await puppeteer.launch({ headless: true });
//       const page = await browser.newPage();
//       await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

//       // Обработка для футбольных матчей
//       if (url.includes('jalgpall.ee')) {
//         await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

//         const eventsData = await page.evaluate((config) => {
//           const results = [];
//           const eventBlocks = document.querySelectorAll(config.eventBlockSelector);

//           eventBlocks.forEach((block) => {
//             const homeTeam = block.querySelector(config.homeTeamSelector)?.textContent.trim() || '';
//             const homeLogo = block.querySelector(config.homeLogoSelector)?.src || '';
//             const awayTeam = block.querySelector(config.awayTeamSelector)?.textContent.trim() || '';
//             const awayLogo = block.querySelector(config.awayLogoSelector)?.src || '';
//             const dateTimeText = block.querySelector(config.dateTimeSelector)?.textContent.trim() || '';
//             const link = block.querySelector(config.eventLinkSelector)?.href || '';

//             if (!homeTeam || !awayTeam || !dateTimeText) return;

//             results.push({
//               name: `${homeTeam} vs ${awayTeam}`,
//               homeTeam,
//               homeLogo,
//               awayTeam,
//               awayLogo,
//               dateTimeText,
//               link,
//             });
//           });
//           return results;
//         }, config);

//         const now = new Date();
//         const events = eventsData.map(event => {
//           const date_time = formatEventDateTime(event.dateTimeText, null, url);
//           return {
//             ...event,
//             date_time,
//             displayDateTime: formatDisplayDateTime(date_time),
//           };
//         }).filter(event => event.date_time && event.date_time >= now);

//         const hashes = [];
//         for (const event of events) {
//           const hash = crypto.createHash('md5').update(`${url}${event.name}${event.date_time}`).digest('hex');
//           hashes.push(hash);

//           await Event.upsert({
//             url,
//             name: event.name,
//             date_time: event.date_time,
//             description: `Football match: ${event.homeTeam} vs ${event.awayTeam}`,
//             image: event.homeLogo || event.awayLogo || null,
//             placeId: config.placeId,
//             cityId: config.cityId,
//             hash,
//             homeTeam: event.homeTeam,
//             homeLogo: event.homeLogo,
//             awayTeam: event.awayTeam,
//             awayLogo: event.awayLogo,
//             link: event.link,
//           });
//         }

//         await Event.destroy({
//           where: {
//             url,
//             hash: { [Op.notIn]: hashes },
//           },
//         });

//         console.log(`Parsed and updated football matches for ${url}`);
//         continue;
//       }

//       // Обработка для Apollo Kino
//       if (url.includes('apollokino.ee')) {
//         await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

//         const now = new Date();
//         const today = now.toISOString().split('T')[0];
//         const tomorrow = new Date(now);
//         tomorrow.setDate(now.getDate() + 1);
//         const tomorrowDate = tomorrow.toISOString().split('T')[0];

//         const dayInputs = await page.$$('input.day-picker__input[name="3062-dt"]');
//         const events = [];

//         for (const dayInput of dayInputs) {
//           const inputValue = await dayInput.evaluate(el => el.value);
//           const [day, month, year] = inputValue.split('.');
//           const inputDateStr = `${year}-${month}-${day}`;

//           if (inputDateStr !== today && inputDateStr !== tomorrowDate) continue;

//           console.log(`Selecting date: ${inputDateStr}`);
//           await dayInput.click();

//           try {
//             await page.waitForSelector('#article-ajax-content-3062', { timeout: 10000 });
//             console.log(`Content loaded for date ${inputDateStr}`);
//           } catch (error) {
//             console.error(`❌ Failed to load content for date ${inputDateStr}:`, error);
//             continue;
//           }

//           await page.evaluate(async () => {
//             await new Promise((resolve) => {
//               let totalHeight = 0;
//               const distance = 100;
//               const timer = setInterval(() => {
//                 const scrollHeight = document.body.scrollHeight;
//                 window.scrollBy(0, distance);
//                 totalHeight += distance;
//                 if (totalHeight >= scrollHeight) {
//                   clearInterval(timer);
//                   resolve();
//                 }
//               }, 100);
//             });
//           });

//           await page.waitForNetworkIdle({ timeout: 10000 });

//           const eventsData = await page.evaluate((config, inputDateStr) => {
//             const results = [];
//             const eventBlocks = document.querySelectorAll(config.eventBlockSelector);

//             eventBlocks.forEach((block) => {
//               const event = {
//                 name: block.querySelector(config.nameSelector)?.innerText.trim() || '',
//                 date: inputDateStr,
//                 displayDate: block.querySelector(config.dateSelector)?.innerText.trim() || '',
//                 description: block.querySelector(config.descriptionSelector)?.innerText.trim() || '',
//                 link: config.eventLinkSelector
//                   ? block.querySelector(config.eventLinkSelector)?.href || ''
//                   : '',
//                 image: '',
//                 time: '',
//               };

//               if (!event.name) return;

//               const timeMatch = event.displayDate.match(/\d{1,2}:\d{2}/);
//               event.time = timeMatch ? timeMatch[0] : '';

//               if (config.imageSelector) {
//                 const imageElement = block.querySelector(config.imageSelector);
//                 if (imageElement) {
//                   imageElement.scrollIntoView();
//                   event.image = imageElement.currentSrc || imageElement.src || '';
//                 }
//               }

//               results.push(event);
//             });
//             return results;
//           }, config, inputDateStr);

//           console.log(`Parsed ${eventsData.length} events for date ${inputDateStr}`);

//           const filteredEvents = eventsData.filter(event => {
//             if (!event.time) return true;
//             const [hours, minutes] = event.time.split(':').map(Number);
//             const sessionDateTime = new Date(event.date);
//             sessionDateTime.setHours(hours, minutes);
//             return sessionDateTime >= now; // Фильтруем прошедшие события
//           });

//           console.log(`After filtering, ${filteredEvents.length} events remain for date ${inputDateStr}`);

//           filteredEvents.forEach(event => {
//             event.date_time = formatEventDateTime(event.date, event.time, url);
//             event.displayDateTime = formatDisplayDateTime(event.date_time);
//           });

//           events.push(...filteredEvents);
//         }

//         // Разделяем события на сегодняшние и завтрашние
//         const todayEvents = events.filter(e => e.date === today);
//         const tomorrowEvents = events.filter(e => e.date === tomorrowDate);

//         // Сортируем по времени
//         todayEvents.sort((a, b) => a.date_time - b.date_time);
//         tomorrowEvents.sort((a, b) => a.date_time - b.date_time);

//         // Формируем итоговый список
//         const upcomingEvents = [...todayEvents]; // Все события на сегодня
//         const todayCount = todayEvents.length;

//         if (todayCount >= 5) {
//           // Если событий на сегодня 5 или больше, добавляем до 3 событий завтра
//           upcomingEvents.push(...tomorrowEvents.slice(0, 3));
//         } else {
//           // Если событий на сегодня меньше 5, добавляем все события завтра
//           upcomingEvents.push(...tomorrowEvents);
//         }

//         console.log(`Today events: ${todayEvents.length}, Tomorrow events: ${tomorrowEvents.length}`);
//         console.log(`Total events to save for ${url}: ${upcomingEvents.length}`);
//         upcomingEvents.forEach(e => console.log(`Selected: ${e.name} at ${e.displayDateTime}`));

//         // Сохранение событий
//         const hashes = [];
//         for (const event of upcomingEvents) {
//           const hash = crypto.createHash('md5').update(`${url}${event.name}${event.date_time}`).digest('hex');
//           hashes.push(hash);

//           console.log(`Saving event: ${event.name}, dateTime: ${event.displayDateTime}`);

//           try {
//             await Event.upsert({
//               url,
//               name: event.name,
//               date_time: event.date_time,
//               description: event.description,
//               image: event.image || null,
//               placeId: config.placeId,
//               cityId: config.cityId,
//               hash,
//             });
//             console.log(`🎉 Successfully saved event: ${event.name}`);
//           } catch (error) {
//             console.error(`❌ Failed to save event ${event.name}:`, error);
//           }
//         }

//         // Удаление старых событий
//         try {
//           await Event.destroy({
//             where: {
//               url,
//               hash: { [Op.notIn]: hashes },
//             },
//           });
//           console.log(`Deleted old events for ${url}`);
//         } catch (error) {
//           console.error(`❌ Failed to delete old events for ${url}:`, error);
//         }

//         continue;
//       }

   

//       // Обработка для kjkk.ee/et/syndmused/kontsert
//       // if (url.includes('kjkk.ee/et/syndmused/kontsert')) {
//       //   await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
//       //   await page.waitForSelector('img[class*="teaser_"]', { timeout: 15000 });
//       //   await page.waitForSelector('div.element.element-date', { timeout: 15000 });

//       //   const eventsData = await page.evaluate((pageUrl) => {
//       //     const imgNodes = Array.from(document.querySelectorAll('img[class*="teaser_"]'));
//       //     const dateNodes = Array.from(document.querySelectorAll('div.element.element-date'));
//       //     const results = [];

//       //     const count = Math.min(imgNodes.length, dateNodes.length);
//       //     for (let i = 0; i < count; i++) {
//       //       const imgNode = imgNodes[i];
//       //       const dateNode = dateNodes[i];

//       //       const name = imgNode.getAttribute('title') || imgNode.getAttribute('alt') || '';
//       //       const image = imgNode.src;
//       //       const date = dateNode.textContent.trim();

//       //       results.push({
//       //         name,
//       //         date,
//       //         image,
//       //         link: pageUrl,
//       //         description: '',
//       //       });
//       //     }
//       //     return results;
//       //   }, url);

//       //   if (!eventsData.length) {
//       //     console.log('❌ События не найдены на KJKK');
//       //     continue;
//       //   }

//       //   console.log(`🎉 Найдено ${eventsData.length} событий на KJKK`);

//       //   const hashes = [];
//       //   for (const ev of eventsData) {
//       //     const date_time = formatEventDateTime(ev.date, null, url);
//       //     const hash = crypto.createHash('md5')
//       //                       .update(`${url}${ev.name}${date_time || ''}`)
//       //                       .digest('hex');
//       //     hashes.push(hash);

//       //     try {
//       //       await Event.upsert({
//       //         url,
//       //         name: ev.name,
//       //         date_time: date_time || null,
//       //         description: ev.description || 'Нет описания',
//       //         image: ev.image || null,
//       //         placeId: config.placeId,
//       //         cityId: config.cityId,
//       //         hash,
//       //       });
//       //       console.log(`🎉 Сохранено: ${ev.name} — ${formatDisplayDateTime(date_time)}`);
//       //     } catch (err) {
//       //       console.error(`❌ Ошибка при сохранении ${ev.name}:`, err);
//       //     }
//       //   }

//       //   try {
//       //     await Event.destroy({
//       //       where: {
//       //         url,
//       //         hash: { [Op.notIn]: hashes },
//       //       },
//       //     });
//       //     console.log(`Удалены старые события для ${url}`);
//       //   } catch (err) {
//       //     console.error(`❌ Ошибка удаления старых событий:`, err);
//       //   }

//       //   continue;
//       // }
//       if (url.includes('kjkk.ee/et/syndmused/kontsert')) {
//   await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
//   await page.waitForSelector('img[class*="teaser_"]', { timeout: 15000 });
//   await page.waitForSelector('div.element.element-date', { timeout: 15000 });

//   const eventsData = await page.evaluate((pageUrl) => {
//     const imgNodes = Array.from(document.querySelectorAll('img[class*="teaser_"]'));
//     const dateNodes = Array.from(document.querySelectorAll('div.element.element-date'));
//     const results = [];

//     const count = Math.min(imgNodes.length, dateNodes.length);
//     for (let i = 0; i < count; i++) {
//       const imgNode = imgNodes[i];
//       const dateNode = dateNodes[i];

//       const name = imgNode.getAttribute('title') || imgNode.getAttribute('alt') || '';
//       const image = imgNode.src;
//       const date = dateNode.textContent.trim(); // Дата в формате "22 Mai 2025 - 10:00"

//       if (!name || !date) continue; // Пропускаем, если нет имени или даты

//       results.push({
//         name,
//         date,
//         image,
//         link: pageUrl,
//         description: '',
//       });
//     }
//     return results;
//   }, url);

//   if (!eventsData.length) {
//     console.log('❌ События не найдены на KJKK');
//     continue;
//   }

//   console.log(`🎉 Найдено ${eventsData.length} событий на KJKK`);

//   const hashes = [];
//   for (const ev of eventsData) {
//     console.log(`Processing event: ${ev.name}, date: ${ev.date}`);
//     const date_time = formatEventDateTime(ev.date, null, url);
//     console.log(`Parsed date_time: ${date_time}`);

//     if (!date_time) {
//       console.error(`❌ Failed to parse date for event: ${ev.name}, date: ${ev.date}`);
//       continue; // Пропускаем событие с некорректной датой
//     }

//     const hash = crypto.createHash('md5')
//       .update(`${url}${ev.name}${date_time}`)
//       .digest('hex');
//     hashes.push(hash);

//     try {
//       await Event.upsert({
//         url,
//         name: ev.name,
//         date_time: date_time,
//         description: ev.description || 'Нет описания',
//         image: ev.image || null,
//         placeId: config.placeId,
//         cityId: config.cityId,
//         hash,
//       });
//       console.log(`🎉 Сохранено: ${ev.name} — ${formatDisplayDateTime(date_time)}`);
//     } catch (err) {
//       console.error(`❌ Ошибка при сохранении ${ev.name}:`, err);
//     }
//   }

//   try {
//     await Event.destroy({
//       where: {
//         url,
//         hash: { [Op.notIn]: hashes },
//       },
//     });
//     console.log(`Удалены старые события для ${url}`);
//   } catch (err) {
//     console.error(`❌ Ошибка удаления старых событий:`, err);
//   }

//   continue;
// }

//       // Обработка для johvi.concert.ee и остальных сайтов
//       await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

//       const eventsData = await page.evaluate((config, url) => {
//         const results = [];
//         const eventBlocks = document.querySelectorAll(config.eventBlockSelector);
//         eventBlocks.forEach((block) => {
//           let event = {};

//           if (url === 'https://pargikeskus.ee/kampaaniad/') {
//             const titleElement = block.querySelector('.campaign-title');
//             const dateElement = block.querySelector('.campaign-date');
//             const descriptionElement = block.querySelector('.campaign-description');

//             event = {
//               name: titleElement?.innerText.trim() || 'Unknown Event',
//               date: dateElement?.innerText.trim() || '',
//               description: descriptionElement?.innerText.trim() || '',
//               image: config.imageAttribute
//                 ? block.querySelector(config.imageSelector)?.getAttribute(config.imageAttribute) || ''
//                 : block.querySelector(config.imageSelector)?.getAttribute('src') || '',
//               link: '',
//             };
//           } else {
//             const dateTimeText = block.querySelector(config.dateSelector)?.innerText.trim() || '';

//             event = {
//               name: block.querySelector(config.nameSelector)?.innerText.trim() || '',
//               date: dateTimeText,
//               description: block.querySelector(config.descriptionSelector)?.innerText.trim() || '',
//               link: config.eventLinkSelector
//                 ? block.querySelector(config.eventLinkSelector)?.href || ''
//                 : '',
//               image: '',
//             };

//             if (!config.eventPageImageSelector && config.imageSelector) {
//               const imageElement = block.querySelector(config.imageSelector);
//               if (imageElement) {
//                 if (config.imageStyle === 'background-image') {
//                   const style = window.getComputedStyle(imageElement);
//                   const backgroundImage = style.backgroundImage;
//                   event.image = backgroundImage ? backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1') : '';
//                 } else if (config.imageAttribute) {
//                   event.image = imageElement.getAttribute(config.imageAttribute) || '';
//                 } else {
//                   event.image = imageElement.getAttribute('src') || '';
//                 }
//               }
//             }
//           }

//           if (!event.name) return;
//           results.push(event);
//         });
//         return results;
//       }, config, url);

//       const events = [];
//       if (config.eventPageImageSelector) {
//         for (const event of eventsData) {
//           const date_time = formatEventDateTime(event.date, null, url);
//           event.date_time = date_time;
//           event.displayDateTime = formatDisplayDateTime(date_time);

//           if (!event.link) {
//             console.log(`❌ No link found for event: ${event.name}, skipping image extraction`);
//             events.push({ ...event, image: '' });
//             continue;
//           }

//           try {
//             const absoluteLink = event.link.startsWith('http')
//               ? event.link
//               : new URL(event.link, url).href;

//             console.log(`Navigating to event page: ${absoluteLink}`);
//             await page.goto(absoluteLink, { waitUntil: 'networkidle2', timeout: 60000 });

//             const image = await page.evaluate((eventPageImageSelector, eventPageImageAttribute) => {
//               const selectors = [
//                 eventPageImageSelector,
//                 '.col-1 img',
//                 '.event-image img',
//                 '.poster img',
//                 '.event-poster img',
//                 'img.event-image',
//                 '.event-detail img',
//                 '.content img',
//               ];

//               let imageUrl = '';
//               for (const selector of selectors) {
//                 const imageElement = document.querySelector(selector);
//                 if (imageElement) {
//                   imageUrl = eventPageImageAttribute
//                     ? imageElement.getAttribute(eventPageImageAttribute) || ''
//                     : imageElement.getAttribute('src') || '';
//                   break;
//                 }
//               }

//               return imageUrl;
//             }, config.eventPageImageSelector, config.eventPageImageAttribute);

//             events.push({ ...event, image });
//           } catch (error) {
//             console.error(`❌ Error navigating to ${absoluteLink}:`, error);
//             events.push({ ...event, image: '' });
//           }
//         }
//       } else {
//         eventsData.forEach(event => {
//           const date_time = formatEventDateTime(event.date, null, url);
//           event.date_time = date_time;
//           event.displayDateTime = formatDisplayDateTime(date_time);
//           events.push(event);
//         });
//       }

//       console.log(`Events to save for ${url}:`, events);

//       const hashes = [];
//       for (const event of events) {
//         const hash = crypto.createHash('md5').update(`${url}${event.name}${event.date_time || ''}`).digest('hex');
//         hashes.push(hash);

//         await Event.upsert({
//           url,
//           name: event.name,
//           date_time: event.date_time,
//           description: event.description,
//           image: event.image || null,
//           placeId: config.placeId,
//           cityId: config.cityId,
//           hash,
//         });
//       }

//       await Event.destroy({
//         where: {
//           url,
//           hash: { [Op.notIn]: hashes },
//         },
//       });

//       console.log(`Parsed and updated events for ${url}`);
//     } catch (error) {
//       console.error(`❌ Error parsing ${url}:`, error);
//     } finally {
//       if (browser) {
//         await browser.close();
//       }
//     }
//   }
// };

// export const createEvent = async (req, res) => {
//   const transaction = await db.transaction();
//   try {
//     const { name, description, date_time, url, placeId, cityId } = req.body;
//     const photo = req.file ? `/assets/uploads/${req.file.filename}` : req.body.image;

//     if (!name || !date_time || !placeId || !cityId) {
//       await transaction.rollback();
//       return res.status(400).json({ message: 'Name, date_time, placeId, and cityId are required' });
//     }

//     const hash = crypto.createHash('md5').update(`${url || ''}${name}${date_time}`).digest('hex');

//     const newEvent = await Event.create({
//       name,
//       description,
//       date_time: new Date(date_time),
//       url,
//       image: photo,
//       placeId,
//       cityId,
//       hash
//     }, { transaction });

//     await transaction.commit();

//     const eventWithDetails = await Event.findByPk(newEvent.id, {
//       include: [
//         {
//           model: Place,
//           as: 'place',
//           include: [{ model: City, as: 'cityData' }],
//         },
//         { model: City, as: 'city' },
//       ],
//     });

//     res.status(201).json({
//       message: 'Event created successfully',
//       event: {
//         ...eventWithDetails.toJSON(),
//         cityName: eventWithDetails.city?.city_name || eventWithDetails.place?.cityData?.city_name || null,
//       }
//     });
//   } catch (error) {
//     await transaction.rollback();
//     console.error('Error creating event:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Обновить событие
// export const updateEvent = async (req, res) => {
//   const transaction = await db.transaction();
//   try {
//     const { id } = req.params;
//     const { name, description, date_time, url, placeId, cityId } = req.body;
//     const photo = req.file ? `/assets/uploads/${req.file.filename}` : req.body.image;

//     const event = await Event.findByPk(id, { transaction });
//     if (!event) {
//       await transaction.rollback();
//       return res.status(404).json({ message: 'Event not found' });
//     }

//     const updates = {};
//     if (name && name !== event.name) updates.name = name;
//     if (description !== undefined && description !== event.description) updates.description = description;
//     if (date_time && new Date(date_time).getTime() !== event.date_time.getTime()) updates.date_time = new Date(date_time);
//     if (url !== undefined && url !== event.url) updates.url = url;
//     if (placeId && placeId !== event.placeId) updates.placeId = placeId;
//     if (cityId && cityId !== event.cityId) updates.cityId = cityId;
//     if (photo && photo !== event.image) updates.image = photo;

//     if (Object.keys(updates).length > 0) {
//       if (updates.name || updates.date_time || updates.url) {
//         updates.hash = crypto.createHash('md5').update(`${updates.url || event.url || ''}${updates.name || event.name}${updates.date_time || event.date_time}`).digest('hex');
//       }
//       await Event.update(updates, { where: { id }, transaction });
//     }

//     await transaction.commit();

//     const updatedEvent = await Event.findByPk(id, {
//       include: [
//         {
//           model: Place,
//           as: 'place',
//           include: [{ model: City, as: 'cityData' }],
//         },
//         { model: City, as: 'city' },
//       ],
//     });

//     res.status(200).json({
//       message: 'Event updated successfully',
//       event: {
//         ...updatedEvent.toJSON(),
//         cityName: updatedEvent.city?.city_name || updatedEvent.place?.cityData?.city_name || null,
//       }
//     });
//   } catch (error) {
//     await transaction.rollback();
//     console.error('Error updating event:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Удалить событие
// export const deleteEvent = async (req, res) => {
//   const transaction = await db.transaction();
//   try {
//     const { id } = req.params;
//     const event = await Event.findByPk(id, { transaction });

//     if (!event) {
//       await transaction.rollback();
//       return res.status(404).json({ message: 'Event not found' });
//     }

//     if (event.image && !event.image.startsWith('http')) {
//       try {
//         await fs.unlink(`public${event.image}`);
//       } catch (err) {
//         console.error('Error deleting event image:', err);
//       }
//     }

//     await event.destroy({ transaction });
//     await transaction.commit();

//     res.status(200).json({ message: 'Event deleted successfully' });
//   } catch (error) {
//     await transaction.rollback();
//     console.error('Error deleting event:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// export const getEventById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate ID
//     if (!Number.isInteger(parseInt(id))) {
//       return res.status(400).json({ message: 'Invalid event ID' });
//     }

//     // Fetch event from database using Sequelize
//     const event = await Event.findByPk(id);

//     if (!event) {
//       return res.status(404).json({ message: 'Event not found' });
//     }

//     // Format response to match EventEditPage.js expectations
//     const eventData = {
//       id: event.id,
//       name: event.name || '',
//       description: event.description || '',
//       date_time: event.date_time ? event.date_time.toISOString() : '',
//       url: event.url || '',
//       placeId: event.placeId ? event.placeId.toString() : '', // Ensure string for frontend
//       cityId: event.cityId ? event.cityId.toString() : '', // Ensure string for frontend
//       image: event.image || ''
//     };

//     res.status(200).json(eventData);
//   } catch (error) {
//     console.error('Error fetching event:', error);
//     res.status(500).json({ message: 'Server error while fetching event' });
//   }
// };

//best

// import puppeteer from 'puppeteer';
// import crypto from 'crypto';
// import { Event, Place, City } from '../models/index.js';
// import { Op } from 'sequelize';
// import db from '../config/database.js';

// // Конфигурация для парсинга
// const parseConfig = {
//   "https://www.apollokino.ee/eng/schedule?theatreAreaID=1019&fromLang=1001": { // Jõhvi
//     eventBlockSelector: '.schedule-card',
//     nameSelector: '.schedule-card__title',
//     dateSelector: '.schedule-card__time',
//     timeSelector: '.schedule-card__time',
//     imageSelector: '.image.schedule-card__image img',
//     imageAttribute: 'currentSrc',
//     descriptionSelector: '.schedule-card__details',
//     eventLinkSelector: '.schedule-card__link',
//     placeId: 2,
//     cityId: 1,
//   },
//   "https://www.apollokino.ee/eng/schedule?theatreAreaID=1008&fromLang=1001": { // Narva
//     eventBlockSelector: '.schedule-card',
//     nameSelector: '.schedule-card__title',
//     dateSelector: '.schedule-card__time',
//     timeSelector: '.schedule-card__time',
//     imageSelector: '.image.schedule-card__image img',
//     imageAttribute: 'currentSrc',
//     descriptionSelector: '.schedule-card__details',
//     eventLinkSelector: '.schedule-card__link',
//     placeId: 51,
//     cityId: 3,
//   },
//   "https://pargikeskus.ee/kampaaniad/": {
//     eventBlockSelector: '.campaign-item',
//     nameSelector: '.campaign-title',
//     dateSelector: '.campaign-date',
//     descriptionSelector: '.campaign-description',
//     imageSelector: '.campaign-image img',
//     placeId: 3,
//     cityId: 2,
//   },
//   "https://www.kjkk.ee/et/syndmused/kontsert": {
//     eventBlockSelector: '.zoo-item',
//     nameSelector: 'img',
//     linkSelector: 'a',
//     imageSelector: 'img',
//     imageAttribute: 'src',
//     placeId: 50,
//     cityId: 2,
//   },
//   "https://johvi.concert.ee": {
//     eventBlockSelector: '.event-list .col-1',
//     nameSelector: 'h2',
//     dateSelector: '.event-date',
//     timeSelector: '.event-time',
//     dateTimeCombined: true,
//     imageSelector: '.image',
//     imageStyle: 'background-image',
//     descriptionSelector: '.info',
//     eventLinkSelector: '.info a.btn.low',
//     eventPageImageSelector: '.event-image img',
//     eventPageImageAttribute: 'src',
//     placeId: 1,
//     cityId: 1,
//   },
//   "https://jalgpall.ee/voistlused/team/5160": {
//     eventBlockSelector: 'tr.upcoming-game',
//     homeTeamSelector: '.team.left .content a',
//     homeLogoSelector: '.team.left .content img',
//     awayTeamSelector: '.team.right .content a',
//     awayLogoSelector: '.team.right .content img',
//     dateTimeSelector: '.vs .time p:last-child',
//     eventLinkSelector: '.vs a',
//     placeId: 52,
//     cityId: 4,
//   },
// };

// // Функция для форматирования даты и времени в DateTime
// const formatEventDateTime = (dateString, timeString, url, eventDate = null) => {
//   try {
//     if (!dateString) return null;

//     const months = {
//       'jaanuar': 0, 'veebruar': 1, 'märts': 2, 'aprill': 3, 'mai': 4, 'juuni': 5,
//       'juuli': 6, 'august': 7, 'september': 8, 'oktoober': 9, 'november': 10, 'detsember': 11,
//       'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
//       'july': 6, 'aug': 7, 'sept': 8, 'october': 9, 'nov': 10, 'dec': 11
//     };

//     // Специфическая обработка для Apollo Kino
//     if (url.includes('apollokino.ee')) {
//       // Используем eventDate (например, "2025-05-07") как базовую дату
//       if (!eventDate) {
//         console.error(`No eventDate provided for Apollo Kino: ${dateString}`);
//         return null;
//       }

//       const [year, month, day] = eventDate.split('-').map(Number);
//       const parsedDate = new Date(year, month - 1, day);

//       // Парсим время из dateString (например, "12:00 PM")
//       const timeMatch = dateString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
//       if (!timeMatch) {
//         console.error(`Invalid time format for Apollo Kino: ${dateString}`);
//         return null;
//       }

//       let [_, hours, minutes, period] = timeMatch;
//       hours = parseInt(hours);
//       minutes = parseInt(minutes);

//       // Преобразуем время из формата AM/PM в 24-часовой
//       if (period.toUpperCase() === 'PM' && hours !== 12) {
//         hours += 12;
//       } else if (period.toUpperCase() === 'AM' && hours === 12) {
//         hours = 0;
//       }

//       parsedDate.setHours(hours, minutes, 0, 0);
//       return parsedDate;
//     }

//     // Специфическая обработка для jalgpall.ee
//     if (url.includes('jalgpall.ee')) {
//       const [datePart, timePart] = dateString.split('\n').map(str => str.trim());
//       if (!datePart) return null;

//       const [day, month, year] = datePart.split('.');
//       if (!day || !month || !year) {
//         console.error(`Invalid date format: ${datePart}`);
//         return null;
//       }

//       const parsedDate = new Date(year, parseInt(month) - 1, parseInt(day));
//       if (isNaN(parsedDate.getTime())) {
//         console.error(`Invalid parsed date: ${datePart}`);
//         return null;
//       }

//       if (timePart && timePart.includes('Kell')) {
//         const time = timePart.replace('Kell', '').trim();
//         const timeMatch = time.match(/(\d{1,2}):(\d{2})/);
//         if (timeMatch) {
//           const hours = parseInt(timeMatch[1], 10);
//           const minutes = parseInt(timeMatch[2], 10);
//           parsedDate.setHours(hours, minutes, 0, 0);
//         } else {
//           parsedDate.setHours(0, 0, 0, 0);
//         }
//       } else {
//         parsedDate.setHours(0, 0, 0, 0);
//       }

//       return parsedDate;
//     }

//     // Специфическая обработка для johvi.concert.ee
//     if (url.includes('johvi.concert.ee')) {
//       let datePart = dateString;
//       let timePart = null;

//       const parts = dateString.split(',').map(str => str.trim());
//       if (parts.length > 1 && parts[parts.length - 1].match(/\d{1,2}:\d{2}/)) {
//         timePart = parts.pop();
//         datePart = parts.join(',').trim();
//       }

//       let day, month;
//       const dateMatch = datePart.match(/(\d{1,2})\.(\d{2})/);
//       if (!dateMatch) {
//         console.error(`Invalid date format: ${datePart}`);
//         return null;
//       }
//       [, day, month] = dateMatch;

//       const now = new Date();
//       let year = now.getFullYear();
//       const parsedDate = new Date(year, parseInt(month) - 1, parseInt(day));

//       if (parsedDate < now) {
//         year += 1;
//         parsedDate.setFullYear(year);
//       }

//       if (timePart) {
//         const timeMatch = timePart.match(/(\d{1,2}):(\d{2})/);
//         if (timeMatch) {
//           const hours = parseInt(timeMatch[1], 10);
//           const minutes = parseInt(timeMatch[2], 10);
//           parsedDate.setHours(hours, minutes, 0, 0);
//         } else {
//           parsedDate.setHours(0, 0, 0, 0);
//         }
//       } else {
//         parsedDate.setHours(0, 0, 0, 0);
//       }

//       return parsedDate;
//     }

//     // Парсим дату для KJKK
//     if (typeof dateString === 'string' && dateString.match(/\d{1,2}\s\w+\s\d{4}/)) {
//       console.log(`Parsing KJKK date: ${dateString}`);
//       let datePart = dateString;
//       let timePart = timeString;

//       if (dateString.includes(' - ')) {
//         [datePart, timePart] = dateString.split(' - ');
//       }

//       const [day, monthStr, year] = datePart.trim().split(/\s+/);
//       const month = months[monthStr.toLowerCase()];

//       if (month === undefined) {
//         console.error(`Unknown month: ${monthStr}`);
//         return null;
//       }

//       const date = new Date(year, month, day);

//       if (timePart) {
//         const timeMatch = timePart.match(/(\d{1,2}):(\d{2})/);
//         if (timeMatch) {
//           const hours = parseInt(timeMatch[1], 10);
//           const minutes = parseInt(timeMatch[2], 10);
//           date.setHours(hours, minutes, 0, 0);
//         }
//       } else if (timeString) {
//         const timeMatch = timeString.match(/(\d{1,2}):(\d{2})/);
//         if (timeMatch) {
//           const hours = parseInt(timeMatch[1], 10);
//           const minutes = parseInt(timeMatch[2], 10);
//           date.setHours(hours, minutes, 0, 0);
//         }
//       }

//       return date;
//     }

//     return null;
//   } catch (error) {
//     console.error(`❌ Error formatting dateTime "${dateString} ${timeString}":`, error);
//     return null;
//   }
// };

// // Функция для форматирования отображаемой даты в "27 Apr HH:mm AM/PM"
// const formatDisplayDateTime = (dateTime) => {
//   if (!dateTime) return 'Date not specified';

//   try {
//     const date = new Date(dateTime);
//     if (isNaN(date.getTime())) return 'Invalid date';

//     const day = date.getDate();
//     const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
//     let hours = date.getHours();
//     const minutes = String(date.getMinutes()).padStart(2, '0');
//     const period = hours >= 12 ? 'PM' : 'AM';

//     // Преобразуем в 12-часовой формат
//     hours = hours % 12 || 12; // Если 0 или 12, то 12

//     return `${day} ${month} ${hours}:${minutes} ${period}`;
//   } catch (error) {
//     console.error(`❌ Error formatting display dateTime "${dateTime}":`, error);
//     return 'Invalid date';
//   }
// };

// // Функция для получения событий из базы данных
// export const getEvents = async (req, res) => {
//   try {
//     const { place_id, offset = 0, limit = 3 } = req.query;

//     if (isNaN(offset) || isNaN(limit)) {
//       return res.status(400).json({ message: 'Invalid offset or limit' });
//     }

//     const queryOptions = {
//       offset: parseInt(offset),
//       limit: parseInt(limit),
//       include: [
//         {
//           model: Place,
//           as: 'place',
//           include: [{ model: City, as: 'cityData' }],
//         },
//         { model: City, as: 'city' },
//       ],
//     };

//     if (place_id) {
//       if (isNaN(place_id)) {
//         return res.status(400).json({ message: 'Invalid place_id' });
//       }
//       queryOptions.where = { placeId: parseInt(place_id) };
//     }

//     const events = await Event.findAll(queryOptions);
//     const hasMore = events.length === parseInt(limit);

//     const formattedEvents = events.map(event => ({
//       ...event.toJSON(),
//       cityName: event.city?.city_name || event.place?.cityData?.city_name || null,
//     }));

//     res.status(200).json({ events: formattedEvents, hasMore });
//   } catch (error) {
//     console.error('Error fetching events:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Функция для парсинга футбольных матчей без сохранения в БД
// export const parseFootballMatches = async (req, res) => {
//   res.status(200).json({
//     matches: [
//       {
//         name: "Mock Team A vs Mock Team B",
//         homeTeam: "Mock Team A",
//         homeLogo: "https://via.placeholder.com/50",
//         awayTeam: "Mock Team B",
//         awayLogo: "https://via.placeholder.com/50",
//         dateTimeText: "05.05.2025\nKell 19:00",
//         date_time: new Date("2025-05-05T19:00:00Z"),
//         displayDateTime: "5 May 19:00",
//         link: "https://example.com",
//       },
//     ],
//   });
// };

// // Функция для парсинга событий
// export const parseEvents = async () => {
//   for (const [url, config] of Object.entries(parseConfig)) {
//     let browser;
//     try {
//       browser = await puppeteer.launch({ headless: true });
//       const page = await browser.newPage();
//       await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

//       if (url.includes('apollokino.ee')) {
//         let retries = 3;
//         while (retries > 0) {
//           try {
//             await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
//             break;
//           } catch (error) {
//             retries--;
//             console.warn(`Retrying (${retries} left) for ${url}: ${error}`);
//             if (retries === 0) throw error;
//           }
//         }

//         const now = new Date();
//         const today = now.toISOString().split('T')[0];
//         const tomorrow = new Date(now);
//         tomorrow.setDate(now.getDate() + 1);
//         const tomorrowDate = tomorrow.toISOString().split('T')[0];

//         const dayInputs = await page.$$('input.day-picker__input[name="3062-dt"]');
//         console.log(`Found ${dayInputs.length} date inputs`);

//         if (!dayInputs.length) {
//           console.error('No date inputs found, cannot proceed with parsing');
//           continue;
//         }

//         const events = [];

//         for (const dayInput of dayInputs) {
//           const inputValue = await dayInput.evaluate(el => el.value);
//           console.log(`Processing date input: ${inputValue}`);

//           // Парсим дату в формате DD.MM.YYYY
//           const [day, month, year] = inputValue.split('.').map(s => s.trim());
//           if (!day || !month || !year) {
//             console.error(`Invalid date format: ${inputValue}`);
//             continue;
//           }

//           const inputDateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

//           if (inputDateStr !== today && inputDateStr !== tomorrowDate) {
//             console.log(`Skipping date ${inputDateStr}, not today or tomorrow`);
//             continue;
//           }

//           console.log(`Selecting date: ${inputDateStr}`);
//           await dayInput.click();

//           try {
//             await page.waitForSelector('.schedule-card', { timeout: 20000 });
//             console.log(`Content loaded for date ${inputDateStr}`);
//           } catch (error) {
//             console.error(`❌ Failed to load content for date ${inputDateStr}:`, error);
//             continue;
//           }

//           await page.evaluate(async () => {
//             await new Promise((resolve) => {
//               let totalHeight = 0;
//               const distance = 100;
//               const timer = setInterval(() => {
//                 const scrollHeight = document.body.scrollHeight;
//                 window.scrollBy(0, distance);
//                 totalHeight += distance;
//                 if (totalHeight >= scrollHeight) {
//                   clearInterval(timer);
//                   resolve();
//                 }
//               }, 100);
//             });
//           });

//           await page.waitForNetworkIdle({ timeout: 20000 });

//           const eventsData = await page.evaluate((config, inputDateStr) => {
//             const results = [];
//             const eventBlocks = document.querySelectorAll('.schedule-card');

//             eventBlocks.forEach((block) => {
//               const event = {
//                 name: block.querySelector('.schedule-card__title')?.innerText.trim() || '',
//                 date: inputDateStr,
//                 displayDate: block.querySelector('.schedule-card__time')?.innerText.trim() || '',
//                 description: block.querySelector('.schedule-card__details')?.innerText.trim() || '',
//                 link: block.querySelector('.schedule-card__link')?.href || '',
//                 image: '',
//                 time: '',
//               };

//               if (!event.name) return;

//               const timeMatch = event.displayDate.match(/\d{1,2}:\d{2}\s*(?:AM|PM)/i);
//               event.time = timeMatch ? timeMatch[0] : '';

//               const imageElement = block.querySelector('.image.schedule-card__image img');
//               if (imageElement) {
//                 imageElement.scrollIntoView();
//                 event.image = imageElement.currentSrc || imageElement.src || '';
//               }

//               results.push(event);
//             });
//             return results;
//           }, config, inputDateStr);

//           console.log(`Parsed ${eventsData.length} events for date ${inputDateStr}`);

//           const filteredEvents = eventsData.filter(event => {
//             if (!event.time) return true;
//             const timeMatch = event.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
//             if (!timeMatch) return true;
//             let [_, hours, minutes, period] = timeMatch;
//             hours = parseInt(hours);
//             minutes = parseInt(minutes);

//             if (period.toUpperCase() === 'PM' && hours !== 12) {
//               hours += 12;
//             } else if (period.toUpperCase() === 'AM' && hours === 12) {
//               hours = 0;
//             }

//             const sessionDateTime = new Date(event.date);
//             sessionDateTime.setHours(hours, minutes);
//             return sessionDateTime >= now; // Фильтруем прошедшие события
//           });

//           console.log(`After filtering, ${filteredEvents.length} events remain for date ${inputDateStr}`);

//           filteredEvents.forEach(event => {
//             event.date_time = formatEventDateTime(event.displayDate, event.time, url, event.date);
//             event.displayDateTime = formatDisplayDateTime(event.date_time);
//           });

//           events.push(...filteredEvents);
//         }

//         // Разделяем события на сегодняшние и завтрашние
//         const todayEvents = events.filter(e => e.date === today);
//         const tomorrowEvents = events.filter(e => e.date === tomorrowDate);

//         // Сортируем по времени
//         todayEvents.sort((a, b) => a.date_time - b.date_time);
//         tomorrowEvents.sort((a, b) => a.date_time - b.date_time);

//         // Формируем итоговый список
//         const upcomingEvents = [...todayEvents]; // Все события на сегодня
//         const todayCount = todayEvents.length;

//         if (todayCount >= 5) {
//           // Если событий на сегодня 5 или больше, добавляем до 3 событий завтра
//           upcomingEvents.push(...tomorrowEvents.slice(0, 3));
//         } else {
//           // Если событий на сегодня меньше 5, добавляем все события завтра
//           upcomingEvents.push(...tomorrowEvents);
//         }

//         console.log(`Today events: ${todayEvents.length}, Tomorrow events: ${tomorrowEvents.length}`);
//         console.log(`Total events to save for ${url}: ${upcomingEvents.length}`);
//         upcomingEvents.forEach(e => console.log(`Selected: ${e.name} at ${e.displayDateTime}`));

//         // Сохранение событий
//         const hashes = [];
//         for (const event of upcomingEvents) {
//           const hash = crypto.createHash('md5').update(`${url}${event.name}${event.date_time}`).digest('hex');
//           hashes.push(hash);

//           console.log(`Saving event: ${event.name}, dateTime: ${event.displayDateTime}`);

//           try {
//             await Event.upsert({
//               url,
//               name: event.name,
//               date_time: event.date_time,
//               description: event.description,
//               image: event.image || null,
//               placeId: config.placeId,
//               cityId: config.cityId,
//               hash,
//             });
//             console.log(`🎉 Successfully saved event: ${event.name}`);
//           } catch (error) {
//             console.error(`❌ Failed to save event ${event.name}:`, error);
//           }
//         }

//         // Удаление старых событий
//         try {
//           await Event.destroy({
//             where: {
//               url,
//               hash: { [Op.notIn]: hashes },
//             },
//           });
//           console.log(`Deleted old events for ${url}`);
//         } catch (error) {
//           console.error(`❌ Failed to delete old events for ${url}:`, error);
//         }

//         continue;
//       }

//       // Обработка для jalgpall.ee
//       if (url.includes('jalgpall.ee')) {
//         await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

//         const eventsData = await page.evaluate((config) => {
//           const results = [];
//           const eventBlocks = document.querySelectorAll(config.eventBlockSelector);

//           eventBlocks.forEach((block) => {
//             const homeTeam = block.querySelector(config.homeTeamSelector)?.textContent.trim() || '';
//             const homeLogo = block.querySelector(config.homeLogoSelector)?.src || '';
//             const awayTeam = block.querySelector(config.awayTeamSelector)?.textContent.trim() || '';
//             const awayLogo = block.querySelector(config.awayLogoSelector)?.src || '';
//             const dateTimeText = block.querySelector(config.dateTimeSelector)?.textContent.trim() || '';
//             const link = block.querySelector(config.eventLinkSelector)?.href || '';

//             if (!homeTeam || !awayTeam || !dateTimeText) return;

//             results.push({
//               name: `${homeTeam} vs ${awayTeam}`,
//               homeTeam,
//               homeLogo,
//               awayTeam,
//               awayLogo,
//               dateTimeText,
//               link,
//             });
//           });
//           return results;
//         }, config);

//         const now = new Date();
//         const events = eventsData.map(event => {
//           const date_time = formatEventDateTime(event.dateTimeText, null, url);
//           return {
//             ...event,
//             date_time,
//             displayDateTime: formatDisplayDateTime(date_time),
//           };
//         }).filter(event => event.date_time && event.date_time >= now);

//         const hashes = [];
//         for (const event of events) {
//           const hash = crypto.createHash('md5').update(`${url}${event.name}${event.date_time}`).digest('hex');
//           hashes.push(hash);

//           await Event.upsert({
//             url,
//             name: event.name,
//             date_time: event.date_time,
//             description: `Football match: ${event.homeTeam} vs ${event.awayTeam}`,
//             image: event.homeLogo || event.awayLogo || null,
//             placeId: config.placeId,
//             cityId: config.cityId,
//             hash,
//             homeTeam: event.homeTeam,
//             homeLogo: event.homeLogo,
//             awayTeam: event.awayTeam,
//             awayLogo: event.awayLogo,
//             link: event.link,
//           });
//         }

//         await Event.destroy({
//           where: {
//             url,
//             hash: { [Op.notIn]: hashes },
//           },
//         });

//         console.log(`Parsed and updated football matches for ${url}`);
//         continue;
//       }

//       // Обработка для kjkk.ee/et/syndmused/kontsert
//       if (url.includes('kjkk.ee/et/syndmused/kontsert')) {
//         await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
//         await page.waitForSelector('img[class*="teaser_"]', { timeout: 15000 });
//         await page.waitForSelector('div.element.element-date', { timeout: 15000 });

//         const eventsData = await page.evaluate((pageUrl) => {
//           const imgNodes = Array.from(document.querySelectorAll('img[class*="teaser_"]'));
//           const dateNodes = Array.from(document.querySelectorAll('div.element.element-date'));
//           const results = [];

//           const count = Math.min(imgNodes.length, dateNodes.length);
//           for (let i = 0; i < count; i++) {
//             const imgNode = imgNodes[i];
//             const dateNode = dateNodes[i];

//             const name = imgNode.getAttribute('title') || imgNode.getAttribute('alt') || '';
//             const image = imgNode.src;
//             const date = dateNode.textContent.trim();

//             if (!name || !date) continue;

//             results.push({
//               name,
//               date,
//               image,
//               link: pageUrl,
//               description: '',
//             });
//           }
//           return results;
//         }, url);

//         if (!eventsData.length) {
//           console.log('❌ События не найдены на KJKK');
//           continue;
//         }

//         console.log(`🎉 Найдено ${eventsData.length} событий на KJKK`);

//         const hashes = [];
//         for (const ev of eventsData) {
//           console.log(`Processing event: ${ev.name}, date: ${ev.date}`);
//           const date_time = formatEventDateTime(ev.date, null, url);
//           console.log(`Parsed date_time: ${date_time}`);

//           if (!date_time) {
//             console.error(`❌ Failed to parse date for event: ${ev.name}, date: ${ev.date}`);
//             continue;
//           }

//           const hash = crypto.createHash('md5')
//             .update(`${url}${ev.name}${date_time}`)
//             .digest('hex');
//           hashes.push(hash);

//           try {
//             await Event.upsert({
//               url,
//               name: ev.name,
//               date_time: date_time,
//               description: ev.description || 'Нет описания',
//               image: ev.image || null,
//               placeId: config.placeId,
//               cityId: config.cityId,
//               hash,
//             });
//             console.log(`🎉 Сохранено: ${ev.name} — ${formatDisplayDateTime(date_time)}`);
//           } catch (err) {
//             console.error(`❌ Ошибка при сохранении ${ev.name}:`, err);
//           }
//         }

//         try {
//           await Event.destroy({
//             where: {
//               url,
//               hash: { [Op.notIn]: hashes },
//             },
//           });
//           console.log(`Удалены старые события для ${url}`);
//         } catch (err) {
//           console.error(`❌ Ошибка удаления старых событий:`, err);
//         }

//         continue;
//       }

//       // Обработка для johvi.concert.ee и остальных сайтов
//       await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

//       const eventsData = await page.evaluate((config, url) => {
//         const results = [];
//         const eventBlocks = document.querySelectorAll(config.eventBlockSelector);
//         eventBlocks.forEach((block) => {
//           let event = {};

//           if (url === 'https://pargikeskus.ee/kampaaniad/') {
//             const titleElement = block.querySelector('.campaign-title');
//             const dateElement = block.querySelector('.campaign-date');
//             const descriptionElement = block.querySelector('.campaign-description');

//             event = {
//               name: titleElement?.innerText.trim() || 'Unknown Event',
//               date: dateElement?.innerText.trim() || '',
//               description: descriptionElement?.innerText.trim() || '',
//               image: config.imageAttribute
//                 ? block.querySelector(config.imageSelector)?.getAttribute(config.imageAttribute) || ''
//                 : block.querySelector(config.imageSelector)?.getAttribute('src') || '',
//               link: '',
//             };
//           } else {
//             const dateTimeText = block.querySelector(config.dateSelector)?.innerText.trim() || '';

//             event = {
//               name: block.querySelector(config.nameSelector)?.innerText.trim() || '',
//               date: dateTimeText,
//               description: block.querySelector(config.descriptionSelector)?.innerText.trim() || '',
//               link: config.eventLinkSelector
//                 ? block.querySelector(config.eventLinkSelector)?.href || ''
//                 : '',
//               image: '',
//             };

//             if (!config.eventPageImageSelector && config.imageSelector) {
//               const imageElement = block.querySelector(config.imageSelector);
//               if (imageElement) {
//                 if (config.imageStyle === 'background-image') {
//                   const style = window.getComputedStyle(imageElement);
//                   const backgroundImage = style.backgroundImage;
//                   event.image = backgroundImage ? backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1') : '';
//                 } else if (config.imageAttribute) {
//                   event.image = imageElement.getAttribute(config.imageAttribute) || '';
//                 } else {
//                   event.image = imageElement.getAttribute('src') || '';
//                 }
//               }
//             }
//           }

//           if (!event.name) return;
//           results.push(event);
//         });
//         return results;
//       }, config, url);

//       const events = [];
//       if (config.eventPageImageSelector) {
//         for (const event of eventsData) {
//           const date_time = formatEventDateTime(event.date, null, url);
//           event.date_time = date_time;
//           event.displayDateTime = formatDisplayDateTime(date_time);

//           if (!event.link) {
//             console.log(`❌ No link found for event: ${event.name}, skipping image extraction`);
//             events.push({ ...event, image: '' });
//             continue;
//           }

//           try {
//             const absoluteLink = event.link.startsWith('http')
//               ? event.link
//               : new URL(event.link, url).href;

//             console.log(`Navigating to event page: ${absoluteLink}`);
//             await page.goto(absoluteLink, { waitUntil: 'networkidle2', timeout: 60000 });

//             const image = await page.evaluate((eventPageImageSelector, eventPageImageAttribute) => {
//               const selectors = [
//                 eventPageImageSelector,
//                 '.col-1 img',
//                 '.event-image img',
//                 '.poster img',
//                 '.event-poster img',
//                 'img.event-image',
//                 '.event-detail img',
//                 '.content img',
//               ];

//               let imageUrl = '';
//               for (const selector of selectors) {
//                 const imageElement = document.querySelector(selector);
//                 if (imageElement) {
//                   imageUrl = eventPageImageAttribute
//                     ? imageElement.getAttribute(eventPageImageAttribute) || ''
//                     : imageElement.getAttribute('src') || '';
//                   break;
//                 }
//               }

//               return imageUrl;
//             }, config.eventPageImageSelector, config.eventPageImageAttribute);

//             events.push({ ...event, image });
//           } catch (error) {
//             console.error(`❌ Error navigating to ${absoluteLink}:`, error);
//             events.push({ ...event, image: '' });
//           }
//         }
//       } else {
//         eventsData.forEach(event => {
//           const date_time = formatEventDateTime(event.date, null, url);
//           event.date_time = date_time;
//           event.displayDateTime = formatDisplayDateTime(date_time);
//           events.push(event);
//         });
//       }

//       console.log(`Events to save for ${url}:`, events);

//       const hashes = [];
//       for (const event of events) {
//         const hash = crypto.createHash('md5').update(`${url}${event.name}${event.date_time || ''}`).digest('hex');
//         hashes.push(hash);

//         await Event.upsert({
//           url,
//           name: event.name,
//           date_time: event.date_time,
//           description: event.description,
//           image: event.image || null,
//           placeId: config.placeId,
//           cityId: config.cityId,
//           hash,
//         });
//       }

//       await Event.destroy({
//         where: {
//           url,
//           hash: { [Op.notIn]: hashes },
//         },
//       });

//       console.log(`Parsed and updated events for ${url}`);
//     } catch (error) {
//       console.error(`❌ Error parsing ${url}:`, error);
//     } finally {
//       if (browser) {
//         await browser.close();
//       }
//     }
//   }
// };

// export const createEvent = async (req, res) => {
//   const transaction = await db.transaction();
//   try {
//     const { name, description, date_time, url, placeId, cityId } = req.body;
//     const photo = req.file ? `/assets/uploads/${req.file.filename}` : req.body.image;

//     if (!name || !date_time || !placeId || !cityId) {
//       await transaction.rollback();
//       return res.status(400).json({ message: 'Name, date_time, placeId, and cityId are required' });
//     }

//     const hash = crypto.createHash('md5').update(`${url || ''}${name}${date_time}`).digest('hex');

//     const newEvent = await Event.create({
//       name,
//       description,
//       date_time: new Date(date_time),
//       url,
//       image: photo,
//       placeId,
//       cityId,
//       hash
//     }, { transaction });

//     await transaction.commit();

//     const eventWithDetails = await Event.findByPk(newEvent.id, {
//       include: [
//         {
//           model: Place,
//           as: 'place',
//           include: [{ model: City, as: 'cityData' }],
//         },
//         { model: City, as: 'city' },
//       ],
//     });

//     res.status(201).json({
//       message: 'Event created successfully',
//       event: {
//         ...eventWithDetails.toJSON(),
//         cityName: eventWithDetails.city?.city_name || eventWithDetails.place?.cityData?.city_name || null,
//       }
//     });
//   } catch (error) {
//     await transaction.rollback();
//     console.error('Error creating event:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Обновить событие
// export const updateEvent = async (req, res) => {
//   const transaction = await db.transaction();
//   try {
//     const { id } = req.params;
//     const { name, description, date_time, url, placeId, cityId } = req.body;
//     const photo = req.file ? `/assets/uploads/${req.file.filename}` : req.body.image;

//     const event = await Event.findByPk(id, { transaction });
//     if (!event) {
//       await transaction.rollback();
//       return res.status(404).json({ message: 'Event not found' });
//     }

//     const updates = {};
//     if (name && name !== event.name) updates.name = name;
//     if (description !== undefined && description !== event.description) updates.description = description;
//     if (date_time && new Date(date_time).getTime() !== event.date_time.getTime()) updates.date_time = new Date(date_time);
//     if (url !== undefined && url !== event.url) updates.url = url;
//     if (placeId && placeId !== event.placeId) updates.placeId = placeId;
//     if (cityId && cityId !== event.cityId) updates.cityId = cityId;
//     if (photo && photo !== event.image) updates.image = photo;

//     if (Object.keys(updates).length > 0) {
//       if (updates.name || updates.date_time || updates.url) {
//         updates.hash = crypto.createHash('md5').update(`${updates.url || event.url || ''}${updates.name || event.name}${updates.date_time || event.date_time}`).digest('hex');
//       }
//       await Event.update(updates, { where: { id }, transaction });
//     }

//     await transaction.commit();

//     const updatedEvent = await Event.findByPk(id, {
//       include: [
//         {
//           model: Place,
//           as: 'place',
//           include: [{ model: City, as: 'cityData' }],
//         },
//         { model: City, as: 'city' },
//       ],
//     });

//     res.status(200).json({
//       message: 'Event updated successfully',
//       event: {
//         ...updatedEvent.toJSON(),
//         cityName: updatedEvent.city?.city_name || updatedEvent.place?.cityData?.city_name || null,
//       }
//     });
//   } catch (error) {
//     await transaction.rollback();
//     console.error('Error updating event:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Удалить событие
// export const deleteEvent = async (req, res) => {
//   const transaction = await db.transaction();
//   try {
//     const { id } = req.params;
//     const event = await Event.findByPk(id, { transaction });

//     if (!event) {
//       await transaction.rollback();
//       return res.status(404).json({ message: 'Event not found' });
//     }

//     if (event.image && !event.image.startsWith('http')) {
//       try {
//         await fs.unlink(`public${event.image}`);
//       } catch (err) {
//         console.error('Error deleting event image:', err);
//       }
//     }

//     await event.destroy({ transaction });
//     await transaction.commit();

//     res.status(200).json({ message: 'Event deleted successfully' });
//   } catch (error) {
//     await transaction.rollback();
//     console.error('Error deleting event:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// export const getEventById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!Number.isInteger(parseInt(id))) {
//       return res.status(400).json({ message: 'Invalid event ID' });
//     }

//     const event = await Event.findByPk(id);

//     if (!event) {
//       return res.status(404).json({ message: 'Event not found' });
//     }

//     const eventData = {
//       id: event.id,
//       name: event.name || '',
//       description: event.description || '',
//       date_time: event.date_time ? event.date_time.toISOString() : '',
//       url: event.url || '',
//       placeId: event.placeId ? event.placeId.toString() : '',
//       cityId: event.cityId ? event.cityId.toString() : '',
//       image: event.image || ''
//     };

//     res.status(200).json(eventData);
//   } catch (error) {
//     console.error('Error fetching event:', error);
//     res.status(500).json({ message: 'Server error while fetching event' });
//   }
// };
import puppeteer from 'puppeteer';
import crypto from 'crypto';
import { Event, Place, City } from '../models/index.js';
import { Op } from 'sequelize';
import db from '../config/database.js';

// Конфигурация для парсинга
const parseConfig = {
  "https://www.apollokino.ee/eng/schedule?theatreAreaID=1019&fromLang=1001": { // Jõhvi
    eventBlockSelector: '.schedule-card',
    nameSelector: '.schedule-card__title',
    dateSelector: '.schedule-card__time',
    timeSelector: '.schedule-card__time',
    imageSelector: '.image.schedule-card__image img',
    imageAttribute: 'currentSrc',
    descriptionSelector: '.schedule-card__details',
    eventLinkSelector: '.schedule-card__link',
    placeId: 2,
    cityId: 1,
  },
  "https://www.apollokino.ee/eng/schedule?theatreAreaID=1008&fromLang=1001": { // Narva
    eventBlockSelector: '.schedule-card',
    nameSelector: '.schedule-card__title',
    dateSelector: '.schedule-card__time',
    timeSelector: '.schedule-card__time',
    imageSelector: '.image.schedule-card__image img',
    imageAttribute: 'currentSrc',
    descriptionSelector: '.schedule-card__details',
    eventLinkSelector: '.schedule-card__link',
    placeId: 51,
    cityId: 3,
  },
  "https://pargikeskus.ee/kampaaniad/": {
    eventBlockSelector: '.campaign-item',
    nameSelector: '.campaign-title',
    dateSelector: '.campaign-date',
    descriptionSelector: '.campaign-description',
    imageSelector: '.campaign-image img',
    placeId: 3,
    cityId: 2,
  },
  "https://www.kjkk.ee/et/syndmused/kontsert": {
    eventBlockSelector: '.zoo-item',
    nameSelector: 'img',
    linkSelector: 'a',
    imageSelector: 'img',
    imageAttribute: 'src',
    placeId: 50,
    cityId: 2,
  },
  "https://johvi.concert.ee": {
    eventBlockSelector: '.event-list .col-1',
    nameSelector: 'h2',
    dateSelector: '.event-date',
    timeSelector: '.event-time',
    dateTimeCombined: true,
    imageSelector: '.image',
    imageStyle: 'background-image',
    descriptionSelector: '.info',
    eventLinkSelector: '.info a.btn.low',
    eventPageImageSelector: '.event-image img',
    eventPageImageAttribute: 'src',
    placeId: 1,
    cityId: 1,
  },
  "https://jalgpall.ee/voistlused/team/5160": {
    eventBlockSelector: 'tr.upcoming-game',
    homeTeamSelector: '.team.left .content a',
    homeLogoSelector: '.team.left .content img',
    awayTeamSelector: '.team.right .content a',
    awayLogoSelector: '.team.right .content img',
    dateTimeSelector: '.vs .time p:last-child',
    eventLinkSelector: '.vs a',
    placeId: 52,
    cityId: 4,
  },
};

// Функция для форматирования даты и времени в DateTime
const formatEventDateTime = (dateString, timeString, url, eventDate = null) => {
  try {
    if (!dateString) return null;

    const months = {
      'jaanuar': 0, 'veebruar': 1, 'märts': 2, 'aprill': 3, 'mai': 4, 'juuni': 5,
      'juuli': 6, 'august': 7, 'september': 8, 'oktoober': 9, 'november': 10, 'detsember': 11,
      'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
      'july': 6, 'aug': 7, 'sept': 8, 'october': 9, 'nov': 10, 'dec': 11
    };

    // Специфическая обработка для Apollo Kino
    if (url.includes('apollokino.ee')) {
      // Используем eventDate (например, "2025-05-07") как базовую дату
      if (!eventDate) {
        console.error(`No eventDate provided for Apollo Kino: ${dateString}`);
        return null;
      }

      const [year, month, day] = eventDate.split('-').map(Number);
      const parsedDate = new Date(year, month - 1, day);

      // Парсим время из dateString (например, "12:00 PM")
      const timeMatch = dateString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!timeMatch) {
        console.error(`Invalid time format for Apollo Kino: ${dateString}`);
        return null;
      }

      let [_, hours, minutes, period] = timeMatch;
      hours = parseInt(hours);
      minutes = parseInt(minutes);

      // Преобразуем время из формата AM/PM в 24-часовой
      if (period.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }

      parsedDate.setHours(hours, minutes, 0, 0);
      return parsedDate;
    }

    // Специфическая обработка для jalgpall.ee
    if (url.includes('jalgpall.ee')) {
      const [datePart, timePart] = dateString.split('\n').map(str => str.trim());
      if (!datePart) return null;

      const [day, month, year] = datePart.split('.');
      if (!day || !month || !year) {
        console.error(`Invalid date format: ${datePart}`);
        return null;
      }

      const parsedDate = new Date(year, parseInt(month) - 1, parseInt(day));
      if (isNaN(parsedDate.getTime())) {
        console.error(`Invalid parsed date: ${datePart}`);
        return null;
      }

      if (timePart && timePart.includes('Kell')) {
        const time = timePart.replace('Kell', '').trim();
        const timeMatch = time.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          parsedDate.setHours(hours, minutes, 0, 0);
        } else {
          parsedDate.setHours(0, 0, 0, 0);
        }
      } else {
        parsedDate.setHours(0, 0, 0, 0);
      }

      return parsedDate;
    }

    // Специфическая обработка для johvi.concert.ee
    if (url.includes('johvi.concert.ee')) {
      let datePart = dateString;
      let timePart = null;

      const parts = dateString.split(',').map(str => str.trim());
      if (parts.length > 1 && parts[parts.length - 1].match(/\d{1,2}:\d{2}/)) {
        timePart = parts.pop();
        datePart = parts.join(',').trim();
      }

      let day, month;
      const dateMatch = datePart.match(/(\d{1,2})\.(\d{2})/);
      if (!dateMatch) {
        console.error(`Invalid date format: ${datePart}`);
        return null;
      }
      [, day, month] = dateMatch;

      const now = new Date();
      let year = now.getFullYear();
      const parsedDate = new Date(year, parseInt(month) - 1, parseInt(day));

      if (parsedDate < now) {
        year += 1;
        parsedDate.setFullYear(year);
      }

      if (timePart) {
        const timeMatch = timePart.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          parsedDate.setHours(hours, minutes, 0, 0);
        } else {
          parsedDate.setHours(0, 0, 0, 0);
        }
      } else {
        parsedDate.setHours(0, 0, 0, 0);
      }

      return parsedDate;
    }

    // Парсим дату для KJKK
    if (typeof dateString === 'string' && dateString.match(/\d{1,2}\s\w+\s\d{4}/)) {
      console.log(`Parsing KJKK date: ${dateString}`);
      let datePart = dateString;
      let timePart = timeString;

      if (dateString.includes(' - ')) {
        [datePart, timePart] = dateString.split(' - ');
      }

      const [day, monthStr, year] = datePart.trim().split(/\s+/);
      const month = months[monthStr.toLowerCase()];

      if (month === undefined) {
        console.error(`Unknown month: ${monthStr}`);
        return null;
      }

      const date = new Date(year, month, day);

      if (timePart) {
        const timeMatch = timePart.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          date.setHours(hours, minutes, 0, 0);
        }
      } else if (timeString) {
        const timeMatch = timeString.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          date.setHours(hours, minutes, 0, 0);
        }
      }

      return date;
    }

    return null;
  } catch (error) {
    console.error(`❌ Error formatting dateTime "${dateString} ${timeString}":`, error);
    return null;
  }
};

// Функция для форматирования отображаемой даты в "27 Apr HH:mm AM/PM"
const formatDisplayDateTime = (dateTime) => {
  if (!dateTime) return 'Date not specified';

  try {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return 'Invalid date';

    const day = date.getDate();
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';

    // Преобразуем в 12-часовой формат
    hours = hours % 12 || 12; // Если 0 или 12, то 12

    return `${day} ${month} ${hours}:${minutes} ${period}`;
  } catch (error) {
    console.error(`❌ Error formatting display dateTime "${dateTime}":`, error);
    return 'Invalid date';
  }
};

// Функция для получения событий из базы данных
export const getEvents = async (req, res) => {
  try {
    const { place_id, offset = 0, limit = 3 } = req.query;

    if (isNaN(offset) || isNaN(limit)) {
      return res.status(400).json({ message: 'Invalid offset or limit' });
    }

    const queryOptions = {
      offset: parseInt(offset),
      limit: parseInt(limit),
      include: [
        {
          model: Place,
          as: 'place',
          include: [{ model: City, as: 'cityData' }],
        },
        { model: City, as: 'city' },
      ],
    };

    if (place_id) {
      if (isNaN(place_id)) {
        return res.status(400).json({ message: 'Invalid place_id' });
      }
      queryOptions.where = { placeId: parseInt(place_id) };
    }

    const events = await Event.findAll(queryOptions);
    const hasMore = events.length === parseInt(limit);

    const formattedEvents = events.map(event => ({
      ...event.toJSON(),
      cityName: event.city?.city_name || event.place?.cityData?.city_name || null,
    }));

    res.status(200).json({ events: formattedEvents, hasMore });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Функция для парсинга футбольных матчей без сохранения в БД
export const parseFootballMatches = async (req, res) => {
  res.status(200).json({
    matches: [
      {
        name: "Mock Team A vs Mock Team B",
        homeTeam: "Mock Team A",
        homeLogo: "https://via.placeholder.com/50",
        awayTeam: "Mock Team B",
        awayLogo: "https://via.placeholder.com/50",
        dateTimeText: "05.05.2025\nKell 19:00",
        date_time: new Date("2025-05-05T19:00:00Z"),
        displayDateTime: "5 May 19:00",
        link: "https://example.com",
      },
    ],
  });
};

// Функция для парсинга событий
export const parseEvents = async () => {
  for (const [url, config] of Object.entries(parseConfig)) {
    let browser;
    try {
      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      if (url.includes('apollokino.ee')) {
        let retries = 3;
        while (retries > 0) {
          try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            break;
          } catch (error) {
            retries--;
            console.warn(`Retrying (${retries} left) for ${url}: ${error}`);
            if (retries === 0) throw error;
          }
        }
      
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split('T')[0];
      
        const dayInputs = await page.$$('input.day-picker__input[name="3062-dt"]');
        console.log(`Found ${dayInputs.length} date inputs`);
      
        if (!dayInputs.length) {
          console.error('No date inputs found, cannot proceed with parsing');
          continue;
        }
      
        const events = [];
      
        for (const dayInput of dayInputs) {
          const inputValue = await dayInput.evaluate(el => el.value);
          console.log(`Processing date input: ${inputValue}`);
      
          // Парсим дату в формате DD.MM.YYYY
          const [day, month, year] = inputValue.split('.').map(s => s.trim());
          if (!day || !month || !year) {
            console.error(`Invalid date format: ${inputValue}`);
            continue;
          }
      
          const inputDateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
          console.log(`Selecting date: ${inputDateStr}`);
          await dayInput.click();
      
          try {
            await page.waitForSelector('.schedule-card', { timeout: 20000 });
            console.log(`Content loaded for date ${inputDateStr}`);
          } catch (error) {
            console.error(`❌ Failed to load content for date ${inputDateStr}:`, error);
            continue;
          }
      
          await page.evaluate(async () => {
            await new Promise((resolve) => {
              let totalHeight = 0;
              const distance = 100;
              const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight) {
                  clearInterval(timer);
                  resolve();
                }
              }, 100);
            });
          });
      
          await page.waitForNetworkIdle({ timeout: 20000 });
      
          const eventsData = await page.evaluate((config, inputDateStr) => {
            const results = [];
            const eventBlocks = document.querySelectorAll('.schedule-card');
      
            eventBlocks.forEach((block) => {
              const event = {
                name: block.querySelector('.schedule-card__title')?.innerText.trim() || '',
                date: inputDateStr,
                displayDate: block.querySelector('.schedule-card__time')?.innerText.trim() || '',
                description: block.querySelector('.schedule-card__details')?.innerText.trim() || '',
                link: block.querySelector('.schedule-card__link')?.href || '',
                image: '',
                time: '',
              };
      
              if (!event.name) return;
      
              const timeMatch = event.displayDate.match(/\d{1,2}:\d{2}\s*(?:AM|PM)/i);
              event.time = timeMatch ? timeMatch[0] : '';
      
              const imageElement = block.querySelector('.image.schedule-card__image img');
              if (imageElement) {
                imageElement.scrollIntoView();
                event.image = imageElement.currentSrc || imageElement.src || '';
              }
      
              results.push(event);
            });
            return results;
          }, config, inputDateStr);
      
          console.log(`Parsed ${eventsData.length} events for date ${inputDateStr}`);
      
          events.push(...eventsData);
        }
      
        // Фильтрация прошедших событий для сегодняшнего дня
        const todayEventsUnfiltered = events.filter(event => event.date === today);
        const filteredTodayEvents = todayEventsUnfiltered.filter(event => {
          if (!event.time) return true;
          const timeMatch = event.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (!timeMatch) return true;
          let [_, hours, minutes, period] = timeMatch;
          hours = parseInt(hours);
          minutes = parseInt(minutes);
      
          if (period.toUpperCase() === 'PM' && hours !== 12) {
            hours += 12;
          } else if (period.toUpperCase() === 'AM' && hours === 12) {
            hours = 0;
          }
      
          const sessionDateTime = new Date(event.date);
          sessionDateTime.setHours(hours, minutes);
          return sessionDateTime >= now; // Оставляем только будущие события
        });
      
        console.log(`After filtering, ${filteredTodayEvents.length} events remain for today`);
      
        // Добавляем все события завтрашнего дня, если меньше 5 событий
        let upcomingEvents = [...filteredTodayEvents];
        const tomorrowEvents = events.filter(event => event.date === tomorrowDate);
        if (filteredTodayEvents.length < 5) {
          upcomingEvents.push(...tomorrowEvents);
        }
      
        // Сортируем по времени
        upcomingEvents.sort((a, b) => {
          const aTime = a.date_time || new Date(a.date);
          const bTime = b.date_time || new Date(b.date);
          return aTime - bTime;
        });
      
        // Устанавливаем date_time и displayDateTime для всех событий
        upcomingEvents.forEach(event => {
          event.date_time = formatEventDateTime(event.displayDate, event.time, url, event.date);
          event.displayDateTime = formatDisplayDateTime(event.date_time);
        });
      
        console.log(`Today events: ${filteredTodayEvents.length}, Tomorrow events: ${tomorrowEvents.length}`);
        console.log(`Total events to save for ${url}: ${upcomingEvents.length}`);
        upcomingEvents.forEach(e => console.log(`Selected: ${e.name} at ${e.displayDateTime}`));
      
        // Сохранение событий
        const hashes = [];
        for (const event of upcomingEvents) {
          const hash = crypto.createHash('md5').update(`${url}${event.name}${event.date_time}`).digest('hex');
          hashes.push(hash);
      
          console.log(`Saving event: ${event.name}, dateTime: ${event.displayDateTime}`);
      
          try {
            await Event.upsert({
              url,
              name: event.name,
              date_time: event.date_time,
              description: event.description,
              image: event.image || null,
              placeId: config.placeId,
              cityId: config.cityId,
              hash,
            });
            console.log(`🎉 Successfully saved event: ${event.name}`);
          } catch (error) {
            console.error(`❌ Failed to save event ${event.name}:`, error);
          }
        }
      
        // Удаление старых событий
        try {
          await Event.destroy({
            where: {
              url,
              hash: { [Op.notIn]: hashes },
            },
          });
          console.log(`Deleted old events for ${url}`);
        } catch (error) {
          console.error(`❌ Failed to delete old events for ${url}:`, error);
        }
      
        continue;
      }

      // Обработка для jalgpall.ee
      if (url.includes('jalgpall.ee')) {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        const eventsData = await page.evaluate((config) => {
          const results = [];
          const eventBlocks = document.querySelectorAll(config.eventBlockSelector);

          eventBlocks.forEach((block) => {
            const homeTeam = block.querySelector(config.homeTeamSelector)?.textContent.trim() || '';
            const homeLogo = block.querySelector(config.homeLogoSelector)?.src || '';
            const awayTeam = block.querySelector(config.awayTeamSelector)?.textContent.trim() || '';
            const awayLogo = block.querySelector(config.awayLogoSelector)?.src || '';
            const dateTimeText = block.querySelector(config.dateTimeSelector)?.textContent.trim() || '';
            const link = block.querySelector(config.eventLinkSelector)?.href || '';

            if (!homeTeam || !awayTeam || !dateTimeText) return;

            results.push({
              name: `${homeTeam} vs ${awayTeam}`,
              homeTeam,
              homeLogo,
              awayTeam,
              awayLogo,
              dateTimeText,
              link,
            });
          });
          return results;
        }, config);

        const now = new Date();
        const events = eventsData.map(event => {
          const date_time = formatEventDateTime(event.dateTimeText, null, url);
          return {
            ...event,
            date_time,
            displayDateTime: formatDisplayDateTime(date_time),
          };
        }).filter(event => event.date_time && event.date_time >= now);

        const hashes = [];
        for (const event of events) {
          const hash = crypto.createHash('md5').update(`${url}${event.name}${event.date_time}`).digest('hex');
          hashes.push(hash);

          await Event.upsert({
            url,
            name: event.name,
            date_time: event.date_time,
            description: `Football match: ${event.homeTeam} vs ${event.awayTeam}`,
            image: event.homeLogo || event.awayLogo || null,
            placeId: config.placeId,
            cityId: config.cityId,
            hash,
            homeTeam: event.homeTeam,
            homeLogo: event.homeLogo,
            awayTeam: event.awayTeam,
            awayLogo: event.awayLogo,
            link: event.link,
          });
        }

        await Event.destroy({
          where: {
            url,
            hash: { [Op.notIn]: hashes },
          },
        });

        console.log(`Parsed and updated football matches for ${url}`);
        continue;
      }

      // Обработка для kjkk.ee/et/syndmused/kontsert
      if (url.includes('kjkk.ee/et/syndmused/kontsert')) {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('img[class*="teaser_"]', { timeout: 15000 });
        await page.waitForSelector('div.element.element-date', { timeout: 15000 });

        const eventsData = await page.evaluate((pageUrl) => {
          const imgNodes = Array.from(document.querySelectorAll('img[class*="teaser_"]'));
          const dateNodes = Array.from(document.querySelectorAll('div.element.element-date'));
          const results = [];

          const count = Math.min(imgNodes.length, dateNodes.length);
          for (let i = 0; i < count; i++) {
            const imgNode = imgNodes[i];
            const dateNode = dateNodes[i];

            const name = imgNode.getAttribute('title') || imgNode.getAttribute('alt') || '';
            const image = imgNode.src;
            const date = dateNode.textContent.trim();

            if (!name || !date) continue;

            results.push({
              name,
              date,
              image,
              link: pageUrl,
              description: '',
            });
          }
          return results;
        }, url);

        if (!eventsData.length) {
          console.log('❌ События не найдены на KJKK');
          continue;
        }

        console.log(`🎉 Найдено ${eventsData.length} событий на KJKK`);

        const hashes = [];
        for (const ev of eventsData) {
          console.log(`Processing event: ${ev.name}, date: ${ev.date}`);
          const date_time = formatEventDateTime(ev.date, null, url);
          console.log(`Parsed date_time: ${date_time}`);

          if (!date_time) {
            console.error(`❌ Failed to parse date for event: ${ev.name}, date: ${ev.date}`);
            continue;
          }

          const hash = crypto.createHash('md5')
            .update(`${url}${ev.name}${date_time}`)
            .digest('hex');
          hashes.push(hash);

          try {
            await Event.upsert({
              url,
              name: ev.name,
              date_time: date_time,
              description: ev.description || 'Нет описания',
              image: ev.image || null,
              placeId: config.placeId,
              cityId: config.cityId,
              hash,
            });
            console.log(`🎉 Сохранено: ${ev.name} — ${formatDisplayDateTime(date_time)}`);
          } catch (err) {
            console.error(`❌ Ошибка при сохранении ${ev.name}:`, err);
          }
        }

        try {
          await Event.destroy({
            where: {
              url,
              hash: { [Op.notIn]: hashes },
            },
          });
          console.log(`Удалены старые события для ${url}`);
        } catch (err) {
          console.error(`❌ Ошибка удаления старых событий:`, err);
        }

        continue;
      }

      // Обработка для johvi.concert.ee и остальных сайтов
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      const eventsData = await page.evaluate((config, url) => {
        const results = [];
        const eventBlocks = document.querySelectorAll(config.eventBlockSelector);
        eventBlocks.forEach((block) => {
          let event = {};

          if (url === 'https://pargikeskus.ee/kampaaniad/') {
            const titleElement = block.querySelector('.campaign-title');
            const dateElement = block.querySelector('.campaign-date');
            const descriptionElement = block.querySelector('.campaign-description');

            event = {
              name: titleElement?.innerText.trim() || 'Unknown Event',
              date: dateElement?.innerText.trim() || '',
              description: descriptionElement?.innerText.trim() || '',
              image: config.imageAttribute
                ? block.querySelector(config.imageSelector)?.getAttribute(config.imageAttribute) || ''
                : block.querySelector(config.imageSelector)?.getAttribute('src') || '',
              link: '',
            };
          } else {
            const dateTimeText = block.querySelector(config.dateSelector)?.innerText.trim() || '';

            event = {
              name: block.querySelector(config.nameSelector)?.innerText.trim() || '',
              date: dateTimeText,
              description: block.querySelector(config.descriptionSelector)?.innerText.trim() || '',
              link: config.eventLinkSelector
                ? block.querySelector(config.eventLinkSelector)?.href || ''
                : '',
              image: '',
            };

            if (!config.eventPageImageSelector && config.imageSelector) {
              const imageElement = block.querySelector(config.imageSelector);
              if (imageElement) {
                if (config.imageStyle === 'background-image') {
                  const style = window.getComputedStyle(imageElement);
                  const backgroundImage = style.backgroundImage;
                  event.image = backgroundImage ? backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1') : '';
                } else if (config.imageAttribute) {
                  event.image = imageElement.getAttribute(config.imageAttribute) || '';
                } else {
                  event.image = imageElement.getAttribute('src') || '';
                }
              }
            }
          }

          if (!event.name) return;
          results.push(event);
        });
        return results;
      }, config, url);

      const events = [];
      if (config.eventPageImageSelector) {
        for (const event of eventsData) {
          const date_time = formatEventDateTime(event.date, null, url);
          event.date_time = date_time;
          event.displayDateTime = formatDisplayDateTime(date_time);

          if (!event.link) {
            console.log(`❌ No link found for event: ${event.name}, skipping image extraction`);
            events.push({ ...event, image: '' });
            continue;
          }

          try {
            const absoluteLink = event.link.startsWith('http')
              ? event.link
              : new URL(event.link, url).href;

            console.log(`Navigating to event page: ${absoluteLink}`);
            await page.goto(absoluteLink, { waitUntil: 'networkidle2', timeout: 60000 });

            const image = await page.evaluate((eventPageImageSelector, eventPageImageAttribute) => {
              const selectors = [
                eventPageImageSelector,
                '.col-1 img',
                '.event-image img',
                '.poster img',
                '.event-poster img',
                'img.event-image',
                '.event-detail img',
                '.content img',
              ];

              let imageUrl = '';
              for (const selector of selectors) {
                const imageElement = document.querySelector(selector);
                if (imageElement) {
                  imageUrl = eventPageImageAttribute
                    ? imageElement.getAttribute(eventPageImageAttribute) || ''
                    : imageElement.getAttribute('src') || '';
                  break;
                }
              }

              return imageUrl;
            }, config.eventPageImageSelector, config.eventPageImageAttribute);

            events.push({ ...event, image });
          } catch (error) {
            console.error(`❌ Error navigating to ${absoluteLink}:`, error);
            events.push({ ...event, image: '' });
          }
        }
      } else {
        eventsData.forEach(event => {
          const date_time = formatEventDateTime(event.date, null, url);
          event.date_time = date_time;
          event.displayDateTime = formatDisplayDateTime(date_time);
          events.push(event);
        });
      }

      console.log(`Events to save for ${url}:`, events);

      const hashes = [];
      for (const event of events) {
        const hash = crypto.createHash('md5').update(`${url}${event.name}${event.date_time || ''}`).digest('hex');
        hashes.push(hash);

        await Event.upsert({
          url,
          name: event.name,
          date_time: event.date_time,
          description: event.description,
          image: event.image || null,
          placeId: config.placeId,
          cityId: config.cityId,
          hash,
        });
      }

      await Event.destroy({
        where: {
          url,
          hash: { [Op.notIn]: hashes },
        },
      });

      console.log(`Parsed and updated events for ${url}`);
    } catch (error) {
      console.error(`❌ Error parsing ${url}:`, error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
};

export const createEvent = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { name, description, date_time, url, placeId, cityId } = req.body;
    const photo = req.file ? `/assets/uploads/${req.file.filename}` : req.body.image;

    if (!name || !date_time || !placeId || !cityId) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Name, date_time, placeId, and cityId are required' });
    }

    const hash = crypto.createHash('md5').update(`${url || ''}${name}${date_time}`).digest('hex');

    const newEvent = await Event.create({
      name,
      description,
      date_time: new Date(date_time),
      url,
      image: photo,
      placeId,
      cityId,
      hash
    }, { transaction });

    await transaction.commit();

    const eventWithDetails = await Event.findByPk(newEvent.id, {
      include: [
        {
          model: Place,
          as: 'place',
          include: [{ model: City, as: 'cityData' }],
        },
        { model: City, as: 'city' },
      ],
    });

    res.status(201).json({
      message: 'Event created successfully',
      event: {
        ...eventWithDetails.toJSON(),
        cityName: eventWithDetails.city?.city_name || eventWithDetails.place?.cityData?.city_name || null,
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Обновить событие
export const updateEvent = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { id } = req.params;
    const { name, description, date_time, url, placeId, cityId } = req.body;
    const photo = req.file ? `/assets/uploads/${req.file.filename}` : req.body.image;

    const event = await Event.findByPk(id, { transaction });
    if (!event) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Event not found' });
    }

    const updates = {};
    if (name && name !== event.name) updates.name = name;
    if (description !== undefined && description !== event.description) updates.description = description;
    if (date_time && new Date(date_time).getTime() !== event.date_time.getTime()) updates.date_time = new Date(date_time);
    if (url !== undefined && url !== event.url) updates.url = url;
    if (placeId && placeId !== event.placeId) updates.placeId = placeId;
    if (cityId && cityId !== event.cityId) updates.cityId = cityId;
    if (photo && photo !== event.image) updates.image = photo;

    if (Object.keys(updates).length > 0) {
      if (updates.name || updates.date_time || updates.url) {
        updates.hash = crypto.createHash('md5').update(`${updates.url || event.url || ''}${updates.name || event.name}${updates.date_time || event.date_time}`).digest('hex');
      }
      await Event.update(updates, { where: { id }, transaction });
    }

    await transaction.commit();

    const updatedEvent = await Event.findByPk(id, {
      include: [
        {
          model: Place,
          as: 'place',
          include: [{ model: City, as: 'cityData' }],
        },
        { model: City, as: 'city' },
      ],
    });

    res.status(200).json({
      message: 'Event updated successfully',
      event: {
        ...updatedEvent.toJSON(),
        cityName: updatedEvent.city?.city_name || updatedEvent.place?.cityData?.city_name || null,
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Удалить событие
export const deleteEvent = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id, { transaction });

    if (!event) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.image && !event.image.startsWith('http')) {
      try {
        await fs.unlink(`public${event.image}`);
      } catch (err) {
        console.error('Error deleting event image:', err);
      }
    }

    await event.destroy({ transaction });
    await transaction.commit();

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!Number.isInteger(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const eventData = {
      id: event.id,
      name: event.name || '',
      description: event.description || '',
      date_time: event.date_time ? event.date_time.toISOString() : '',
      url: event.url || '',
      placeId: event.placeId ? event.placeId.toString() : '',
      cityId: event.cityId ? event.cityId.toString() : '',
      image: event.image || ''
    };

    res.status(200).json(eventData);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error while fetching event' });
  }
};