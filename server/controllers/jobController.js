const {
  createJob,
  getJobs,
  getMyJobs,
  getJobById,
  updateJob,
  publishJob,
  pauseJob,
  closeJob,
} = require('../services/jobService');

const getActorId = (user) =>
  user?.userId || user?._id || user?.id || null;

const createJobController = async (req, res, next) => {
  try {
    const job = await createJob(
      getActorId(req.user),
      req.body
    );

    return res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

const getJobsController = async (req, res, next) => {
  try {
    const result = await getJobs(req.query);

    return res.status(200).json({
      success: true,
      message: 'Jobs fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMyJobsController = async (req, res, next) => {
  try {
    const result = await getMyJobs({
      ...req.query,
      userId: getActorId(req.user),
    });

    return res.status(200).json({
      success: true,
      message: 'Your jobs fetched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getJobByIdController = async (req, res, next) => {
  try {
    const job = await getJobById(
      req.params.id,
      {
        userId: getActorId(req.user),
        role: req.user?.role || null,
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Job fetched successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

const updateJobController = async (req, res, next) => {
  try {
    const job = await updateJob(
      req.params.id,
      getActorId(req.user),
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

const publishJobController = async (req, res, next) => {
  try {
    const job = await publishJob(
      req.params.id,
      getActorId(req.user)
    );

    return res.status(200).json({
      success: true,
      message: 'Job published successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

const pauseJobController = async (req, res, next) => {
  try {
    const job = await pauseJob(
      req.params.id,
      getActorId(req.user)
    );

    return res.status(200).json({
      success: true,
      message: 'Job paused successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

const closeJobController = async (req, res, next) => {
  try {
    const job = await closeJob(
      req.params.id,
      getActorId(req.user)
    );

    return res.status(200).json({
      success: true,
      message: 'Job closed successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJobController,
  getJobsController,
  getMyJobsController,
  getJobByIdController,
  updateJobController,
  publishJobController,
  pauseJobController,
  closeJobController,
};
