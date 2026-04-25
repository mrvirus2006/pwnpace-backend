const mongoose = require('mongoose');

const UserSettingsSchema = new mongoose.Schema({
  // Locks these settings to the specific user ID
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  currentTarget: { type: String, default: 'Awaiting Orders...' },
  totalModules: { type: Number, default: 1 },
  totalSections: { type: Number, default: 1 },
  learningRanges: { type: Array, default: [] }
});

module.exports = mongoose.model('UserSettings', UserSettingsSchema);