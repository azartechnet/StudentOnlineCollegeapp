const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  testTitle: String,
  // Student snapshot
  studentName: String,
  studentId: String,
  studentEmail: String,
  studentPhone: String,
  studentCollege: String,
  studentLocation: String,
  studentAddress: String,
  // Answers
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedAnswer: Number,
    correctAnswer: Number,
    marks: Number,
    isCorrect: Boolean
  }],
  totalMarks: Number,
  obtainedMarks: Number,
  timeTakenSeconds: Number,
  autoSubmitted: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'published'],
    default: 'pending'
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  feedback: String
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);