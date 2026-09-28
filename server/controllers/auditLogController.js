const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { ApiResponse } = require('../utils/response');

const getAuditLogs = async (req, res, next) => {
  try {
    const { entity, action, user, page = 1, limit = 20 } = req.query;

    const query = {};

    if (entity) {
      query.entity = entity;
    }

    if (action) {
      query.action = { $regex: action, $options: 'i' };
    }

    if (user) {
      query.user = user;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AuditLog.find(query)
      .populate('user', 'name email role department')
      .populate('userId', 'name email role department')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(query);

    return ApiResponse.success(res, 'Audit logs retrieved successfully', {
      logs,
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

const getAdminSummary = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    const userRoles = {
      ADMIN: 0,
      RECRUITER: 0,
      INTERVIEWER: 0,
      CANDIDATE: 0,
    };

    roleDistribution.forEach((item) => {
      if (item._id) {
        userRoles[item._id] = item.count;
      }
    });

    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const totalAuditLogs = await AuditLog.countDocuments();

    return ApiResponse.success(res, 'Admin summary fetched successfully', {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        roles: userRoles,
      },
      system: {
        totalJobs,
        totalApplications,
        totalAuditLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs,
  getAdminSummary,
};
