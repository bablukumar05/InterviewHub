const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { protect, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');

router.use(protect);

router
  .route('/')
  .post(authorize(ROLES.ADMIN), organizationController.createOrganization)
  .get(organizationController.getOrganizations);

router
  .route('/:id')
  .get(organizationController.getOrganizationById)
  .put(authorize(ROLES.ADMIN), organizationController.updateOrganization);

module.exports = router;
