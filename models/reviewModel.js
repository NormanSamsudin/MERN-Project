//review / rating / createdAT / ref to tour / ref

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review must have a text']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    // referencing to the tour
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    },
    // referencing to the author who wrote the review
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  // virtual property manipulaed by other fields
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//middleware to before find help to make referensing
reviewSchema.pre(/^find/, function(next) {
  // populate ni sebenarnya macam die sambung buat query
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // });

  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  console.log(stats);
};

// guna post utk confirm semua data dah saved
reviewSchema.post('save', function(next) {
  // this points to current review
  this.constructor.calcAverageRatings(this.tour);
  //next(); kalau pakai post middleware xperlu ada next
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
