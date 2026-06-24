const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  // Store the ordered list of site keys (e.g., "hue", "custom_pos")
  itinerary: [{ type: String }],
  // Custom points added via GPS or manual input – stored as plain objects
  customPoints: { type: mongoose.Schema.Types.Mixed, default: {} },
  savedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Itinerary', itinerarySchema);
