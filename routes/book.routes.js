const express = require('express');
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/book.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.post('/', authenticateToken, requireRole('admin'), createBook);
router.put('/:id', authenticateToken, requireRole('admin'), updateBook);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteBook);

module.exports = router;






