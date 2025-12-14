const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Fee = sequelize.define('Fee', {
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
    amountTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'amount_total',
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'due_date',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paidAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'paid_amount',
    },
    status: {
      type: DataTypes.ENUM('due', 'partial', 'paid', 'overdue'),
      defaultValue: 'due',
    },
    razorpayOrderId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'razorpay_order_id',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  }, {
    tableName: 'fees',
    timestamps: false,
  });

  return Fee;
};






