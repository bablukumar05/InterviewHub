const express = require('express');
const {
  getAuditLogs,
  getAdminSummary,
} = require('../controllers/auditLogController');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(protect);
router.use(authorize(ROLES.ADMIN));

router.get('/', getAuditLogs);
router.get('/admin-summary', getAdminSummary);

module.exports = router;
