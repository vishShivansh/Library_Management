const { BorrowRecord, Book, Student } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

const requestBorrow = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const studentId = req.user.id;

    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    if (book.copiesAvailable <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Book is not available',
      });
    }

    // Check if student has pending/issued records for this book
    const existingRecord = await BorrowRecord.findOne({
      where: {
        studentId,
        bookId,
        status: { [Op.in]: ['pending', 'issued'] },
      },
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending or active borrow request for this book',
      });
    }

    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + 14); // 14 days from now

    const borrowRecord = await BorrowRecord.create({
      studentId,
      bookId,
      dueAt,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Borrow request created successfully',
      data: borrowRecord,
    });
  } catch (error) {
    next(error);
  }
};

const approveBorrow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const borrowRecord = await BorrowRecord.findByPk(id, {
      include: [{ model: Book, as: 'book' }],
    });

    if (!borrowRecord) {
      return res.status(404).json({
        success: false,
        message: 'Borrow record not found',
      });
    }

    if (borrowRecord.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Borrow request is not pending',
      });
    }

    const book = borrowRecord.book;
    if (book.copiesAvailable <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Book is not available',
      });
    }

    await book.update({ copiesAvailable: book.copiesAvailable - 1 });
    await borrowRecord.update({
      status: 'issued',
      issuedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Borrow request approved',
      data: borrowRecord,
    });
  } catch (error) {
    next(error);
  }
};

const requestReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const borrowRecord = await BorrowRecord.findByPk(id, {
      include: [{ model: Book, as: 'book' }],
    });

    if (!borrowRecord) {
      return res.status(404).json({
        success: false,
        message: 'Borrow record not found',
      });
    }

    if (borrowRecord.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'You can only return your own books',
      });
    }

    if (borrowRecord.status !== 'issued') {
      return res.status(400).json({
        success: false,
        message: 'Book is not currently issued',
      });
    }

    // Calculate fine if overdue
    let fineAmount = 0;
    if (new Date(borrowRecord.dueAt) < new Date()) {
      const daysOverdue = Math.ceil(
        (new Date() - new Date(borrowRecord.dueAt)) / (1000 * 60 * 60 * 24)
      );
      fineAmount = daysOverdue * 5; // 5 per day (adjust as needed)
    }

    await borrowRecord.update({
      status: 'pending_return',
      fineAmount,
    });

    res.json({
      success: true,
      message: 'Return request submitted',
      data: borrowRecord,
    });
  } catch (error) {
    next(error);
  }
};

const approveReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const borrowRecord = await BorrowRecord.findByPk(id, {
      include: [{ model: Book, as: 'book' }],
    });

    if (!borrowRecord) {
      return res.status(404).json({
        success: false,
        message: 'Borrow record not found',
      });
    }

    if (!['issued', 'pending_return'].includes(borrowRecord.status)) {
      return res.status(400).json({
        success: false,
        message: 'Return cannot be processed',
      });
    }

    const book = borrowRecord.book;
    await book.update({ copiesAvailable: book.copiesAvailable + 1 });
    await borrowRecord.update({
      status: 'returned',
      returnedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Return approved',
      data: borrowRecord,
    });
  } catch (error) {
    next(error);
  }
};

const getMyBorrows = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { status } = req.query;

    const where = { studentId };
    if (status) {
      where.status = status;
    }

    const borrowRecords = await BorrowRecord.findAll({
      where,
      include: [
        { model: Book, as: 'book' },
      ],
      order: [['id', 'DESC']], // Order by ID (newest first)
    });

    res.json({
      success: true,
      data: borrowRecords,
    });
  } catch (error) {
    next(error);
  }
};

const getAllBorrows = async (req, res, next) => {
  try {
    const { status, studentId, bookId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (studentId) where.studentId = studentId;
    if (bookId) where.bookId = bookId;

    const borrowRecords = await BorrowRecord.findAll({
      where,
      include: [
        { model: Book, as: 'book' },
        { model: Student, as: 'student' },
      ],
      order: [['id', 'DESC']], // Order by ID (newest first)
    });

    res.json({
      success: true,
      data: borrowRecords,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestBorrow,
  approveBorrow,
  requestReturn,
  approveReturn,
  getMyBorrows,
  getAllBorrows,
};






