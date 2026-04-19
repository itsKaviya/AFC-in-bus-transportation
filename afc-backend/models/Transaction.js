const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['recharge', 'deduction'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Amount must be positive']
    },
    balanceBefore: {
      type: Number,
      required: true
    },
    balanceAfter: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip'
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'success'
    }
  },
  {
    timestamps: true
  }
);

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
