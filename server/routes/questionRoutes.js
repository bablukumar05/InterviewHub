const express = require("express");

const router =
  express.Router();

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const {
  validate,
  validateQuery,
} = require("../middleware/validationMiddleware");

const {
  createQuestionSchema,
  updateQuestionSchema,
  questionListQuerySchema,
} = require(
  "../validators/questionValidator"
);

const {
  createQuestionController,
  getQuestionByIdController,
  listQuestionsController,
  updateQuestionController,
  deactivateQuestionController,
  activateQuestionController,
  getQuestionFilterOptionsController,
} = require(
  "../controllers/questionController"
);

router.get(
  "/filters",
  protect,
  authorize(
    "ADMIN",
    "RECRUITER",
    "INTERVIEWER"
  ),
  getQuestionFilterOptionsController
);

router.get(
  "/",
  protect,
  authorize(
    "ADMIN",
    "RECRUITER",
    "INTERVIEWER"
  ),
  validateQuery(
    questionListQuerySchema
  ),
  listQuestionsController
);

router.post(
  "/",
  protect,
  authorize(
    "ADMIN",
    "RECRUITER",
    "INTERVIEWER"
  ),
  validate(
    createQuestionSchema
  ),
  createQuestionController
);

router.get(
  "/:id",
  protect,
  authorize(
    "ADMIN",
    "RECRUITER",
    "INTERVIEWER"
  ),
  getQuestionByIdController
);

router.patch(
  "/:id",
  protect,
  authorize(
    "ADMIN",
    "RECRUITER",
    "INTERVIEWER"
  ),
  validate(
    updateQuestionSchema
  ),
  updateQuestionController
);

router.patch(
  "/:id/deactivate",
  protect,
  authorize(
    "ADMIN",
    "RECRUITER",
    "INTERVIEWER"
  ),
  deactivateQuestionController
);

router.patch(
  "/:id/activate",
  protect,
  authorize(
    "ADMIN",
    "RECRUITER",
    "INTERVIEWER"
  ),
  activateQuestionController
);

module.exports = router;
