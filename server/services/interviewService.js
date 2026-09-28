const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const Interview = require("../models/Interview");
const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");

const {
  APPLICATION_STATUS,
} = require("../constants/status");

const APP_STATUS = {
  APPLIED:
    APPLICATION_STATUS.APPLIED || "APPLIED",

  SCREENING:
    APPLICATION_STATUS.SCREENING ||
    "SCREENING",

  SHORTLISTED:
    APPLICATION_STATUS.SHORTLISTED ||
    "SHORTLISTED",

  INTERVIEW:
    APPLICATION_STATUS.INTERVIEW ||
    "INTERVIEW",

  SELECTED:
    APPLICATION_STATUS.SELECTED ||
    "SELECTED",

  OFFER:
    APPLICATION_STATUS.OFFER ||
    "OFFER",

  HIRED:
    APPLICATION_STATUS.HIRED || "HIRED",

  REJECTED:
    APPLICATION_STATUS.REJECTED ||
    "REJECTED",
};

const INTERVIEW_STATUS = {
  SCHEDULED: "SCHEDULED",
  CONFIRMED: "CONFIRMED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
};

const ACTIVE_ROUND_STATUSES = new Set([
  INTERVIEW_STATUS.SCHEDULED,
  INTERVIEW_STATUS.CONFIRMED,
  INTERVIEW_STATUS.IN_PROGRESS,
  INTERVIEW_STATUS.COMPLETED,
]);

const TERMINAL_INTERVIEW_STATUSES = new Set([
  INTERVIEW_STATUS.COMPLETED,
  INTERVIEW_STATUS.CANCELLED,
  INTERVIEW_STATUS.NO_SHOW,
]);

const SCHEDULE_CONFLICT_STATUSES = new Set([
  INTERVIEW_STATUS.SCHEDULED,
  INTERVIEW_STATUS.CONFIRMED,
  INTERVIEW_STATUS.IN_PROGRESS,
]);

const NO_SHOW_GRACE_MINUTES = Number(
  process.env.INTERVIEW_NO_SHOW_GRACE_MINUTES || 15
);

const INTERVIEW_STATUS_TRANSITIONS = {
  [INTERVIEW_STATUS.SCHEDULED]: new Set([
    INTERVIEW_STATUS.CONFIRMED,
    INTERVIEW_STATUS.CANCELLED,
    INTERVIEW_STATUS.NO_SHOW,
  ]),

  [INTERVIEW_STATUS.CONFIRMED]: new Set([
    INTERVIEW_STATUS.IN_PROGRESS,
    INTERVIEW_STATUS.CANCELLED,
    INTERVIEW_STATUS.NO_SHOW,
  ]),

  [INTERVIEW_STATUS.IN_PROGRESS]: new Set([
    INTERVIEW_STATUS.COMPLETED,
    INTERVIEW_STATUS.CANCELLED,
  ]),

  [INTERVIEW_STATUS.COMPLETED]: new Set(),

  [INTERVIEW_STATUS.CANCELLED]: new Set(),

  [INTERVIEW_STATUS.NO_SHOW]: new Set(),
};

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getId = (value) => {
  if (!value) return null;

  if (
    typeof value === "string" ||
    value instanceof mongoose.Types.ObjectId
  ) {
    return String(value);
  }

  return value._id
    ? String(value._id)
    : value.id
    ? String(value.id)
    : null;
};

const sameId = (a, b) => {
  const first = getId(a);
  const second = getId(b);

  return Boolean(first && second && first === second);
};

const ensureValidObjectId = (
  value,
  fieldName = "ID"
) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw createError(
      `Invalid ${fieldName}`,
      400
    );
  }
};

const getActiveActor = async (user) => {
  if (!user?.userId && !user?.id) {
    throw createError(
      "Authentication required",
      401
    );
  }

  const userId = user.userId || user.id;

  const actor = await User.findById(userId).select(
    "_id role organizationId isActive name firstName lastName avatar"
  );

  if (!actor) {
    throw createError(
      "User account not found",
      401
    );
  }

  if (!actor.isActive) {
    throw createError(
      "User account is inactive",
      403
    );
  }

  if (actor.role !== "CANDIDATE" && !actor.organizationId) {
    throw createError(
      "User is not assigned to an organization",
      403
    );
  }

  return actor;
};

const assertSameOrganization = (
  actorOrganizationId,
  resourceOrganizationId
) => {
  if (
    !sameId(
      actorOrganizationId,
      resourceOrganizationId
    )
  ) {
    throw createError(
      "You do not have access to this organization",
      403
    );
  }
};

const getApplicationContext = async (
  applicationId
) => {
  ensureValidObjectId(
    applicationId,
    "application ID"
  );

  const application =
    await Application.findById(applicationId)
      .populate({
        path: "jobId",
        select:
          "_id organizationId recruiterId postedBy title status interviewRounds",
      })
      .populate({
        path: "candidateProfile",
        select:
          "_id userId headline skills experience education resumeUrl resumeOriginalName",
      });

  if (!application) {
    throw createError(
      "Application not found",
      404
    );
  }

  const job =
    application.jobId ||
    application.job;

  if (!job) {
    throw createError(
      "Application job not found",
      404
    );
  }

  if (
    application.organizationId &&
    !sameId(
      application.organizationId,
      job.organizationId
    )
  ) {
    throw createError(
      "Application and job organization mismatch",
      409
    );
  }

  if (
    application.jobId &&
    !sameId(
      application.jobId,
      job._id
    )
  ) {
    throw createError(
      "Application and job relationship is invalid",
      409
    );
  }

  if (
    application.candidateProfile &&
    !sameId(
      application.candidateProfile.userId,
      application.candidateId
    )
  ) {
    throw createError(
      "Application candidate profile relationship is invalid",
      409
    );
  }

  return {
    application,
    job,
  };
};

const assertRecruiterJobAccess = (
  actor,
  job
) => {
  assertSameOrganization(
    actor.organizationId,
    job.organizationId
  );

  if (actor.role === "ADMIN") {
    return;
  }

  if (actor.role !== "RECRUITER") {
    throw createError(
      "Only recruiters or admins can manage interviews",
      403
    );
  }

  if (
    !sameId(
      actor._id,
      job.recruiterId
    )
  ) {
    throw createError(
      "You do not have access to this job",
      403
    );
  }
};

