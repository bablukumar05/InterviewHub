const express = require('express');

const {
  createJobController,
  getJobsController,
  getMyJobsController,
  getJobByIdController,
  updateJobController,
  publishJobController,
  pauseJobController,
  closeJobController,
} = require('../controllers/jobController');

const {
  getJobApplicationsController,
} = require('../controllers/applicationController');

const {
  protect,
  authorize,
  optionalAuth,
} = require('../middleware/authMiddleware');

const {
  validate,
  validateQuery,
} = require('../middleware/validationMiddleware');

const {
  createJobSchema,
  updateJobSchema,
  emptyBodySchema,
} = require('../validators/jobValidator');

const {
  applicationListQuerySchema,
} = require('../validators/applicationValidator');

const router = express.Router();

router.get(
  '/',
  optionalAuth,
  getJobsController
);

router.post(
  '/',
  protect,
  authorize('RECRUITER', 'ADMIN'),
  validate(createJobSchema),
  createJobController
);

router.get(
  '/my',
  protect,
  authorize('RECRUITER', 'ADMIN'),
  getMyJobsController
);

router.get(
  '/:jobId/applications',
  protect,
  authorize('RECRUITER', 'ADMIN'),
  validateQuery(applicationListQuerySchema),
  getJobApplicationsController
);

router.get(
  '/:id',
  optionalAuth,
  getJobByIdController
);

router.put(
  '/:id',
  protect,
  authorize('RECRUITER', 'ADMIN'),
  validate(updateJobSchema),
  updateJobController
);

router.patch(
  '/:id/publish',
  protect,
  authorize('RECRUITER', 'ADMIN'),
  validate(emptyBodySchema),
  publishJobController
);

router.patch(
  '/:id/pause',
  protect,
  authorize('RECRUITER', 'ADMIN'),
  validate(emptyBodySchema),
  pauseJobController
);

router.patch(
  '/:id/close',
  protect,
  authorize('RECRUITER', 'ADMIN'),
  validate(emptyBodySchema),
  closeJobController
);

module.exports = router;
