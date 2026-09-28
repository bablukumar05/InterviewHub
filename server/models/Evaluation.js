const mongoose = require("mongoose");

const {
  EVALUATION_STATUSES,
  EVALUATION_RECOMMENDATIONS,
} = require("../constants/evaluation");

const skillScoreSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },

    maxScore: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const questionScoreSchema =
  new mongoose.Schema(
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },

      questionText: {
        type: String,
        trim: true,
        maxlength: 1000,
        required: true,
      },

      skill: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 100,
      },

      score: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
      },

      maxScore: {
        type: Number,
        default: 5,
        min: 1,
        max: 10,
      },

      notes: {
        type: String,
        trim: true,
        maxlength: 1500,
        default: "",
      },
    },
    {
      _id: false,
    }
  );

const evaluationSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      index: true,
    },

    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    interviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    questionScores: {
      type: [questionScoreSchema],
      default: [],
    },

    skillScores: {
      type: [skillScoreSchema],
      default: [],
    },

    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    recommendation: {
      type: String,
      enum: EVALUATION_RECOMMENDATIONS,
      default: "HOLD",
      index: true,
    },

    strengths: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    weaknesses: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    feedback: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    status: {
      type: String,
      enum: EVALUATION_STATUSES,
      default: "DRAFT",
      index: true,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

evaluationSchema.index(
  {
    interviewId: 1,
    interviewerId: 1,
  },
  {
    unique: true,
  }
);

evaluationSchema.index({
  organizationId: 1,
  applicationId: 1,
});

evaluationSchema.index({
  candidateId: 1,
  createdAt: -1,
});

evaluationSchema.index({
  interviewId: 1,
  status: 1,
});

evaluationSchema.index({
  organizationId: 1,
  recommendation: 1,
  status: 1,
});

evaluationSchema.pre(
  "validate",
  function () {
    if (Array.isArray(this.skillScores)) {
      const seen = new Set();

      this.skillScores =
        this.skillScores.filter(
          (item) => {
            const skill =
              String(item.skill || "")
                .trim()
                .toLowerCase();

            if (!skill) {
              return false;
            }

            if (seen.has(skill)) {
              return false;
            }

            seen.add(skill);

            item.skill = skill;

            return true;
          }
        );
    }

    if (
      Array.isArray(
        this.questionScores
      )
    ) {
      const seenQuestions = new Set();

      this.questionScores =
        this.questionScores.filter(
          (item) => {
            const questionId =
              item.questionId
                ? String(item.questionId)
                : "";

            if (!questionId) {
              return false;
            }

            if (
              seenQuestions.has(
                questionId
              )
            ) {
              return false;
            }

            seenQuestions.add(
              questionId
            );

            if (item.skill) {
              item.skill =
                String(item.skill)
                  .trim()
                  .toLowerCase();
            }

            return true;
          }
        );
    }

    if (
      this.status === "SUBMITTED" &&
      !this.submittedAt
    ) {
      this.submittedAt = new Date();
    }

    if (
      this.status === "REVIEWED" &&
      !this.reviewedAt
    ) {
      this.reviewedAt = new Date();
    }
  }
);

module.exports = mongoose.model(
  "Evaluation",
  evaluationSchema
);
