const mongoose = require("mongoose");

const Evaluation = require("../models/Evaluation");
const Interview = require("../models/Interview");
const Application = require("../models/Application");
const Job = require("../models/Job");
const Question = require("../models/Question");
const User = require("../models/User");

const {
  EVALUATION_STATUSES,
  EVALUATION_RECOMMENDATIONS,
} = require("../constants/evaluation");

const EVALUATION_CREATABLE_INTERVIEW_STATUSES = [
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
];

const EVALUATION_SUBMIT_INTERVIEW_STATUS =
  "COMPLETED";

const createError = (
  message,
  statusCode = 400
) => {
  const error = new Error(message);

  error.statusCode =
    statusCode;

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

  return Boolean(
    first &&
      second &&
      first === second
  );
};

const ensureValidObjectId = (
  value,
  fieldName = "ID"
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      value
    )
  ) {
    throw createError(
      `Invalid ${fieldName}`,
      400
    );
  }
};

const getActiveActor = async (
  user
) => {
  const actorId =
    user?.userId || user?._id || user?.id;

  if (!actorId) {
    throw createError(
      "Authentication required",
      401
    );
  }

  const actor =
    await User.findById(
      actorId
    ).select(
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

  if (
    actor.role !== "CANDIDATE" &&
    !actor.organizationId
  ) {
    throw createError(
      "User is not assigned to an organization",
      403
    );
  }

  return actor;
};

const isAssignedInterviewer = (
  interview,
  userId
) => {
  const assignedThroughArray =
    Array.isArray(
      interview.interviewers
    ) &&
    interview.interviewers.some(
      (item) =>
        sameId(
          item.userId,
          userId
        )
    );

  const assignedThroughLegacyField =
    interview.interviewerId &&
    sameId(
      interview.interviewerId,
      userId
    );

  return Boolean(
    assignedThroughArray ||
      assignedThroughLegacyField
  );
};

const assertAssignedInterviewer = (
  actor,
  interview
) => {
  if (
    actor.role !== "INTERVIEWER"
  ) {
    throw createError(
      "Interviewer access required",
      403
    );
  }

  if (
    !sameId(
      actor.organizationId,
      interview.organizationId
    )
  ) {
    throw createError(
      "You do not have access to this organization",
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

const assertRecruiterJobAccess = (
  actor,
  job
) => {
  if (
    !sameId(
      actor.organizationId,
      job.organizationId
    )
  ) {
    throw createError(
      "You do not have access to this organization",
      403
    );
  }

  if (
    actor.role === "ADMIN"
  ) {
    return;
  }

  if (
    actor.role !== "RECRUITER"
  ) {
    throw createError(
      "Recruiter or admin access required",
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

const getInterviewContext = async (
  interviewId
) => {
  ensureValidObjectId(
    interviewId,
    "interview ID"
  );

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
      "_id organizationId recruiterId title skills interviewRounds"
    );

  if (!job) {
    throw createError(
      "Interview job not found",
      404
    );
  }

  const application =
    await Application.findById(
      interview.applicationId
    ).select(
      "_id organizationId jobId candidateId candidateProfile status currentRound"
    );

  if (!application) {
    throw createError(
      "Interview application not found",
      404
    );
  }

  if (
    !sameId(
      interview.jobId,
      job._id
    )
  ) {
    throw createError(
      "Interview and job relationship is invalid",
      409
    );
  }

  if (
    !sameId(
      interview.applicationId,
      application._id
    )
  ) {
    throw createError(
      "Interview and application relationship is invalid",
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
    !sameId(
      interview.organizationId,
      job.organizationId
    )
  ) {
    throw createError(
      "Interview and job organization mismatch",
      409
    );
  }

  return {
    interview,
    job,
    application,
  };
};

const assertEvaluationAccess = (
  actor,
  evaluation,
  job,
  interview
) => {
  if (
    actor.role === "INTERVIEWER"
  ) {
    assertAssignedInterviewer(
      actor,
      interview
    );

    if (
      !sameId(
        actor._id,
        evaluation.interviewerId
      )
    ) {
      throw createError(
        "You do not have access to this evaluation",
        403
      );
    }

    return;
  }

  if (
    ["RECRUITER", "ADMIN"].includes(
      actor.role
    )
  ) {
    assertRecruiterJobAccess(
      actor,
      job
    );

    return;
  }

  throw createError(
    "You do not have access to this evaluation",
    403
  );
};

const getAccessibleQuestions = async ({
  questionIds,
  organizationId,
}) => {
  const uniqueIds = [
    ...new Set(
      questionIds.map(
        (id) => String(id)
      )
    ),
  ];

  if (
    uniqueIds.length === 0
  ) {
    return new Map();
  }

  const questions =
    await Question.find({
      _id: {
        $in: uniqueIds,
      },

      $or: [
        {
          visibility: "SYSTEM",
        },
        {
          visibility:
            "ORGANIZATION",

          organizationId,
        },
      ],
    }).select(
      "_id title skills category field role difficulty type visibility organizationId"
    );

  if (
    questions.length !==
    uniqueIds.length
  ) {
    throw createError(
      "One or more selected questions are not accessible",
      403
    );
  }

  return new Map(
    questions.map(
      (question) => [
        String(question._id),
        question,
      ]
    )
  );
};

const normalizeQuestionScores =
  async ({
    questionScores = [],
    organizationId,
  }) => {
    if (
      !Array.isArray(
        questionScores
      )
    ) {
      return [];
    }

    const questionIds =
      questionScores.map(
        (item) =>
          item.questionId
      );

    const questionMap =
      await getAccessibleQuestions({
        questionIds,
        organizationId,
      });

    return questionScores.map(
      (item) => {
        const question =
          questionMap.get(
            String(
              item.questionId
            )
          );

        if (!question) {
          throw createError(
            `Question ${item.questionId} not found`,
            404
          );
        }

        const requestedSkill =
          item.skill
            ?.trim()
            .toLowerCase();

        const questionSkills =
          Array.isArray(
            question.skills
          )
            ? question.skills.map(
                (skill) =>
                  String(skill)
                    .trim()
                    .toLowerCase()
              )
            : [];

        let skill =
          requestedSkill;

        if (
          skill &&
          questionSkills.length > 0 &&
          !questionSkills.includes(
            skill
          )
        ) {
          throw createError(
            `Skill ${skill} is not associated with the selected question`,
            400
          );
        }

        if (
          !skill &&
          questionSkills.length > 0
        ) {
          skill =
            questionSkills[0];
        }

        return {
          questionId:
            question._id,

          questionText:
            question.title,

          skill:
            skill || undefined,

          score:
            Number(item.score),

          maxScore: 5,

          notes:
            item.notes
              ?.trim() || "",
        };
      }
    );
  };

const normalizeSkillScores = (
  skillScores = []
) => {
  if (
    !Array.isArray(
      skillScores
    )
  ) {
    return [];
  }

  const seen = new Set();

  return skillScores.map(
    (item) => {
      const skill =
        String(item.skill)
          .trim()
          .toLowerCase();

      if (!skill) {
        throw createError(
          "Skill name is required",
          400
        );
      }

      if (
        seen.has(skill)
      ) {
        throw createError(
          `Duplicate skill score: ${skill}`,
          400
        );
      }

      seen.add(skill);

      return {
        skill,

        score:
          Number(item.score),

        maxScore: 5,

        comment:
          item.comment
            ?.trim() || "",
      };
    }
  );
};

const calculateAverageScore = (
  items = []
) => {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return 0;
  }

  const totalRatio =
    items.reduce(
      (sum, item) => {
        const score =
          Number(item.score) || 0;

        const maxScore =
          Number(
            item.maxScore
          ) || 5;

        return (
          sum +
          score / maxScore
        );
      },
      0
    );

  return Number(
    (
      (totalRatio /
        items.length) *
      100
    ).toFixed(2)
  );
};

const calculateOverallScore = ({
  skillScores,
  questionScores,
}) => {
  if (
    Array.isArray(skillScores) &&
    skillScores.length > 0
  ) {
    return calculateAverageScore(
      skillScores
    );
  }

  if (
    Array.isArray(
      questionScores
    ) &&
    questionScores.length > 0
  ) {
    return calculateAverageScore(
      questionScores
    );
  }

  return 0;
};

const findExistingEvaluation =
  async ({
    interviewId,
    interviewerId,
  }) => {
    return Evaluation.findOne({
      interviewId,
      interviewerId,
    });
  };

const createEvaluation = async ({
  data,
  user,
}) => {
  const actor =
    await getActiveActor(user);

  if (
    actor.role !== "INTERVIEWER"
  ) {
    throw createError(
      "Only interviewers can create evaluations",
      403
    );
  }

  const {
    interview,
    job,
    application,
  } =
    await getInterviewContext(
      data.interviewId
    );

  assertAssignedInterviewer(
    actor,
    interview
  );

  if (
    !EVALUATION_CREATABLE_INTERVIEW_STATUSES.includes(
      interview.status
    )
  ) {
    throw createError(
      `Evaluation cannot be created when interview status is ${interview.status}`,
      409
    );
  }

  const existing =
    await findExistingEvaluation({
      interviewId:
        interview._id,
      interviewerId:
        actor._id,
    });

  if (existing) {
    throw createError(
      "You already have an evaluation for this interview",
      409
    );
  }

  const questionScores =
    await normalizeQuestionScores({
      questionScores:
        data.questionScores || [],

      organizationId:
        interview.organizationId,
    });

  const skillScores =
    normalizeSkillScores(
      data.skillScores || []
    );

  const overallScore =
    calculateOverallScore({
      skillScores,
      questionScores,
    });

  const evaluation =
    await Evaluation.create({
      organizationId:
        interview.organizationId,

      interviewId:
        interview._id,

      applicationId:
        application._id,

      jobId:
        job._id,

      candidateId:
        application.candidateId,

      interviewerId:
        actor._id,

      questionScores,

      skillScores,

      overallScore,

      recommendation:
        data.recommendation ||
        "HOLD",

      strengths:
        data.strengths ||
        "",

      weaknesses:
        data.weaknesses ||
        "",

      feedback:
        data.feedback ||
        "",

      status:
        "DRAFT",

      createdBy:
        actor._id,

      updatedBy:
        actor._id,
    });

  return evaluation;
};

const getEvaluationById =
  async ({
    evaluationId,
    user,
  }) => {
    ensureValidObjectId(
      evaluationId,
      "evaluation ID"
    );

    const actor =
      await getActiveActor(user);

    const evaluation =
      await Evaluation.findById(
        evaluationId
      ).populate([
        {
          path: "interviewId",
          select:
            "_id status roundNumber roundName roundType scheduledAt durationMinutes timezone meetingType interviewers interviewerId",
        },
        {
          path: "applicationId",
          select:
            "_id status currentRound jobId candidateId",
        },
        {
          path: "jobId",
          select:
            "_id title department skills recruiterId organizationId",
        },
        {
          path: "candidateId",
          select:
            "_id name firstName lastName avatar",
        },
        {
          path: "interviewerId",
          select:
            "_id name firstName lastName avatar role",
        },
        {
          path: "reviewedBy",
          select:
            "_id name firstName lastName avatar role",
        },
      ]);

    if (!evaluation) {
      throw createError(
        "Evaluation not found",
        404
      );
    }

    const interview =
      evaluation.interviewId;

    const job =
      evaluation.jobId;

    if (!interview) {
      throw createError(
        "Evaluation interview not found",
        404
      );
    }

    if (!job) {
      throw createError(
        "Evaluation job not found",
        404
      );
    }

    assertEvaluationAccess(
      actor,
      evaluation,
      job,
      interview
    );

    return evaluation;
  };

const getMyEvaluations =
  async ({
    user,
    page = 1,
    limit = 10,
    status,
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
      Math.max(
        Number(page) || 1,
        1
      );

    const safeLimit =
      Math.min(
        Math.max(
          Number(limit) || 10,
          1
        ),
        50
      );

    const filter = {
      interviewerId:
        actor._id,

      organizationId:
        actor.organizationId,
    };

    if (status) {
      filter.status =
        status;
    }

    const [
      items,
      total,
    ] = await Promise.all([
      Evaluation.find(filter)
        .sort({
          updatedAt: -1,
        })
        .skip(
          (safePage - 1) *
            safeLimit
        )
        .limit(safeLimit)
        .populate([
          {
            path: "interviewId",
            select:
              "_id status roundNumber roundName roundType scheduledAt",
          },
          {
            path: "jobId",
            select:
              "_id title",
          },
          {
            path: "candidateId",
            select:
              "_id name firstName lastName avatar",
          },
        ]),

      Evaluation.countDocuments(
        filter
      ),
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

const getInterviewEvaluations =
  async ({
    interviewId,
    user,
  }) => {
    const actor =
      await getActiveActor(user);

    const {
      interview,
      job,
    } =
      await getInterviewContext(
        interviewId
      );

    if (
      actor.role ===
      "INTERVIEWER"
    ) {
      assertAssignedInterviewer(
        actor,
        interview
      );

      return Evaluation.findOne({
        interviewId:
          interview._id,

        interviewerId:
          actor._id,
      }).populate([
        {
          path: "interviewerId",
          select:
            "_id name firstName lastName avatar role",
        },
      ]);
    }

    assertRecruiterJobAccess(
      actor,
      job
    );

    return Evaluation.find({
      interviewId:
        interview._id,

      organizationId:
        interview.organizationId,
    })
      .sort({
        createdAt: 1,
      })
      .populate([
        {
          path: "interviewerId",
          select:
            "_id name firstName lastName avatar role",
        },
        {
          path: "reviewedBy",
          select:
            "_id name firstName lastName avatar role",
        },
      ]);
  };

const getApplicationEvaluations =
  async ({
    applicationId,
    user,
  }) => {
    ensureValidObjectId(
      applicationId,
      "application ID"
    );

    const actor =
      await getActiveActor(user);

    if (
      ![
        "RECRUITER",
        "ADMIN",
      ].includes(actor.role)
    ) {
      throw createError(
        "Recruiter or admin access required",
        403
      );
    }

    const application =
      await Application.findById(
        applicationId
      ).select(
        "_id jobId organizationId candidateId status"
      );

    if (!application) {
      throw createError(
        "Application not found",
        404
      );
    }

    const job =
      await Job.findById(
        application.jobId
      ).select(
        "_id organizationId recruiterId title"
      );

    if (!job) {
      throw createError(
        "Job not found",
        404
      );
    }

    assertRecruiterJobAccess(
      actor,
      job
    );

    return Evaluation.find({
      applicationId:
        application._id,

      organizationId:
        application.organizationId,
    })
      .sort({
        overallScore: -1,
        createdAt: 1,
      })
      .populate([
        {
          path: "interviewerId",
          select:
            "_id name firstName lastName avatar role",
        },
        {
          path: "interviewId",
          select:
            "_id status roundNumber roundName roundType scheduledAt",
        },
        {
          path: "reviewedBy",
          select:
            "_id name firstName lastName avatar role",
        },
      ]);
  };

const updateEvaluation = async ({
  evaluationId,
  data,
  user,
}) => {
  ensureValidObjectId(
    evaluationId,
    "evaluation ID"
  );

  const actor =
    await getActiveActor(user);

  if (
    actor.role !== "INTERVIEWER"
  ) {
    throw createError(
      "Only interviewers can edit evaluations",
      403
    );
  }

  const evaluation =
    await Evaluation.findById(
      evaluationId
    );

  if (!evaluation) {
    throw createError(
      "Evaluation not found",
      404
    );
  }

  if (
    !sameId(
      actor._id,
      evaluation.interviewerId
    )
  ) {
    throw createError(
      "You can only edit your own evaluation",
      403
    );
  }

  const {
    interview,
    job,
    application,
  } =
    await getInterviewContext(
      evaluation.interviewId
    );

  assertAssignedInterviewer(
    actor,
    interview
  );

  if (
    evaluation.status !==
    "DRAFT"
  ) {
    throw createError(
      "Only draft evaluations can be edited",
      409
    );
  }

  if (
    !EVALUATION_CREATABLE_INTERVIEW_STATUSES.includes(
      interview.status
    )
  ) {
    throw createError(
      `Evaluation cannot be edited when interview status is ${interview.status}`,
      409
    );
  }

  if (
    data.questionScores !==
    undefined
  ) {
    evaluation.questionScores =
      await normalizeQuestionScores({
        questionScores:
          data.questionScores,

        organizationId:
          interview.organizationId,
      });
  }

  if (
    data.skillScores !==
    undefined
  ) {
    evaluation.skillScores =
      normalizeSkillScores(
        data.skillScores
      );
  }

  if (
    data.recommendation !==
    undefined
  ) {
    evaluation.recommendation =
      data.recommendation;
  }

  if (
    data.strengths !==
    undefined
  ) {
    evaluation.strengths =
      data.strengths;
  }

  if (
    data.weaknesses !==
    undefined
  ) {
    evaluation.weaknesses =
      data.weaknesses;
  }

  if (
    data.feedback !==
    undefined
  ) {
    evaluation.feedback =
      data.feedback;
  }

  evaluation.overallScore =
    calculateOverallScore({
      skillScores:
        evaluation.skillScores,

      questionScores:
        evaluation.questionScores,
    });

  evaluation.updatedBy =
    actor._id;

  await evaluation.save();

  return evaluation;
};

const submitEvaluation =
  async ({
    evaluationId,
    data = {},
    user,
  }) => {
    ensureValidObjectId(
      evaluationId,
      "evaluation ID"
    );

    const actor =
      await getActiveActor(user);

    if (
      actor.role !==
      "INTERVIEWER"
    ) {
      throw createError(
        "Only interviewers can submit evaluations",
        403
      );
    }

    const evaluation =
      await Evaluation.findById(
        evaluationId
      );

    if (!evaluation) {
      throw createError(
        "Evaluation not found",
        404
      );
    }

    if (
      !sameId(
        actor._id,
        evaluation.interviewerId
      )
    ) {
      throw createError(
        "You can only submit your own evaluation",
        403
      );
    }

    if (
      evaluation.status ===
      "SUBMITTED"
    ) {
      return evaluation;
    }

    if (
      evaluation.status ===
      "REVIEWED"
    ) {
      throw createError(
        "Reviewed evaluations cannot be submitted again",
        409
      );
    }

    const {
      interview,
    } =
      await getInterviewContext(
        evaluation.interviewId
      );

    assertAssignedInterviewer(
      actor,
      interview
    );

    if (
      interview.status !==
      EVALUATION_SUBMIT_INTERVIEW_STATUS
    ) {
      throw createError(
        "Evaluation can only be submitted after the interview is completed",
        409
      );
    }

    if (
      !Array.isArray(
        evaluation.skillScores
      ) ||
      evaluation.skillScores
        .length === 0
    ) {
      throw createError(
        "At least one skill score is required before submission",
        400
      );
    }

    if (
      data.recommendation !==
      undefined
    ) {
      evaluation.recommendation =
        data.recommendation;
    }

    if (
      data.strengths !==
      undefined
    ) {
      evaluation.strengths =
        data.strengths;
    }

    if (
      data.weaknesses !==
      undefined
    ) {
      evaluation.weaknesses =
        data.weaknesses;
    }

    if (
      data.feedback !==
      undefined
    ) {
      evaluation.feedback =
        data.feedback;
    }

    evaluation.overallScore =
      calculateOverallScore({
        skillScores:
          evaluation.skillScores,

        questionScores:
          evaluation.questionScores,
      });

    evaluation.status =
      "SUBMITTED";

    evaluation.submittedAt =
      new Date();

    evaluation.updatedBy =
      actor._id;

    await evaluation.save();

    return evaluation;
  };

const reviewEvaluation =
  async ({
    evaluationId,
    user,
  }) => {
    ensureValidObjectId(
      evaluationId,
      "evaluation ID"
    );

    const actor =
      await getActiveActor(user);

    if (
      ![
        "RECRUITER",
        "ADMIN",
      ].includes(actor.role)
    ) {
      throw createError(
        "Only recruiters or admins can review evaluations",
        403
      );
    }

    const evaluation =
      await Evaluation.findById(
        evaluationId
      );

    if (!evaluation) {
      throw createError(
        "Evaluation not found",
        404
      );
    }

    const job =
      await Job.findById(
        evaluation.jobId
      ).select(
        "_id organizationId recruiterId title"
      );

    if (!job) {
      throw createError(
        "Job not found",
        404
      );
    }

    assertRecruiterJobAccess(
      actor,
      job
    );

    if (
      evaluation.status ===
      "REVIEWED"
    ) {
      return evaluation;
    }

    if (
      evaluation.status !==
      "SUBMITTED"
    ) {
      throw createError(
        "Only submitted evaluations can be reviewed",
        409
      );
    }

    evaluation.status =
      "REVIEWED";

    evaluation.reviewedAt =
      new Date();

    evaluation.reviewedBy =
      actor._id;

    evaluation.updatedBy =
      actor._id;

    await evaluation.save();

    return evaluation;
  };

module.exports = {
  createEvaluation,
  getEvaluationById,
  getMyEvaluations,
  getInterviewEvaluations,
  getApplicationEvaluations,
  updateEvaluation,
  submitEvaluation,
  reviewEvaluation,

  calculateOverallScore,
};
