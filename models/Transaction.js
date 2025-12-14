const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
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
    feeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'fee_id',
      references: {
        model: 'fees',
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'success', 'failed', 'refunded'),
      defaultValue: 'pending',
    },
    transactionId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      field: 'transaction_id',
    },
    razorpayPaymentId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      field: 'razorpay_payment_id',
    },
    razorpayOrderId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'razorpay_order_id',
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'payment_method',
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'transactions',
    timestamps: false,
  });

  return Transaction;
};