const getAndValidateInterviewers = async (
  interviewerIds,
  organizationId
) => {
  const uniqueIds = [
    ...new Set(
      interviewerIds.map((id) => String(id))
    ),
  ];

  const invalidIds = uniqueIds.filter(
    (id) =>
      !mongoose.Types.ObjectId.isValid(id)
  );

  if (invalidIds.length > 0) {
    throw createError(
      "One or more interviewer IDs are invalid",
      400
    );
  }

  const users = await User.find({
    _id: {
      $in: uniqueIds,
    },
  }).select(
    "_id role organizationId isActive name firstName lastName avatar"
  );

  if (users.length !== uniqueIds.length) {
    throw createError(
      "One or more interviewers were not found",
      404
    );
  }

  for (const interviewer of users) {
    if (!interviewer.isActive) {
      throw createError(
        `Interviewer ${getId(
          interviewer._id
        )} is inactive`,
        400
      );
    }

    if (interviewer.role !== "INTERVIEWER") {
      throw createError(
        `${interviewer.name || "Selected user"} is not an interviewer`,
        400
      );
    }

    if (
      !sameId(
        interviewer.organizationId,
        organizationId
      )
    ) {
      throw createError(
        "All interviewers must belong to the same organization",
        403
      );
    }
  }

  return users;
};

const resolveInterviewRound = (
  job,
  roundNumber
) => {
  if (!Array.isArray(job.interviewRounds) || job.interviewRounds.length === 0) {
    return {
      roundNumber: Number(roundNumber) || 1,
      roundName: `Interview Round ${roundNumber || 1}`,
      roundType: "TECHNICAL",
    };
  }

  const round = job.interviewRounds.find(
    (item) =>
      Number(item.order) === Number(roundNumber)
  );

  if (!round) {
    throw createError(
      `Interview round ${roundNumber} does not exist for this job`,
      400
    );
  }

  return {
    roundNumber: Number(round.order),
    roundName: round.name,
    roundType: round.type,
  };
};

const assertApplicationCanBeInterviewed = (
  application
) => {
  const currentStatus =
    application.status;

  const allowed = [
    APP_STATUS.SHORTLISTED,
    APP_STATUS.INTERVIEW,
  ];

  if (!allowed.includes(currentStatus)) {
    throw createError(
      `Application with status ${currentStatus} cannot be scheduled for an interview`,
      409
    );
  }
};

const assertPreviousRoundCompleted = async ({
  applicationId,
  roundNumber,
}) => {
  if (Number(roundNumber) <= 1) {
    return;
  }

  const previousRoundNumber = Number(roundNumber) - 1;

  const previousInterview = await Interview.findOne({
    applicationId,
    roundNumber: previousRoundNumber,
    status: INTERVIEW_STATUS.COMPLETED,
  }).select("_id status completedAt roundName");

  if (!previousInterview) {
    throw createError(
      `Round ${roundNumber} cannot be scheduled until round ${previousRoundNumber} is completed`,
      409
    );
  }
};

const assertNoDuplicateRound = async ({
  applicationId,
  roundNumber,
}) => {
  const existing = await Interview.findOne({
    applicationId,
    roundNumber,
    status: {
      $in: [...ACTIVE_ROUND_STATUSES],
    },
  }).select("_id status roundName scheduledAt");

  if (existing) {
    throw createError(
      `An active interview already exists for round ${roundNumber}`,
      409
    );
  }
};

const getInterviewWindow = (
  scheduledAt,
  durationMinutes
) => {
  const start =
    scheduledAt instanceof Date
      ? scheduledAt
      : new Date(scheduledAt);

  if (
    Number.isNaN(start.getTime())
  ) {
    throw createError(
      "Invalid interview schedule",
      400
    );
  }

  const duration =
    Number(durationMinutes);

  const end = new Date(
    start.getTime() +
      duration * 60 * 1000
  );

  return {
    start,
    end,
  };
};

const assertFutureSchedule = (
  scheduledAt
) => {
  const start = new Date(scheduledAt);

  if (
    Number.isNaN(start.getTime())
  ) {
    throw createError(
      "Invalid interview schedule",
      400
    );
  }

  if (start.getTime() <= Date.now()) {
    throw createError(
      "Interview must be scheduled for a future time",
      400
    );
  }
};

const findScheduleConflicts = async ({
  candidateId,
  interviewerIds = [],
  scheduledAt,
  durationMinutes,
  excludeInterviewId = null,
}) => {
  const {
    start: newStart,
    end: newEnd,
  } = getInterviewWindow(
    scheduledAt,
    durationMinutes
  );

  const orConditions = [
    {
      candidateId,
    },
  ];

  if (interviewerIds.length > 0) {
    orConditions.push({
      $or: [
        {
          "interviewers.userId": {
            $in: interviewerIds,
          },
        },
        {
          interviewerId: {
            $in: interviewerIds,
          },
        },
      ],
    });
  }

  const query = {
    status: {
      $in: [
        ...SCHEDULE_CONFLICT_STATUSES,
      ],
    },

    scheduledAt: {
      $lt: newEnd,
    },

    $or: orConditions,
  };

  if (excludeInterviewId) {
    query._id = {
      $ne: excludeInterviewId,
    };
  }

  const existing =
    await Interview.find(query).select(
      "_id candidateId interviewerId interviewers scheduledAt durationMinutes status roundName applicationId"
    );

  const conflicts = [];

  for (const interview of existing) {
    const {
      start: existingStart,
      end: existingEnd,
    } = getInterviewWindow(
      interview.scheduledAt,
      interview.durationMinutes || interview.duration || 60
    );

    const overlaps =
      existingStart < newEnd &&
      existingEnd > newStart;

    if (!overlaps) {
      continue;
    }

    const candidateConflict =
      sameId(
        interview.candidateId,
        candidateId
      );

    const interviewerConflict =
      (Array.isArray(interview.interviewers) &&
        interview.interviewers.some((participant) =>
          interviewerIds.some((id) =>
            sameId(participant.userId, id)
          )
        )) ||
      (interview.interviewerId &&
        interviewerIds.some((id) =>
          sameId(interview.interviewerId, id)
        ));

    if (
      candidateConflict ||
      interviewerConflict
    ) {
      conflicts.push({
        interviewId: interview._id,
        roundName: interview.roundName,
        status: interview.status,
        scheduledAt:
          interview.scheduledAt,
        candidateConflict,
        interviewerConflict,
      });
    }
  }

  return conflicts;
};

