const express = require('express');

const {
  createApplicationController,
  getMyApplicationsController,
  getApplicationByIdController,
  updateApplicationStatusController,
  generateOfferController,
  respondToOfferController,
  getJobApplicationsController,
} = require('../controllers/applicationController');

const {
  protect,
  authorize,
} = require('../middleware/authMiddleware');

const {
  validate,
  validateQuery,
} = require('../middleware/validationMiddleware');

const {
  createApplicationSchema,
  updateApplicationStatusSchema,
  applicationListQuerySchema,
  generateOfferSchema,
  respondToOfferSchema,
} = require('../validators/applicationValidator');

const router = express.Router();

router.get(
  '/my',
  protect,
  authorize('CANDIDATE'),
  validateQuery(applicationListQuerySchema),
  getMyApplicationsController
);

router.get(
  '/my-applications',
  protect,
  authorize('CANDIDATE'),
  validateQuery(applicationListQuerySchema),
  getMyApplicationsController
);

router.post(
  '/',
  protect,
  authorize('CANDIDATE'),
  validate(createApplicationSchema),
  createApplicationController
);

router.get(
  '/job/:jobId',
  protect,
  authorize('RECRUITER', 'ADMIN'),
  validateQuery(applicationListQuerySchema),
  getJobApplicationsController
);

router.get(
  '/:id',
  protect,
  authorize(
    'CANDIDATE',
    'RECRUITER',
    'ADMIN'
  ),
  getApplicationByIdController
);

router.patch(
  '/:id/status',
  protect,
  authorize(
    'RECRUITER',
    'ADMIN'
  ),
  validate(updateApplicationStatusSchema),
  updateApplicationStatusController
);

router.put(
  '/:id/status',
  protect,
  authorize(
    'RECRUITER',
    'ADMIN'
  ),
  validate(updateApplicationStatusSchema),
  updateApplicationStatusController
);

router.post(
  '/:id/generate-offer',
  protect,
  authorize('RECRUITER', 'ADMIN'),
  validate(generateOfferSchema),
  generateOfferController
);

router.put(
  '/:id/respond-offer',
  protect,
  authorize('CANDIDATE'),
  validate(respondToOfferSchema),
  respondToOfferController
);

router.patch(
  '/:id/respond-offer',
  protect,
  authorize('CANDIDATE'),
  validate(respondToOfferSchema),
  respondToOfferController
);

module.exports = router;
