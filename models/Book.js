const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Book = sequelize.define('Book', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    isbn: {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    coverUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'cover_url',
    },
    copiesTotal: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      field: 'copies_total',
    },
    copiesAvailable: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      field: 'copies_available',
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    addedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'added_at',
    },
  }, {
    tableName: 'books',
    timestamps: false,
  });

  return Book;
};