const assertNoScheduleConflict = async (
  params
) => {
  const conflicts =
    await findScheduleConflicts(params);

  if (conflicts.length === 0) {
    return;
  }

  const hasCandidateConflict =
    conflicts.some(
      (item) =>
        item.candidateConflict
    );

  const hasInterviewerConflict =
    conflicts.some(
      (item) =>
        item.interviewerConflict
    );

  let message =
    "Interview schedule conflicts with an existing interview";

  if (
    hasCandidateConflict &&
    hasInterviewerConflict
  ) {
    message =
      "Candidate and interviewer availability conflict with another interview";
  } else if (hasCandidateConflict) {
    message =
      "Candidate already has another interview scheduled at this time";
  } else if (
    hasInterviewerConflict
  ) {
    message =
      "One or more interviewers are already booked at this time";
  }

  const error = createError(
    message,
    409
  );

  error.conflicts = conflicts;

  throw error;
};

const appendApplicationHistory = (
  application,
  nextStatus,
  actorId,
  note
) => {
  const now = new Date();

  application.status =
    nextStatus;

  if (!Array.isArray(
    application.statusHistory
  )) {
    application.statusHistory = [];
  }

  application.statusHistory.push({
    status: nextStatus,
    updatedBy: actorId,
    timestamp: now,
    note: note || undefined,
  });

  if (!Array.isArray(
    application.stageHistory
  )) {
    application.stageHistory = [];
  }

  application.stageHistory.push({
    stage: nextStatus,
    changedBy: actorId,
    updatedBy: actorId,
    changedAt: now,
    timestamp: now,
    note: note || undefined,
  });
};

const syncApplicationToInterview = async ({
  application,
  actorId,
  scheduledAt,
  roundNumber,
}) => {
  const note = `Interview scheduled for round ${roundNumber}`;

  if (
    application.status ===
    APP_STATUS.SHORTLISTED
  ) {
    appendApplicationHistory(
      application,
      APP_STATUS.INTERVIEW,
      actorId,
      note
    );
  } else {
    if (!Array.isArray(application.stageHistory)) {
      application.stageHistory = [];
    }
    const now = new Date();
    application.stageHistory.push({
      stage: APP_STATUS.INTERVIEW,
      changedBy: actorId,
      updatedBy: actorId,
      changedAt: now,
      timestamp: now,
      note,
    });
  }

  const existingRound = Number(application.currentRound || 0);

  if (Number(roundNumber) > existingRound) {
    application.currentRound = Number(roundNumber);
  }

  application.interviewScheduledAt =
    scheduledAt;

  await application.save();
};

const syncApplicationAfterInterviewStatusChange = async ({
  applicationId,
  actorId,
  status,
  note,
  excludeInterviewId = null,
}) => {
  const application = await Application.findById(applicationId);
  if (!application) return;

  const now = new Date();
  if (!Array.isArray(application.stageHistory)) {
    application.stageHistory = [];
  }

  let stageNote = note;
  if (!stageNote) {
    switch (status) {
      case INTERVIEW_STATUS.CONFIRMED:
        stageNote = "Interview confirmed";
        break;
      case INTERVIEW_STATUS.IN_PROGRESS:
        stageNote = "Interview started";
        break;
      case INTERVIEW_STATUS.COMPLETED:
        stageNote = "Interview completed";
        break;
      case INTERVIEW_STATUS.CANCELLED:
        stageNote = "Interview cancelled";
        break;
      case INTERVIEW_STATUS.NO_SHOW:
        stageNote = "Interview marked as no-show";
        break;
      default:
        stageNote = `Interview status updated to ${status}`;
    }
  }

  application.stageHistory.push({
    stage: APP_STATUS.INTERVIEW,
    changedBy: actorId,
    updatedBy: actorId,
    changedAt: now,
    timestamp: now,
    note: stageNote,
  });

  if (status === INTERVIEW_STATUS.COMPLETED) {
    application.interviewCompletedAt = now;
  }

  if (TERMINAL_INTERVIEW_STATUSES.has(status)) {
    const nextActiveInterview = await Interview.findOne({
      applicationId,
      _id: { $ne: excludeInterviewId },
      status: {
        $in: [
          INTERVIEW_STATUS.SCHEDULED,
          INTERVIEW_STATUS.CONFIRMED,
          INTERVIEW_STATUS.IN_PROGRESS,
        ],
      },
    }).sort({ scheduledAt: 1 });

    application.interviewScheduledAt = nextActiveInterview
      ? nextActiveInterview.scheduledAt
      : null;
  }

  await application.save();
};

const assertInterviewManagerAccess = (
  actor,
  interview,
  job
) => {
  if (
    actor.role === "ADMIN"
  ) {
    assertSameOrganization(
      actor.organizationId,
      interview.organizationId
    );

    return;
  }

  if (
    actor.role === "RECRUITER"
  ) {
    assertRecruiterJobAccess(
      actor,
      job
    );

    return;
  }

  throw createError(
    "You do not have permission to manage this interview",
    403
  );
};

const isAssignedInterviewer = (
  interview,
  userId
) => {
  const inArray =
    Array.isArray(
      interview.interviewers
    ) &&
    interview.interviewers.some(
      (participant) =>
        sameId(
          participant.userId,
          userId
        )
    );

  const isSingle =
    interview.interviewerId &&
    sameId(interview.interviewerId, userId);

  return Boolean(inArray || isSingle);
};

