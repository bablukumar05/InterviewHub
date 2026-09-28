const Offer = require('../models/Offer');
const Application = require('../models/Application');
const notificationService = require('./notificationService');
const auditLogService = require('./auditLogService');
const { APPLICATION_STATUS } = require('../constants/status');

class OfferService {
  async createOffer(data, creatorId) {
    const offer = await Offer.create({
      ...data,
      createdBy: creatorId,
    });

    await Application.findByIdAndUpdate(data.applicationId, {
      status: APPLICATION_STATUS.OFFER_SENT,
      $push: {
        statusHistory: {
          status: APPLICATION_STATUS.OFFER_SENT,
          updatedBy: creatorId,
          note: `Offer letter created: ${data.title}`,
        },
      },
    });

    await notificationService.createNotification({
      recipient: data.candidateId,
      title: 'Job Offer Received!',
      message: `Congratulations! You have received a job offer for ${data.title}.`,
      type: 'OFFER_GENERATED',
      link: '/candidate/offers',
    });

    await auditLogService.createLog({
      user: creatorId,
      action: 'OFFER_CREATED',
      entity: 'Offer',
      entityId: offer._id,
      details: { candidateId: data.candidateId, salary: data.salary },
    });

    return offer;
  }

  async getOffers(query = {}) {
    return await Offer.find(query)
      .populate('candidateId', 'name email avatar')
      .populate('jobId', 'title department location')
      .populate('createdBy', 'name email');
  }

  async getOfferById(id) {
    return await Offer.findById(id)
      .populate('candidateId', 'name email avatar phone')
      .populate('jobId', 'title department location salaryRange')
      .populate('createdBy', 'name email');
  }

  async updateOfferStatus(id, status, notes = '', userId) {
    const offer = await Offer.findById(id);
    if (!offer) return null;

    offer.status = status;
    if (notes) offer.notes = notes;
    if (status === 'ACCEPTED') offer.signedAt = new Date();

    await offer.save();

    if (status === 'ACCEPTED') {
      await Application.findByIdAndUpdate(offer.applicationId, {
        status: APPLICATION_STATUS.HIRED,
        $push: {
          statusHistory: {
            status: APPLICATION_STATUS.HIRED,
            updatedBy: userId,
            note: 'Candidate accepted the job offer!',
          },
        },
      });
    }

    await auditLogService.createLog({
      user: userId,
      action: `OFFER_STATUS_${status}`,
      entity: 'Offer',
      entityId: offer._id,
      details: { status },
    });

    return offer;
  }
}

module.exports = new OfferService();
