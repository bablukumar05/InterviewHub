const questionService = require(
  "../services/questionService"
);

const sendSuccess = ({
  res,
  statusCode = 200,
  message,
  data,
}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const createQuestionController =
  async (req, res, next) => {
    try {
      const question =
        await questionService.createQuestion({
          data: req.body,
          user: req.user,
        });

      return sendSuccess({
        res,
        statusCode: 201,
        message:
          "Question created successfully",
        data: {
          question,
        },
      });
    } catch (error) {
      next(error);
    }
  };

const getQuestionByIdController =
  async (req, res, next) => {
    try {
      const question =
        await questionService.getQuestionById({
          questionId:
            req.params.id,
          user: req.user,
        });

      return sendSuccess({
        res,
        message:
          "Question fetched successfully",
        data: {
          question,
        },
      });
    } catch (error) {
      next(error);
    }
  };

const listQuestionsController =
  async (req, res, next) => {
    try {
      const result =
        await questionService.listQuestions({
          user: req.user,
          ...(req.validatedQuery ||
            req.query),
        });

      return sendSuccess({
        res,
        message:
          "Questions fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

const updateQuestionController =
  async (req, res, next) => {
    try {
      const question =
        await questionService.updateQuestion({
          questionId:
            req.params.id,
          data: req.body,
          user: req.user,
        });

      return sendSuccess({
        res,
        message:
          "Question updated successfully",
        data: {
          question,
        },
      });
    } catch (error) {
      next(error);
    }
  };

const deactivateQuestionController =
  async (req, res, next) => {
    try {
      const question =
        await questionService.deactivateQuestion({
          questionId:
            req.params.id,
          user: req.user,
        });

      return sendSuccess({
        res,
        message:
          "Question deactivated successfully",
        data: {
          question,
        },
      });
    } catch (error) {
      next(error);
    }
  };

const activateQuestionController =
  async (req, res, next) => {
    try {
      const question =
        await questionService.activateQuestion({
          questionId:
            req.params.id,
          user: req.user,
        });

      return sendSuccess({
        res,
        message:
          "Question activated successfully",
        data: {
          question,
        },
      });
    } catch (error) {
      next(error);
    }
  };

const getQuestionFilterOptionsController =
  async (req, res, next) => {
    try {
      const filters =
        await questionService.getQuestionFilterOptions({
          user: req.user,
        });

      return sendSuccess({
        res,
        message:
          "Question filter options fetched successfully",
        data: filters,
      });
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  createQuestionController,
  getQuestionByIdController,
  listQuestionsController,
  updateQuestionController,
  deactivateQuestionController,
  activateQuestionController,
  getQuestionFilterOptionsController,
};
