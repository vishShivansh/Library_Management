const express = require('express');
const { syncAllToMongoDB, syncCollectionToMongoDB } = require('../utils/mongoSync.service');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Sync all collections to MongoDB (Admin only)
router.post('/sync/all', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    await syncAllToMongoDB();
    res.json({
      success: true,
      message: 'All collections synced to MongoDB successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error syncing to MongoDB',
      error: error.message,
    });
  }
});

// Sync specific collection to MongoDB (Admin only)
router.post('/sync/:collection', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { collection } = req.params;
    await syncCollectionToMongoDB(collection);
    res.json({
      success: true,
      message: `Collection '${collection}' synced to MongoDB successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error syncing collection to MongoDB',
      error: error.message,
    });
  }
});

module.exports = router;

