const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BorrowRecord = sequelize.define('BorrowRecord', {
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
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'book_id',
      references: {
        model: 'books',
        key: 'id',
      },
    },
    issuedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'issued_at',
    },
    dueAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'due_at',
    },
    returnedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'returned_at',
    },
    fineAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'fine_amount',
    },
    status: {
      type: DataTypes.ENUM('pending', 'issued', 'returned', 'overdue', 'cancelled'),
      defaultValue: 'pending',
    },
  }, {
    tableName: 'borrow_records',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return BorrowRecord;
};






