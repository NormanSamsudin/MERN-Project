//API Features
class APIFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString }; // destructuring to make new object
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    // hanya akan allow duration
    excludeFields.forEach(el => delete queryObj[el]);
    //console.log(this.query, queryObj); // so dia akan  filter based on the parameter query

    //Andvance Filtering (greater, less, )
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); //regular expression

    //console.log(JSON.parse(queryStr));
    //let query = Tour.find(JSON.parse(queryStr));

    this.query = this.query.find(JSON.parse(queryStr));

    return this; // supaya die boleh chaining
  }

  sort() {
    if (this.queryString.sort) {
      // kalau wujud baru die masuk dalam ni
      const sortBy = this.queryString.sort.split(',').join(' '); // nak spit string
      //console.log(sortBy);
      this.query = this.query.sort(sortBy); //build sort query with spesific sort attribute
    } else {
      this.query = this.query.sort('-createdAt'); //build sort query by default created date
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); //- for exclude
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit); // build skip and limit

    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip > numTours) throw new Error('This page does not exist'); //kalau dah xde new page
    // }
    return this;
  }
}

module.exports = APIFeature;
