const mongoose = require('mongoose');

const Job = require('../models/Job');
const User = require('../models/User');

const {
  isValidJobStatusTransition,
} = require('../validators/jobValidator');

const createServiceError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureValidObjectId = (id, fieldName = 'ID') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createServiceError(`Invalid ${fieldName}`, 400);
  }
};

const escapeRegex = (value = '') => {
  return value.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
};

const normalizeSkills = (skills = []) => {
  if (!Array.isArray(skills)) {
    return [];
  }

  return [
    ...new Set(
      skills
        .map((skill) => String(skill).trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
};

const normalizeStringArray = (items = []) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => String(item).trim())
    .filter(Boolean);
};

const normalizeSalary = (salary) => {
  if (salary === undefined || salary === null) {
    return {
      min: 0,
      max: 0,
      currency: 'USD',
      period: 'YEARLY',
    };
  }

  if (typeof salary === 'number') {
    return {
      min: salary,
      max: salary,
      currency: 'USD',
      period: 'YEARLY',
    };
  }

  return {
    min: Number(salary.min ?? 0),
    max: Number(salary.max ?? 0),
    currency: String(salary.currency || 'USD').toUpperCase(),
    period: salary.period || 'YEARLY',
  };
};

const buildSalaryRange = (salary) => {
  return {
    min: salary.min || 0,
    max: salary.max || 0,
    currency: salary.currency || 'USD',
  };
};

const sanitizeInterviewRounds = (interviewRounds = []) => {
  if (!Array.isArray(interviewRounds)) {
    return [];
  }

  return interviewRounds
    .map((round) => ({
      name: String(round.name || '').trim(),
      type: round.type,
      order: Number(round.order),
    }))
    .sort((a, b) => a.order - b.order);
};

const getUser = async (userId) => {
  ensureValidObjectId(userId, 'user ID');

  const user = await User.findById(userId);

  if (!user) {
    throw createServiceError('User not found', 404);
  }

  if (!user.isActive) {
    throw createServiceError('User account is inactive', 403);
  }

  return user;
};

const getOrganizationId = async (userId) => {
  const user = await getUser(userId);

  if (!user.organizationId) {
    throw createServiceError(
      'User is not associated with an organization',
      403
    );
  }

  return user.organizationId;
};

const ensurePublishedDeadline = (deadline) => {
  if (!deadline) {
    return;
  }

  const deadlineDate = new Date(deadline);

  if (Number.isNaN(deadlineDate.getTime())) {
    throw createServiceError('Invalid job deadline', 400);
  }

  if (deadlineDate <= new Date()) {
    throw createServiceError('Job deadline must be in the future', 400);
  }
};

const buildJobPayload = (data = {}) => {
  const salary = normalizeSalary(data.salary);

  const payload = {
    title: data.title,
    department: data.department,
    description: data.description,
    responsibilities: normalizeStringArray(data.responsibilities),
    requirements: normalizeStringArray(data.requirements),
    skills: normalizeSkills(data.skills),
    experienceLevel: data.experienceLevel,
    employmentType: data.employmentType,
    location: data.location,
    workMode: data.workMode,
    salary,
    salaryRange: buildSalaryRange(salary),
    openings: data.openings,
    deadline: data.deadline ? new Date(data.deadline) : undefined,
    interviewRounds: sanitizeInterviewRounds(data.interviewRounds),
  };

  return payload;
};

const createJob = async (userId, jobData = {}) => {
  const user = await getUser(userId);

  if (!['RECRUITER', 'ADMIN'].includes(user.role)) {
    throw createServiceError(
      'Only recruiters or admins can create jobs',
      403
    );
  }

  if (!user.organizationId) {
    throw createServiceError(
      'User is not associated with an organization',
      403
    );
  }

  const payload = buildJobPayload(jobData);

  const job = new Job({
    ...payload,
    organizationId: user.organizationId,
    recruiterId: user._id,
    postedBy: user._id,
    applicantsCount: 0,
    status: 'DRAFT',
    publishedAt: null,
    closedAt: null,
  });

  await job.save();

  return job;
};

const getJobs = async ({
  page = 1,
  limit = 10,
  search = '',
  location = '',
  workMode = '',
  employmentType = '',
  experienceLevel = '',
  organizationId = '',
} = {}) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const skip = (currentPage - 1) * currentLimit;

  const filter = {
    status: 'PUBLISHED',
  };

  if (organizationId) {
    ensureValidObjectId(organizationId, 'organization ID');
    filter.organizationId = organizationId;
  }

  if (location?.trim()) {
    filter.location = {
      $regex: escapeRegex(location.trim()),
      $options: 'i',
    };
  }

  if (workMode) {
    filter.workMode = workMode;
  }

  if (employmentType) {
    filter.employmentType = employmentType;
  }

  if (experienceLevel) {
    filter.experienceLevel = experienceLevel;
  }

  if (search?.trim()) {
    const searchRegex = {
      $regex: escapeRegex(search.trim()),
      $options: 'i',
    };

    filter.$or = [
      { title: searchRegex },
      { department: searchRegex },
      { description: searchRegex },
      { skills: searchRegex },
    ];
  }

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('organizationId', 'name logo website')
      .populate('recruiterId', 'name')
      .sort({
        publishedAt: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(currentLimit)
      .lean(),

    Job.countDocuments(filter),
  ]);

  return {
    jobs,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(total / currentLimit),
      hasNextPage: currentPage * currentLimit < total,
      hasPreviousPage: currentPage > 1,
    },
  };
};

