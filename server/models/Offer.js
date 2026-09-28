const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },

    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      unique: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },

    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },

    title: {
      type: String,
      trim: true,
    },

    salary: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Salary information is required'],
      default: () => ({ amount: 0, currency: 'INR', period: 'YEARLY' }),
    },

    joiningDate: {
      type: Date,
      required: [true, 'Target joining date is required'],
    },

    offerExpiryDate: {
      type: Date,
      default: function () {
        const d = new Date();
        d.setDate(d.getDate() + 14);
        return d;
      },
    },

    benefits: [
      {
        type: String,
        trim: true,
      },
    ],

    notes: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: '',
    },

    offerLetterUrl: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
      default: 'DRAFT',
    },

    sentAt: {
      type: Date,
      default: null,
    },

    respondedAt: {
      type: Date,
      default: null,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    signedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

offerSchema.pre('validate', function () {
  if (typeof this.salary === 'number') {
    const num = this.salary;
    this.salary = {
      amount: num,
      currency: 'INR',
      period: 'YEARLY',
    };
  }

  if (typeof this.benefits === 'string') {
    this.benefits = [this.benefits];
  }

  if (!this.offerExpiryDate) {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    this.offerExpiryDate = d;
  }
});

offerSchema.pre('save', async function () {
  if (this.position && !this.title) {
    this.title = this.position;
  } else if (this.title && !this.position) {
    this.position = this.title;
  }

  if (this.status === 'SENT' && !this.sentAt) {
    this.sentAt = new Date();
  }

  if (this.status === 'ACCEPTED') {
    if (!this.acceptedAt) this.acceptedAt = new Date();
    if (!this.respondedAt) this.respondedAt = this.acceptedAt;
    if (!this.signedAt) this.signedAt = this.acceptedAt;
  }

  if (this.status === 'REJECTED') {
    if (!this.rejectedAt) this.rejectedAt = new Date();
    if (!this.respondedAt) this.respondedAt = this.rejectedAt;
  }
});

offerSchema.index({ organizationId: 1, status: 1 });
offerSchema.index({ candidateId: 1 });

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
