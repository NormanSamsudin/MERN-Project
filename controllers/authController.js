const crypto = require('crypto');
const { promisify } = require('util');
//const rateLimit = require('express-rate-limit'); //bruteforce protection
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const sendEmail = require('./../utils/email');

// dalam ni ada yang middle ware ada yang endooint

// function to sign jwt token
// just to avoid redundant code
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true, //must use https protocol
    httpOnly: true
  };

  // end product jer kita wajibkan pakai https
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  //create cookie for the client side
  res.cookie('jwt', token, cookieOptions);
  // remove the password from the output
  user.password = undefined;

  // 201 for created
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // 1. Get the data from the request
  //const newUser = await User.create(req.body);
  // macam ni lagy bagus sebab orang lain x boleh tambah bende yang pelik2
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role
  });

  // custom function to give response and set status code
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //check if email and password are exist
  if (!email || !password) {
    // bad request
    // kene return dekat sini supaya die x execute code yang ada kat bawah
    return next(new AppError('Please provide email and password', 400));
  }
  //check if password is correct
  // check based on email
  const user = await User.findOne({ email: email }).select('+password'); // explicitly select password even being block

  // function correct password ni daripada instance method dalam user model
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  console.log(user);
  //if everything is ok, send token to client
  // custom function to give response and set status code
  createSendToken(user, 200, res);
});

//middleware to protect from brute force attacks
// exports.secureBruteforce = rateLimit({
//   windowMs: 5 * 60 * 1000, // 15 minutes
//   max: 5, // Limit each IP to 5 login attempts per windowMs
//   message:
//     'Too many login attempts from this IP, please try again after 15 minutes',
//   handler: (req, res, next, options) => {
//     // Log the IP address
//     console.log(`Too many login attempts from IP: ${req.ip}`);

//     // Respond with the message
//     res.status(options.statusCode).send(options.message);
//   }
// });

//middleware to protect routes
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  // get token from request header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer') // kita nak tetapkan format utk auth
  ) {
    token = req.headers.authorization.split(' ')[1];
    //console.log(token);
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  // 2) Check if token is valid
  // use promisify to make return of promise
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  // die akan ada dua error invalid signature and expired token

  // 3) Check if user still exist,
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check is user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  req.user = freshUser;
  //grant access to the protected route
  next();
});

// middleware with parameters
// it will recieve the parameter as array
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles = ['admin', 'guide-lead']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

//handler for forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // to deactivate all the validator of "email is required"

  // 3) Send it to user's email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetUrl}.\n If you didn't forget your password please ignore this email !!`;

  try {
    await sendEmail({
      email: user.email, // target email to send token
      subject: 'Your password reset token (valid for 10 minutes)', //title of the email
      message //content within the email
    });

    //response from the server
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (err) {
    // if got error then no token generated and save in the database
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

//handler for reset password

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() } // making sure token is not excess time to use
  });

  //2) if token is not expired, and there is user , then set new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3) update changedPasswordAt property for the user
  //handled by middleware in the file userModel

  //4) log the user in, send JWT
  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user
  //   }
  // });

  createSendToken(user, 200, res);
});

// if logged in user want to change password
// willrequired current password before updating the passoword
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) get user from the collection
  const user = await User.findById(req.user.id).select('+password'); //concatination field

  //2) check if the POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('Your current password is wrong', 401));

  //3) If so, update the password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  // User.findByIdAndUpdate will not work as intended
  // we dont implement this because the custome validator will not working (eg : validator confirmPassword)

  //4) Log user in, send JWT
  createSendToken(user, 200, res);
});

// yang membezakan antara middleware dengan endpoint adalah die ada response atau tak.
