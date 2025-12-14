const { Transaction, Fee, Student } = require('../models');
const { verifyWebhookSignature } = require('../utils/razorpay.util');
const { sendNotification } = require('../utils/fcm.util');

const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body;

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }

    const event = body.event;
    const payment = body.payload.payment?.entity;

    if (event === 'payment.captured' && payment) {
      const paymentId = payment.id;
      const orderId = payment.order_id;

      // Check if already processed (idempotency)
      const existingTransaction = await Transaction.findOne({
        where: { razorpayPaymentId: paymentId },
      });

      if (existingTransaction) {
        return res.json({
          success: true,
          message: 'Payment already processed',
        });
      }

      // Find transaction by order ID
      const transaction = await Transaction.findOne({
        where: { razorpayOrderId: orderId },
        include: [{ model: Fee, as: 'fee' }],
      });

      if (!transaction) {
        console.error('Transaction not found for order:', orderId);
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }

      // Update transaction
      await transaction.update({
        status: 'success',
        razorpayPaymentId: paymentId,
        transactionId: paymentId,
        paymentMethod: payment.method || 'razorpay',
        metadata: payment,
      });

      // Update fee
      const fee = transaction.fee;
      const newPaidAmount = fee.paidAmount + transaction.amount;
      const status = newPaidAmount >= fee.amountTotal ? 'paid' : 'partial';
      
      await fee.update({
        paidAmount: newPaidAmount,
        status,
      });

      // Send notification
      const student = await Student.findByPk(transaction.studentId);
      if (student && student.fcmToken) {
        await sendNotification(
          student.fcmToken,
          'Payment Successful',
          `Payment of ₹${transaction.amount} processed successfully`,
          { type: 'payment', transactionId: transaction.id }
        );
      }

      return res.json({
        success: true,
        message: 'Payment processed successfully',
      });
    }

    res.json({
      success: true,
      message: 'Webhook received',
    });
  } catch (error) {
    console.error('Webhook error:', error);
    next(error);
  }
};

module.exports = {
  handleWebhook,
};






