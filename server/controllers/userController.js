const User = require('../models/User');
const Organization = require('../models/Organization');
const Application = require('../models/Application');
const AuditLog = require('../models/AuditLog');
const { ApiResponse, ApiError } = require('../utils/response');

const resolveOrganizationId = async (reqUser) => {
  if (reqUser && reqUser.organizationId) {
    return reqUser.organizationId;
  }
  let org = await Organization.findOne();
  if (!org) {
    org = await Organization.create({
      name: 'InterviewHub Enterprise',
      slug: 'interviewhub-enterprise',
      industry: 'Technology',
    });
  }
  return org._id;
};

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ApiError('User profile not found', 404));
    }

    let applications = [];
    if (user.role === 'CANDIDATE') {
      applications = await Application.find({ candidate: user._id })
        .populate('job', 'title department location type status')
        .sort('-createdAt');
    }

    return ApiResponse.success(res, 'User profile fetched successfully', {
      user,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError('Please upload a resume file (PDF, DOC, DOCX)', 400));
    }

    const resumeUrl = `/uploads/${req.file.filename}`;
    const resumePublicId = req.file.filename;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        resumeUrl,
        resumePublicId,
      },
      { new: true }
    );

    return ApiResponse.success(res, 'Resume uploaded successfully', {
      resumeUrl: user.resumeUrl,
      originalName: req.file.originalname,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { role, department, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (role) {
      query.role = role;
    }

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    return ApiResponse.success(res, 'Users fetched successfully', {
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ApiError('User not found', 404));
    }

    return ApiResponse.success(res, 'User retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'RECRUITER',
      title = '',
      department = '',
    } = req.body;

    if (!name || !email || !password) {
      return next(new ApiError('Name, email, and password are required', 400));
    }

    if (password.length < 6) {
      return next(new ApiError('Password must be at least 6 characters', 400));
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return next(new ApiError('A user with this email already exists', 400));
    }

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const userData = {
      name: name.trim(),
      firstName,
      lastName,
      email: normalizedEmail,
      password,
      role,
      title: title.trim(),
      department: department.trim(),
      provider: 'LOCAL',
      isActive: true,
      isOnboarded: true,
      isEmailVerified: true,
    };

    if (role !== 'CANDIDATE') {
      userData.organizationId = await resolveOrganizationId(req.user);
    }

    const newUser = await User.create(userData);
    const createdUser = await User.findById(newUser._id);

    await AuditLog.create({
      organizationId: userData.organizationId || req.user?.organizationId,
      userId: req.user._id || req.user.id,
      action: 'CREATE_USER',
      entity: 'USER',
      entityId: newUser._id,
      description: `Added ${role} account for ${createdUser.name} (${createdUser.email})`,
    }).catch(() => null);

    return ApiResponse.success(
      res,
      'Team member created successfully',
      { user: createdUser },
      201
    );
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { role, isActive, title, department } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ApiError('User not found', 404));
    }

    if (role) {
      user.role = role;
      if (role !== 'CANDIDATE' && !user.organizationId) {
        user.organizationId = await resolveOrganizationId(req.user);
      }
    }
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (typeof title === 'string') user.title = title.trim();
    if (typeof department === 'string') user.department = department.trim();

    await user.save();

    await AuditLog.create({
      organizationId: user.organizationId || req.user?.organizationId,
      userId: req.user._id || req.user.id,
      action: 'UPDATE_USER',
      entity: 'USER',
      entityId: user._id,
      description: `Updated user ${user.name} (role: ${user.role}, active: ${user.isActive})`,
    }).catch(() => null);

    return ApiResponse.success(res, 'User status updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  uploadResume,
  getAllUsers,
  getUserById,
  createUser,
  updateUserStatus,
};
