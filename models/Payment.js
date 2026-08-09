const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  membershipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Membership'
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'cash', 'bank_transfer', 'upi'],
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  receiptUrl: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);
