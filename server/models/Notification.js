const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },

    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: 1000,
    },

    type: {
      type: String,
      enum: [
        'APPLICATION',
        'INTERVIEW',
        'INTERVIEW_SCHEDULED',
        'INTERVIEW_REMINDER',
        'EVALUATION',
        'OFFER',
        'SYSTEM',
        'JOB_POSTED',
        'APPLICATION_STATUS',
        'REMINDER',
        'EVALUATION_SUBMITTED',
        'OFFER_GENERATED',
      ],
      required: true,
      default: 'SYSTEM',
    },

    relatedEntity: {
      type: String,
      enum: ['APPLICATION', 'INTERVIEW', 'EVALUATION', 'OFFER', 'JOB', 'USER'],
      default: null,
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    read: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },

    link: {
      type: String,
      default: '',
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.pre('validate', function () {
  if (this.userId && !this.recipient) {
    this.recipient = this.userId;
  } else if (this.recipient && !this.userId) {
    this.userId = this.recipient;
  }

  if (this.isModified('read') && !this.isModified('isRead')) {
    this.isRead = Boolean(this.read);
  } else if (this.isModified('isRead') && !this.isModified('read')) {
    this.read = Boolean(this.isRead);
  } else {
    const readFlag = Boolean(this.isRead || this.read);
    this.isRead = readFlag;
    this.read = readFlag;
  }

  if (this.isRead && !this.readAt) {
    this.readAt = new Date();
  }

  if (!this.relatedEntity && this.type) {
    if (this.type.includes('INTERVIEW')) this.relatedEntity = 'INTERVIEW';
    else if (this.type.includes('APPLICATION')) this.relatedEntity = 'APPLICATION';
    else if (this.type.includes('EVALUATION')) this.relatedEntity = 'EVALUATION';
    else if (this.type.includes('OFFER')) this.relatedEntity = 'OFFER';
    else if (this.type.includes('JOB')) this.relatedEntity = 'JOB';
  }
});

notificationSchema.pre('save', async function () {
  if (this.userId && !this.recipient) {
    this.recipient = this.userId;
  } else if (this.recipient && !this.userId) {
    this.userId = this.recipient;
  }

  const readFlag = Boolean(this.isRead || this.read);
  this.isRead = readFlag;
  this.read = readFlag;
});

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ organizationId: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