const assertInterviewerAccess = (
  actor,
  interview,
  job
) => {
  assertSameOrganization(
    actor.organizationId,
    interview.organizationId
  );

  if (
    actor.role === "ADMIN"
  ) {
    return;
  }

  if (
    actor.role === "RECRUITER"
  ) {
    assertRecruiterJobAccess(
      actor,
      job
    );

    return;
  }

  if (
    actor.role !== "INTERVIEWER"
  ) {
    throw createError(
      "Only assigned interviewers can access this interview",
      403
    );
  }

  if (
    !isAssignedInterviewer(
      interview,
      actor._id
    )
  ) {
    throw createError(
      "You are not assigned to this interview",
      403
    );
  }
};

const assertCandidateAccess = (
  actor,
  interview
) => {
  if (
    actor.role !== "CANDIDATE"
  ) {
    throw createError(
      "Candidate access required",
      403
    );
  }

  if (
    !sameId(
      actor._id,
      interview.candidateId
    )
  ) {
    throw createError(
      "You do not have access to this interview",
      403
    );
  }
};

const assertInterviewersAssigned = (
  interview
) => {
  const hasArray =
    Array.isArray(interview.interviewers) &&
    interview.interviewers.length > 0;

  const hasSingle = Boolean(interview.interviewerId);

  if (!hasArray && !hasSingle) {
    throw createError(
      "At least one interviewer must be assigned before confirming the interview",
      409
    );
  }
};

const assertNoShowEligible = (
  interview
) => {
  const scheduledAt = new Date(interview.scheduledAt);
  const graceMs = NO_SHOW_GRACE_MINUTES * 60 * 1000;
  const eligibleAt = scheduledAt.getTime() + graceMs;

  if (Date.now() < eligibleAt) {
    throw createError(
      `Interview can be marked no-show after ${NO_SHOW_GRACE_MINUTES} minutes from the scheduled time`,
      409
    );
  }
};

const interviewPopulate = [
  {
    path: "applicationId",
    select:
      "_id status appliedAt currentRound jobId candidateId candidateProfile resumeUrl resume",
  },
  {
    path: "jobId",
    select:
      "_id title department location workMode employmentType interviewRounds recruiterId organizationId",
  },
  {
    path: "candidateId",
    select:
      "_id name firstName lastName avatar title email",
  },
  {
    path: "candidateProfileId",
    select:
      "_id headline bio skills education experience resumeUrl resumeOriginalName location",
  },
  {
    path: "recruiterId",
    select:
      "_id name firstName lastName avatar role email",
  },
  {
    path: "interviewerId",
    select:
      "_id name firstName lastName avatar role email",
  },
  {
    path: "interviewers.userId",
    select:
      "_id name firstName lastName avatar role email",
  },
];

const createInterview = async ({
  data,
  user,
}) => {
  const actor =
    await getActiveActor(user);

  if (
    !["RECRUITER", "ADMIN"].includes(
      actor.role
    )
  ) {
    throw createError(
      "Only recruiters or admins can schedule interviews",
      403
    );
  }

  const {
    application,
    job,
  } =
    await getApplicationContext(
      data.applicationId
    );

  assertRecruiterJobAccess(
    actor,
    job
  );

  assertApplicationCanBeInterviewed(
    application
  );

  const round =
    resolveInterviewRound(
      job,
      data.roundNumber
    );

  await assertPreviousRoundCompleted({
    applicationId:
      application._id,
    roundNumber:
      round.roundNumber,
  });

  await assertNoDuplicateRound({
    applicationId:
      application._id,
    roundNumber:
      round.roundNumber,
  });

  assertFutureSchedule(
    data.scheduledAt
  );

  await assertNoScheduleConflict({
    candidateId:
      application.candidateId,
    interviewerIds: [],
    scheduledAt:
      data.scheduledAt,
    durationMinutes:
      data.durationMinutes,
  });

  const interview =
    await Interview.create({
      organizationId:
        job.organizationId,

      applicationId:
        application._id,

      jobId:
        job._id,

      candidateId:
        application.candidateId,

      candidateProfileId:
        getId(application.candidateProfile) || undefined,

      recruiterId:
        job.recruiterId,

      interviewers: [],

      roundNumber:
        round.roundNumber,

      roundName:
        round.roundName,

      roundType:
        round.roundType,

      status:
        INTERVIEW_STATUS.SCHEDULED,

      scheduledAt:
        new Date(data.scheduledAt),

      durationMinutes:
        data.durationMinutes,

      timezone:
        data.timezone,

      meetingType:
        data.meetingType,

      meetingUrl:
        data.meetingUrl,

      location:
        data.location,

      instructions:
        data.instructions,

      candidateNotes:
        data.candidateNotes,

      createdBy:
        actor._id,

      updatedBy:
        actor._id,
    });

  await syncApplicationToInterview({
    application,
    actorId: actor._id,
    scheduledAt:
      interview.scheduledAt,
    roundNumber:
      round.roundNumber,
  });

  return Interview.findById(
    interview._id
  ).populate(interviewPopulate);
};

const getInterviewById = async ({
  interviewId,
  user,
}) => {
  ensureValidObjectId(
    interviewId,
    "interview ID"
  );

  const actor =
    await getActiveActor(user);

  const interview =
    await Interview.findById(
      interviewId
    ).populate(interviewPopulate);

  if (!interview) {
    throw createError(
      "Interview not found",
      404
    );
  }

  const job =
    interview.jobId;

  if (!job) {
    throw createError(
      "Interview job not found",
      404
    );
  }

  if (
    actor.role === "CANDIDATE"
  ) {
    assertCandidateAccess(
      actor,
      interview
    );
  } else if (
    actor.role === "INTERVIEWER"
  ) {
    assertInterviewerAccess(
      actor,
      interview,
      job
    );
  } else if (
    ["RECRUITER", "ADMIN"].includes(
      actor.role
    )
  ) {
    assertRecruiterJobAccess(
      actor,
      job
    );
  } else {
    throw createError(
      "You do not have access to this interview",
      403
    );
  }

  if (actor.role === "CANDIDATE") {
    const interviewObj = interview.toObject ? interview.toObject() : { ...interview };
    delete interviewObj.notes;
    return interviewObj;
  }

  return interview;
};

