const express = require("express");

const router =
  express.Router();

const {
  protect,
  authorize,
} = require(
  "../middleware/authMiddleware"
);

const {
  validate,
  validateQuery,
} = require(
  "../middleware/validationMiddleware"
);

const {
  createEvaluationSchema,
  updateEvaluationSchema,
  submitEvaluationSchema,
  evaluationListQuerySchema,
  emptyBodySchema,
} = require(
  "../validators/evaluationValidator"
);

const {
  createEvaluationController,
  getEvaluationByIdController,
  getMyEvaluationsController,
  getInterviewEvaluationsController,
  getApplicationEvaluationsController,
  updateEvaluationController,
  submitEvaluationController,
  reviewEvaluationController,
} = require(
  "../controllers/evaluationController"
);

router.get(
  "/my",
  protect,
  authorize(
    "INTERVIEWER"
  ),
  validateQuery(
    evaluationListQuerySchema
  ),
  getMyEvaluationsController
);

router.get(
  "/interview/:interviewId",
  protect,
  authorize(
    "INTERVIEWER",
    "RECRUITER",
    "ADMIN"
  ),
  getInterviewEvaluationsController
);

router.get(
  "/application/:applicationId",
  protect,
  authorize(
    "RECRUITER",
    "ADMIN"
  ),
  getApplicationEvaluationsController
);

router.post(
  "/",
  protect,
  authorize(
    "INTERVIEWER"
  ),
  validate(
    createEvaluationSchema
  ),
  createEvaluationController
);

router.get(
  "/:id",
  protect,
  authorize(
    "INTERVIEWER",
    "RECRUITER",
    "ADMIN"
  ),
  getEvaluationByIdController
);

router.patch(
  "/:id",
  protect,
  authorize(
    "INTERVIEWER"
  ),
  validate(
    updateEvaluationSchema
  ),
  updateEvaluationController
);

router.patch(
  "/:id/submit",
  protect,
  authorize(
    "INTERVIEWER"
  ),
  validate(
    submitEvaluationSchema
  ),
  submitEvaluationController
);

router.patch(
  "/:id/review",
  protect,
  authorize(
    "RECRUITER",
    "ADMIN"
  ),
  validate(
    emptyBodySchema
  ),
  reviewEvaluationController
);

module.exports = router;
