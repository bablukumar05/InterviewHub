const express = require('express');
const {
  getUserProfile,
  uploadResume,
  getAllUsers,
  getUserById,
  createUser,
  updateUserStatus,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(protect);

router.get('/profile', getUserProfile);
router.post('/upload-resume', upload.single('resume'), uploadResume);

router.get('/', authorize(ROLES.ADMIN, ROLES.RECRUITER, ROLES.INTERVIEWER), getAllUsers);
router.post('/', authorize(ROLES.ADMIN), createUser);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.RECRUITER, ROLES.INTERVIEWER), getUserById);
router.put('/:id/status', authorize(ROLES.ADMIN), updateUserStatus);

module.exports = router;
