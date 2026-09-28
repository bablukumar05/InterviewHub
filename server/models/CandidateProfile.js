const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    degree: {
      type: String,
      trim: true,
    },
    institution: {
      type: String,
      trim: true,
    },
    field: {
      type: String,
      trim: true,
    },
    startYear: {
      type: Number,
      min: 1900,
    },
    endYear: {
      type: Number,
      min: 1900,
    },
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    currentlyWorking: {
      type: Boolean,
      default: false,
    },
    current: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { _id: false }
);

const candidateProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    headline: {
      type: String,
      trim: true,
      maxlength: 150,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1500,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    dateOfBirth: {
      type: Date,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    education: [educationSchema],
    experience: [experienceSchema],
    certifications: [
      {
        name: { type: String, trim: true },
        title: { type: String, trim: true },
        issuer: { type: String, trim: true },
        issueDate: { type: Date },
        expiryDate: { type: Date },
        credentialUrl: { type: String, default: '' },
      },
    ],
    resumeUrl: {
      type: String,
      default: '',
    },
    resumeOriginalName: {
      type: String,
      default: '',
      trim: true,
    },
    resumeSize: {
      type: Number,
      default: 0,
    },
    portfolioUrl: {
      type: String,
      default: '',
      trim: true,
    },
    githubUrl: {
      type: String,
      default: '',
      trim: true,
    },
    linkedinUrl: {
      type: String,
      default: '',
      trim: true,
    },
    salaryExpectation: {
      min: { type: Number, min: 0, default: 0 },
      max: { type: Number, min: 0, default: 0 },
      currency: { type: String, default: 'USD', uppercase: true },
    },
    preferredRole: {
      type: String,
      default: '',
    },
    expectedSalary: {
      type: Number,
      default: 0,
    },
    noticePeriodDays: {
      type: Number,
      default: 30,
    },
    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

candidateProfileSchema.index({ skills: 1 });
candidateProfileSchema.index({ location: 1 });

candidateProfileSchema.methods.calculateProfileCompletion = function () {
  let score = 0;
  if (this.headline && this.headline.trim()) score += 15;
  if (this.bio && this.bio.trim()) score += 15;
  if (this.skills && this.skills.length > 0) score += 20;
  if (this.experience && this.experience.length > 0) score += 20;
  if (this.education && this.education.length > 0) score += 15;
  if (this.resumeUrl && this.resumeUrl.trim()) score += 15;
  this.profileCompletion = Math.min(score, 100);
  return this.profileCompletion;
};

candidateProfileSchema.pre('save', async function () {
  if (this.experience && this.experience.length > 0) {
    this.experience.forEach((exp) => {
      if (exp.position && !exp.role) exp.role = exp.position;
      else if (exp.role && !exp.position) exp.position = exp.role;

      if (typeof exp.currentlyWorking === 'boolean') exp.current = exp.currentlyWorking;
      else if (typeof exp.current === 'boolean') exp.currentlyWorking = exp.current;
    });
  }

  if (this.salaryExpectation && this.salaryExpectation.max && !this.expectedSalary) {
    this.expectedSalary = this.salaryExpectation.max;
  }

  this.calculateProfileCompletion();
});

const CandidateProfile = mongoose.model('CandidateProfile', candidateProfileSchema);

module.exports = CandidateProfile;
