const express = require('express');

const {
  adminAnalytics,
  recruiterAnalytics,
  interviewerAnalytics,
  candidateAnalytics,
} = require('../controllers/analyticsController');

const {
  protect,
  authorize,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
  '/admin',
  protect,
  authorize('ADMIN'),
  adminAnalytics
);

router.get(
  '/recruiter',
  protect,
  authorize('RECRUITER'),
  recruiterAnalytics
);

router.get(
  '/interviewer',
  protect,
  authorize('INTERVIEWER'),
  interviewerAnalytics
);

router.get(
  '/candidate',
  protect,
  authorize('CANDIDATE'),
  candidateAnalytics
);

module.exports = router;
