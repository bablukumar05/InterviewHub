const mongoose = require("mongoose");

const {
  QUESTION_TYPES,
  QUESTION_DIFFICULTIES,
} = require("../constants/question");

const questionUsageSchema =
  new mongoose.Schema(
    {
      timesUsed: {
        type: Number,
        default: 0,
        min: 0,
      },

      timesAnswered: {
        type: Number,
        default: 0,
        min: 0,
      },

      averageScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
    },
    {
      _id: false,
    }
  );

const questionSchema =
  new mongoose.Schema(
    {
      organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        default: null,
        required: function () {
          return (
            this.visibility ===
            "ORGANIZATION"
          );
        },
        index: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 500,
      },

      description: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
      },

      expectedAnswer: {
        type: String,
        trim: true,
        maxlength: 5000,
        default: "",
      },

      evaluationGuidance: {
        type: String,
        trim: true,
        maxlength: 3000,
        default: "",
      },

      field: {
        type: String,
        trim: true,
        maxlength: 100,
        required: true,
        index: true,
      },

      role: {
        type: String,
        trim: true,
        maxlength: 150,
        index: true,
      },

      category: {
        type: String,
        trim: true,
        maxlength: 100,
        required: true,
        index: true,
      },

      skills: {
        type: [
          {
            type: String,
            trim: true,
            lowercase: true,
          },
        ],
        default: [],
        index: true,
      },

      tags: {
        type: [
          {
            type: String,
            trim: true,
            lowercase: true,
          },
        ],
        default: [],
      },

      type: {
        type: String,
        enum: QUESTION_TYPES,
        required: true,
        index: true,
      },

      difficulty: {
        type: String,
        enum: QUESTION_DIFFICULTIES,
        required: true,
        default: "MEDIUM",
        index: true,
      },

      visibility: {
        type: String,
        enum: [
          "SYSTEM",
          "ORGANIZATION",
        ],
        default: "ORGANIZATION",
        index: true,
      },

      isActive: {
        type: Boolean,
        default: true,
        index: true,
      },

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      usageStats: {
        type: questionUsageSchema,
        default: () => ({}),
      },
    },

    {
      timestamps: true,
    }
  );

questionSchema.index({
  organizationId: 1,
  isActive: 1,
});

questionSchema.index({
  field: 1,
  role: 1,
  isActive: 1,
});

questionSchema.index({
  skills: 1,
  isActive: 1,
});

questionSchema.index({
  type: 1,
  difficulty: 1,
  isActive: 1,
});

questionSchema.index({
  title: "text",
  description: "text",
  category: "text",
  skills: "text",
  tags: "text",
});

questionSchema.pre(
  "validate",
  function () {
    if (Array.isArray(this.skills)) {
      this.skills = [
        ...new Set(
          this.skills
            .map((skill) =>
              String(skill)
                .trim()
                .toLowerCase()
            )
            .filter(Boolean)
        ),
      ];
    }

    if (Array.isArray(this.tags)) {
      this.tags = [
        ...new Set(
          this.tags
            .map((tag) =>
              String(tag)
                .trim()
                .toLowerCase()
            )
            .filter(Boolean)
        ),
      ];
    }

    if (this.field) {
      this.field =
        String(this.field).trim();
    }

    if (this.role) {
      this.role =
        String(this.role).trim();
    }

    if (this.category) {
      this.category =
        String(this.category).trim();
    }
  }
);

module.exports = mongoose.model(
  "Question",
  questionSchema
);
