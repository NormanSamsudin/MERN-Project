const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');

exports.signup = catchAsync(async (req, res, next) => {
  // 1. Get the data from the request
  //const newUser = await User.create(req.body);
  // macam ni lagy bagus sebab orang lain x boleh tambah bende yang pelik2
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
    //role: 'admin'
  });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  // 201 for created
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = (req, res, next) => {
  const { email, password } = req.body;

  //check if email and password are exist
  if (!email || !password) {
    // bad request
    next(new AppError('Please provide email and password', 400));
  }
  //check if password is correct

  //if everything is ok, send token to client
  const token = '';
  res.status(200).json({
    status: 'success',
    token
  });

  //
};
