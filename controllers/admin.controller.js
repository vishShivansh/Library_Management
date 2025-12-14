const { Student, BorrowRecord, Attendance, Fee, Book } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

const getDashboardSummary = async (req, res, next) => {
  try {
    const totalStudents = await Student.count();
    const totalBooks = await Book.count();
    const booksBorrowed = await BorrowRecord.count({
      where: { status: { [Op.in]: ['issued', 'pending'] } },
    });
    const booksAvailable = await Book.sum('copiesAvailable');
    const feesDue = await Fee.count({
      where: { status: { [Op.in]: ['due', 'partial', 'overdue'] } },
    });

    // Calculate attendance percentage for current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const totalDays = new Date().getDate();
    
    const attendanceRecords = await Attendance.count({
      where: {
        date: { [Op.gte]: currentMonth },
        status: 'present',
      },
    });
    
    const attendancePercentage = totalStudents > 0 
      ? (attendanceRecords / (totalStudents * totalDays)) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        totalStudents,
        totalBooks,
        booksBorrowed,
        booksAvailable,
        feesDue,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAttendanceReport = async (req, res, next) => {
  try {
    const { from, to, studentId } = req.query;

    const where = {};
    if (from && to) {
      where.date = { [Op.between]: [from, to] };
    }
    if (studentId) where.studentId = studentId;

    const attendance = await Attendance.findAll({
      where,
      include: [{ model: Student, as: 'student' }],
      attributes: [
        'date',
        [sequelize.fn('COUNT', sequelize.col('Attendance.id')), 'presentCount'],
      ],
      group: ['date'],
      order: [['date', 'DESC']],
    });

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

const getAllStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { rollNo: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Student.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']], // Order by ID (newest first) - created_at column may not exist in DB
    });

    res.json({
      success: true,
      data: {
        students: rows,
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

const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id, {
      include: [
        {
          model: Attendance,
          as: 'attendances',
          separate: true,
          order: [['date', 'DESC']],
        },
        {
          model: Fee,
          as: 'fees',
          separate: true,
          order: [['id', 'DESC']],
        },
      ],
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, rollNo, phone, class: studentClass, password, photoUrl } = req.body;

    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Check if email or rollNo already exists for another student
    if (email || rollNo) {
      const where = {
        id: { [Op.ne]: id },
        [Op.or]: [],
      };
      if (email) where[Op.or].push({ email });
      if (rollNo) where[Op.or].push({ rollNo });

      const existing = await Student.findOne({ where });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Email or roll number already exists',
        });
      }
    }

    // Update fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (rollNo) updateData.rollNo = rollNo;
    if (phone !== undefined) updateData.phone = phone;
    if (studentClass !== undefined) updateData.class = studentClass;
    if (password) updateData.password = password;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl;

    await student.update(updateData);

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    await student.destroy();

    res.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getAttendanceReport,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};






