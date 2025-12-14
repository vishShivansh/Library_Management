const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const Student = sequelize.define('Student', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    rollNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'roll_no',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    class: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    languagePref: {
      type: DataTypes.STRING(5),
      defaultValue: 'en',
      field: 'language_pref',
    },
    photoUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'photo_url',
    },
    fcmToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'fcm_token',
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'joined_at',
    },
  }, {
    tableName: 'students',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (student) => {
        if (student.password) {
          student.password = await bcrypt.hash(student.password, 10);
        }
      },
      beforeUpdate: async (student) => {
        if (student.changed('password')) {
          student.password = await bcrypt.hash(student.password, 10);
        }
      },
    },
  });

  Student.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  Student.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  return Student;
};






