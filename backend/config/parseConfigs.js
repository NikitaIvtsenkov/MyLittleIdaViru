export const parseConfig = {
  // "https://www.apollokino.ee": {
  //   eventBlockSelector: '.schedule-card__container', // Обновлено
  //   nameSelector: '.schedule-card__label--starts-at', // Обновлено
  //   dateSelector: '.schedule-card__time--label', // Обновлено
  //   timeSelector: '.schedule-card__time--label', // Обновлено
  //   imageSelector: '.schedule-card__image', // Оставляем, но проверим ниже
  //   imageStyle: 'background-image',
  //   descriptionSelector: '.schedule-card__label--starts-at', // Обновлено
  //   placeId: 2,
  //   cityId: 1,
  // },
  "https://www.apollokino.ee/eng/schedule?theatreAreaID=1019&fromLang=1001": {
    eventBlockSelector: '.schedule-card',
    nameSelector: '.schedule-card__title',
    dateSelector: '.schedule-card__time',
    timeSelector: '.schedule-card__time',
    imageSelector: '.image.schedule-card__image img',
    imageAttribute: 'currentSrc', // Извлекаем currentSrc вместо src
    descriptionSelector: '.schedule-card__details',
    eventLinkSelector: '.schedule-card__link',
    placeId: 2,
    cityId: 1,
},
  // "https://www.apollokino.ee/rus/schedule?theatreAreaID=1019&fromLang=1001": {
  //   eventBlockSelector: '.schedule-card__container', // Обновлено
  //   nameSelector: '.schedule-card__label--starts-at', // Обновлено
  //   dateSelector: '.schedule-card__time--label', // Обновлено
  //   timeSelector: '.schedule-card__time--label', // Обновлено
  //   imageSelector: '.schedule-card__image', // Оставляем, но проверим ниже
  //   imageStyle: 'background-image',
  //   descriptionSelector: '.schedule-card__label--starts-at', // Обновлено
  //   placeId: 2,
  //   cityId: 1,
  // },
  "https://johvi.concert.ee": {
    eventBlockSelector: '.event-list .col-1',
    nameSelector: 'h2',
    dateSelector: '.event-date',
    imageSelector: '.image',
    imageStyle: 'background-image',
    descriptionSelector: '.info',
    eventLinkSelector: '.info a.btn.low',
    eventPageImageSelector: '.event-image img', // Обновлено (предположение)
    eventPageImageAttribute: 'src',
    placeId: 1,
    cityId: 1,
  },
  // "https://fcphoenix.ee": {
  //   eventBlockSelector: '.mrm-item',
  //   nameSelector: '.mrm-status',
  //   dateSelector: '.mrm-place span',
  //   descriptionSelector: '.mrm-place',
  //   leftImageSelector: '.mrm-score img:nth-child(1)',
  //   rightImageSelector: '.mrm-score img:nth-child(3)',
  //   limit: 1,
  //   placeId: 3,
  //   cityId: 1,
  // },
  // "https://pargikeskus.ee": {
  //   eventBlockSelector: '.elementor-post',
  //   nameSelector: '.elementor-post__title',
  //   dateSelector: '.elementor-post__excerpt p:contains(\"Kehtib kuni\")',
  //   descriptionSelector: '.elementor-post__excerpt p',
  //   imageSelector: 'img.img-fix-size',
  //   imageAttribute: 'src',
  //   imageStyle: null,
  //   placeId: 4,
  //   cityId: 1,
  // },
  // "https://pargikeskus.ee/kampaaniad/": {
  //   eventBlockSelector: '.column-quarter',
  //   nameSelector: null,
  //   dateSelector: null,
  //   descriptionSelector: null,
  //   imageSelector: 'img.img-fix-size',
  //   imageAttribute: 'src',
  //   imageStyle: null,
  //   placeId: 4,
  //   cityId: 1,
  // },
};