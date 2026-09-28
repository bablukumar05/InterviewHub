const organizationService = require('../services/organizationService');
const { successResponse, errorResponse } = require('../utils/response');

exports.createOrganization = async (req, res, next) => {
  try {
    const org = await organizationService.createOrganization(req.body, req.user._id);
    return successResponse(res, org, 'Organization created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.getOrganizations = async (req, res, next) => {
  try {
    const orgs = await organizationService.getAllOrganizations();
    return successResponse(res, orgs, 'Organizations fetched successfully');
  } catch (error) {
    next(error);
  }
};

exports.getOrganizationById = async (req, res, next) => {
  try {
    const org = await organizationService.getOrganizationById(req.params.id);
    if (!org) {
      return errorResponse(res, 'Organization not found', 404);
    }
    return successResponse(res, org, 'Organization retrieved successfully');
  } catch (error) {
    next(error);
  }
};

exports.updateOrganization = async (req, res, next) => {
  try {
    const org = await organizationService.updateOrganization(req.params.id, req.body);
    if (!org) {
      return errorResponse(res, 'Organization not found', 404);
    }
    return successResponse(res, org, 'Organization updated successfully');
  } catch (error) {
    next(error);
  }
};
