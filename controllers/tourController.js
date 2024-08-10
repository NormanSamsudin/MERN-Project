const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
//const AppError = require('./../utils/AppError');
const factory = require('./handlerFactory');
const AppError = require('../utils/AppError');
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
 *       example:
 *         id: 609c5f5b8f1b2b001f3b0f90
 *         name: The Forest Hiker
 *         slug: the-forest-hiker
 *         duration: 5
 *         maxGroupSize: 25
 *         difficulty: medium
 *         ratingsAverage: 4.7
 *         ratingsQuality: 9
 *         price: 497
 *         priceDiscount: 297
 *         summary: Exciting forest hike with breathtaking views
 *         description: Detailed description goes here...
 *         imageCover: tour-5-cover.jpg
 *         images: [tour-5-1.jpg, tour-5-2.jpg, tour-5-3.jpg]
 *         createdAt: 2021-05-14T00:00:00.000Z
 *         startDates: [2021-06-01T00:00:00.000Z, 2021-07-01T00:00:00.000Z]
 *         secretTour: false
 */
// image will be store as buffer
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload an image.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1
  },
  {
    name: 'images',
    maxCount: 3
  }
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // image tu akan represent dalam bentuk buffer
  console.log(req.files);

  if (!req.files.imageCover || !req.files.images) return next();

  //1) cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //2) images
  req.body.images = [];
  // kene pakai map sbb nak kasi die bole execute dlu
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

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
// the factory need to be made by our own
// avoid redundant delete method for different model
exports.createTour = factory.createOne(Tour);
exports.getAllTours = factory.getAll(Tour);
exports.getTours = factory.getOne(Tour, { path: 'reviews' });
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

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
