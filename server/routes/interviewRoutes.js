const express = require("express");

const router = express.Router();

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const {
  validate,
  validateQuery,
} = require("../middleware/validationMiddleware");

const {
  createInterviewSchema,
  updateInterviewSchema,
  rescheduleInterviewSchema,
  assignInterviewersSchema,
  cancelInterviewSchema,
  emptyBodySchema,
  interviewListQuerySchema,
} = require("../validators/interviewValidator");

const {
  createInterviewController,
  getInterviewByIdController,

  getMyCandidateInterviewsController,
  getMyInterviewerInterviewsController,
  getRecruiterInterviewsController,

  getAvailableInterviewersController,
  getInterviewCandidateProfileController,
  getInterviewCandidateResumeController,

  updateInterviewController,
  rescheduleInterviewController,
  assignInterviewersController,

  confirmInterviewController,
  startInterviewController,
  completeInterviewController,
  cancelInterviewController,
  markInterviewNoShowController,
} = require("../controllers/interviewController");

router.get(
  "/my",
  protect,
  authorize("CANDIDATE"),
  validateQuery(interviewListQuerySchema),
  getMyCandidateInterviewsController
);

router.get(
  "/candidate/my",
  protect,
  authorize("CANDIDATE"),
  validateQuery(interviewListQuerySchema),
  getMyCandidateInterviewsController
);

router.get(
  "/candidate",
  protect,
  authorize("CANDIDATE"),
  validateQuery(interviewListQuerySchema),
  getMyCandidateInterviewsController
);

router.get(
  "/assigned",
  protect,
  authorize("INTERVIEWER"),
  validateQuery(interviewListQuerySchema),
  getMyInterviewerInterviewsController
);

router.get(
  "/interviewer/my",
  protect,
  authorize("INTERVIEWER"),
  validateQuery(interviewListQuerySchema),
  getMyInterviewerInterviewsController
);

router.get(
  "/recruiter",
  protect,
  authorize("RECRUITER", "ADMIN"),
  validateQuery(interviewListQuerySchema),
  getRecruiterInterviewsController
);

router.get(
  "/recruiter/my",
  protect,
  authorize("RECRUITER", "ADMIN"),
  validateQuery(interviewListQuerySchema),
  getRecruiterInterviewsController
);

router.post(
  "/",
  protect,
  authorize("RECRUITER", "ADMIN"),
  validate(createInterviewSchema),
  createInterviewController
);

router.get(
  "/:id/interviewer-options",
  protect,
  authorize(
    "RECRUITER",
    "ADMIN"
  ),
  getAvailableInterviewersController
);

router.get(
  "/:id/candidate",
  protect,
  authorize(
    "INTERVIEWER",
    "RECRUITER",
    "ADMIN"
  ),
  getInterviewCandidateProfileController
);

router.get(
  "/:id/candidate-resume",
  protect,
  authorize(
    "INTERVIEWER",
    "RECRUITER",
    "ADMIN"
  ),
  getInterviewCandidateResumeController
);

router.get(
  "/:id",
  protect,
  authorize(
    "CANDIDATE",
    "INTERVIEWER",
    "RECRUITER",
    "ADMIN"
  ),
  getInterviewByIdController
);

router.patch(
  "/:id",
  protect,
  authorize("RECRUITER", "ADMIN"),
  validate(updateInterviewSchema),
  updateInterviewController
);

router.patch(
  "/:id/reschedule",
  protect,
  authorize("RECRUITER", "ADMIN"),
  validate(rescheduleInterviewSchema),
  rescheduleInterviewController
);

router.patch(
  "/:id/interviewers",
  protect,
  authorize("RECRUITER", "ADMIN"),
  validate(assignInterviewersSchema),
  assignInterviewersController
);

router.put(
  "/:id/assign",
  protect,
  authorize("RECRUITER", "ADMIN"),
  validate(assignInterviewersSchema),
  assignInterviewersController
);

router.patch(
  "/:id/confirm",
  protect,
  authorize("RECRUITER", "ADMIN"),
  validate(emptyBodySchema),
  confirmInterviewController
);

router.patch(
  "/:id/start",
  protect,
  authorize(
    "INTERVIEWER",
    "RECRUITER",
    "ADMIN"
  ),
  validate(emptyBodySchema),
  startInterviewController
);

router.patch(
  "/:id/complete",
  protect,
  authorize(
    "INTERVIEWER",
    "RECRUITER",
    "ADMIN"
  ),
  validate(emptyBodySchema),
  completeInterviewController
);

router.patch(
  "/:id/cancel",
  protect,
  authorize("RECRUITER", "ADMIN"),
  validate(cancelInterviewSchema),
  cancelInterviewController
);

router.patch(
  "/:id/no-show",
  protect,
  authorize(
    "INTERVIEWER",
    "RECRUITER",
    "ADMIN"
  ),
  validate(emptyBodySchema),
  markInterviewNoShowController
);

module.exports = router;
