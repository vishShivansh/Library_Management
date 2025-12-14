const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');
const config = require('../config/config');

const sequelize = new Sequelize(
  dbConfig[config.env].database,
  dbConfig[config.env].username,
  dbConfig[config.env].password,
  {
    ...dbConfig[config.env],
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false,
    },
  }
);

// Import models
const Student = require('./Student')(sequelize);
const Admin = require('./Admin')(sequelize);
const Book = require('./Book')(sequelize);
const BorrowRecord = require('./BorrowRecord')(sequelize);
const Attendance = require('./Attendance')(sequelize);
const AttendanceToken = require('./AttendanceToken')(sequelize);
const Fee = require('./Fee')(sequelize);
const Transaction = require('./Transaction')(sequelize);
const Notification = require('./Notification')(sequelize);

// Define associations
Student.hasMany(BorrowRecord, { foreignKey: 'student_id', as: 'borrowRecords' });
Book.hasMany(BorrowRecord, { foreignKey: 'book_id', as: 'borrowRecords' });
BorrowRecord.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
BorrowRecord.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

Student.hasMany(Attendance, { foreignKey: 'student_id', as: 'attendances' });
Attendance.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

Student.hasMany(Fee, { foreignKey: 'student_id', as: 'fees' });
Fee.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

Student.hasMany(Transaction, { foreignKey: 'student_id', as: 'transactions' });
Transaction.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
Transaction.belongsTo(Fee, { foreignKey: 'fee_id', as: 'fee' });
Fee.hasMany(Transaction, { foreignKey: 'fee_id', as: 'transactions' });

Student.hasMany(Notification, { foreignKey: 'student_id', as: 'notifications' });
Notification.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

module.exports = {
  sequelize,
  Student,
  Admin,
  Book,
  BorrowRecord,
  Attendance,
  AttendanceToken,
  Fee,
  Transaction,
  Notification,
};






