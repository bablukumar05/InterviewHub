const mongoose = require('mongoose');
const { APPLICATION_STATUS } = require('../constants/status');

const stageHistorySchema = new mongoose.Schema(
  {
    stage: {
      type: String,
      required: true,
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    note: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },

    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    candidateProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CandidateProfile',
    },

    resumeUrl: {
      type: String,
      default: '',
    },

    resume: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      originalName: { type: String, default: '' },
    },

    coverLetter: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: '',
    },

    experienceYears: {
      type: Number,
      default: 0,
    },

    expectedSalary: {
      type: Number,
      default: 0,
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.APPLIED,
    },

    currentRound: {
      type: mongoose.Schema.Types.Mixed,
      default: 0,
    },

    recruiterNotes: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: '',
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },

    stageHistory: {
      type: [stageHistorySchema],
      default: [],
    },

    statusHistory: [
      {
        status: {
          type: String,
          enum: Object.values(APPLICATION_STATUS),
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          default: '',
        },
      },
    ],

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    shortlistedAt: Date,

    interviewScheduledAt: Date,

    interviewCompletedAt: Date,

    selectedAt: Date,

    rejectedAt: Date,

    hiredAt: Date,

    offerDetails: {
      position: { type: String, default: '' },
      salaryPackage: { type: Number, default: 0 },
      joiningDate: { type: Date },
      benefits: { type: String, default: '' },
      offerLetterUrl: { type: String, default: '' },
      sentAt: { type: Date },
      respondedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.pre('save', async function () {
  if (this.jobId && !this.job) {
    this.job = this.jobId;
  } else if (this.job && !this.jobId) {
    this.jobId = this.job;
  }

  if (this.candidateId && !this.candidate) {
    this.candidate = this.candidateId;
  } else if (this.candidate && !this.candidateId) {
    this.candidateId = this.candidate;
  }

  if (this.resume && this.resume.url && !this.resumeUrl) {
    this.resumeUrl = this.resume.url;
  } else if (this.resumeUrl && (!this.resume || !this.resume.url)) {
    this.resume = { url: this.resumeUrl };
  }

  if (this.isNew && (!this.stageHistory || this.stageHistory.length === 0)) {
    this.stageHistory = [
      {
        stage: this.status || 'APPLIED',
        changedBy: this.candidateId,
        updatedBy: this.candidateId,
        note: 'Application submitted',
        changedAt: this.appliedAt || new Date(),
        timestamp: this.appliedAt || new Date(),
      },
    ];
  }
});

applicationSchema.index({ organizationId: 1, jobId: 1 });
applicationSchema.index({ candidateId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
