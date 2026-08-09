const express = require('express');
const router = express.Router();
const {
  bookClass,
  getMyBookings,
  cancelBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', bookClass);
router.get('/my-bookings', getMyBookings);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
