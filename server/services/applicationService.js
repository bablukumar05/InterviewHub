const mongoose = require('mongoose');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const Organization = require('../models/Organization');
const {
  isValidApplicationStatusTransition,
} = require('../validators/applicationValidator');

const createServiceError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureValidObjectId = (id, label = 'ID') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createServiceError(`Invalid ${label} format`, 400);
  }
};

const notifySafe = async (notificationPayload) => {
  try {
    const { sendNotification } = require('./notificationService');
    if (typeof sendNotification === 'function') {
      await sendNotification(notificationPayload);
    }
  } catch (err) {

    console.warn('[Notification Notice]: Notification could not be dispatched:', err.message);
  }
};

const REQUIRED_PROFILE_COMPLETION =
  Number(process.env.MIN_PROFILE_COMPLETION_FOR_APPLICATION) || 60;

const ensureRecruiterJobAccess = async (arg1, arg2, arg3, arg4) => {
  let job, user;

  if (arg1 && typeof arg1 === 'object' && ('job' in arg1 || 'user' in arg1)) {
    job = arg1.job;
    user = arg1.user || {};
  } else if (
    typeof arg1 === 'string' ||
    (arg1 && arg1._bsontype === 'ObjectID') ||
    (arg1 && arg1 instanceof mongoose.Types.ObjectId)
  ) {
    job = await Job.findById(arg1);
    user = {
      _id: arg2,
      role: arg3,
      organizationId: arg4,
    };
  } else {
    job = arg1;
    user = {
      _id: arg2,
      role: arg3,
      organizationId: arg4,
    };
  }

  if (!job) {
    throw createServiceError('Job not found', 404);
  }

  const userOrgId = user.organizationId?._id || user.organizationId;
  if (!userOrgId) {
    throw createServiceError('User is not associated with an organization', 403);
  }

  const jobOrganizationId = job.organizationId?._id || job.organizationId;
  const jobRecruiterId = job.recruiterId?._id || job.recruiterId || job.postedBy?._id || job.postedBy;

  if (String(jobOrganizationId) !== String(userOrgId)) {
    throw createServiceError('You do not have access to this job', 403);
  }

  const userRole = user.role;
  const userId = user._id || user.userId || user.id;

  if (userRole === 'ADMIN') {
    return job;
  }

  if (userRole === 'RECRUITER') {
    if (String(jobRecruiterId) !== String(userId)) {
      throw createServiceError('You can only access your own job applications', 403);
    }
    return job;
  }

  throw createServiceError('You do not have permission to access job applications', 403);
};

const buildApplicationSnapshot = ({ job, candidate, candidateProfile, coverLetter, resumeUrl }) => {
  const resolvedSkills =
    candidateProfile.skills?.length > 0
      ? candidateProfile.skills
      : candidate.skills || [];

  const resolvedExperience =
    candidate.experienceYears !== undefined && candidate.experienceYears !== null
      ? Number(candidate.experienceYears)
      : (candidateProfile.experience?.length || 0);

  const resolvedSalary =
    candidateProfile.expectedSalary !== undefined && candidateProfile.expectedSalary !== null
      ? Number(candidateProfile.expectedSalary)
      : (candidateProfile.salaryExpectation?.max || 0);

  const resumePayload = {
    url: resumeUrl,
    originalName: candidateProfile.resumeOriginalName || 'Candidate_Resume.pdf',
    publicId: '',
  };

  const now = new Date();

  return {
    organizationId: job.organizationId,
    jobId: job._id,
    job: job._id,
    candidateId: candidate._id,
    candidate: candidate._id,
    candidateProfile: candidateProfile._id,
    resumeUrl,
    resume: resumePayload,
    coverLetter: coverLetter?.trim() || '',
    experienceYears: resolvedExperience,
    expectedSalary: resolvedSalary,
    skills: resolvedSkills,
    status: 'APPLIED',
    appliedAt: now,
    stageHistory: [
      {
        stage: 'APPLIED',
        changedBy: candidate._id,
        updatedBy: candidate._id,
        note: 'Application submitted by candidate',
        changedAt: now,
        timestamp: now,
      },
    ],
    statusHistory: [
      {
        status: 'APPLIED',
        updatedBy: candidate._id,
        timestamp: now,
        note: 'Application submitted by candidate',
      },
    ],
  };
};

