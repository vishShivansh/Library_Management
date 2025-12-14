const express = require('express');
const {
  getMyFees,
  getAllFees,
  createFee,
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getReceipt,
} = require('../controllers/fee.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Student routes
router.get('/my', authenticateToken, getMyFees);
router.post('/pay', authenticateToken, createPaymentOrder);
router.post('/verify', authenticateToken, verifyPayment);
router.get('/history/:id', authenticateToken, getPaymentHistory);
router.get('/my/history', authenticateToken, (req, res, next) => {
  getPaymentHistory(req, res, next);
});
router.get('/receipt/:transactionId', authenticateToken, getReceipt);

// Admin routes
router.get('/all', authenticateToken, requireRole('admin'), getAllFees);
router.post('/', authenticateToken, requireRole('admin'), createFee);
router.get('/receipt/:transactionId', authenticateToken, requireRole('admin'), getReceipt);

module.exports = router;






