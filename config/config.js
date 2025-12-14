require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
  fcm: {
    serverKey: process.env.FCM_SERVER_KEY,
    senderId: process.env.FCM_SENDER_ID,
  },
  qr: {
    hmacSecret: process.env.QR_HMAC_SECRET || 'your-qr-secret',
    ttl: parseInt(process.env.QR_TOKEN_TTL) || 30, // seconds
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  webhookUrl: process.env.WEBHOOK_URL || 'http://localhost:3000/api/payments/webhook',
  mongodb: {
    url: process.env.MONGODB_URL || null,
  },
};






