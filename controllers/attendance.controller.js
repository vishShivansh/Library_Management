const { Attendance, AttendanceToken, Student } = require('../models');
const { generateQRToken, verifyToken: verifyQRToken, validateGPS } = require('../utils/qr.util');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

const generateQRCode = async (req, res, next) => {
  try {
    const { kioskId, ttlSeconds, date } = req.body;
    const kiosk = kioskId || req.user.id.toString();
    
    // Use provided date or today's date - ensures QR code is date-specific
    const targetDate = date || new Date().toISOString().split('T')[0];

    const { token, qrDataUrl, payload, expiresAt } = await generateQRToken(kiosk, ttlSeconds, targetDate);

    // Store token in database
    await AttendanceToken.create({
      token,
      kioskId: kiosk,
      issuedAt: new Date(payload.issued_at),
      expiresAt: new Date(payload.expires_at),
      metadata: { action: payload.action, date: targetDate },
    });

    res.json({
      success: true,
      data: {
        token,
        qrDataUrl,
        expiresAt,
        date: targetDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

const markAttendance = async (req, res, next) => {
  try {
    const { token, selfieBase64, lat, lon, deviceId } = req.body;
    const studentId = req.user.id;

    // Verify QR token
    let payload;
    try {
      payload = verifyQRToken(token);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid or expired QR token',
      });
    }

    // Check if token already used
    const tokenRecord = await AttendanceToken.findOne({ where: { token } });
    if (!tokenRecord) {
      return res.status(400).json({
        success: false,
        message: 'Token not found',
      });
    }

    if (tokenRecord.used) {
      return res.status(400).json({
        success: false,
        message: 'Token already used',
      });
    }

    // GPS validation (optional - if library location is configured)
    const libraryLat = parseFloat(process.env.LIBRARY_LAT) || null;
    const libraryLon = parseFloat(process.env.LIBRARY_LON) || null;
    let gpsValid = true;
    let gpsReason = null;

    if (libraryLat && libraryLon && lat && lon) {
      gpsValid = validateGPS(libraryLat, libraryLon, parseFloat(lat), parseFloat(lon));
      if (!gpsValid) {
        gpsReason = 'Location mismatch - not within library boundaries';
      }
    }

    // Get target date from token payload or use today
    const targetDate = payload.date || new Date().toISOString().split('T')[0];
    
    // Check if attendance already marked for target date
    const existingAttendance = await Attendance.findOne({
      where: {
        studentId,
        date: targetDate,
        status: 'present',
      },
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: true,
        message: `Attendance already marked for ${targetDate}`,
        data: existingAttendance,
      });
    }

    // Mark token as used
    await tokenRecord.update({ used: true, usedBy: studentId });

    // Create attendance record with target date from token
    const attendance = await Attendance.create({
      studentId,
      date: targetDate,
      status: 'present',
      method: 'app_qr',
      location: lat && lon ? { lat: parseFloat(lat), lon: parseFloat(lon) } : null,
      photoUrl: selfieBase64 ? `data:image/jpeg;base64,${selfieBase64}` : null,
      verified: gpsValid && !selfieBase64, // Auto-verify if GPS valid and no selfie
      recordedBy: deviceId || 'app',
    });

    const response = {
      success: true,
      message: 'Attendance marked successfully',
      data: attendance,
    };

    if (!gpsValid) {
      response.warning = gpsReason;
      response.requiresVerification = true;
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
};

const getStudentAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;

    // Check if user is accessing their own attendance or is admin
    const studentId = req.user.role === 'admin' ? id : req.user.id;

    const where = { studentId };
    if (from && to) {
      where.date = {
        [Op.between]: [from, to],
      };
    } else if (from) {
      where.date = { [Op.gte]: from };
    } else if (to) {
      where.date = { [Op.lte]: to };
    }

    const attendance = await Attendance.findAll({
      where,
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

const getAllAttendance = async (req, res, next) => {
  try {
    const { from, to, studentId, verified } = req.query;

    const where = {};
    if (from && to) {
      where.date = {
        [Op.between]: [from, to],
      };
    } else if (from) {
      where.date = { [Op.gte]: from };
    } else if (to) {
      where.date = { [Op.lte]: to };
    }
    if (studentId) where.studentId = studentId;
    if (verified !== undefined) where.verified = verified === 'true';

    const attendance = await Attendance.findAll({
      where,
      include: [{ model: Student, as: 'student' }],
      order: [['date', 'DESC'], ['id', 'DESC']], // Order by date then ID
    });

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

const getUnverifiedAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findAll({
      where: { verified: false },
      include: [{ model: Student, as: 'student' }],
      order: [['id', 'DESC']], // Order by ID (newest first)
    });

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

const verifyAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve' | 'reject'

    const attendance = await Attendance.findByPk(id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    if (action === 'approve') {
      await attendance.update({ verified: true });
      res.json({
        success: true,
        message: 'Attendance verified',
        data: attendance,
      });
    } else if (action === 'reject') {
      await attendance.update({ status: 'absent', verified: true });
      res.json({
        success: true,
        message: 'Attendance rejected',
        data: attendance,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "approve" or "reject"',
      });
    }
  } catch (error) {
    next(error);
  }
};

const manualMarkAttendance = async (req, res, next) => {
  try {
    const { studentId, date, status: attendanceStatus, notes } = req.body;
    const adminId = req.user.id;

    // Validate student exists
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Use provided date or today's date
    const targetDate = date || new Date().toISOString().split('T')[0];
    const status = attendanceStatus || 'present';

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      where: {
        studentId,
        date: targetDate,
      },
    });

    if (existingAttendance) {
      // Update existing record
      await existingAttendance.update({
        status,
        method: 'manual',
        verified: true,
        recordedBy: `admin_${adminId}`,
      });

      return res.json({
        success: true,
        message: 'Attendance updated successfully',
        data: existingAttendance,
      });
    }

    // Create new attendance record
    const attendance = await Attendance.create({
      studentId,
      date: targetDate,
      status,
      method: 'manual',
      verified: true,
      recordedBy: `admin_${adminId}`,
    });

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateQRCode,
  markAttendance,
  getStudentAttendance,
  getAllAttendance,
  getUnverifiedAttendance,
  verifyAttendance,
  manualMarkAttendance,
};






