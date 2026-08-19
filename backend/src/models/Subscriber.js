const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  resumeUrl: {
    type: String,
    default: null,
  },
  resumePublicId: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'notified', 'registered'],
    default: 'pending',
  },
  ipAddress: {
    type: String,
    default: '',
  },
}, { timestamps: true });

subscriberSchema.index({ email: 1 });
subscriberSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Subscriber', subscriberSchema);
