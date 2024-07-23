const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('./../utils/AppError');

// nak filter POSTed request body daripada sensitive datafield in database such as {name, email}
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  // Execute Query
  const users = await User.find();

  //Send Response
  res.status(200).json({
    status: 'OK',
    result: users.length,
    data: {
      users
    }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) create error if user post password data
  // to avoid object injection
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }

  //2) filterout unwanted fields name that are not allowed to be updated
  // for this case only name and email can be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  //3) update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: updatedUser
  });
});

// handler to deactivate account instead of delete user data
exports.deleteMe = catchAsync(async (req, res, next) => {
  // nak jadikan user tu deactivate jer
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'success',
    message: 'This route is not yet defined'
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'success',
    message: 'This route is not yet defined'
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'success',
    message: 'This route is not yet defined'
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'success',
    message: 'This route is not yet defined'
  });
};
