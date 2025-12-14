const admin = require('firebase-admin');
const config = require('../config/config');

// Initialize Firebase Admin (requires service account or credentials)
let fcmInitialized = false;

const initializeFCM = () => {
  if (!fcmInitialized && config.fcm.serverKey) {
    try {
      // For simplicity, using a service account file path
      // In production, use environment variables or secret management
      if (process.env.FCM_SERVICE_ACCOUNT_PATH) {
        const serviceAccount = require(process.env.FCM_SERVICE_ACCOUNT_PATH);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else {
        // Initialize with server key (limited functionality)
        console.warn('FCM: Service account not configured. Using server key method.');
      }
      fcmInitialized = true;
    } catch (error) {
      console.error('FCM initialization error:', error);
    }
  }
};

const sendNotification = async (fcmToken, title, body, data = {}) => {
  try {
    initializeFCM();
    
    if (!admin.apps.length) {
      throw new Error('FCM not initialized');
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      token: fcmToken,
    };

    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('FCM send error:', error);
    return { success: false, error: error.message };
  }
};

const sendNotificationToMultiple = async (fcmTokens, title, body, data = {}) => {
  try {
    initializeFCM();
    
    if (!admin.apps.length) {
      throw new Error('FCM not initialized');
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      tokens: fcmTokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    return {
      success: response.successCount > 0,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses,
    };
  } catch (error) {
    console.error('FCM multicast error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  initializeFCM,
  sendNotification,
  sendNotificationToMultiple,
};






