const express = require('express');
const {
  sendNotificationToStudents,
  getMyNotifications,
  markNotificationRead,
} = require('../controllers/notification.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Student routes
router.get('/my', authenticateToken, getMyNotifications);
router.put('/:id/read', authenticateToken, markNotificationRead);

// Admin routes
router.post('/', authenticateToken, requireRole('admin'), sendNotificationToStudents);

module.exports = router;






