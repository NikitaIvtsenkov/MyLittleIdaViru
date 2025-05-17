import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Документация',
      version: '1.0.0',
      description: 'В рамках данного проекта представлена разработка интерактивной платформы, которая выполняет роль виртуального гида для пользователей, предоставляя им доступ к информации о достопримечательностях, событиях и локациях в регионе Ида-Вирумаа. Основной целью проекта является создание удобного и функционального ресурса, который будет способствовать популяризации региона, облегчая туристам и местным жителям поиск интересных мест для посещения, а также предоставляя актуальную информацию о предстоящих мероприятиях.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Путь к вашим роутам с аннотациями
};
const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default swaggerDocs;
