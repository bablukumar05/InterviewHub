const express = require('express');
const router = express.Router();

const {
  getCatalogController,
  getRoleByIdController,
  getDepartmentsController,
  searchSkillsController,
  normalizeSkillsController,
} = require('../controllers/skillController');

router.get('/departments', getDepartmentsController);
router.get('/search', searchSkillsController);
router.get('/catalog', getCatalogController);
router.get('/catalog/:id', getRoleByIdController);
router.post('/normalize', normalizeSkillsController);

module.exports = router;
