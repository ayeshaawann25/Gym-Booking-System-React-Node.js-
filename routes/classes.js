const express = require('express');
const router = express.Router();
const {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass
} = require('../controllers/classController');
const { protect } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roleCheck');

router.get('/', getClasses);
router.get('/:id', getClass);
router.post('/', protect, allowRoles('trainer', 'admin'), createClass);
router.put('/:id', protect, allowRoles('trainer', 'admin'), updateClass);
router.delete('/:id', protect, allowRoles('trainer', 'admin'), deleteClass);

module.exports = router;