const createApplication = async (userId, applicationData = {}) => {
  ensureValidObjectId(userId, 'user ID');
  const { jobId, coverLetter, resumeUrl } = applicationData;
  ensureValidObjectId(jobId, 'job ID');

  const candidate = await User.findById(userId);
  if (!candidate) {
    throw createServiceError('User not found', 404);
  }
  if (candidate.role !== 'CANDIDATE') {
    throw createServiceError('Only registered candidates can apply for jobs', 403);
  }

  const candidateProfile = await CandidateProfile.findOne({ userId: candidate._id });
  if (!candidateProfile) {
    throw createServiceError('Complete your candidate profile before applying', 400);
  }

  const currentCompletion = candidateProfile.profileCompletion ?? 0;
  if (currentCompletion < REQUIRED_PROFILE_COMPLETION) {
    throw createServiceError(
      'Candidate profile must be at least 60% complete before applying',
      400
    );
  }

  const resolvedResumeUrl =
    resumeUrl?.trim() ||
    candidateProfile.resumeUrl?.trim() ||
    candidateProfile.resume?.url?.trim() ||
    candidate.resumeUrl?.trim();

  if (!resolvedResumeUrl) {
    throw createServiceError('Upload your resume before applying', 400);
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw createServiceError('Job not found', 404);
  }

  if (job.status !== 'PUBLISHED') {
    throw createServiceError('This job is not currently accepting applications', 409);
  }

  if (job.deadline && new Date(job.deadline).getTime() < Date.now()) {
    throw createServiceError('Application deadline has passed', 409);
  }

  const existingApplication = await Application.findOne({
    jobId: job._id,
    candidateId: candidate._id,
  });

  if (existingApplication) {
    throw createServiceError('You have already applied for this job', 409);
  }

  const snapshot = buildApplicationSnapshot({
    job,
    candidate,
    candidateProfile,
    coverLetter,
    resumeUrl: resolvedResumeUrl,
  });

  const application = new Application(snapshot);
  await application.save();

  await Job.findByIdAndUpdate(job._id, { $inc: { applicantsCount: 1 } });

  const recruiterId = job.postedBy || job.recruiterId;
  if (recruiterId) {
    await notifySafe({
      recipient: recruiterId,
      title: 'New Candidate Application',
      message: `${candidate.name} applied for "${job.title}"`,
      type: 'APPLICATION_STATUS',
      link: `/recruiter/applications`,
    });
  }

  return application;
};

const applyForJob = createApplication;

const getCandidateApplications = async (arg1, arg2 = {}) => {
  let userId;
  let options = {};

  if (typeof arg1 === 'object' && arg1 !== null) {
    userId = arg1.userId || arg1.id;
    options = arg1;
  } else {
    userId = arg1;
    options = arg2 || {};
  }

  ensureValidObjectId(userId, 'user ID');
  const candidate = await User.findById(userId);
  if (!candidate || candidate.role !== 'CANDIDATE') {
    throw createServiceError('Only candidates can access their own applications', 403);
  }

  const { page = 1, limit = 10, status = '' } = options;
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const skip = (currentPage - 1) * currentLimit;

  const filter = {
    candidateId: candidate._id,
  };

  if (status) {
    filter.status = status;
  }

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate({
        path: 'jobId',
        select: 'title department location employmentType type workMode status salary salaryRange organizationId deadline',
        populate: {
          path: 'organizationId',
          select: 'name logo website',
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit)
      .lean(),

    Application.countDocuments(filter),
  ]);

  return {
    applications,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(total / currentLimit) || 1,
      hasNextPage: currentPage * currentLimit < total,
      hasPreviousPage: currentPage > 1,
    },
  };
};

