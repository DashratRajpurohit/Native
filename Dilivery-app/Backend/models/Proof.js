const mongoose = require('mongoose');

const proofSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Not required until auth is fully integrated
  },
  orderId: {
    type: String,
    required: true,
  },
  courier: {
    type: String,
  },
  condition: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  photo: {
    type: String,
  },
  latitude: {
    type: String,
  },
  longitude: {
    type: String,
  },
  address: {
    type: String,
  },
  status: {
    type: String,
    default: 'Submitted',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Proof', proofSchema);
