const express = require('express');

const {
  getProfile,
  createCandidateProfile,
  updateCandidateProfile,
  uploadResume,
  deleteResume,
  getProfileById,
} = require('../controllers/candidateProfileController');

const {
  protect,
  authorize,
} = require('../middleware/authMiddleware');

const { validate } = require('../middleware/validationMiddleware');
const { uploadResume: uploadResumeMiddleware } = require('../middleware/uploadMiddleware');

const {
  candidateProfileSchema,
} = require('../validators/candidateProfileValidator');

const router = express.Router();

router.get(
  '/me',
  protect,
  authorize('CANDIDATE'),
  getProfile
);

router.post(
  '/',
  protect,
  authorize('CANDIDATE'),
  validate(candidateProfileSchema),
  createCandidateProfile
);

router.put(
  '/me',
  protect,
  authorize('CANDIDATE'),
  validate(candidateProfileSchema),
  updateCandidateProfile
);

router.post(
  '/resume',
  protect,
  authorize('CANDIDATE'),
  uploadResumeMiddleware.single('resume'),
  uploadResume
);

router.delete(
  '/resume',
  protect,
  authorize('CANDIDATE'),
  deleteResume
);

router.get(
  '/:id',
  protect,
  getProfileById
);

module.exports = router;
