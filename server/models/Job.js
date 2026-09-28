const mongoose = require('mongoose');

const interviewRoundSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['TECHNICAL', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'HR', 'FINAL'],
      required: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const salarySchema = new mongoose.Schema(
  {
    min: {
      type: Number,
      min: 0,
      default: 0,
    },
    max: {
      type: Number,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
    },
    period: {
      type: String,
      enum: ['YEARLY', 'MONTHLY', 'HOURLY'],
      default: 'YEARLY',
    },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    department: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      maxlength: 5000,
    },
    responsibilities: [
      {
        type: String,
        trim: true,
      },
    ],
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    experienceLevel: {
      type: String,
      enum: [
        'ENTRY_LEVEL',
        'JUNIOR',
        'MID_LEVEL',
        'SENIOR',
        'LEAD',
        'ENTRY',
        'MID',
        'EXECUTIVE',
      ],
      default: 'MID_LEVEL',
    },
    employmentType: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'],
      required: true,
      default: 'FULL_TIME',
    },
    type: {
      type: String,
      default: 'FULL_TIME',
    },
    location: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    workMode: {
      type: String,
      enum: ['ONSITE', 'REMOTE', 'HYBRID'],
      default: 'REMOTE',
    },
    salary: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ min: 0, max: 0, currency: 'USD', period: 'YEARLY' }),
    },
    salaryRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },
    openings: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED', 'ACTIVE'],
      default: 'PUBLISHED',
      index: true,
    },
    interviewRounds: {
      type: [interviewRoundSchema],
      default: [],
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ organizationId: 1, status: 1 });
jobSchema.index({ organizationId: 1, recruiterId: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ deadline: 1 });
jobSchema.index({ title: 'text', department: 'text', skills: 'text' });

jobSchema.pre('validate', function () {
  if (typeof this.salary === 'number') {
    const num = this.salary;
    this.salary = {
      min: num,
      max: num,
      currency: 'USD',
      period: 'YEARLY',
    };
  }
});

jobSchema.pre('save', async function () {
  if (this.recruiterId && !this.postedBy) {
    this.postedBy = this.recruiterId;
  } else if (this.postedBy && !this.recruiterId) {
    this.recruiterId = this.postedBy;
  }

  if (this.employmentType && !this.type) {
    this.type = this.employmentType;
  }

  if (this.status === 'PUBLISHED' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  if (this.status === 'CLOSED' && !this.closedAt) {
    this.closedAt = new Date();
  }

  if (this.salary && this.salary.min && (!this.salaryRange || !this.salaryRange.min)) {
    this.salaryRange = {
      min: this.salary.min,
      max: this.salary.max || 0,
      currency: this.salary.currency || 'USD',
    };
  }
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
