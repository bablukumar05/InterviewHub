const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Interview = require('../models/Interview');
const Evaluation = require('../models/Evaluation');
const Offer = require('../models/Offer');

const toObjectId = (id) => {
  if (!id) return null;
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return id;
};

const getApplicationStatusDistribution = async ({
  organizationId,
  recruiterId,
  candidateId,
}) => {
  const match = {};

  if (organizationId) {
    match.organizationId = toObjectId(organizationId);
  }

  if (candidateId) {
    const cId = toObjectId(candidateId);
    match.$or = [{ candidateId: cId }, { candidate: cId }];
  } else if (recruiterId) {
    const rId = toObjectId(recruiterId);
    const recruiterJobs = await Job.find({
      ...(organizationId ? { organizationId: toObjectId(organizationId) } : {}),
      $or: [{ recruiterId: rId }, { postedBy: rId }],
    }).select('_id');
    const recruiterJobIds = recruiterJobs.map((j) => toObjectId(j._id));

    match.$or = [
      { recruiterId: rId },
      { jobId: { $in: recruiterJobIds } },
    ];
  }

  return Application.aggregate([
    {
      $match: match,
    },
    {
      $group: {
        _id: '$status',
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1,
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ]);
};

const getInterviewStatusDistribution = async ({
  organizationId,
  interviewerId,
}) => {
  const match = {};

  if (organizationId) {
    match.organizationId = toObjectId(organizationId);
  }

  if (interviewerId) {
    const iId = toObjectId(interviewerId);
    match.$or = [{ interviewerId: iId }, { interviewer: iId }];
  }

  return Interview.aggregate([
    {
      $match: match,
    },
    {
      $group: {
        _id: '$status',
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1,
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ]);
};

const getMonthlyApplicationsTrend = async ({
  organizationId,
  recruiterId,
  candidateId,
}) => {
  const match = {};

  if (organizationId) {
    match.organizationId = toObjectId(organizationId);
  }

  if (candidateId) {
    const cId = toObjectId(candidateId);
    match.$or = [{ candidateId: cId }, { candidate: cId }];
  } else if (recruiterId) {
    const rId = toObjectId(recruiterId);
    const recruiterJobs = await Job.find({
      ...(organizationId ? { organizationId: toObjectId(organizationId) } : {}),
      $or: [{ recruiterId: rId }, { postedBy: rId }],
    }).select('_id');
    const recruiterJobIds = recruiterJobs.map((j) => toObjectId(j._id));

    match.$or = [
      { recruiterId: rId },
      { jobId: { $in: recruiterJobIds } },
    ];
  }

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  match.createdAt = { $gte: sixMonthsAgo };

  const rawResults = await Application.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthMap = {};
  rawResults.forEach((item) => {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
    monthMap[key] = item.count;
  });

  const timeline = [];
  const curr = new Date(sixMonthsAgo);

  while (timeline.length < 6) {
    const y = curr.getFullYear();
    const m = curr.getMonth() + 1;
    const key = `${y}-${String(m).padStart(2, '0')}`;
    timeline.push({
      month: monthNames[curr.getMonth()],
      applications: monthMap[key] || 0,
      year: y,
    });
    curr.setMonth(curr.getMonth() + 1);
  }

  return timeline;
};

const getJobsStatusDistribution = async ({
  organizationId,
  recruiterId,
}) => {
  const match = {};

  if (organizationId) {
    match.organizationId = toObjectId(organizationId);
  }

  if (recruiterId) {
    const rId = toObjectId(recruiterId);
    match.$or = [{ recruiterId: rId }, { postedBy: rId }];
  }

  return Job.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);
};

const getMonthlyInterviewsTrend = async ({
  organizationId,
  interviewerId,
  recruiterId,
}) => {
  const match = {};

  if (organizationId) {
    match.organizationId = toObjectId(organizationId);
  }

  if (interviewerId) {
    const iId = toObjectId(interviewerId);
    match.$or = [{ interviewerId: iId }, { interviewer: iId }];
  } else if (recruiterId) {
    const rId = toObjectId(recruiterId);
    match.$or = [{ recruiterId: rId }, { scheduledBy: rId }];
  }

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  match.scheduledAt = { $gte: sixMonthsAgo };

  const rawResults = await Interview.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: '$scheduledAt' },
          month: { $month: '$scheduledAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthMap = {};
  rawResults.forEach((item) => {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
    monthMap[key] = item.count;
  });

  const timeline = [];
  const curr = new Date(sixMonthsAgo);

  while (timeline.length < 6) {
    const y = curr.getFullYear();
    const m = curr.getMonth() + 1;
    const key = `${y}-${String(m).padStart(2, '0')}`;
    timeline.push({
      month: monthNames[curr.getMonth()],
      interviews: monthMap[key] || 0,
    });
    curr.setMonth(curr.getMonth() + 1);
  }

  return timeline;
};

const getHiringFunnelData = async ({
  organizationId,
  recruiterId,
  candidateId,
}) => {
  const match = {};

  if (organizationId) {
    match.organizationId = toObjectId(organizationId);
  }

  if (candidateId) {
    const cId = toObjectId(candidateId);
    match.$or = [{ candidateId: cId }, { candidate: cId }];
  } else if (recruiterId) {
    const rId = toObjectId(recruiterId);
    const recruiterJobs = await Job.find({
      ...(organizationId ? { organizationId: toObjectId(organizationId) } : {}),
      $or: [{ recruiterId: rId }, { postedBy: rId }],
    }).select('_id');
    const recruiterJobIds = recruiterJobs.map((j) => toObjectId(j._id));

    match.$or = [
      { recruiterId: rId },
      { jobId: { $in: recruiterJobIds } },
    ];
  }

  const applications = await Application.find(match).select('status');

  const funnel = {
    applications: applications.length,
    screening: 0,
    shortlisted: 0,
    interviews: 0,
    selected: 0,
    offers: 0,
    hired: 0,
  };

  const screeningSet = new Set(['SCREENING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'UNDER_REVIEW', 'SELECTED', 'OFFER_SENT', 'OFFER_ACCEPTED', 'HIRED']);
  const shortlistedSet = new Set(['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'UNDER_REVIEW', 'SELECTED', 'OFFER_SENT', 'OFFER_ACCEPTED', 'HIRED']);
  const interviewSet = new Set(['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'UNDER_REVIEW', 'SELECTED', 'OFFER_SENT', 'OFFER_ACCEPTED', 'HIRED']);
  const selectedSet = new Set(['SELECTED', 'OFFER_SENT', 'OFFER_ACCEPTED', 'HIRED']);
  const offerSet = new Set(['OFFER_SENT', 'OFFER_ACCEPTED', 'HIRED']);
  const hiredSet = new Set(['OFFER_ACCEPTED', 'HIRED']);

  applications.forEach((app) => {
    const s = app.status;
    if (screeningSet.has(s)) funnel.screening += 1;
    if (shortlistedSet.has(s)) funnel.shortlisted += 1;
    if (interviewSet.has(s)) funnel.interviews += 1;
    if (selectedSet.has(s)) funnel.selected += 1;
    if (offerSet.has(s)) funnel.offers += 1;
    if (hiredSet.has(s)) funnel.hired += 1;
  });

  return [
    { stage: 'Applications', count: funnel.applications },
    { stage: 'Screening', count: funnel.screening },
    { stage: 'Shortlisted', count: funnel.shortlisted },
    { stage: 'Interviews', count: funnel.interviews },
    { stage: 'Selected', count: funnel.selected },
    { stage: 'Offers', count: funnel.offers },
    { stage: 'Hired', count: funnel.hired },
  ];
};

const adminAnalytics = async (req, res, next) => {
  try {
    const organizationId = req.user.organizationId;

    const [
      totalUsers,
      totalOrganizations,
      totalJobs,
      totalApplications,
      totalInterviews,
      totalEvaluations,
      totalOffers,
      applicationStatus,
      applicationsByMonth,
      jobsByStatus,
      interviewTrends,
      hiringFunnel,
    ] = await Promise.all([
      organizationId
        ? User.countDocuments({ organizationId })
        : User.countDocuments(),

      organizationId
        ? Organization.countDocuments({ _id: organizationId })
        : Organization.countDocuments(),

      organizationId
        ? Job.countDocuments({ organizationId })
        : Job.countDocuments(),

      organizationId
        ? Application.countDocuments({ organizationId })
        : Application.countDocuments(),

      organizationId
        ? Interview.countDocuments({ organizationId })
        : Interview.countDocuments(),

      organizationId
        ? Evaluation.countDocuments({ organizationId })
        : Evaluation.countDocuments(),

      organizationId
        ? Offer.countDocuments({ organizationId })
        : Offer.countDocuments(),

      getApplicationStatusDistribution({ organizationId }),
      getMonthlyApplicationsTrend({ organizationId }),
      getJobsStatusDistribution({ organizationId }),
      getMonthlyInterviewsTrend({ organizationId }),
      getHiringFunnelData({ organizationId }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Admin analytics fetched successfully',
      data: {
        stats: {
          totalUsers,
          totalOrganizations,
          totalJobs,
          totalApplications,
          totalInterviews,
          totalEvaluations,
          totalOffers,
        },
        charts: {
          applicationStatus,
          applicationsByMonth,
          jobsByStatus,
          interviewTrends,
          hiringFunnel,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const recruiterAnalytics = async (req, res, next) => {
  try {
    const organizationId = req.user.organizationId;
    const recruiterId = req.user.userId || req.user.id;

    const jobFilter = organizationId
      ? { organizationId, $or: [{ recruiterId }, { postedBy: recruiterId }] }
      : { $or: [{ recruiterId }, { postedBy: recruiterId }] };

    const recruiterJobs = await Job.find(jobFilter).select('_id');
    const recruiterJobIds = recruiterJobs.map((j) => j._id);

    const [
      totalJobs,
      publishedJobs,
      totalApplications,
      shortlistedApplications,
      totalInterviews,
      upcomingInterviews,
      totalOffers,
      applicationStatus,
      applicationsByMonth,
      jobsByStatus,
      interviewTrends,
      hiringFunnel,
    ] = await Promise.all([
      Job.countDocuments(jobFilter),

      Job.countDocuments({
        ...jobFilter,
        status: { $in: ['PUBLISHED', 'ACTIVE'] },
      }),

      Application.countDocuments({
        ...(organizationId ? { organizationId } : {}),
        $or: [
          { recruiterId },
          { jobId: { $in: recruiterJobIds } },
        ],
      }),

      Application.countDocuments({
        ...(organizationId ? { organizationId } : {}),
        $or: [
          { recruiterId },
          { jobId: { $in: recruiterJobIds } },
        ],
        status: 'SHORTLISTED',
      }),

      Interview.countDocuments({
        ...(organizationId ? { organizationId } : {}),
        $or: [
          { recruiterId },
          { scheduledBy: recruiterId },
          { jobId: { $in: recruiterJobIds } },
        ],
      }),

      Interview.countDocuments({
        ...(organizationId ? { organizationId } : {}),
        $or: [
          { recruiterId },
          { scheduledBy: recruiterId },
          { jobId: { $in: recruiterJobIds } },
        ],
        scheduledAt: {
          $gte: new Date(),
        },
        status: {
          $in: ['SCHEDULED', 'CONFIRMED'],
        },
      }),

      Offer.countDocuments({
        ...(organizationId ? { organizationId } : {}),
        $or: [
          { createdBy: recruiterId },
          { recruiterId },
          { jobId: { $in: recruiterJobIds } },
        ],
      }),

      getApplicationStatusDistribution({
        organizationId,
        recruiterId,
      }),

      getMonthlyApplicationsTrend({
        organizationId,
        recruiterId,
      }),

      getJobsStatusDistribution({
        organizationId,
        recruiterId,
      }),

      getMonthlyInterviewsTrend({
        organizationId,
        recruiterId,
      }),

      getHiringFunnelData({
        organizationId,
        recruiterId,
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Recruiter analytics fetched successfully',
      data: {
        stats: {
          totalJobs,
          publishedJobs,
          totalApplications,
          shortlistedApplications,
          totalInterviews,
          upcomingInterviews,
          totalOffers,
        },
        charts: {
          applicationStatus,
          applicationsByMonth,
          jobsByStatus,
          interviewTrends,
          hiringFunnel,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const interviewerAnalytics = async (req, res, next) => {
  try {
    const organizationId = req.user.organizationId;
    const interviewerId = req.user.userId || req.user.id;

    const interviewMatch = {
      ...(organizationId ? { organizationId } : {}),
      $or: [{ interviewerId }, { interviewer: interviewerId }],
    };

    const evaluationMatch = {
      ...(organizationId ? { organizationId } : {}),
      $or: [{ interviewerId }, { interviewer: interviewerId }],
    };

    const [
      totalInterviews,
      upcomingInterviews,
      completedInterviews,
      totalEvaluations,
      completedEvaluations,
      interviewStatus,
      interviewTrends,
    ] = await Promise.all([
      Interview.countDocuments(interviewMatch),

      Interview.countDocuments({
        ...interviewMatch,
        scheduledAt: {
          $gte: new Date(),
        },
        status: {
          $in: ['SCHEDULED', 'CONFIRMED'],
        },
      }),

      Interview.countDocuments({
        ...interviewMatch,
        status: 'COMPLETED',
      }),

      Evaluation.countDocuments(evaluationMatch),

      Evaluation.countDocuments({
        ...evaluationMatch,
        submittedAt: {
          $ne: null,
        },
      }),

      getInterviewStatusDistribution({
        organizationId,
        interviewerId,
      }),

      getMonthlyInterviewsTrend({
        organizationId,
        interviewerId,
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Interviewer analytics fetched successfully',
      data: {
        stats: {
          totalInterviews,
          upcomingInterviews,
          completedInterviews,
          totalEvaluations,
          completedEvaluations,
        },
        charts: {
          interviewStatus,
          interviewTrends,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const candidateAnalytics = async (req, res, next) => {
  try {
    const organizationId = req.user.organizationId;
    const candidateId = req.user.userId || req.user.id;

    const appMatch = {
      ...(organizationId ? { organizationId } : {}),
      $or: [{ candidateId }, { candidate: candidateId }],
    };

    const interviewMatch = {
      ...(organizationId ? { organizationId } : {}),
      $or: [{ candidateId }, { candidate: candidateId }],
    };

    const offerMatch = {
      ...(organizationId ? { organizationId } : {}),
      $or: [{ candidateId }, { candidate: candidateId }],
    };

    const [
      totalApplications,
      shortlistedApplications,
      scheduledInterviews,
      completedInterviews,
      offersReceived,
      applicationStatus,
      applicationsByMonth,
      hiringFunnel,
    ] = await Promise.all([
      Application.countDocuments(appMatch),

      Application.countDocuments({
        ...appMatch,
        status: 'SHORTLISTED',
      }),

      Interview.countDocuments({
        ...interviewMatch,
        scheduledAt: {
          $gte: new Date(),
        },
        status: {
          $in: ['SCHEDULED', 'CONFIRMED'],
        },
      }),

      Interview.countDocuments({
        ...interviewMatch,
        status: 'COMPLETED',
      }),

      Offer.countDocuments(offerMatch),

      getApplicationStatusDistribution({
        organizationId,
        candidateId,
      }),

      getMonthlyApplicationsTrend({
        organizationId,
        candidateId,
      }),

      getHiringFunnelData({
        organizationId,
        candidateId,
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Candidate analytics fetched successfully',
      data: {
        stats: {
          totalApplications,
          shortlistedApplications,
          scheduledInterviews,
          completedInterviews,
          offersReceived,
        },
        charts: {
          applicationStatus,
          applicationsByMonth,
          hiringFunnel,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminAnalytics,
  recruiterAnalytics,
  interviewerAnalytics,
  candidateAnalytics,
};
