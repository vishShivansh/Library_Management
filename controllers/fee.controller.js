const { Fee, Transaction, Student } = require('../models');
const { createOrder, verifyPaymentSignature } = require('../utils/razorpay.util');
const { sendNotification } = require('../utils/fcm.util');
const config = require('../config/config');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

const getMyFees = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { status } = req.query;

    const where = { studentId };
    if (status) where.status = status;

    const fees = await Fee.findAll({
      where,
      order: [['id', 'DESC']], // Order by ID (newest first)
    });

    res.json({
      success: true,
      data: fees,
    });
  } catch (error) {
    next(error);
  }
};

const getAllFees = async (req, res, next) => {
  try {
    const { studentId, status } = req.query;

    const where = {};
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;

    const fees = await Fee.findAll({
      where,
      include: [{ model: Student, as: 'student' }],
      order: [['id', 'DESC']], // Order by ID (newest first)
    });

    res.json({
      success: true,
      data: fees,
    });
  } catch (error) {
    next(error);
  }
};

const createFee = async (req, res, next) => {
  try {
    const { studentId, amountTotal, dueDate, description } = req.body;

    const fee = await Fee.create({
      studentId,
      amountTotal: parseFloat(amountTotal),
      dueDate,
      description,
      status: 'due',
    });

    res.status(201).json({
      success: true,
      message: 'Fee created successfully',
      data: fee,
    });
  } catch (error) {
    next(error);
  }
};

const createPaymentOrder = async (req, res, next) => {
  try {
    const { feeId, amount } = req.body;
    const studentId = req.user.id;

    const fee = await Fee.findByPk(feeId);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee not found',
      });
    }

    if (fee.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'You can only pay your own fees',
      });
    }

    const paymentAmount = amount || (fee.amountTotal - fee.paidAmount);
    if (paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Fee is already paid',
      });
    }

    // Create Razorpay order
    const receipt = `fee_${feeId}_${Date.now()}`;
    const order = await createOrder(paymentAmount, 'INR', receipt);

    // Update fee with order ID
    await fee.update({ razorpayOrderId: order.id });

    // Create pending transaction
    const transaction = await Transaction.create({
      studentId,
      feeId,
      amount: paymentAmount,
      status: 'pending',
      razorpayOrderId: order.id,
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount / 100, // Convert from paise
        currency: order.currency,
        receipt: order.receipt,
        transactionId: transaction.id,
        razorpayKeyId: config.razorpay.keyId, // Include key ID for frontend
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    // Verify payment signature
    const isValid = verifyPaymentSignature(orderId, paymentId, signature);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    // Find transaction
    const transaction = await Transaction.findOne({
      where: { razorpayOrderId: orderId },
      include: [{ model: Fee, as: 'fee' }],
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    if (transaction.status === 'success') {
      return res.json({
        success: true,
        message: 'Payment already processed',
        data: transaction,
      });
    }

    // Update transaction
    await transaction.update({
      status: 'success',
      razorpayPaymentId: paymentId,
      transactionId: paymentId,
      paymentMethod: 'razorpay',
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

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentHistory = async (req, res, next) => {
  try {
    const studentId = req.user.role === 'admin' ? req.query.studentId : req.user.id;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID required',
      });
    }

    const transactions = await Transaction.findAll({
      where: { studentId },
      include: [{ model: Fee, as: 'fee' }],
      order: [['timestamp', 'DESC']],
    });

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

const getReceipt = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const studentId = req.user.role === 'admin' ? undefined : req.user.id;

    const where = { id: transactionId, status: 'success' };
    if (studentId) where.studentId = studentId;

    const transaction = await Transaction.findOne({
      where,
      include: [
        { model: Fee, as: 'fee' },
        { model: Student, as: 'student' },
      ],
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or not authorized',
      });
    }

    // Generate receipt data
    const receipt = {
      transactionId: transaction.id,
      razorpayPaymentId: transaction.razorpayPaymentId || transaction.transactionId,
      amount: parseFloat(transaction.amount),
      paymentMethod: transaction.paymentMethod || 'Razorpay',
      timestamp: transaction.timestamp,
      student: {
        name: transaction.student?.name,
        email: transaction.student?.email,
        rollNo: transaction.student?.rollNo,
      },
      fee: transaction.fee ? {
        id: transaction.fee.id,
        description: transaction.fee.description,
        amountTotal: parseFloat(transaction.fee.amountTotal),
        paidAmount: parseFloat(transaction.fee.paidAmount),
      } : null,
    };

    res.json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyFees,
  getAllFees,
  createFee,
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getReceipt,
};






