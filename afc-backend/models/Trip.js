const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    lat: {
      type: Number,
      required: true,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    lng: {
      type: Number,
      required: true,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    rfidUID: {
      type: String,
      required: true,
      uppercase: true,
      index: true
    },
    tapIn: {
      type: locationSchema,
      required: true
    },
    tapOut: {
      type: locationSchema
    },
    distanceKm: {
      type: Number,
      min: 0
    },
    fare: {
      baseFare: Number,
      perKmRate: Number,
      distanceFare: Number,
      totalFare: Number
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'failed'],
      default: 'in-progress',
      index: true
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    },
    duration: {
      type: Number // in minutes
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tripSchema.index({ user: 1, createdAt: -1 });
tripSchema.index({ rfidUID: 1, status: 1 });

module.exports = mongoose.model('Trip', tripSchema);
