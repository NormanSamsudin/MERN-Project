const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const userRouter = express.Router();

// route to sign up user
userRouter.post('/signup', authController.signup);
userRouter.post(
  '/login',
  authController.secureBruteforce,
  authController.login
); //protected from bruteforce attack
// utk pos email
userRouter.post('/forgotPassword', authController.forgotPassword);
//recieve token and set new password
userRouter.patch('/resetPassword/:token', authController.resetPassword); //unprotected from bruteforce attack
// change password if the user loggedin
userRouter.patch(
  '/updateMyPassword',
  authController.protect, // kne ada authorization dlu
  authController.updatePassword
);
// update user data if the user has logged in
userRouter.patch('/updateMe', authController.protect, userController.updateMe);

userRouter.patch('/deleteMe', authController.protect, userController.deleteMe);

userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
