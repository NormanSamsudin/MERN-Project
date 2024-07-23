const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const userRouter = express.Router();

// route to sign up user
userRouter.post('/signup', authController.signup);
userRouter.post(
  '/login',
  //authController.secureBruteforce,
  authController.login
); //protected from bruteforce attack
// utk pos email
userRouter.post('/forgotPassword', authController.forgotPassword);
//recieve token and set new password
userRouter.patch('/resetPassword/:token', authController.resetPassword); //unprotected from bruteforce attack

//protect all routes after this middleware is called
userRouter.use(authController.protect);

// change password if the user loggedin
userRouter.patch(
  '/updateMyPassword',

  authController.updatePassword
);
userRouter.get('/me', userController.getMe, userController.getUser);

// update user data if the user has logged in
userRouter.patch('/updateMe', userController.updateMe);

//delete user tapi tak delete pon dalam database
// walaupon method die delete
userRouter.delete('/deleteMe', userController.deleteMe);

// only blow router got effected
userRouter.use(authController.restrictTo('admin'));

userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser) // if user is not log in
  .delete(userController.deleteUser);

module.exports = userRouter;
