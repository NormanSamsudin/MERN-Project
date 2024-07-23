const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('../models/userModel');

//const validator = require('validator');

// create schema of database
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'The maximum length is 40 characters'],
      minLength: [10, 'The minimum length is 10 characters']
      //validate: [validator.isAlpha, 'Tour name must only contain characters'] // pakai external library utk check input https://github.com/validatorjs/validator.js/
    },
    slug: String, // untuk special case bila nak pakai document middleware
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        // only for string
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      // custom validator
      validate: {
        validator: function(val) {
          //this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price {{VALUE}} should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true, //trim any space from front and end of th string
      required: [true, 'A tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false //filter select
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    // referencing document based on userid
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
    // tak nak pakai child referencing ganti dengan virtual populate
    // reviews: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review'
    //   }
    // ]
  },
  // virtual property something ike not stored in the database but being manipulated by other fields
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//set index by ascending order
tourSchema.index({ price: 1, ratingsAverge: -1 });
tourSchema.index({ slug: 1 });
//define virtual property ( utk nak elak simpan bende yang sama cuma beza unit )
// nnti kalau kita buat request data pon die akan ada jgk dalam response
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

//virtual + populate
// die x sama macam virtual field yang biasa
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

//DOCUMENT middleware: runs before create() and save()
tourSchema.pre('save', function(next) {
  //console.log(this); // this to sebenarnya document
  this.slug = slugify(this.name, { lower: true });
  next();
});

//DOCUMENT middleware: runs before create() and save() to make Embeded
// tourSchema.pre('save', async function(next) {
//   const guidesPromisses = this.guides.map(id => User.findById(id));

//   // change value value array of guides
//   this.guides = await Promise.all(guidesPromisses); //  waits for all promises in guidesPromises to resolve.
//   next();
// });

//DOCUMENT middleware: runs before create() and save() wont trigger for update and delete,
tourSchema.pre('save', function(next) {
  //console.log('Will save document...........'); // this to sebenarnya document
  next();
});

//DOCUMENT middleware: runs after .save() and .create()
tourSchema.post('save', function(doc, next) {
  // akan ada dua parameter doc tu kita boleh access document yang dah save tu
  //console.log(doc);
  next();
});

//QUERY Middleware
tourSchema.pre(/^find/, function(next) {
  //regular expression pattern
  // will trigger find, findOne, findOneAndDelete, findOneAndRemove, findOneAndUpdate
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

//QUERY Middleware to achieve referencing
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

//QUERY Middleware post
tourSchema.post(/^find/, function(docs, next) {
  //regular expression pattern
  // will trigger find, findOne, findOneAndDelete, findOneAndRemove, findOneAndUpdate
  this.find({ secretTour: { $ne: true } });
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// AGGREGATION Middleware
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); //to filter secret tour from the aggregate response
  console.log(this.pipeline());
  next();
});

// create model based on schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
