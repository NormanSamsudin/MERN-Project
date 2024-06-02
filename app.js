const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const setSecureHeaders = require('./controllers/secureController');

// 1) MIDDLEWARE
const app = express();

// 3rd party middleware (http request logger)
// env variables ni boleh access dekat mana2 file jer
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //morgan ni guna untuk jadikan die akan print setiap request yang kita buat
}

// Apply the middleware globally to all routes
app.use(setSecureHeaders);
//middleware between request and response
// mende ni penting kalau tak nnti kita tak dapat transtlate data
app.use(express.json());
app.use(express.static(`public`)); // untuk nak serve static file daripada folder public

//  custom midleware sendiri
// middleware ni kene ada dekat bahagian atas sekali
// app.use((req, res, next) => {
//   console.log('Hello from the middleware!');
//   next(); // go to next stack middleware
// });

// custom middleware sendiri
// nak modify request data
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers); // nak print headers
  // de ada beza kalau nak pring headers dgn nak print body
  next(); // go to next stack middleware
});

// 2) ROUTES HANDLERS
// dah takde sbb dah masukkan dalam folder lain

// 3) ROUTES
// mounting routes
//swagger
const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Simple API with Swagger',
      version: '0.1.0',
      description:
        'This is a simple CRUD API application made with Express and documented with Swagger',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html'
      }
    },
    servers: [
      {
        url: 'http://localhost:8000/api/v1'
      }
    ]
  },
  apis: ['./routes/*.js']
};

const specs = swaggerJsdoc(options);
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCssUrl:
      'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-newspaper.css'
  })
);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//kalau ada routes yang x trigger route lain yang dekat atas so die akan dikira xde route so response die yang ni
// sbbtu yang ni kne letak last sekali "*" = all route
app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//global error handling middleware
app.use(globalErrorHandler);

// 4) START SERVER
module.exports = app;
