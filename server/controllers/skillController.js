const {
  getCatalog,
  getRoleById,
  getDepartments,
  normalizeSkillList,
  searchRoles,
} = require('../services/skillCatalogService');

const sendSuccess = ({ res, statusCode = 200, message = 'Success', data = {} }) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const getCatalogController = async (req, res, next) => {
  try {
    const { department, search, field } = req.query;
    const roles = await getCatalog({ department, search, field });

    return sendSuccess({
      res,
      statusCode: 200,
      message: 'Skill and role catalog retrieved successfully',
      data: {
        total: roles.length,
        roles,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRoleByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = await getRoleById(id);

    return sendSuccess({
      res,
      statusCode: 200,
      message: 'Career role details retrieved successfully',
      data: {
        role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDepartmentsController = async (req, res, next) => {
  try {
    const departments = await getDepartments();

    return sendSuccess({
      res,
      statusCode: 200,
      message: 'Departments catalog retrieved successfully',
      data: {
        total: departments.length,
        departments,
      },
    });
  } catch (error) {
    next(error);
  }
};

const searchSkillsController = async (req, res, next) => {
  try {
    const { q } = req.query;
    const results = await searchRoles(q);

    return sendSuccess({
      res,
      statusCode: 200,
      message: 'Skills and roles search completed',
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

const normalizeSkillsController = async (req, res, next) => {
  try {
    const { skills } = req.body;
    const normalized = normalizeSkillList(skills);

    return sendSuccess({
      res,
      statusCode: 200,
      message: 'Skills normalized successfully',
      data: {
        count: normalized.length,
        skills: normalized,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCatalogController,
  getRoleByIdController,
  getDepartmentsController,
  searchSkillsController,
  normalizeSkillsController,
};