const getJobApplications = async (arg1, arg2, arg3, arg4, arg5) => {
  let userId, role, userOrgId, jobId, options;

  if (typeof arg1 === 'object' && arg1 !== null) {
    jobId = arg1.jobId;
    userId = arg1.userId || arg1.id;
    role = arg1.role;
    userOrgId = arg1.userOrgId || arg1.organizationId;
    options = arg1;
  } else {
    userId = arg1;
    role = arg2;
    userOrgId = arg3;
    jobId = arg4;
    options = arg5 || {};
  }

  ensureValidObjectId(userId, 'user ID');
  ensureValidObjectId(jobId, 'job ID');

  if (!role || !userOrgId) {
    const user = await User.findById(userId);
    if (!user) throw createServiceError('User not found', 404);
    role = role || user.role;
    userOrgId = userOrgId || user.organizationId;
  }

  if (!['RECRUITER', 'ADMIN'].includes(role)) {
    throw createServiceError('Only recruiters or admins can access job applicant rosters', 403);
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw createServiceError('Job not found', 404);
  }

  await ensureRecruiterJobAccess({
    job,
    user: {
      _id: userId,
      role,
      organizationId: userOrgId,
    },
  });

  const { page = 1, limit = 10, status = '' } = options;
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const skip = (currentPage - 1) * currentLimit;

  const filter = {
    jobId: job._id,
    organizationId: userOrgId,
  };

  if (status) {
    filter.status = status;
  }

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate('candidateId', 'name email phone avatar title department skills experienceYears resumeUrl')
      .populate('candidateProfile', 'headline skills education experience certifications location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit)
      .lean(),

    Application.countDocuments(filter),
  ]);

  return {
    job: {
      _id: job._id,
      title: job.title,
      department: job.department,
      status: job.status,
      applicantsCount: job.applicantsCount,
    },
    applications,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(total / currentLimit) || 1,
      hasNextPage: currentPage * currentLimit < total,
      hasPreviousPage: currentPage > 1,
    },
  };
};

const getApplicationById = async (applicationId, arg2, arg3, arg4) => {
  ensureValidObjectId(applicationId, 'application ID');

  let userId, role, userOrgId;
  if (typeof arg2 === 'object' && arg2 !== null) {
    userId = arg2.userId || arg2.id;
    role = arg2.role;
    userOrgId = arg2.userOrgId || arg2.organizationId;
  } else {
    userId = arg2;
    role = arg3;
    userOrgId = arg4;
  }

  ensureValidObjectId(userId, 'user ID');

  if (!role || (!userOrgId && role !== 'CANDIDATE')) {
    const user = await User.findById(userId);
    if (!user) throw createServiceError('User not found', 404);
    role = role || user.role;
    userOrgId = userOrgId || user.organizationId;
  }

  const application = await Application.findById(applicationId)
    .populate({
      path: 'jobId',
      select: 'title department location employmentType type workMode status salary salaryRange recruiterId organizationId deadline interviewRounds',
      populate: {
        path: 'organizationId',
        select: 'name logo website',
      },
    })
    .populate('candidateId', 'name email phone avatar title department skills experienceYears resumeUrl bio')
    .populate('candidateProfile')
    .populate('statusHistory.updatedBy', 'name role')
    .lean();

  if (!application) {
    throw createServiceError('Application not found', 404);
  }

  if (role === 'CANDIDATE') {
    const candidateOwnerId = String(application.candidateId?._id || application.candidateId);
    if (candidateOwnerId !== String(userId)) {
      throw createServiceError('You do not have access to this application', 403);
    }
    return application;
  }

  if (['RECRUITER', 'ADMIN'].includes(role)) {
    const appOrgId = String(application.organizationId?._id || application.organizationId);
    if (appOrgId !== String(userOrgId)) {
      throw createServiceError('You do not have access to this application', 403);
    }

    if (role === 'RECRUITER') {
      const jobRecruiterId = String(application.jobId?.recruiterId?._id || application.jobId?.recruiterId || application.job?.recruiterId?._id || application.job?.recruiterId);
      if (jobRecruiterId !== String(userId)) {
        throw createServiceError('You can only view applications for jobs you manage', 403);
      }
    }

    return application;
  }

  throw createServiceError('Unauthorized access to application', 403);
};

