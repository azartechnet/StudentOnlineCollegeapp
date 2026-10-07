const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  emailId: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  location: { type: String, required: true },
  collegeName: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);