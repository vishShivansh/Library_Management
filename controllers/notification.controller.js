const { Notification, Student } = require('../models');
const { sendNotification, sendNotificationToMultiple } = require('../utils/fcm.util');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

const sendNotificationToStudents = async (req, res, next) => {
  try {
    const { targetType, targetId, title, message, type } = req.body;

    let students = [];
    if (targetType === 'student' && targetId) {
      students = await Student.findAll({ where: { id: parseInt(targetId) } });
    } else if (targetType === 'topic' && targetId) {
      // Assuming targetId is a class name
      students = await Student.findAll({ where: { class: targetId } });
    } else if (targetType === 'all') {
      students = await Student.findAll({ where: { fcmToken: { [Op.ne]: null } } });
    }

    const notifications = [];
    const fcmTokens = [];

    for (const student of students) {
      const notification = await Notification.create({
        studentId: student.id,
        targetType,
        targetId: targetId || 'all',
        type: type || 'push',
        title,
        message,
        status: 'pending',
      });

      notifications.push(notification);
      if (student.fcmToken) {
        fcmTokens.push(student.fcmToken);
      }
    }

    // Send FCM notifications
    if (fcmTokens.length > 0) {
      const result = await sendNotificationToMultiple(fcmTokens, title, message, {
        type: 'notification',
      });

      // Update notification status
      if (result.success) {
        await Notification.update(
          { status: 'sent', sentAt: new Date() },
          { where: { id: { [Op.in]: notifications.map((n) => n.id) } } }
        );
      } else {
        await Notification.update(
          { status: 'failed' },
          { where: { id: { [Op.in]: notifications.map((n) => n.id) } } }
        );
      }
    }

    res.json({
      success: true,
      message: 'Notifications sent',
      data: {
        count: notifications.length,
        notifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMyNotifications = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { read, limit = 50 } = req.query;

    const where = { studentId };
    if (read !== undefined) where.read = read === 'true';

    const notifications = await Notification.findAll({
      where,
      order: [['id', 'DESC']], // Order by ID (newest first)
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const notification = await Notification.findOne({
      where: { id, studentId },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    await notification.update({ read: true, readAt: new Date() });

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendNotificationToStudents,
  getMyNotifications,
  markNotificationRead,
};
