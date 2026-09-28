const {
  createApplication,
  getMyApplications,
  getApplicationById,
  getJobApplications,
  updateApplicationStatus,
  generateOffer,
  respondToOffer,
} = require('../services/applicationService');

const createApplicationController = async (
  req,
  res,
  next
) => {
  try {
    const application =
      await createApplication(
        req.user.userId,
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

const getMyApplicationsController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await getMyApplications({
        ...(req.validatedQuery || req.query),
        userId: req.user.userId,
      });

    return res.status(200).json({
      success: true,
      message:
        'Applications fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getApplicationByIdController = async (
  req,
  res,
  next
) => {
  try {
    const application =
      await getApplicationById(
        req.params.id,
        {
          userId: req.user.userId,
          role: req.user.role,
          userOrgId: req.user.organizationId,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        'Application fetched successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

const getJobApplicationsController = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await getJobApplications({
        ...(req.validatedQuery || req.query),
        jobId: req.params.jobId,
        userId: req.user.userId,
        role: req.user.role,
        userOrgId: req.user.organizationId,
      });

    return res.status(200).json({
      success: true,
      message:
        'Job applications fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatusController = async (
  req,
  res,
  next
) => {
  try {
    const application =
      await updateApplicationStatus(
        req.params.id,
        req.user.userId,
        req.user.role,
        req.user.organizationId,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        'Application status updated successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

const generateOfferController = async (
  req,
  res,
  next
) => {
  try {
    const application =
      await generateOffer(
        req.params.id,
        req.user.userId,
        req.user.role,
        req.user.organizationId,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        'Job offer generated successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

const respondToOfferController = async (
  req,
  res,
  next
) => {
  try {
    const application =
      await respondToOffer(
        req.params.id,
        req.user.userId,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: `Offer ${req.body.accept ? 'accepted! Status updated to HIRED.' : 'declined.'}`,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApplicationController,
  getMyApplicationsController,
  getApplicationByIdController,
  getJobApplicationsController,
  updateApplicationStatusController,
  generateOfferController,
  respondToOfferController,

  applyForJobController: createApplicationController,
  getCandidateApplicationsController: getMyApplicationsController,
};
