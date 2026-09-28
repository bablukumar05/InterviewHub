const evaluationService = require(
  "../services/evaluationService"
);

const sendSuccess = ({
  res,
  statusCode = 200,
  message,
  data,
}) => {
  return res
    .status(statusCode)
    .json({
      success: true,
      message,
      data,
    });
};

const createEvaluationController =
  async (req, res, next) => {
    try {
      const evaluation =
        await evaluationService.createEvaluation(
          {
            data: req.body,
            user: req.user,
          }
        );

      return sendSuccess({
        res,
        statusCode: 201,
        message:
          "Evaluation draft created successfully",
        data: {
          evaluation,
        },
      });
    } catch (error) {
      next(error);
    }
  };

const getEvaluationByIdController =
  async (req, res, next) => {
    try {
      const evaluation =
        await evaluationService.getEvaluationById(
          {
            evaluationId:
              req.params.id,
            user: req.user,
          }
        );

      return sendSuccess({
        res,
        message:
          "Evaluation fetched successfully",
        data: {
          evaluation,
        },
      });
    } catch (error) {
      next(error);
    }
  };

const getMyEvaluationsController =
  async (req, res, next) => {
    try {
      const result =
        await evaluationService.getMyEvaluations(
          {
            user: req.user,
            ...(req.validatedQuery ||
              req.query),
          }
        );

      return sendSuccess({
        res,
        message:
          "Your evaluations fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

const getInterviewEvaluationsController =
  async (req, res, next) => {
    try {
      const evaluations =
        await evaluationService.getInterviewEvaluations(
          {
            interviewId:
              req.params.interviewId,
            user: req.user,
          }
        );

      return sendSuccess({
        res,
        message:
          "Interview evaluations fetched successfully",
        data: {
          evaluations,
        },
      });
    } catch (error) {
      next(error);
    }
  };

const getApplicationEvaluationsController =
  async (req, res, next) => {
    try {
      const evaluations =
        await evaluationService.getApplicationEvaluations(
          {
            applicationId:
              req.params.applicationId,
            user: req.user,
          }
        );

      return sendSuccess({
        res,
        message:
          "Application evaluations fetched successfully",
        data: {
          evaluations,
        },
      });
    } catch (error) {
      next(error);
    }
  };

const updateEvaluationController =
  async (req, res, next) => {
    try {
      const evaluation =
        await evaluationService.updateEvaluation(
          {
            evaluationId:
              req.params.id,
            data: req.body,
            user: req.user,
          }
        );

      return sendSuccess({
        res,
        message:
          "Evaluation draft updated successfully",
        data: {
          evaluation,
        },
      });
    } catch (error) {
      next(error);
    }
  };

const submitEvaluationController =
  async (req, res, next) => {
    try {
      const evaluation =
        await evaluationService.submitEvaluation(
          {
            evaluationId:
              req.params.id,
            data: req.body,
            user: req.user,
          }
        );

      return sendSuccess({
        res,
        message:
          "Evaluation submitted successfully",
        data: {
          evaluation,
        },
      });
    } catch (error) {
      next(error);
    }
  };

const reviewEvaluationController =
  async (req, res, next) => {
    try {
      const evaluation =
        await evaluationService.reviewEvaluation(
          {
            evaluationId:
              req.params.id,
            user: req.user,
          }
        );

      return sendSuccess({
        res,
        message:
          "Evaluation reviewed successfully",
        data: {
          evaluation,
        },
      });
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  createEvaluationController,
  getEvaluationByIdController,
  getMyEvaluationsController,
  getInterviewEvaluationsController,
  getApplicationEvaluationsController,
  updateEvaluationController,
  submitEvaluationController,
  reviewEvaluationController,
};
