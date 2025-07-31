const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['super-admin', 'admin', 'user'],
    default: 'user'
  }
}); 

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel; 


