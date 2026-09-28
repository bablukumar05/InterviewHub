const offerService = require('../services/offerService');
const { successResponse, errorResponse } = require('../utils/response');
const { ROLES } = require('../constants/roles');

exports.createOffer = async (req, res, next) => {
  try {
    const offer = await offerService.createOffer(req.body, req.user._id);
    return successResponse(res, offer, 'Job offer generated successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.getOffers = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === ROLES.CANDIDATE) {
      filter.candidateId = req.user._id;
    }
    const offers = await offerService.getOffers(filter);
    return successResponse(res, offers, 'Offers retrieved successfully');
  } catch (error) {
    next(error);
  }
};

exports.getOfferById = async (req, res, next) => {
  try {
    const offer = await offerService.getOfferById(req.params.id);
    if (!offer) {
      return errorResponse(res, 'Offer letter not found', 404);
    }
    return successResponse(res, offer, 'Offer details fetched successfully');
  } catch (error) {
    next(error);
  }
};

exports.updateOfferStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const offer = await offerService.updateOfferStatus(req.params.id, status, notes, req.user._id);
    if (!offer) {
      return errorResponse(res, 'Offer letter not found', 404);
    }
    return successResponse(res, offer, `Offer status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};
