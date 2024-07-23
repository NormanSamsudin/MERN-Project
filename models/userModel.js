const crypto = require('crypto');
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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'], // type of user exists in this
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'User must have a password'],
    minlength: 8,
    select: false
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    minlength: 8,
    validate: {
      // only works on .create() and .save()
      // not works for .findByIdAndUpdate()
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date, // will limiting time to reset password
  active: {
    type: Boolean,
    default: true,
    select: false //filter select
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

// DOCUMENT middleware: runs before create() and save()
//used for change value passwordChangeAt
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangeAt = Date.now() - 1000; // cause of some time delay
  next();
});

//Document middleware
// regular expression pattern find
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

//instance method: that will be available on any function or ethos
userSchema.methods.correctPassword = async function(
  candidatePassword, //original password from user
  userPassword //hashed password
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  // False means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  //generate token used for password reset
  // this token will be send t user
  // tak boleh simpan token dalam database sebab kalau attacker dapat token ni bahaya
  const resetToken = crypto.randomBytes(32).toString('hex');

  //nak simpa dalam database boleh tapi kne encrypt dlu supaya attacker tak tahu apa password yang betul die
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // will be sent to user
  return resetToken;
};

// create model of the user schema
const User = mongoose.model('User', userSchema);

module.exports = User;
