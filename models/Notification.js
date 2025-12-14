const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'student_id',
      references: {
        model: 'students',
        key: 'id',
      },
    },
    targetType: {
      type: DataTypes.ENUM('student', 'topic', 'all'),
      defaultValue: 'student',
      field: 'target_type',
    },
    targetId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'target_id',
      comment: 'student id, class name, or "all"',
    },
    type: {
      type: DataTypes.ENUM('in_app', 'push', 'whatsapp'),
      defaultValue: 'in_app',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'failed'),
      defaultValue: 'pending',
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'sent_at',
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'read_at',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  }, {
    tableName: 'notifications',
    timestamps: false,
  });

  return Notification;
};






