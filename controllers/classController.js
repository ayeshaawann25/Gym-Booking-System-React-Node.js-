const FitnessClass = require('../models/FitnessClass');
const Trainer = require('../models/Trainer');
const Booking = require('../models/Booking');

// @desc    Get all classes
// @route   GET /api/classes
exports.getClasses = async (req, res) => {
  try {
    const { type, difficulty, search, limit = 10, page = 1 } = req.query;
    
    let query = { isActive: true };
    
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const classes = await FitnessClass.find(query)
      .populate('trainerId', 'userId specialization experience rating')
      .populate({
        path: 'trainerId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await FitnessClass.countDocuments(query);

    res.status(200).json({
      success: true,
      data: classes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
exports.getClass = async (req, res) => {
  try {
    const fitnessClass = await FitnessClass.findById(req.params.id)
      .populate('trainerId', 'userId specialization experience bio rating')
      .populate({
        path: 'trainerId',
        populate: {
          path: 'userId',
          select: 'name email phone'
        }
      });

    if (!fitnessClass) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Get available spots
    const bookedCount = await Booking.countDocuments({
      classId: fitnessClass._id,
      status: 'confirmed'
    });

    res.status(200).json({
      success: true,
      data: {
        ...fitnessClass.toObject(),
        availableSpots: fitnessClass.maxCapacity - bookedCount,
        bookedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create class (Trainer)
// @route   POST /api/classes
exports.createClass = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ userId: req.user.id });
    
    if (!trainer) {
      return res.status(403).json({
        success: false,
        error: 'Only trainers can create classes'
      });
    }

    const classData = {
      ...req.body,
      trainerId: trainer._id
    };

    const fitnessClass = await FitnessClass.create(classData);

    res.status(201).json({
      success: true,
      data: fitnessClass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
exports.updateClass = async (req, res) => {
  try {
    let fitnessClass = await FitnessClass.findById(req.params.id);

    if (!fitnessClass) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check if user owns this class
    const trainer = await Trainer.findOne({ userId: req.user.id });
    if (fitnessClass.trainerId.toString() !== trainer._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this class'
      });
    }

    fitnessClass = await FitnessClass.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: fitnessClass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
exports.deleteClass = async (req, res) => {
  try {
    const fitnessClass = await FitnessClass.findById(req.params.id);

    if (!fitnessClass) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check if user owns this class
    const trainer = await Trainer.findOne({ userId: req.user.id });
    if (fitnessClass.trainerId.toString() !== trainer._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this class'
      });
    }

    await fitnessClass.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
