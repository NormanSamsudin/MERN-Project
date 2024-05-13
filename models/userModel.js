const mongoose = require('mongoose');
//const slugify = require('slugify');
const validator = require('validator');

const bcrypt = require('bcrypt');

//create user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'The maximum length is 40 characters'],
    minLength: [10, 'The minimum length is 10 characters']
  },
  email: {
    type: String,
    required: [true, 'User must have email'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'User must have a password'],
    minlength: 8
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    minlength: 8,
    validate: {
      // only works on .create() and .save()
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same'
    }
  }
});

// DOCUMENT middleware: runs before create() and save()
// used for encrypting
userSchema.pre('save', async function(next) {
  // untuk nak check kalau value password tu dah berubah so nnti boleh abaikan jer
  if (!this.isModified('password')) return next();

  // replace password with hash password
  this.password = await bcrypt.hash(this.password, 12);

  //delete password confirm field
  this.confirmPassword = undefined;
});

// create model of the user schema
const User = mongoose.model('User', userSchema);

module.exports = User;