const getMyCandidateInterviews = async ({
  user,
  page = 1,
  limit = 10,
  status,
}) => {
  const actor =
    await getActiveActor(user);

  if (
    actor.role !== "CANDIDATE"
  ) {
    throw createError(
      "Candidate access required",
      403
    );
  }

  const safePage =
    Math.max(Number(page) || 1, 1);

  const safeLimit = Math.min(
    Math.max(Number(limit) || 10, 1),
    50
  );

  const filter = {
    candidateId: actor._id,
  };

  if (status) {
    filter.status = status;
  }

  const [items, total] =
    await Promise.all([
      Interview.find(filter)
        .sort({
          scheduledAt: 1,
        })
        .skip(
          (safePage - 1) *
            safeLimit
        )
        .limit(safeLimit)
        .populate(interviewPopulate),

      Interview.countDocuments(filter),
    ]);

  const sanitizedItems = items.map((item) => {
    const obj = item.toObject ? item.toObject() : { ...item };
    delete obj.notes;
    return obj;
  });

  return {
    items: sanitizedItems,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(
        total / safeLimit
      ),
    },
  };
};

const getMyInterviewerInterviews = async ({
  user,
  page = 1,
  limit = 10,
  status,
  from,
  to,
}) => {
  const actor =
    await getActiveActor(user);

  if (
    actor.role !== "INTERVIEWER"
  ) {
    throw createError(
      "Interviewer access required",
      403
    );
  }

  const safePage =
    Math.max(Number(page) || 1, 1);

  const safeLimit = Math.min(
    Math.max(Number(limit) || 10, 1),
    50
  );

  const filter = {
    organizationId:
      actor.organizationId,

    $or: [
      {
        "interviewers.userId": actor._id,
      },
      {
        interviewerId: actor._id,
      },
    ],
  };

  if (status) {
    filter.status = status;
  }

  if (from || to) {
    filter.scheduledAt = {};

    if (from) {
      filter.scheduledAt.$gte =
        new Date(from);
    }

    if (to) {
      filter.scheduledAt.$lt =
        new Date(to);
    }
  }

  const [items, total] =
    await Promise.all([
      Interview.find(filter)
        .sort({
          scheduledAt: 1,
        })
        .skip(
          (safePage - 1) *
            safeLimit
        )
        .limit(safeLimit)
        .populate(interviewPopulate),

      Interview.countDocuments(filter),
    ]);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(
        total / safeLimit
      ),
    },
  };
};

const getRecruiterInterviews = async ({
  user,
  page = 1,
  limit = 10,
  status,
  jobId,
  applicationId,
}) => {
  const actor =
    await getActiveActor(user);

  if (
    !["RECRUITER", "ADMIN"].includes(
      actor.role
    )
  ) {
    throw createError(
      "Recruiter or admin access required",
      403
    );
  }

  const safePage =
    Math.max(Number(page) || 1, 1);

  const safeLimit = Math.min(
    Math.max(Number(limit) || 10, 1),
    50
  );

  const filter = {
    organizationId:
      actor.organizationId,
  };

  if (
    actor.role === "RECRUITER"
  ) {
    filter.recruiterId =
      actor._id;
  }

  if (status) {
    filter.status = status;
  }

  if (jobId) {
    filter.jobId = jobId;
  }

  if (applicationId) {
    filter.applicationId = applicationId;
  }

  const [items, total] =
    await Promise.all([
      Interview.find(filter)
        .sort({
          scheduledAt: 1,
        })
        .skip(
          (safePage - 1) *
            safeLimit
        )
        .limit(safeLimit)
        .populate(interviewPopulate),

      Interview.countDocuments(filter),
    ]);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(
        total / safeLimit
      ),
    },
  };
};

const updateInterview = async ({
  interviewId,
  data,
  user,
}) => {
  ensureValidObjectId(
    interviewId,
    "interview ID"
  );

  const actor =
    await getActiveActor(user);

  const interview =
    await Interview.findById(
      interviewId
    );

  if (!interview) {
    throw createError(
      "Interview not found",
      404
    );
  }

  const job =
    await Job.findById(
      interview.jobId
    ).select(
      "_id organizationId recruiterId title interviewRounds"
    );

  if (!job) {
    throw createError(
      "Job not found",
      404
    );
  }

  assertInterviewManagerAccess(
    actor,
    interview,
    job
  );

  if (
    TERMINAL_INTERVIEW_STATUSES.has(
      interview.status
    )
  ) {
    throw createError(
      "Completed, cancelled, or no-show interviews cannot be edited",
      409
    );
  }

  const nextScheduledAt =
    data.scheduledAt
      ? new Date(data.scheduledAt)
      : interview.scheduledAt;

  const nextDuration =
    data.durationMinutes ??
    interview.durationMinutes;

  if (data.scheduledAt) {
    assertFutureSchedule(
      data.scheduledAt
    );
  }

  if (
    data.scheduledAt ||
    data.durationMinutes
  ) {
    const existingInterviewerIds =
      Array.isArray(interview.interviewers) && interview.interviewers.length > 0
        ? interview.interviewers.map((item) => item.userId)
        : interview.interviewerId
        ? [interview.interviewerId]
        : [];

    await assertNoScheduleConflict({
      candidateId:
        interview.candidateId,

      interviewerIds: existingInterviewerIds,

      scheduledAt:
        nextScheduledAt,

      durationMinutes:
        nextDuration,

      excludeInterviewId:
        interview._id,
    });
  }

  const nextMeetingType =
    data.meetingType ??
    interview.meetingType;

  const nextMeetingUrl =
    data.meetingUrl !== undefined
      ? data.meetingUrl
      : interview.meetingUrl;

  const nextLocation =
    data.location !== undefined
      ? data.location
      : interview.location;

  if (
    nextMeetingType === "VIDEO" &&
    !nextMeetingUrl
  ) {
    throw createError(
      "meetingUrl is required for video interviews",
      400
    );
  }

  if (
    nextMeetingType === "ONSITE" &&
    !nextLocation
  ) {
    throw createError(
      "location is required for onsite interviews",
      400
    );
  }

  const editableFields = [
    "scheduledAt",
    "durationMinutes",
    "timezone",
    "meetingType",
    "meetingUrl",
    "location",
    "instructions",
    "candidateNotes",
  ];

  for (const field of editableFields) {
    if (
      data[field] !== undefined
    ) {
      interview[field] =
        field === "scheduledAt"
          ? new Date(data[field])
          : data[field];
    }
  }

  interview.updatedBy =
    actor._id;

  await interview.save();

  if (
    data.scheduledAt
  ) {
    await Application.updateOne(
      {
        _id:
          interview.applicationId,
      },
      {
        $set: {
          interviewScheduledAt:
            interview.scheduledAt,
        },
      }
    );
  }

  return Interview.findById(
    interview._id
  ).populate(interviewPopulate);
};

