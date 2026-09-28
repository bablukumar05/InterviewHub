const mongoose = require("mongoose");

const Question = require("../models/Question");
const User = require("../models/User");

const createError = (
  message,
  statusCode = 400
) => {
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
    await User.findById(actorId)
      .select(
        "_id role organizationId isActive name firstName lastName"
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

const assertQuestionManagerAccess = (
  actor
) => {
  if (
    !["ADMIN", "RECRUITER", "INTERVIEWER"].includes(
      actor.role
    )
  ) {
    throw createError(
      "Only interviewers, recruiters, or admins can manage questions",
      403
    );
  }
};

const assertQuestionReaderAccess = (
  actor
) => {
  if (
    ![
      "ADMIN",
      "RECRUITER",
      "INTERVIEWER",
    ].includes(actor.role)
  ) {
    throw createError(
      "You do not have access to the question bank",
      403
    );
  }
};

const buildVisibilityFilter = (
  actor
) => {
  return {
    $or: [
      {
        visibility: "SYSTEM",
      },
      {
        visibility: "ORGANIZATION",
        organizationId:
          actor.organizationId,
      },
    ],
  };
};

const createQuestion = async ({
  data,
  user,
}) => {
  const actor =
    await getActiveActor(user);

  assertQuestionManagerAccess(actor);

  const question =
    await Question.create({
      ...data,

      organizationId:
        actor.organizationId,

      visibility:
        "ORGANIZATION",

      createdBy:
        actor._id,

      updatedBy:
        actor._id,

      isActive:
        data.isActive !== undefined
          ? data.isActive
          : true,
    });

  return question;
};

const getQuestionById = async ({
  questionId,
  user,
}) => {
  const actor =
    await getActiveActor(user);

  assertQuestionReaderAccess(actor);

  if (
    !mongoose.Types.ObjectId.isValid(
      questionId
    )
  ) {
    throw createError(
      "Invalid question ID",
      400
    );
  }

  const filter = {
    _id: questionId,
    ...buildVisibilityFilter(actor),
  };

  const question =
    await Question.findOne(filter);

  if (!question) {
    throw createError(
      "Question not found",
      404
    );
  }

  return question;
};

const listQuestions = async ({
  user,
  page = 1,
  limit = 10,
  search,
  field,
  role,
  category,
  skill,
  type,
  difficulty,
  isActive,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  const actor =
    await getActiveActor(user);

  assertQuestionReaderAccess(actor);

  const safePage = Math.max(
    Number(page) || 1,
    1
  );

  const safeLimit = Math.min(
    Math.max(Number(limit) || 10, 1),
    50
  );

  const filter = {
    ...buildVisibilityFilter(actor),
  };

  if (field) {
    filter.field = field;
  }

  if (role) {
    filter.role = role;
  }

  if (category) {
    filter.category = category;
  }

  if (skill) {
    filter.skills = skill
      .trim()
      .toLowerCase();
  }

  if (type) {
    filter.type = type;
  }

  if (difficulty) {
    filter.difficulty = difficulty;
  }

  if (isActive !== undefined) {
    filter.isActive =
      isActive === true ||
      isActive === "true";
  }

  if (search?.trim()) {
    filter.$text = {
      $search: search.trim(),
    };
  }

  const sortDirection =
    sortOrder === "asc" ? 1 : -1;

  const sort = {
    [sortBy]: sortDirection,
  };

  const [items, total] =
    await Promise.all([
      Question.find(filter)
        .sort(sort)
        .skip(
          (safePage - 1) *
            safeLimit
        )
        .limit(safeLimit),

      Question.countDocuments(filter),
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

const updateQuestion = async ({
  questionId,
  data,
  user,
}) => {
  const actor =
    await getActiveActor(user);

  assertQuestionManagerAccess(actor);

  if (
    !mongoose.Types.ObjectId.isValid(
      questionId
    )
  ) {
    throw createError(
      "Invalid question ID",
      400
    );
  }

  const question =
    await Question.findById(
      questionId
    );

  if (!question) {
    throw createError(
      "Question not found",
      404
    );
  }

  if (
    question.visibility ===
    "SYSTEM"
  ) {
    throw createError(
      "System questions cannot be modified",
      403
    );
  }

  if (
    getId(question.organizationId) !==
    getId(actor.organizationId)
  ) {
    throw createError(
      "You do not have access to this question",
      403
    );
  }

  const editableFields = [
    "title",
    "description",
    "expectedAnswer",
    "evaluationGuidance",
    "field",
    "role",
    "category",
    "skills",
    "tags",
    "type",
    "difficulty",
    "isActive",
  ];

  for (const fieldName of editableFields) {
    if (
      data[fieldName] !== undefined
    ) {
      question[fieldName] =
        data[fieldName];
    }
  }

  question.updatedBy =
    actor._id;

  await question.save();

  return question;
};

const deactivateQuestion = async ({
  questionId,
  user,
}) => {
  return updateQuestion({
    questionId,
    data: {
      isActive: false,
    },
    user,
  });
};

const activateQuestion = async ({
  questionId,
  user,
}) => {
  return updateQuestion({
    questionId,
    data: {
      isActive: true,
    },
    user,
  });
};

const getQuestionFilterOptions = async ({
  user,
}) => {
  const actor =
    await getActiveActor(user);

  assertQuestionReaderAccess(actor);

  const visibilityFilter =
    buildVisibilityFilter(actor);

  const [
    fields,
    roles,
    categories,
    skills,
    tags,
  ] = await Promise.all([
    Question.distinct(
      "field",
      visibilityFilter
    ),

    Question.distinct(
      "role",
      visibilityFilter
    ),

    Question.distinct(
      "category",
      visibilityFilter
    ),

    Question.distinct(
      "skills",
      visibilityFilter
    ),

    Question.distinct(
      "tags",
      visibilityFilter
    ),
  ]);

  return {
    fields: fields
      .filter(Boolean)
      .sort(),

    roles: roles
      .filter(Boolean)
      .sort(),

    categories: categories
      .filter(Boolean)
      .sort(),

    skills: skills
      .filter(Boolean)
      .sort(),

    tags: tags
      .filter(Boolean)
      .sort(),
  };
};

module.exports = {
  createQuestion,
  getQuestionById,
  listQuestions,
  updateQuestion,
  deactivateQuestion,
  activateQuestion,
  getQuestionFilterOptions,
};
