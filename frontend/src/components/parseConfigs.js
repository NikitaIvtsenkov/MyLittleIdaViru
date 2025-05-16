export const parseConfig = {
 "https://www.apollokino.ee": {
  eventBlockSelector: '.grid__col.schedule__col--item',
  nameSelector: '.schedule-card__title',
  dateSelector: '.schedule-card__time',
  timeSelector: '.schedule-card__time',
  imageSelector: '.schedule-card__image img',
  imageStyle: 'srcset',
  imageAttribute: 'data-srcset', // добавлено для получения атрибута srcset
  descriptionSelector: '.schedule-card__title',
  // limit: 2

  },
  'https://www.apollokino.ee/rus/schedule?theatreAreaID=1019&fromLang=1001': {
    eventBlockSelector: '.grid__col.schedule__col--item',
    nameSelector: '.schedule-card__title',
    dateSelector: '.schedule-card__time',
    timeSelector: '.schedule-card__time',
    imageSelector: '.schedule-card__image img',
    imageStyle: 'srcset',
    imageAttribute: 'data-srcset', // добавлено для получения атрибута srcset
    descriptionSelector: '.schedule-card__title',
    // limit: 2
  
  },
  'https://johvi.concert.ee': {
    eventBlockSelector: '.event-list .col-1',
    nameSelector: 'h2',
    dateSelector: '.date',
    imageSelector: '.image',
    imageStyle: 'background-image', // Указание извлечения фона как изображения
    descriptionSelector: '.info',
    // limit: 2,
  },
  // Добавьте больше конфигураций по мере необходимости
  'https://fcphoenix.ee': {
    eventBlockSelector: '.mrm-item', // Селектор для блока с информацией о матче
    nameSelector: '.mrm-status', // Селектор для названия матча
    dateSelector: '.mrm-place span', // Селектор для даты матча
    descriptionSelector: '.mrm-place', // Селектор для описания матча
    leftImageSelector: '.mrm-score img:nth-child(1)', // Логотип левой команды
    rightImageSelector: '.mrm-score img:nth-child(3)', // Логотип правой команды
  },
  "https://pargikeskus.ee": {
    eventBlockSelector: '.elementor-post',
    nameSelector: '.elementor-post__title',
    dateSelector: '.elementor-post__excerpt p:contains("Kehtib kuni")',
    descriptionSelector: '.elementor-post__excerpt p',
    imageSelector: 'img.img-fix-size',
    imageAttribute: 'src',
    imageStyle: null,
  },
  'https://pargikeskus.ee/kampaaniad/': {
    eventBlockSelector: '.column-quarter', // Обновлено, но используется только для справки, так как логика теперь в Puppeteer
    nameSelector: null, // Не используется, так как парсинг кастомный
    dateSelector: null, // Не используется
    descriptionSelector: null, // Не используется
    imageSelector: 'img.img-fix-size',
    imageAttribute: 'src',
    imageStyle: null,
  }
};