const updateApplicationStatus = async (
  applicationId,
  userId,
  arg3,
  arg4,
  arg5
) => {
  ensureValidObjectId(applicationId, 'application ID');
  ensureValidObjectId(userId, 'user ID');

  let role, userOrgId, payload;
  if (typeof arg3 === 'object' && arg3 !== null && arg4 === undefined) {

    payload = arg3;
    const user = await User.findById(userId);
    if (!user) throw createServiceError('User not found', 404);
    role = user.role;
    userOrgId = user.organizationId;
  } else {
    role = arg3;
    userOrgId = arg4;
    payload = arg5 || {};
  }

  const { status, note = '', rejectionReason = '', recruiterNotes = '', currentRound } = payload;
  ensureValidObjectId(applicationId, 'application ID');
  ensureValidObjectId(userId, 'user ID');

  if (!['RECRUITER', 'ADMIN'].includes(role)) {
    throw createServiceError('Only recruiters or admins can update application statuses', 403);
  }

  const application = await Application.findById(applicationId).populate('jobId');
  if (!application) {
    throw createServiceError('Application not found', 404);
  }

  const appOrgId = String(application.organizationId?._id || application.organizationId);
  if (appOrgId !== String(userOrgId)) {
    throw createServiceError('You do not have access to this application', 403);
  }

  if (role === 'RECRUITER') {
    const jobRecruiterId = String(application.jobId?.recruiterId?._id || application.jobId?.recruiterId || application.job?.recruiterId?._id || application.job?.recruiterId);
    if (jobRecruiterId !== String(userId)) {
      throw createServiceError('You can only update applications for your own jobs', 403);
    }
  }

  if (['HIRED', 'OFFER_REJECTED', 'REJECTED'].includes(application.status)) {
    throw createServiceError(`Applications in ${application.status} status are terminal and cannot be transitioned`, 409);
  }

  if (application.status === status) {
    throw createServiceError('Application is already in this status', 409);
  }

  if (!isValidApplicationStatusTransition(application.status, status)) {
    throw createServiceError(
      `Application cannot move from ${application.status} to ${status}`,
      409
    );
  }

  const now = new Date();
  application.status = status;

  if (currentRound !== undefined) {
    application.currentRound = currentRound;
  }

  if (status === 'SHORTLISTED') application.shortlistedAt = now;
  if (status === 'INTERVIEW_SCHEDULED') application.interviewScheduledAt = now;
  if (status === 'INTERVIEW_COMPLETED') application.interviewCompletedAt = now;
  if (status === 'SELECTED') application.selectedAt = now;
  if (status === 'HIRED') application.hiredAt = now;
  if (status === 'REJECTED') {
    application.rejectedAt = now;
    if (rejectionReason) application.rejectionReason = rejectionReason;
  }

  const auditNote = note || rejectionReason || `Status transitioned to ${status}`;
  application.stageHistory.push({
    stage: status,
    changedBy: userId,
    updatedBy: userId,
    note: auditNote,
    changedAt: now,
    timestamp: now,
  });

  application.statusHistory.push({
    status,
    updatedBy: userId,
    note: auditNote,
    timestamp: now,
  });

  await application.save();

  await notifySafe({
    recipient: application.candidateId,
    title: 'Application Status Updated',
    message: `Your application status for "${application.jobId?.title || 'position'}" is now: ${status}`,
    type: 'APPLICATION_STATUS',
    link: `/candidate/applications`,
  });

  return application;
};

