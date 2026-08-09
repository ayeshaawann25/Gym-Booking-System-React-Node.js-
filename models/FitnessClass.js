const mongoose = require('mongoose');

const FitnessClassSchema = new mongoose.Schema({
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a class name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  type: {
    type: String,
    enum: ['Yoga', 'Zumba', 'Weight Training', 'Cardio', 'Pilates', 'CrossFit', 'HIIT'],
    required: true
  },
  schedule: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  maxCapacity: {
    type: Number,
    default: 20,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  durationMinutes: {
    type: Number,
    default: 60
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  classImage: {
    type: String,
    default: 'default-class.jpg'
  },
  requirements: {
    type: String
  }
}, {
  timestamps: true
});

// Virtual for available spots
FitnessClassSchema.virtual('availableSpots').get(function() {
  return this.maxCapacity - this.bookingsCount;
});

// Virtual for bookings count
FitnessClassSchema.virtual('bookingsCount', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'classId',
  count: true
});

module.exports = mongoose.model('FitnessClass', FitnessClassSchema);
