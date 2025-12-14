const { Book } = require('../models');
const { Op } = require('sequelize');

const getAllBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, tags } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } },
        { isbn: { [Op.like]: `%${search}%` } },
      ];
    }
    if (category) {
      where.category = category;
    }
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      where.tags = { [Op.contains]: tagArray };
    }

    const { count, rows } = await Book.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['addedAt', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        books: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    res.json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      coverUrl,
      copiesTotal,
      copiesAvailable,
      tags,
      description,
    } = req.body;

    const book = await Book.create({
      title,
      author,
      isbn,
      category,
      coverUrl,
      copiesTotal: copiesTotal || 1,
      copiesAvailable: copiesAvailable !== undefined ? copiesAvailable : copiesTotal || 1,
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    const {
      title,
      author,
      isbn,
      category,
      coverUrl,
      copiesTotal,
      copiesAvailable,
      tags,
      description,
    } = req.body;

    await book.update({
      title: title || book.title,
      author: author !== undefined ? author : book.author,
      isbn: isbn !== undefined ? isbn : book.isbn,
      category: category !== undefined ? category : book.category,
      coverUrl: coverUrl !== undefined ? coverUrl : book.coverUrl,
      copiesTotal: copiesTotal !== undefined ? copiesTotal : book.copiesTotal,
      copiesAvailable: copiesAvailable !== undefined ? copiesAvailable : book.copiesAvailable,
      tags: tags !== undefined ? (Array.isArray(tags) ? tags : [tags]) : book.tags,
      description: description !== undefined ? description : book.description,
    });

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    await book.destroy();

    res.json({
      success: true,
      message: 'Book deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};