const getMyJobs = async ({
  userId,
  page = 1,
  limit = 10,
  status = '',
  search = '',
} = {}) => {
  const user = await getUser(userId);

  if (!['RECRUITER', 'ADMIN'].includes(user.role)) {
    throw createServiceError(
      'Only recruiters or admins can access managed jobs',
      403
    );
  }

  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const skip = (currentPage - 1) * currentLimit;

  const filter = {
    organizationId: user.organizationId,
  };

  if (user.role === 'RECRUITER') {
    filter.recruiterId = user._id;
  }

  if (status) {
    filter.status = status;
  }

  if (search?.trim()) {
    const searchRegex = {
      $regex: escapeRegex(search.trim()),
      $options: 'i',
    };

    filter.$or = [
      { title: searchRegex },
      { department: searchRegex },
      { skills: searchRegex },
    ];
  }

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(currentLimit)
      .lean(),

    Job.countDocuments(filter),
  ]);

  return {
    jobs,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(total / currentLimit),
      hasNextPage: currentPage * currentLimit < total,
      hasPreviousPage: currentPage > 1,
    },
  };
};

const getJobById = async (
  jobId,
  { userId = null, role = null } = {}) => {
  ensureValidObjectId(jobId, 'job ID');

  const job = await Job.findById(jobId)
    .populate('organizationId', 'name logo website')
    .populate('recruiterId', 'name')
    .lean();

  if (!job) {
    throw createServiceError('Job not found', 404);
  }

  if (!userId || !['RECRUITER', 'ADMIN'].includes(role)) {
    if (job.status !== 'PUBLISHED') {
      throw createServiceError('Job not found', 404);
    }

    return job;
  }

  const user = await getUser(userId);

  if (!user.organizationId) {
    throw createServiceError(
      'User is not associated with an organization',
      403
    );
  }

  if (role === 'ADMIN') {
    if (
      String(job.organizationId?._id || job.organizationId) !==
      String(user.organizationId)
    ) {
      throw createServiceError('You do not have access to this job', 403);
    }

    return job;
  }

  if (role === 'RECRUITER') {
    if (
      String(job.recruiterId?._id || job.recruiterId) !==
      String(user._id)
    ) {
      throw createServiceError('You do not have access to this job', 403);
    }

    return job;
  }

  return job;
};