const rescheduleInterview = async ({
  interviewId,
  data,
  user,
}) => {
  ensureValidObjectId(
    interviewId,
    "interview ID"
  );

  const actor =
    await getActiveActor(user);

  const interview =
    await Interview.findById(
      interviewId
    );

  if (!interview) {
    throw createError(
      "Interview not found",
      404
    );
  }

  const job =
    await Job.findById(
      interview.jobId
    ).select(
      "_id organizationId recruiterId title"
    );

  if (!job) {
    throw createError(
      "Job not found",
      404
    );
  }

  assertInterviewManagerAccess(
    actor,
    interview,
    job
  );

  if (
    ![
      INTERVIEW_STATUS.SCHEDULED,
      INTERVIEW_STATUS.CONFIRMED,
    ].includes(
      interview.status
    )
  ) {
    throw createError(
      "Only scheduled or confirmed interviews can be rescheduled",
      409
    );
  }

  assertFutureSchedule(
    data.scheduledAt
  );

  const nextDuration =
    data.durationMinutes ??
    interview.durationMinutes;

  const existingInterviewerIds =
    Array.isArray(interview.interviewers) && interview.interviewers.length > 0
      ? interview.interviewers.map((item) => item.userId)
      : interview.interviewerId
      ? [interview.interviewerId]
      : [];

  await assertNoScheduleConflict({
    candidateId:
      interview.candidateId,

    interviewerIds: existingInterviewerIds,

    scheduledAt:
      data.scheduledAt,

    durationMinutes:
      nextDuration,

    excludeInterviewId:
      interview._id,
  });

  const oldScheduledAt =
    interview.scheduledAt;

  interview.rescheduledFrom =
    oldScheduledAt;

  interview.rescheduleReason =
    data.reason;

  interview.scheduledAt =
    new Date(data.scheduledAt);

  if (data.timezone) {
    interview.timezone =
      data.timezone;
  }

  if (
    data.durationMinutes !==
    undefined
  ) {
    interview.durationMinutes =
      data.durationMinutes;
  }

  interview.rescheduledCount =
    (interview.rescheduledCount || 0) + 1;

  interview.updatedBy =
    actor._id;

  await interview.save();

  const application = await Application.findById(interview.applicationId);
  if (application) {
    if (!Array.isArray(application.stageHistory)) {
      application.stageHistory = [];
    }
    const now = new Date();
    const rescheduleNote = data.reason
      ? `Interview rescheduled: ${data.reason}`
      : "Interview rescheduled";

    application.stageHistory.push({
      stage: APP_STATUS.INTERVIEW,
      changedBy: actor._id,
      updatedBy: actor._id,
      changedAt: now,
      timestamp: now,
      note: rescheduleNote,
    });
    application.interviewScheduledAt = interview.scheduledAt;
    await application.save();
  }

  return Interview.findById(
    interview._id
  ).populate(interviewPopulate);
};

const assignInterviewers = async ({
  interviewId,
  interviewerIds,
  user,
}) => {
  ensureValidObjectId(
    interviewId,
    "interview ID"
  );

  const actor =
    await getActiveActor(user);

  const interview =
    await Interview.findById(
      interviewId
    );

  if (!interview) {
    throw createError(
      "Interview not found",
      404
    );
  }

  const job =
    await Job.findById(
      interview.jobId
    ).select(
      "_id organizationId recruiterId"
    );

  if (!job) {
    throw createError(
      "Job not found",
      404
    );
  }

  assertInterviewManagerAccess(
    actor,
    interview,
    job
  );

  if (
    TERMINAL_INTERVIEW_STATUSES.has(
      interview.status
    )
  ) {
    throw createError(
      "Interviewers cannot be changed after the interview is closed",
      409
    );
  }

  const interviewers =
    await getAndValidateInterviewers(
      interviewerIds,
      interview.organizationId
    );

  const ids =
    interviewers.map(
      (item) => item._id
    );

  await assertNoScheduleConflict({
    candidateId:
      interview.candidateId,

    interviewerIds: ids,

    scheduledAt:
      interview.scheduledAt,

    durationMinutes:
      interview.durationMinutes,

    excludeInterviewId:
      interview._id,
  });

  interview.interviewers =
    interviewers.map(
      (interviewer, index) => ({
        userId:
          interviewer._id,

        role:
          index === 0
            ? "PRIMARY"
            : "PANEL",
      })
    );

  if (interviewers.length > 0) {
    interview.interviewerId = interviewers[0]._id;
  }

  interview.updatedBy =
    actor._id;

  await interview.save();

  return Interview.findById(
    interview._id
  ).populate(interviewPopulate);
};

const assertStatusActionAccess = ({
  actor,
  interview,
  job,
  nextStatus,
}) => {

  if (
    actor.role === "ADMIN"
  ) {
    assertSameOrganization(
      actor.organizationId,
      interview.organizationId
    );

    return;
  }

  if (
    actor.role === "RECRUITER"
  ) {
    assertRecruiterJobAccess(
      actor,
      job
    );

    return;
  }

  if (
    actor.role === "INTERVIEWER"
  ) {
    assertInterviewerAccess(
      actor,
      interview,
      job
    );

    if (
      nextStatus ===
      INTERVIEW_STATUS.CANCELLED
    ) {
      throw createError(
        "Only the recruiter or admin can cancel an interview",
        403
      );
    }

    return;
  }

  throw createError(
    "You do not have permission to change interview status",
    403
  );
};

