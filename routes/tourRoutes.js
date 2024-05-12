const express = require('express');

const tourController = require('./../controllers/tourController');

// nak bind
const tourRouter = express.Router();

//middleware untuk spesific path (tour path only)
// tourRouter.param('id', (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);
//   next();
// })

//param middleware
//tourRouter.param('id', tourController.checkID);

//bila buat macam ni lagi senang nak baca code
tourRouter
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

tourRouter.route('/tour-stats').get(tourController.getTourStats);

tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

// 1 route (no need to redundant write same routes)
tourRouter
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour); // kita boleh letak middleware utk spesific path

// 2 route (no need to redundant write same routes)
tourRouter
  .route('/:id')
  .get(tourController.getTours)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = tourRouter;
