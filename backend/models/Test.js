const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  durationMinutes: { type: Number, required: true, default: 30 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' }
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);