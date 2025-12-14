'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check and add created_at to students table if it doesn't exist
    const [studentsColumns] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM `students` LIKE 'created_at'"
    );
    if (studentsColumns.length === 0) {
      await queryInterface.addColumn('students', 'created_at', {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: true,
      });
    }

    // Check and add updated_at to students table if it doesn't exist
    const [studentsUpdatedColumns] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM `students` LIKE 'updated_at'"
    );
    if (studentsUpdatedColumns.length === 0) {
      await queryInterface.addColumn('students', 'updated_at', {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        allowNull: true,
      });
    }

    // Check and add created_at to fees table if it doesn't exist
    const [feesColumns] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM `fees` LIKE 'created_at'"
    );
    if (feesColumns.length === 0) {
      await queryInterface.addColumn('fees', 'created_at', {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: true,
      });
    }

    // Check and add created_at to attendance table if it doesn't exist
    const [attendanceColumns] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM `attendance` LIKE 'created_at'"
    );
    if (attendanceColumns.length === 0) {
      await queryInterface.addColumn('attendance', 'created_at', {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: true,
      });
    }

    // Check and add created_at to borrow_records table if it doesn't exist
    const [borrowColumns] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM `borrow_records` LIKE 'created_at'"
    );
    if (borrowColumns.length === 0) {
      await queryInterface.addColumn('borrow_records', 'created_at', {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: true,
      });
    }

    // Check and add updated_at to borrow_records table if it doesn't exist
    const [borrowUpdatedColumns] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM `borrow_records` LIKE 'updated_at'"
    );
    if (borrowUpdatedColumns.length === 0) {
      await queryInterface.addColumn('borrow_records', 'updated_at', {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        allowNull: true,
      });
    }

    // Check and add created_at to notifications table if it doesn't exist
    const [notificationColumns] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM `notifications` LIKE 'created_at'"
    );
    if (notificationColumns.length === 0) {
      await queryInterface.addColumn('notifications', 'created_at', {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove columns if they exist (for rollback)
    await queryInterface.removeColumn('students', 'created_at').catch(() => {});
    await queryInterface.removeColumn('students', 'updated_at').catch(() => {});
    await queryInterface.removeColumn('fees', 'created_at').catch(() => {});
    await queryInterface.removeColumn('attendance', 'created_at').catch(() => {});
    await queryInterface.removeColumn('borrow_records', 'created_at').catch(() => {});
    await queryInterface.removeColumn('borrow_records', 'updated_at').catch(() => {});
    await queryInterface.removeColumn('notifications', 'created_at').catch(() => {});
  },
};

