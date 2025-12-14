const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'student_id',
      references: {
        model: 'students',
        key: 'id',
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('present', 'absent'),
      allowNull: false,
    },
    method: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "'app_qr' | 'kiosk_bio' | 'manual' | 'gps'",
    },
    location: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '{lat, lon}',
    },
    photoUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'photo_url',
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    recordedBy: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'recorded_by',
      comment: 'admin/kiosk/device-id',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  }, {
    tableName: 'attendance',
    timestamps: false,
  });

  return Attendance;
};






