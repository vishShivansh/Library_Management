'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Students table
    await queryInterface.createTable('students', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      roll_no: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      class: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      language_pref: {
        type: Sequelize.STRING(5),
        defaultValue: 'en',
      },
      photo_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      fcm_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      joined_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Admins table
    await queryInterface.createTable('admins', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      role: {
        type: Sequelize.STRING(50),
        defaultValue: 'librarian',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Books table
    await queryInterface.createTable('books', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      author: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      isbn: {
        type: Sequelize.STRING(32),
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      cover_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      copies_total: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      copies_available: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      added_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Borrow records table
    await queryInterface.createTable('borrow_records', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      book_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      issued_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      due_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      returned_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      fine_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM('pending', 'issued', 'returned', 'overdue', 'cancelled', 'pending_return'),
        defaultValue: 'pending',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Attendance table
    await queryInterface.createTable('attendance', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('present', 'absent'),
        allowNull: false,
      },
      method: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      location: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      photo_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      recorded_by: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Attendance tokens table
    await queryInterface.createTable('attendance_tokens', {
      token: {
        type: Sequelize.STRING(500),
        primaryKey: true,
      },
      kiosk_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      issued_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      used: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      used_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'students',
          key: 'id',
        },
      },
    });

    // Fees table
    await queryInterface.createTable('fees', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      amount_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      paid_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM('due', 'partial', 'paid', 'overdue'),
        defaultValue: 'due',
      },
      razorpay_order_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Transactions table
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      fee_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'fees',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'success', 'failed', 'refunded'),
        defaultValue: 'pending',
      },
      transaction_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      razorpay_payment_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      razorpay_order_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Notifications table
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'students',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      target_type: {
        type: Sequelize.ENUM('student', 'topic', 'all'),
        defaultValue: 'student',
      },
      target_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM('in_app', 'push', 'whatsapp'),
        defaultValue: 'in_app',
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'sent', 'failed'),
        defaultValue: 'pending',
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await queryInterface.addIndex('borrow_records', ['student_id']);
    await queryInterface.addIndex('borrow_records', ['book_id']);
    await queryInterface.addIndex('attendance', ['student_id', 'date']);
    await queryInterface.addIndex('fees', ['student_id']);
    await queryInterface.addIndex('transactions', ['student_id']);
    await queryInterface.addIndex('notifications', ['student_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('transactions');
    await queryInterface.dropTable('fees');
    await queryInterface.dropTable('attendance_tokens');
    await queryInterface.dropTable('attendance');
    await queryInterface.dropTable('borrow_records');
    await queryInterface.dropTable('books');
    await queryInterface.dropTable('admins');
    await queryInterface.dropTable('students');
  },
};