const updateJob = async (jobId, userId, jobData = {}) => {
  ensureValidObjectId(jobId, 'job ID');

  const user = await getUser(userId);

  if (!['RECRUITER', 'ADMIN'].includes(user.role)) {
    throw createServiceError('Only recruiters or admins can update jobs', 403);
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw createServiceError('Job not found', 404);
  }

  if (String(job.organizationId) !== String(user.organizationId)) {
    throw createServiceError('You do not have access to this job', 403);
  }

  if (
    user.role === 'RECRUITER' &&
    String(job.recruiterId) !== String(user._id)
  ) {
    throw createServiceError('You can only update your own jobs', 403);
  }

  if (job.status === 'CLOSED') {
    throw createServiceError('Closed jobs cannot be updated', 409);
  }

  const payload = buildJobPayload(jobData);

  Object.keys(payload).forEach((field) => {
    if (jobData[field] !== undefined) {
      job[field] = payload[field];
    }
  });

  if (jobData.employmentType !== undefined) {
    job.employmentType = jobData.employmentType;
    job.type = jobData.employmentType;
  }

  if (jobData.salary !== undefined) {
    job.salary = normalizeSalary(jobData.salary);
    job.salaryRange = buildSalaryRange(job.salary);
  }

  if (job.status === 'PUBLISHED') {
    ensurePublishedDeadline(job.deadline);
  }

  await job.save();

  return job;
};

const publishJob = async (jobId, userId) => {
  ensureValidObjectId(jobId, 'job ID');

  const user = await getUser(userId);

  if (!['RECRUITER', 'ADMIN'].includes(user.role)) {
    throw createServiceError('Only recruiters or admins can publish jobs', 403);
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw createServiceError('Job not found', 404);
  }

  if (String(job.organizationId) !== String(user.organizationId)) {
    throw createServiceError('You do not have access to this job', 403);
  }

  if (
    user.role === 'RECRUITER' &&
    String(job.recruiterId) !== String(user._id)
  ) {
    throw createServiceError('You can only publish your own jobs', 403);
  }

  if (!isValidJobStatusTransition(job.status, 'PUBLISHED')) {
    throw createServiceError(
      `Job cannot be published from ${job.status} status`,
      409
    );
  }

  ensurePublishedDeadline(job.deadline);

  job.status = 'PUBLISHED';

  if (!job.publishedAt) {
    job.publishedAt = new Date();
  }

  job.closedAt = null;

  await job.save();

  return job;
};

const pauseJob = async (jobId, userId) => {
  ensureValidObjectId(jobId, 'job ID');

  const user = await getUser(userId);

  if (!['RECRUITER', 'ADMIN'].includes(user.role)) {
    throw createServiceError('Only recruiters or admins can pause jobs', 403);
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw createServiceError('Job not found', 404);
  }

  if (String(job.organizationId) !== String(user.organizationId)) {
    throw createServiceError('You do not have access to this job', 403);
  }

  if (
    user.role === 'RECRUITER' &&
    String(job.recruiterId) !== String(user._id)
  ) {
    throw createServiceError('You can only pause your own jobs', 403);
  }

  if (!isValidJobStatusTransition(job.status, 'PAUSED')) {
    throw createServiceError(
      `Job cannot be paused from ${job.status} status`,
      409
    );
  }

  job.status = 'PAUSED';

  await job.save();

  return job;
};

const closeJob = async (jobId, userId) => {
  ensureValidObjectId(jobId, 'job ID');

  const user = await getUser(userId);

  if (!['RECRUITER', 'ADMIN'].includes(user.role)) {
    throw createServiceError('Only recruiters or admins can close jobs', 403);
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw createServiceError('Job not found', 404);
  }

  if (String(job.organizationId) !== String(user.organizationId)) {
    throw createServiceError('You do not have access to this job', 403);
  }

  if (
    user.role === 'RECRUITER' &&
    String(job.recruiterId) !== String(user._id)
  ) {
    throw createServiceError('You can only close your own jobs', 403);
  }

  if (!isValidJobStatusTransition(job.status, 'CLOSED')) {
    throw createServiceError(
      `Job cannot be closed from ${job.status} status`,
      409
    );
  }

  job.status = 'CLOSED';
  job.closedAt = job.closedAt || new Date();

  await job.save();

  return job;
};

module.exports = {
  createJob,
  getJobs,
  getMyJobs,
  getJobById,
  updateJob,
  publishJob,
  pauseJob,
  closeJob,
};