const transitionInterviewStatus = async ({
  interviewId,
  nextStatus,
  user,
  note,
}) => {
  ensureValidObjectId(
    interviewId,
    "interview ID"
  );

  const actor =
    await getActiveActor(user);

  const interview =
    await Interview.findById(
      interviewId
    );

  if (!interview) {
    throw createError(
      "Interview not found",
      404
    );
  }

  const job =
    await Job.findById(
      interview.jobId
    ).select(
      "_id organizationId recruiterId"
    );

  if (!job) {
    throw createError(
      "Job not found",
      404
    );
  }

  assertStatusActionAccess({
    actor,
    interview,
    job,
    nextStatus,
  });

  const currentStatus =
    interview.status;

  if (
    currentStatus ===
    nextStatus
  ) {
    throw createError(
      `Interview is already ${nextStatus}`,
      409
    );
  }

  if (
    nextStatus === INTERVIEW_STATUS.CONFIRMED ||
    nextStatus === INTERVIEW_STATUS.IN_PROGRESS
  ) {
    assertInterviewersAssigned(interview);
  }

  if (nextStatus === INTERVIEW_STATUS.NO_SHOW) {
    assertNoShowEligible(interview);
  }

  const allowedTransitions =
    INTERVIEW_STATUS_TRANSITIONS[
      currentStatus
    ] || new Set();

  if (
    !allowedTransitions.has(
      nextStatus
    )
  ) {
    throw createError(
      `Invalid interview status transition: ${currentStatus} → ${nextStatus}`,
      409
    );
  }

  const now = new Date();

  interview.status =
    nextStatus;

  interview.updatedBy =
    actor._id;

  switch (nextStatus) {
    case INTERVIEW_STATUS.CONFIRMED:
      interview.confirmedAt = now;
      break;

    case INTERVIEW_STATUS.IN_PROGRESS:
      interview.startedAt = now;
      break;

    case INTERVIEW_STATUS.COMPLETED:
      interview.completedAt = now;
      break;

    case INTERVIEW_STATUS.CANCELLED:
      interview.cancelledAt = now;

      if (note) {
        interview.cancellationReason =
          note;
      }

      break;

    case INTERVIEW_STATUS.NO_SHOW:
      break;

    default:
      break;
  }

  await interview.save();

  await syncApplicationAfterInterviewStatusChange({
    applicationId: interview.applicationId,
    actorId: actor._id,
    status: nextStatus,
    note:
      nextStatus === INTERVIEW_STATUS.CANCELLED && note
        ? `Interview cancelled: ${note}`
        : nextStatus === INTERVIEW_STATUS.COMPLETED && note
        ? `Interview completed: ${note}`
        : undefined,
    excludeInterviewId: interview._id,
  });

  return Interview.findById(
    interview._id
  ).populate(interviewPopulate);
};

const confirmInterview = async ({
  interviewId,
  user,
}) => {
  return transitionInterviewStatus({
    interviewId,
    nextStatus:
      INTERVIEW_STATUS.CONFIRMED,
    user,
  });
};

const startInterview = async ({
  interviewId,
  user,
}) => {
  return transitionInterviewStatus({
    interviewId,
    nextStatus:
      INTERVIEW_STATUS.IN_PROGRESS,
    user,
  });
};

const completeInterview = async ({
  interviewId,
  user,
  note,
}) => {
  return transitionInterviewStatus({
    interviewId,
    nextStatus:
      INTERVIEW_STATUS.COMPLETED,
    user,
    note,
  });
};

const cancelInterview = async ({
  interviewId,
  user,
  reason,
}) => {
  if (!reason?.trim()) {
    throw createError(
      "Cancellation reason is required",
      400
    );
  }

  return transitionInterviewStatus({
    interviewId,
    nextStatus:
      INTERVIEW_STATUS.CANCELLED,
    user,
    note: reason.trim(),
  });
};

const markInterviewNoShow = async ({
  interviewId,
  user,
}) => {
  return transitionInterviewStatus({
    interviewId,
    nextStatus:
      INTERVIEW_STATUS.NO_SHOW,
    user,
  });
};

const findInterviewerScheduleConflicts =
  async ({
    interviewerIds,
    scheduledAt,
    durationMinutes,
    excludeInterviewId = null,
  }) => {
    const {
      start,
      end,
    } = getInterviewWindow(
      scheduledAt,
      durationMinutes
    );

    const query = {
      "interviewers.userId": {
        $in: interviewerIds,
      },

      status: {
        $in: [
          INTERVIEW_STATUS.SCHEDULED,
          INTERVIEW_STATUS.CONFIRMED,
          INTERVIEW_STATUS.IN_PROGRESS,
        ],
      },

      scheduledAt: {
        $lt: end,
      },
    };

    if (excludeInterviewId) {
      query._id = {
        $ne: excludeInterviewId,
      };
    }

    const interviews =
      await Interview.find(query)
        .select(
          "_id scheduledAt durationMinutes status roundName interviewers"
        )
        .lean();

    const conflicts = [];

    for (const interview of interviews) {
      const {
        start: existingStart,
        end: existingEnd,
      } = getInterviewWindow(
        interview.scheduledAt,
        interview.durationMinutes
      );

      const overlaps =
        existingStart < end &&
        existingEnd > start;

      if (!overlaps) {
        continue;
      }

      for (
        const participant of
          interview.interviewers || []
      ) {
        const interviewerId =
          String(
            participant.userId
          );

        if (
          !interviewerIds.some(
            (id) =>
              String(id) ===
              interviewerId
          )
        ) {
          continue;
        }

        conflicts.push({
          interviewerId:
            participant.userId,

          interviewId:
            interview._id,

          scheduledAt:
            interview.scheduledAt,

          durationMinutes:
            interview.durationMinutes,

          status:
            interview.status,

          roundName:
            interview.roundName,
        });
      }
    }

    return conflicts;
  };