const generateOffer = async (
  applicationId,
  userId,
  role,
  userOrgId,
  { position, salaryPackage, joiningDate, benefits = '', offerLetterUrl = '' } = {}) => {
  ensureValidObjectId(applicationId, 'application ID');
  ensureValidObjectId(userId, 'user ID');

  if (!['RECRUITER', 'ADMIN'].includes(role)) {
    throw createServiceError('Only recruiters or admins can generate job offers', 403);
  }

  const application = await Application.findById(applicationId).populate('jobId');
  if (!application) {
    throw createServiceError('Application not found', 404);
  }

  if (String(application.organizationId) !== String(userOrgId)) {
    throw createServiceError('You do not have access to this application', 403);
  }

  if (role === 'RECRUITER') {
    const jobRecruiterId = String(application.jobId?.recruiterId || application.job?.recruiterId);
    if (jobRecruiterId !== String(userId)) {
      throw createServiceError('You can only generate offers for your own jobs', 403);
    }
  }

  if (!isValidApplicationStatusTransition(application.status, 'OFFER_SENT')) {
    throw createServiceError(
      `Cannot generate offer for application currently in ${application.status} status`,
      409
    );
  }

  const now = new Date();
  application.status = 'OFFER_SENT';
  application.offerDetails = {
    position: position.trim(),
    salaryPackage: Number(salaryPackage),
    joiningDate: new Date(joiningDate),
    benefits: benefits.trim(),
    offerLetterUrl: offerLetterUrl.trim(),
    sentAt: now,
  };

  const auditNote = `Job offer extended for ${position} with package $${salaryPackage}`;
  application.stageHistory.push({
    stage: 'OFFER_SENT',
    changedBy: userId,
    updatedBy: userId,
    note: auditNote,
    changedAt: now,
    timestamp: now,
  });

  application.statusHistory.push({
    status: 'OFFER_SENT',
    updatedBy: userId,
    note: auditNote,
    timestamp: now,
  });

  await application.save();

  await notifySafe({
    recipient: application.candidateId,
    title: 'Formal Job Offer Received!',
    message: `Congratulations! A formal offer letter has been issued for the position of ${position}.`,
    type: 'OFFER_GENERATED',
    link: `/candidate/offers`,
  });

  return application;
};

const respondToOffer = async (applicationId, userId, { accept, note = '' } = {}) => {
  ensureValidObjectId(applicationId, 'application ID');
  ensureValidObjectId(userId, 'user ID');

  const application = await Application.findById(applicationId).populate('jobId');
  if (!application) {
    throw createServiceError('Application not found', 404);
  }

  const candidateOwnerId = String(application.candidateId?._id || application.candidateId);
  if (candidateOwnerId !== String(userId)) {
    throw createServiceError('Not authorized to respond to this offer', 403);
  }

  if (application.status !== 'OFFER_SENT') {
    throw createServiceError('No pending offer found for this application', 400);
  }

  const nextStatus = accept ? 'HIRED' : 'OFFER_REJECTED';
  const now = new Date();

  application.status = nextStatus;
  application.offerDetails.respondedAt = now;
  if (accept) {
    application.hiredAt = now;
  }

  const auditNote = note || (accept ? 'Candidate accepted offer' : 'Candidate declined offer');

  application.stageHistory.push({
    stage: nextStatus,
    changedBy: userId,
    updatedBy: userId,
    note: auditNote,
    changedAt: now,
    timestamp: now,
  });

  application.statusHistory.push({
    status: nextStatus,
    updatedBy: userId,
    note: auditNote,
    timestamp: now,
  });

  await application.save();

  const recruiterId = application.jobId?.postedBy || application.jobId?.recruiterId;
  if (recruiterId) {
    await notifySafe({
      recipient: recruiterId,
      title: accept ? 'Job Offer Accepted! 🎉' : 'Job Offer Declined',
      message: `Candidate has ${accept ? 'ACCEPTED' : 'DECLINED'} the job offer for ${application.jobId?.title}.`,
      type: 'OFFER_GENERATED',
      link: `/recruiter/applications`,
    });
  }

  return application;
};

module.exports = {
  createApplication,
  applyForJob,
  getMyApplications: getCandidateApplications,
  getCandidateApplications,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
  generateOffer,
  respondToOffer,
  ensureRecruiterJobAccess,
  buildApplicationSnapshot,
  REQUIRED_PROFILE_COMPLETION,
};
