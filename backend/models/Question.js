const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  marks: { type: Number, required: true, default: 1 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);