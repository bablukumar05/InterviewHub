const mongoose = require('mongoose');
const { INTERVIEW_STATUS, INTERVIEW_TYPES } = require('../constants/status');

const interviewSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },

    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },

    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },

    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    candidateProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CandidateProfile',
    },

    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    interviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },

    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    interviewers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['PRIMARY', 'PANEL'],
          default: 'PRIMARY',
        },
      },
    ],

    round: {
      type: mongoose.Schema.Types.Mixed,
      default: 1,
    },

    roundNumber: {
      type: Number,
      default: 1,
      index: true,
    },

    roundName: {
      type: String,
      trim: true,
      default: 'Technical Round',
    },

    roundType: {
      type: String,
      default: 'TECHNICAL',
    },

    title: {
      type: String,
      trim: true,
      maxlength: 150,
      default: 'Technical Interview',
    },

    type: {
      type: String,
      default: 'TECHNICAL',
    },

    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date and time is required'],
      index: true,
    },

    duration: {
      type: Number,
      min: 15,
      default: 60,
    },

    durationMinutes: {
      type: Number,
      default: 60,
    },

    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },

    meetingType: {
      type: String,
      enum: ['VIDEO', 'PHONE', 'ONSITE'],
      default: 'VIDEO',
    },

    meetingUrl: {
      type: String,
      trim: true,
      default: '',
    },

    meetingLink: {
      type: String,
      trim: true,
      default: '',
    },

    location: {
      type: String,
      trim: true,
      default: '',
    },

    instructions: {
      type: String,
      trim: true,
      default: '',
    },

    candidateNotes: {
      type: String,
      trim: true,
      default: '',
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: '',
    },

    status: {
      type: String,
      enum: Object.values(INTERVIEW_STATUS),
      default: INTERVIEW_STATUS.SCHEDULED,
      index: true,
    },

    reminderSent: {
      type: Boolean,
      default: false,
    },

    confirmedAt: {
      type: Date,
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },

    rescheduledFrom: {
      type: Date,
      default: null,
    },

    rescheduleReason: {
      type: String,
      trim: true,
      default: '',
    },

    rescheduledCount: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

interviewSchema.pre('save', async function () {
  if (this.applicationId && !this.application) {
    this.application = this.applicationId;
  } else if (this.application && !this.applicationId) {
    this.applicationId = this.application;
  }

  if (this.candidateId && !this.candidate) {
    this.candidate = this.candidateId;
  } else if (this.candidate && !this.candidateId) {
    this.candidateId = this.candidate;
  }

  if (this.interviewers && this.interviewers.length > 0 && !this.interviewerId) {
    this.interviewerId = this.interviewers[0].userId;
  } else if (this.interviewerId && (!this.interviewers || this.interviewers.length === 0)) {
    this.interviewers = [{ userId: this.interviewerId, role: 'PRIMARY' }];
  }

  if (this.interviewerId && !this.interviewer) {
    this.interviewer = this.interviewerId;
  } else if (this.interviewer && !this.interviewerId) {
    this.interviewerId = this.interviewer;
  }

  if (this.recruiterId && !this.scheduledBy) {
    this.scheduledBy = this.recruiterId;
  } else if (this.scheduledBy && !this.recruiterId) {
    this.recruiterId = this.scheduledBy;
  }

  if (this.duration && !this.durationMinutes) {
    this.durationMinutes = this.duration;
  } else if (this.durationMinutes && !this.duration) {
    this.duration = this.durationMinutes;
  }

  if (this.meetingUrl && !this.meetingLink) {
    this.meetingLink = this.meetingUrl;
  } else if (this.meetingLink && !this.meetingUrl) {
    this.meetingUrl = this.meetingLink;
  }

  if (this.roundNumber && !this.round) {
    this.round = this.roundNumber;
  } else if (this.round && !this.roundNumber) {
    this.roundNumber = typeof this.round === 'number' ? this.round : 1;
  }

  if (this.roundName && (!this.title || this.title === 'Technical Interview')) {
    this.title = this.roundName;
  } else if (typeof this.round === 'object' && this.round?.name && (!this.title || this.title === 'Technical Interview')) {
    this.title = this.round.name;
  }
});

interviewSchema.index({ candidateId: 1, scheduledAt: 1 });
interviewSchema.index({ interviewerId: 1, scheduledAt: 1 });
interviewSchema.index({ 'interviewers.userId': 1, scheduledAt: 1 });
interviewSchema.index({ applicationId: 1, roundNumber: 1 });
interviewSchema.index({ organizationId: 1, scheduledAt: 1 });

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
