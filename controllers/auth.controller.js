const { Student, Admin } = require('../models');
const { Op } = require('sequelize');
const { generateToken } = require('../utils/jwt.util');

const register = async (req, res, next) => {
  try {
    const { name, email, password, rollNo, phone, class: studentClass, role } = req.body;

    // Validate role
    if (role === 'admin') {
      // Admin registration (can be restricted)
      const existingAdmin = await Admin.findOne({ where: { email } });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Admin with this email already exists',
        });
      }

      const admin = await Admin.create({
        name,
        email,
        password,
        phone,
        role: 'admin',
      });

      const token = generateToken(admin.id, 'admin');

      return res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        data: {
          user: admin,
          token,
        },
      });
    } else {
      // Student registration
      const existingStudent = await Student.findOne({
        where: { [Op.or]: [{ email }, { rollNo }] },
      });

      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Student with this email or roll number already exists',
        });
      }

      const student = await Student.create({
        name,
        email,
        password,
        rollNo,
        phone,
        class: studentClass,
      });

      const token = generateToken(student.id, 'student');

      return res.status(201).json({
        success: true,
        message: 'Student registered successfully',
        data: {
          user: student,
          token,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (role === 'admin') {
      const admin = await Admin.findOne({ where: { email } });
      if (!admin || !(await admin.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const token = generateToken(admin.id, 'admin');

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: admin,
          token,
        },
      });
    } else {
      const student = await Student.findOne({ where: { email } });
      if (!student || !(await student.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const token = generateToken(student.id, 'student');

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: student,
          token,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = req.userModel;
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = req.userModel;
    const { name, phone, languagePref, photoUrl } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (languagePref) updates.languagePref = languagePref;
    if (photoUrl) updates.photoUrl = photoUrl;

    await user.update(updates);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
