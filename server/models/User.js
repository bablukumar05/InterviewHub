const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { ROLES, ALL_ROLES } = require('../constants/roles');

const userSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: function () {
        return this.role !== 'CANDIDATE';
      },
    },

    name: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    firstName: {
      type: String,
      trim: true,
      default: '',
    },

    lastName: {
      type: String,
      trim: true,
      default: '',
    },

    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type: String,
      required: function () {
        return this.provider === 'LOCAL' || !this.provider;
      },
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },

    provider: {
      type: String,
      enum: ['LOCAL', 'GOOGLE', 'GITHUB', 'LINKEDIN', 'TWITTER'],
      default: 'LOCAL',
    },

    providerId: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: {
        values: ALL_ROLES,
        message: 'Role must be one of: ADMIN, RECRUITER, INTERVIEWER, CANDIDATE',
      },
      default: ROLES.CANDIDATE,
      required: true,
    },

    isOnboarded: {
      type: Boolean,
      default: false,
    },

    candidateProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CandidateProfile',
    },

    avatar: {
      type: String,
      default: '',
    },

    phone: {
      type: String,
      default: '',
      trim: true,
    },

    bio: {
      type: String,
      default: '',
    },

    title: {
      type: String,
      default: '',
    },

    department: {
      type: String,
      default: '',
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    experienceYears: {
      type: Number,
      default: 0,
    },

    resumeUrl: {
      type: String,
      default: '',
    },

    resumePublicId: {
      type: String,
      default: '',
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.index({ organizationId: 1 });
userSchema.index({ organizationId: 1, role: 1 });
userSchema.index({ provider: 1, providerId: 1 });

userSchema.pre('save', async function () {
  if (!this.password || !this.isModified('password')) {
    return;
  }
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, email: this.email, name: this.name },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

const User = mongoose.model('User', userSchema);

module.exports = User;
