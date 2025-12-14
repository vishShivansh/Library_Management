const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AttendanceToken = sequelize.define('AttendanceToken', {
    token: {
      type: DataTypes.STRING(500),
      primaryKey: true,
    },
    kioskId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'kiosk_id',
    },
    issuedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'issued_at',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    usedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'used_by',
      references: {
        model: 'students',
        key: 'id',
      },
    },
  }, {
    tableName: 'attendance_tokens',
    timestamps: false,
  });

  return AttendanceToken;
};






