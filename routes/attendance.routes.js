const express = require('express');
const {
  generateQRCode,
  markAttendance,
  getStudentAttendance,
  getAllAttendance,
  getUnverifiedAttendance,
  verifyAttendance,
  manualMarkAttendance,
} = require('../controllers/attendance.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Student routes
router.post('/mark', authenticateToken, markAttendance);
router.get('/student/:id', authenticateToken, getStudentAttendance);
router.get('/my', authenticateToken, (req, res, next) => {
  req.params.id = req.user.id;
  getStudentAttendance(req, res, next);
});

// Admin/Kiosk routes
router.post('/qrcode', authenticateToken, requireRole('admin'), generateQRCode);
router.post('/manual', authenticateToken, requireRole('admin'), manualMarkAttendance);
router.get('/all', authenticateToken, requireRole('admin'), getAllAttendance);
router.get('/unverified', authenticateToken, requireRole('admin'), getUnverifiedAttendance);
router.put('/:id/verify', authenticateToken, requireRole('admin'), verifyAttendance);

module.exports = router;






