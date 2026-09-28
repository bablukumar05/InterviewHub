const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
      uppercase: true,
    },

    entity: {
      type: String,
      required: [true, 'Target entity is required'],
      trim: true,
      uppercase: true,
    },

    entityId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    description: {
      type: String,
      required: [true, 'Audit log description is required'],
      trim: true,
    },

    ipAddress: {
      type: String,
      default: '127.0.0.1',
      trim: true,
    },

    ip: {
      type: String,
      default: '127.0.0.1',
      trim: true,
    },

    userAgent: {
      type: String,
      default: 'InterviewHub Engine',
      trim: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.pre('validate', function () {
  if (this.userId && !this.user) {
    this.user = this.userId;
  } else if (this.user && !this.userId) {
    this.userId = this.user;
  }

  if (this.ipAddress && !this.ip) {
    this.ip = this.ipAddress;
  } else if (this.ip && !this.ipAddress) {
    this.ipAddress = this.ip;
  }

  if (this.metadata && (!this.details || Object.keys(this.details).length === 0)) {
    this.details = this.metadata;
  } else if (this.details && (!this.metadata || Object.keys(this.metadata).length === 0)) {
    this.metadata = this.details;
  }
});

auditLogSchema.pre('save', async function () {
  if (this.userId && !this.user) {
    this.user = this.userId;
  } else if (this.user && !this.userId) {
    this.userId = this.user;
  }

  if (this.ipAddress && !this.ip) {
    this.ip = this.ipAddress;
  } else if (this.ip && !this.ipAddress) {
    this.ipAddress = this.ip;
  }
});

auditLogSchema.index({ organizationId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entity: 1, entityId: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
