const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xxs = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const geminiRouter = require('./routes/geminiRouter');
const setSecureHeaders = require('./controllers/secureController');

// 1) GLOBAL MIDDLEWARE
const app = express();
// securityhttp headers
app.use(helmet());
// 3rd party middleware (http request logger)
// env variables ni boleh access dekat mana2 file jer
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //morgan ni guna untuk jadikan die akan print setiap request yang kita buat
}

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message:
    'Too many login attempts from this IP, please try again after 15 minutes',
  handler: (req, res, next, options) => {
    // Log the IP address
    console.log(`Too many login attempts from IP: ${req.ip}`);

    // Respond with the message
    res.status(options.statusCode).send(options.message);
  }
});

// apply limiter to all endpoint start with /api
app.use('/api', limiter);

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data sanitization agains XXS injection
app.use(xxs()); // will escape data

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Apply the middleware globally to all routes
app.use(setSecureHeaders);
//middleware between request and response
// mende ni penting kalau tak nnti kita tak dapat transtlate data
//body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // only limited to body with 10kb
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
app.use('/api/v1/gemini', geminiRouter);

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
