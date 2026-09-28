const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');

router.use(protect);

router
  .route('/')
  .post(authorize(ROLES.RECRUITER, ROLES.ADMIN), offerController.createOffer)
  .get(offerController.getOffers);

router.route('/:id').get(offerController.getOfferById);

router
  .route('/:id/status')
  .patch(offerController.updateOfferStatus);

module.exports = router;
