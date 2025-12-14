const express = require('express');
const { handleWebhook } = require('../controllers/payment.controller');

const router = express.Router();

// Webhook endpoint (no auth needed - Razorpay will sign it)
router.post('/webhook', handleWebhook);

module.exports = router;






