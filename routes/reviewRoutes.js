const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const reviewRouter = express.Router({ mergeParams: true }); // { mergeParams: true } ni untuk jadikan yang kalau mount parameter between two router

// middleware to protect access to route
reviewRouter.use(authController.protect);

reviewRouter
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user', 'admin'), // only user allowed
    reviewController.setTourUserIds,
    reviewController.createReview
  );

reviewRouter
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = reviewRouter;
