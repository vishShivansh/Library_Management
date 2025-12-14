const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../config/config');

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

const createOrder = async (amount, currency = 'INR', receipt = null) => {
  try {
    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    throw new Error(`Razorpay order creation failed: ${error.message}`);
  }
};

const verifyWebhookSignature = (body, signature) => {
  try {
    const expected = crypto
      .createHmac('sha256', config.razorpay.webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');
    return expected === signature;
  } catch (error) {
    return false;
  }
};

const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    const payload = `${orderId}|${paymentId}`;
    const expected = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(payload)
      .digest('hex');
    return expected === signature;
  } catch (error) {
    return false;
  }
};

module.exports = {
  razorpay,
  createOrder,
  verifyWebhookSignature,
  verifyPaymentSignature,
};






