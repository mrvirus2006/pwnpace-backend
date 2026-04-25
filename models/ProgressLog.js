const mongoose = require('mongoose');

const ProgressLogSchema = new mongoose.Schema({
  // This is the anchor that locks the log to a specific user
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  date: { type: String, required: true },

  // ---> DOUBLE PRECISION ENABLED <---
  // In Mongoose, Number is a 64-bit float by default. 
  // We use 0.0 to match the Flutter double logic.
  dailyModules: { 
    type: Number, 
    default: 0.0 
  },
  
  dailySections: { 
    type: Number, 
    default: 0.0 
  },

  note: { 
    type: String, 
    default: "" 
  }
});

// Ensures isolation: One user can only have one decimal entry per date
ProgressLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ProgressLog', ProgressLogSchema);