const AppError = require('./../utils/AppError');

// custom erroe for invalid Id or path
// tapi ni kalau tak nak pakai pon takpe
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

//stop here
const handleDuplicateFieldsDB = err => {
  //const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]; // regular expression untuk dapatkan values between quotation marks
  //ada jer cara yang lagi senang
  const value = err.keyValue.name;
  console.log(value);
  const message = `Duplicate field value ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  //Operational, trusted error: send message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    //log error
    // nnti boleh nampak dalam heroku bila dah deploy nnti
    console.error('ERROR', err);

    // send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong'
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production ') {
    //lepas production ni kne ada space
    // nak guna destructive sbb nak buat const baru
    // boleh buang kalau tak nak guna atau tak paham.
    // cuma nnti error message tu die xleh nak custome bagi senang orang paham jer
    let error = JSON.stringify(err);
    error = JSON.parse(error);
    //if ada error yang nak mark as operational
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    sendErrorProd(error, res);
  }
};
