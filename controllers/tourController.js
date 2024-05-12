const Tour = require('./../models/tourModel');
const APIFeature = require('./../utils/apifeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');

//middlware for top-5-cheap
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,raingsAverage,summary,difficulty';
  next();
};

// method to remove try and catch block and make code more easy to understand
// const catchAsync = fn => {
//   return (req, res, next) => {
//     fn(req, res, next).catch(next);
//   };
// };

//handler routes
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

//handler
exports.getAllTours = catchAsync(async (req, res, next) => {
  //Build Query
  const features = new APIFeature(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Execute Query
  const tours = await features.query;

  //Send Response
  res.status(200).json({
    status: 'OK',
    result: this.getTours.length,
    data: {
      tours
    }
  });
});

exports.getTours = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  //implement 404 not found error
  if (!tour) {
    // kalau error nnti die akan trigger dekat middleware
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'OK',
    result: tour.length,
    data: {
      tour
    }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  //implement 404 not found error
  if (!tour) {
    // kalau error nnti die akan trigger dekat middleware
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  //implement 404 not found error
  if (!tour) {
    // kalau error nnti die akan trigger dekat middleware
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Tour deleted successfully'
  });
});

// handler for get tour stats
// involve with the aggregationpipeline service
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: null, // boleh ubah jadi based on difficulty level
        // _id: 'difficulty',
        // _id: 'ratingsAverage',
        // _id: { $toUpper: 'difficulty' } // boleh ubah response dalam tulisan besar
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 } // 1 for escending, avgPrice tu depend on the group
    }
    // boleh jer kalau nak sambung lagi untuk buat matching
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

//solve real business problems
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates' // will make one document for each element of array startDates.
    },
    {
      // nak filter data based on certain year only
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
          // $gte: `${year}-01-01`,
          // $lte: `${year}-12-31`
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' } // nak custom fields
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 } //descending order
    },
    {
      $limit: 12 //boleh ada 12 jer
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});
