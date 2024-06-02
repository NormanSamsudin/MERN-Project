const mongoose = require('mongoose');
const slugify = require('slugify');

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
    ratingsQuality: {
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
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//define virtual property ( utk nak elak simpan bende yang sama cuma beza unit )
// nnti kalau kita buat request data pon die akan ada jgk dalam response
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

//DOCUMENT middleware: runs before create() and save()
tourSchema.pre('save', function(next) {
  //console.log(this); // this to sebenarnya document
  this.slug = slugify(this.name, { lower: true });
  next();
});

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
