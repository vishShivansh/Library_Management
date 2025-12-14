const crypto = require('crypto');
const config = require('../config/config');
const QRCode = require('qrcode');

const signPayload = (payload) => {
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadJson).toString('base64');
  const hmac = crypto
    .createHmac('sha256', config.qr.hmacSecret)
    .update(payloadB64)
    .digest('hex');
  return `${payloadB64}.${hmac}`;
};

const verifyToken = (token) => {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) {
      throw new Error('Invalid token format');
    }

    const expected = crypto
      .createHmac('sha256', config.qr.hmacSecret)
      .update(payloadB64)
      .digest('hex');

    if (expected !== signature) {
      throw new Error('Invalid signature');
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));
    
    if (new Date(payload.expires_at) < new Date()) {
      throw new Error('Token expired');
    }

    return payload;
  } catch (error) {
    throw error;
  }
};

const generateQRToken = async (kioskId, ttlSeconds = null, date = null) => {
  const ttl = ttlSeconds || config.qr.ttl;
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + ttl * 1000);
  const nonce = crypto.randomBytes(16).toString('hex');
  
  // Use provided date or today's date (YYYY-MM-DD format)
  const targetDate = date || new Date().toISOString().split('T')[0];

  const payload = {
    kiosk_id: kioskId,
    issued_at: issuedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    nonce,
    action: 'attendance',
    date: targetDate, // Include date in payload to make QR code date-specific
  };

  const token = signPayload(payload);
  
  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(token);

  return {
    token,
    qrDataUrl,
    payload,
    expiresAt,
  };
};

const validateGPS = (lat1, lon1, lat2, lon2, radiusMeters = 100) => {
  // Haversine formula to calculate distance
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance <= radiusMeters;
};

module.exports = {
  signPayload,
  verifyToken,
  generateQRToken,
  validateGPS,
};






