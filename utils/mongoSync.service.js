const { Student, Admin, Book, BorrowRecord, Attendance, Fee, Transaction, Notification } = require('../models');
const mongoose = require('mongoose');

// MongoDB Schemas (for viewing data)
const StudentSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const AdminSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const BookSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const BorrowRecordSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const AttendanceSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const FeeSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const TransactionSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const NotificationSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

const getModels = () => {
  if (mongoose.connection.readyState !== 1) {
    return null;
  }
  
  return {
    Student: mongoose.model('Student', StudentSchema, 'students'),
    Admin: mongoose.model('Admin', AdminSchema, 'admins'),
    Book: mongoose.model('Book', BookSchema, 'books'),
    BorrowRecord: mongoose.model('BorrowRecord', BorrowRecordSchema, 'borrow_records'),
    Attendance: mongoose.model('Attendance', AttendanceSchema, 'attendances'),
    Fee: mongoose.model('Fee', FeeSchema, 'fees'),
    Transaction: mongoose.model('Transaction', TransactionSchema, 'transactions'),
    Notification: mongoose.model('Notification', NotificationSchema, 'notifications'),
  };
};

// Convert Sequelize instance to plain object
const toPlainObject = (instance) => {
  if (!instance) return null;
  const data = instance.get ? instance.get({ plain: true }) : instance;
  // Remove Sequelize metadata
  delete data.dataValues;
  return data;
};

// Sync a single collection
const syncCollection = async (sequelizeModel, mongoModel, collectionName) => {
  try {
    const mongoModels = getModels();
    if (!mongoModels || !mongoModel) {
      console.log(`⚠️  MongoDB not connected. Skipping ${collectionName} sync.`);
      return { synced: 0, errors: 0 };
    }

    const mongoCollection = mongoModels[mongoModel];
    if (!mongoCollection) {
      console.log(`⚠️  MongoDB model ${mongoModel} not found.`);
      return { synced: 0, errors: 0 };
    }

    // Get all records from Sequelize
    const records = await sequelizeModel.findAll({ raw: true });
    
    if (records.length === 0) {
      console.log(`ℹ️  No records found in ${collectionName}`);
      return { synced: 0, errors: 0 };
    }

    // Clear existing collection (optional - comment out if you want to keep history)
    // await mongoCollection.deleteMany({});

    // Insert/Update records
    let synced = 0;
    let errors = 0;

    for (const record of records) {
      try {
        const plainRecord = toPlainObject(record);
        // Store MySQL id as mysqlId for reference
        const mysqlId = plainRecord.id;
        
        // Remove id from plainRecord to avoid conflicts with MongoDB _id
        delete plainRecord.id;
        
        // Use mysqlId field to find existing records (not _id)
        // MongoDB will auto-generate _id as ObjectId
        await mongoCollection.findOneAndUpdate(
          { mysqlId: mysqlId },
          { 
            $set: {
              ...plainRecord,
              mysqlId: mysqlId // Keep mysqlId for reference
            }
          },
          { upsert: true, new: true }
        );
        synced++;
      } catch (error) {
        console.error(`Error syncing ${collectionName} record ${record.id}:`, error.message);
        errors++;
      }
    }

    console.log(`✅ Synced ${synced} records to MongoDB ${collectionName}${errors > 0 ? ` (${errors} errors)` : ''}`);
    return { synced, errors };
  } catch (error) {
    console.error(`❌ Error syncing ${collectionName}:`, error.message);
    return { synced: 0, errors: 1 };
  }
};

// Sync all collections
const syncAllToMongoDB = async () => {
  try {
    const mongoModels = getModels();
    if (!mongoModels) {
      console.log('⚠️  MongoDB not connected. Skipping sync.');
      return;
    }

    console.log('🔄 Starting MongoDB sync...');

    const results = {
      students: await syncCollection(Student, 'Student', 'students'),
      admins: await syncCollection(Admin, 'Admin', 'admins'),
      books: await syncCollection(Book, 'Book', 'books'),
      borrowRecords: await syncCollection(BorrowRecord, 'BorrowRecord', 'borrow_records'),
      attendances: await syncCollection(Attendance, 'Attendance', 'attendances'),
      fees: await syncCollection(Fee, 'Fee', 'fees'),
      transactions: await syncCollection(Transaction, 'Transaction', 'transactions'),
      notifications: await syncCollection(Notification, 'Notification', 'notifications'),
    };

    const totalSynced = Object.values(results).reduce((sum, r) => sum + r.synced, 0);
    const totalErrors = Object.values(results).reduce((sum, r) => sum + r.errors, 0);

    console.log(`\n✅ MongoDB sync completed!`);
    console.log(`   Total records synced: ${totalSynced}`);
    if (totalErrors > 0) {
      console.log(`   Errors: ${totalErrors}`);
    }
  } catch (error) {
    console.error('❌ Error during MongoDB sync:', error.message);
  }
};

// Sync specific collection
const syncCollectionToMongoDB = async (collectionName) => {
  const collections = {
    students: { model: Student, mongoModel: 'Student' },
    admins: { model: Admin, mongoModel: 'Admin' },
    books: { model: Book, mongoModel: 'Book' },
    borrow_records: { model: BorrowRecord, mongoModel: 'BorrowRecord' },
    attendances: { model: Attendance, mongoModel: 'Attendance' },
    fees: { model: Fee, mongoModel: 'Fee' },
    transactions: { model: Transaction, mongoModel: 'Transaction' },
    notifications: { model: Notification, mongoModel: 'Notification' },
  };

  const collection = collections[collectionName];
  if (!collection) {
    console.error(`❌ Unknown collection: ${collectionName}`);
    return;
  }

  await syncCollection(collection.model, collection.mongoModel, collectionName);
};

module.exports = {
  syncAllToMongoDB,
  syncCollectionToMongoDB,
  getModels,
};

