const Booking = require('../models/Booking');
const FitnessClass = require('../models/FitnessClass');
const Membership = require('../models/Membership');
const Payment = require('../models/Payment');

// @desc    Book a class
// @route   POST /api/bookings
exports.bookClass = async (req, res) => {
  try {
    const { classId } = req.body;
    const userId = req.user.id;

    // Check if class exists
    const fitnessClass = await FitnessClass.findById(classId);
    if (!fitnessClass) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check if class is active
    if (!fitnessClass.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Class is not available'
      });
    }

    // Check capacity
    const bookedCount = await Booking.countDocuments({
      classId,
      status: 'confirmed'
    });

    if (bookedCount >= fitnessClass.maxCapacity) {
      return res.status(400).json({
        success: false,
        error: 'Class is fully booked'
      });
    }

    // Check if user already booked
    const existingBooking = await Booking.findOne({
      userId,
      classId,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        error: 'You have already booked this class'
      });
    }

    // Check membership
    const membership = await Membership.findOne({
      userId,
      status: 'active',
      endDate: { $gte: new Date() }
    });

    let amount = fitnessClass.price;
    let paymentStatus = 'pending';

    if (membership) {
      amount = 0;
      paymentStatus = 'paid';
      
      // Decrease remaining classes
      if (membership.remainingClasses !== null) {
        membership.remainingClasses -= 1;
        await membership.save();
      }
    }

    // Create booking
    const booking = await Booking.create({
      userId,
      classId,
      status: 'confirmed',
      amount,
      paymentStatus
    });

    // Create payment record if amount > 0
    if (amount > 0) {
      await Payment.create({
        userId,
        bookingId: booking._id,
        amount,
        paymentMethod: 'cash',
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'completed',
        paymentDate: new Date()
      });
    }

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('classId')
      .populate({
        path: 'classId',
        populate: {
          path: 'trainerId',
          populate: {
            path: 'userId',
            select: 'name email'
          }
        }
      })
      .sort({ bookingDate: -1 });

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Booking already cancelled'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
