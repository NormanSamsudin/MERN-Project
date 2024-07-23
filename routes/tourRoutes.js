const express = require('express');

const tourController = require('./../controllers/tourController');

const authController = require('./../controllers/authController');

const reviewRouter = require('./../routes/reviewRoutes');
// nak bind
const tourRouter = express.Router();

//middleware untuk spesific path (tour path only)
// tourRouter.param('id', (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);
//   next();
// })

/**
 * @swagger
 * components:
 *   schemas:
 *     Tour:
 *       type: object
 *       required:
 *         - name
 *         - duration
 *         - maxGroupSize
 *         - difficulty
 *         - price
 *         - summary
 *         - imageCover
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the tour
 *         name:
 *           type: string
 *           description: The name of the tour
 *         slug:
 *           type: string
 *           description: The slug for the tour name, typically used in URLs
 *         duration:
 *           type: number
 *           description: The duration of the tour in days
 *         maxGroupSize:
 *           type: number
 *           description: The maximum number of people in the tour group
 *         difficulty:
 *           type: string
 *           description: The difficulty level of the tour
 *           enum: [easy, medium, difficult]
 *         ratingsAverage:
 *           type: number
 *           description: The average rating of the tour
 *         ratingsQuality:
 *           type: number
 *           description: The quality rating of the tour
 *         price:
 *           type: number
 *           description: The price of the tour
 *         priceDiscount:
 *           type: number
 *           description: The discounted price of the tour
 *         summary:
 *           type: string
 *           description: A brief summary of the tour
 *         description:
 *           type: string
 *           description: A detailed description of the tour
 *         imageCover:
 *           type: string
 *           description: The URL of the cover image for the tour
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: An array of image URLs for the tour
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date when the tour was created
 *         startDates:
 *           type: array
 *           items:
 *             type: string
 *             format: date-time
 *           description: An array of start dates for the tour
 *         secretTour:
 *           type: boolean
 *           description: A flag indicating whether the tour is secret
 */

/**
 * @swagger
 * tags:
 *   name: Tours
 *   description: The tours managing API
 * /tours:
 *   get:
 *     summary: Lists all the tours
 *     tags: [Tours]
 *     responses:
 *       200:
 *         description: The list of the tours
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tour'
 *   post:
 *     summary: Create a new tour
 *     tags: [Tours]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tour'
 *     responses:
 *       201:
 *         description: The created tour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tour'
 *       500:
 *         description: Some server error
 * /tours/top-5-cheap:
 *   get:
 *     summary: Get the top 5 cheap tours
 *     tags: [Tours]
 *     responses:
 *       200:
 *         description: The list of the top 5 cheap tours
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tour'
 * /tours/tour-stats:
 *   get:
 *     summary: Get tour statistics
 *     tags: [Tours]
 *     responses:
 *       200:
 *         description: The tour statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: array
 *                       items:
 *                         type: object
 * /tours/monthly-plan/{year}:
 *   get:
 *     summary: Get the monthly plan for a given year
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: year
 *         schema:
 *           type: integer
 *         required: true
 *         description: The year to get the plan for
 *     responses:
 *       200:
 *         description: The monthly plan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     plan:
 *                       type: array
 *                       items:
 *                         type: object
 * /tours/{id}:
 *   get:
 *     summary: Get the tour by id
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The tour id
 *     responses:
 *       200:
 *         description: The tour response by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tour'
 *       404:
 *         description: The tour was not found
 *   put:
 *     summary: Update the tour by id
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The tour id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tour'
 *     responses:
 *       200:
 *         description: The tour was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tour'
 *       404:
 *         description: The tour was not found
 *       500:
 *         description: Some error happened
 *   delete:
 *     summary: Remove the tour by id
 *     tags: [Tours]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The tour id
 *     responses:
 *       200:
 *         description: The tour was deleted
 *       404:
 *         description: The tour was not found
 */

//param middleware
//tourRouter.param('id', tourController.checkID);

// tourRouter
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

// middleware kalau route tu same so die akan pass dekat router lain
// mounting router from tour -> review
tourRouter.use('/:tourId/reviews', reviewRouter);

//bila buat macam ni lagi senang nak baca code
tourRouter
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

tourRouter.route('/tour-stats').get(tourController.getTourStats);

tourRouter
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

// 1 route (no need to redundant write same routes)
tourRouter
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  ); // kita boleh letak middleware utk spesific path

// 2 route (no need to redundant write same routes)
tourRouter
  .route('/:id')
  .get(tourController.getTours)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = tourRouter;
