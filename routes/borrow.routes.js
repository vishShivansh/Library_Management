const express = require('express');
const {
  requestBorrow,
  approveBorrow,
  requestReturn,
  approveReturn,
  getMyBorrows,
  getAllBorrows,
} = require('../controllers/borrow.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Student routes
router.post('/', authenticateToken, requestBorrow);
router.get('/my', authenticateToken, getMyBorrows);
router.put('/:id/return', authenticateToken, requestReturn);

// Admin routes
router.get('/all', authenticateToken, requireRole('admin'), getAllBorrows);
router.put('/:id/approve', authenticateToken, requireRole('admin'), approveBorrow);
router.put('/:id/approve-return', authenticateToken, requireRole('admin'), approveReturn);

module.exports = router;