const getAvailableInterviewers = async ({
  interviewId,
  user,
}) => {
  ensureValidObjectId(
    interviewId,
    "interview ID"
  );

  const actor =
    await getActiveActor(user);

  if (
    !["RECRUITER", "ADMIN"].includes(
      actor.role
    )
  ) {
    throw createError(
      "Only recruiters or admins can view interviewer availability",
      403
    );
  }

  const interview =
    await Interview.findById(
      interviewId
    ).select(
      "_id organizationId jobId candidateId scheduledAt durationMinutes interviewers status"
    );

  if (!interview) {
    throw createError(
      "Interview not found",
      404
    );
  }

  const job =
    await Job.findById(
      interview.jobId
    ).select(
      "_id organizationId recruiterId title"
    );

  if (!job) {
    throw createError(
      "Job not found",
      404
    );
  }

  assertInterviewManagerAccess(
    actor,
    interview,
    job
  );

  const interviewers =
    await User.find({
      organizationId:
        interview.organizationId,

      role: "INTERVIEWER",

      isActive: true,
    })
      .select(
        "_id name firstName lastName avatar title department skills"
      )
      .sort({
        name: 1,
      })
      .lean();

  const interviewerIds =
    interviewers.map(
      (item) => item._id
    );

  const conflicts =
    interviewerIds.length > 0
      ? await findInterviewerScheduleConflicts({
          interviewerIds,
          scheduledAt:
            interview.scheduledAt,
          durationMinutes:
            interview.durationMinutes,
          excludeInterviewId:
            interview._id,
        })
      : [];

  const conflictMap =
    new Map();

  for (const conflict of conflicts) {
    const key =
      String(conflict.interviewerId);

    if (!conflictMap.has(key)) {
      conflictMap.set(key, []);
    }

    conflictMap
      .get(key)
      .push(conflict);
  }

  const currentlyAssigned =
    new Set(
      (interview.interviewers || [])
        .map(
          (item) =>
            String(item.userId)
        )
    );

  const items =
    interviewers.map(
      (interviewer) => {
        const id =
          String(interviewer._id);

        const conflictsForUser =
          conflictMap.get(id) || [];

        return {
          user: interviewer,

          isAssigned:
            currentlyAssigned.has(id),

          isAvailable:
            conflictsForUser.length ===
            0,

          conflicts:
            conflictsForUser,
        };
      }
    );

  return {
    interview: {
      _id: interview._id,
      scheduledAt:
        interview.scheduledAt,
      durationMinutes:
        interview.durationMinutes,
      status:
        interview.status,
    },

    items,
  };
};

const getInterviewCandidateProfile = async ({
  interviewId,
  user,
}) => {
  ensureValidObjectId(
    interviewId,
    "interview ID"
  );

  const actor =
    await getActiveActor(user);

  const interview =
    await Interview.findById(
      interviewId
    )
      .populate({
        path: "candidateId",
        select:
          "_id name firstName lastName avatar title",
      })
      .populate({
        path: "candidateProfileId",
        select:
          "_id headline bio skills education experience location portfolioUrl githubUrl linkedinUrl resumeUrl resumeOriginalName",
      });

  if (!interview) {
    throw createError(
      "Interview not found",
      404
    );
  }

  const job =
    await Job.findById(
      interview.jobId
    ).select(
      "_id organizationId recruiterId title"
    );

  if (!job) {
    throw createError(
      "Job not found",
      404
    );
  }

  if (
    actor.role ===
    "INTERVIEWER"
  ) {
    assertInterviewerAccess(
      actor,
      interview,
      job
    );
  } else if (
    actor.role ===
      "RECRUITER" ||
    actor.role ===
      "ADMIN"
  ) {
    assertRecruiterJobAccess(
      actor,
      job
    );
  } else {
    throw createError(
      "You do not have permission to view this candidate",
      403
    );
  }

  return {
    candidate:
      interview.candidateId,

    profile:
      interview.candidateProfileId,

    interviewId:
      interview._id,
  };
};

const getInterviewCandidateResume = async ({
  interviewId,
  user,
}) => {
  ensureValidObjectId(
    interviewId,
    "interview ID"
  );

  const actor =
    await getActiveActor(user);

  const interview =
    await Interview.findById(
      interviewId
    );

  if (!interview) {
    throw createError(
      "Interview not found",
      404
    );
  }

  const job =
    await Job.findById(
      interview.jobId
    ).select(
      "_id organizationId recruiterId"
    );

  if (!job) {
    throw createError(
      "Job not found",
      404
    );
  }

  if (actor.role === "INTERVIEWER") {
    assertInterviewerAccess(
      actor,
      interview,
      job
    );
  } else if (actor.role === "RECRUITER" || actor.role === "ADMIN") {
    assertRecruiterJobAccess(
      actor,
      job
    );
  } else {
    throw createError(
      "You do not have permission to view this candidate resume",
      403
    );
  }

  const application =
    await Application.findById(
      interview.applicationId
    ).select(
      "_id resumeUrl resume"
    );

  if (!application) {
    throw createError(
      "Application not found",
      404
    );
  }

  const resumeUrl =
    application.resumeUrl ||
    application.resume?.url;

  if (!resumeUrl) {
    throw createError(
      "Candidate resume not found",
      404
    );
  }

  const filename =
    path.basename(
      resumeUrl
    );

  let resumePath = path.resolve(__dirname, "../uploads/resumes", filename);
  if (!fs.existsSync(resumePath)) {
    resumePath = path.join(process.cwd(), "uploads", "resumes", filename);
  }

  if (
    !fs.existsSync(
      resumePath
    )
  ) {
    throw createError(
      "Resume file is no longer available",
      404
    );
  }

  return {
    filePath:
      resumePath,

    originalName:
      application.resume
        ?.originalName ||
      path.basename(
        filename
      ),
  };
};

module.exports = {
  createInterview,

  getInterviewById,
  getMyCandidateInterviews,
  getMyInterviewerInterviews,
  getRecruiterInterviews,

  getAvailableInterviewers,
  getInterviewCandidateProfile,
  getInterviewCandidateResume,

  updateInterview,
  rescheduleInterview,
  assignInterviewers,

  transitionInterviewStatus,

  confirmInterview,
  startInterview,
  completeInterview,
  cancelInterview,
  markInterviewNoShow,

  INTERVIEW_STATUS,
  INTERVIEW_STATUS_TRANSITIONS,
  ACTIVE_ROUND_STATUSES,
  NO_SHOW_GRACE_MINUTES,
};
