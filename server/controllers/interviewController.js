const {
  createInterview,
  getInterviewById,
  getMyCandidateInterviews,
  getMyInterviewerInterviews,
  getRecruiterInterviews,
  getAvailableInterviewers,
  getInterviewCandidateProfile,
  getInterviewCandidateResume,
  updateInterview,
  rescheduleInterview,
  assignInterviewers,
  confirmInterview,
  startInterview,
  completeInterview,
  cancelInterview,
  markInterviewNoShow,
} = require("../services/interviewService");

const sendSuccess = ({
  res,
  statusCode = 200,
  message,
  data = null,
}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const getPaginationQuery = (query = {}) => {
  const page = Math.max(
    Number(query.page) || 1,
    1
  );

  const limit = Math.min(
    Math.max(
      Number(query.limit) || 10,
      1
    ),
    50
  );

  return {
    page,
    limit,
  };
};

const createInterviewController = async (
  req,
  res,
  next
) => {
  try {
    const interview = await createInterview({
      data: req.body,
      user: req.user,
    });

    return sendSuccess({
      res,
      statusCode: 201,
      message:
        "Interview scheduled successfully",
      data: {
        interview,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getInterviewByIdController = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const interview =
      await getInterviewById({
        interviewId: id,
        user: req.user,
      });

    return sendSuccess({
      res,
      statusCode: 200,
      message:
        "Interview fetched successfully",
      data: {
        interview,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMyCandidateInterviewsController =
  async (req, res, next) => {
    try {
      const query =
        req.validatedQuery ||
        req.query ||
        {};

      const {
        page,
        limit,
      } =
        getPaginationQuery(query);

      const result =
        await getMyCandidateInterviews({
          user: req.user,
          page,
          limit,
          status: query.status,
        });

      return sendSuccess({
        res,
        statusCode: 200,
        message:
          "Candidate interviews fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

const getMyInterviewerInterviewsController =
  async (req, res, next) => {
    try {
      const query =
        req.validatedQuery ||
        req.query || {};

      const {
        page,
        limit,
      } =
        getPaginationQuery(query);

      const result =
        await getMyInterviewerInterviews({
          user: req.user,
          page,
          limit,
          status: query.status,
          from: query.from,
          to: query.to,
        });

      return sendSuccess({
        res,
        statusCode: 200,
        message:
          "Assigned interviews fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

const getRecruiterInterviewsController =
  async (req, res, next) => {
    try {
      const query =
        req.validatedQuery ||
        req.query || {};

      const {
        page,
        limit,
      } =
        getPaginationQuery(query);

      const result =
        await getRecruiterInterviews({
          user: req.user,
          page,
          limit,
          status: query.status,
          jobId: query.jobId,
          applicationId: query.applicationId,
        });

      return sendSuccess({
        res,
        statusCode: 200,
        message:
          "Recruiter interviews fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

const updateInterviewController = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const interview =
      await updateInterview({
        interviewId: id,
        data: req.body,
        user: req.user,
      });

    return sendSuccess({
      res,
      statusCode: 200,
      message:
        "Interview updated successfully",
      data: {
        interview,
      },
    });
  } catch (error) {
    next(error);
  }
};

const rescheduleInterviewController =
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const interview =
        await rescheduleInterview({
          interviewId: id,
          data: req.body,
          user: req.user,
        });

      return sendSuccess({
        res,
        statusCode: 200,
        message:
          "Interview rescheduled successfully",
        data: {
          interview,
        },
      });
    } catch (error) {
      next(error);
    }
  };

const assignInterviewersController =
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const interview =
        await assignInterviewers({
          interviewId: id,
          interviewerIds:
            req.body.interviewerIds,
          user: req.user,
        });

      return sendSuccess({
        res,
        statusCode: 200,
        message:
          "Interviewers assigned successfully",
        data: {
          interview,
        },
      });
    } catch (error) {
      next(error);
    }
  };

const confirmInterviewController =
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const interview =
        await confirmInterview({
          interviewId: id,
          user: req.user,
        });

      return sendSuccess({
        res,
        statusCode: 200,
        message:
          "Interview confirmed successfully",
        data: {
          interview,
        },
      });
    } catch (error) {
      next(error);
    }
  };

const startInterviewController =
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const interview =
        await startInterview({
          interviewId: id,
          user: req.user,
        });

      return sendSuccess({
        res,
        statusCode: 200,
        message:
          "Interview started successfully",
        data: {
          interview,
        },
      });
    } catch (error) {
      next(error);
    }
  };

const completeInterviewController =
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const note = req.body?.note;

      const interview =
        await completeInterview({
          interviewId: id,
          user: req.user,
          note,
        });

      return sendSuccess({
        res,
        statusCode: 200,
        message:
          "Interview completed successfully",
        data: {
          interview,
        },
      });
    } catch (error) {
      next(error);
    }
  };

const cancelInterviewController =
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const reason =
        req.body?.reason;

      const interview =
        await cancelInterview({
          interviewId: id,
          user: req.user,
          reason,
        });

      return sendSuccess({
        res,
        statusCode: 200,
        message:
          "Interview cancelled successfully",
        data: {
          interview,
        },
      });
    } catch (error) {
      next(error);
    }
  };

const markInterviewNoShowController =
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const interview =
        await markInterviewNoShow({
          interviewId: id,
          user: req.user,
        });

      return sendSuccess({
        res,
        statusCode: 200,
        message:
          "Interview marked as no-show",
        data: {
          interview,
        },
      });
    } catch (error) {
      next(error);
    }
  };

const getAvailableInterviewersController =
  async (req, res, next) => {
    try {
      const { id } =
        req.params;

      const result =
        await getAvailableInterviewers({
          interviewId: id,
          user: req.user,
        });

      return sendSuccess({
        res,
        statusCode: 200,
        message:
          "Interviewer availability fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

const getInterviewCandidateProfileController =
  async (req, res, next) => {
    try {
      const { id } =
        req.params;

      const result =
        await getInterviewCandidateProfile({
          interviewId: id,
          user: req.user,
        });

      return sendSuccess({
        res,
        statusCode: 200,
        message:
          "Candidate profile fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

const getInterviewCandidateResumeController =
  async (req, res, next) => {
    try {
      const { id } =
        req.params;

      const result =
        await getInterviewCandidateResume({
          interviewId: id,
          user: req.user,
        });

      res.setHeader(
        "Content-Disposition",
        `inline; filename="${result.originalName}"`
      );

      return res.sendFile(
        result.filePath
      );
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  createInterviewController,

  getInterviewByIdController,

  getMyCandidateInterviewsController,
  getMyInterviewerInterviewsController,
  getRecruiterInterviewsController,

  getAvailableInterviewersController,
  getInterviewCandidateProfileController,
  getInterviewCandidateResumeController,

  updateInterviewController,
  rescheduleInterviewController,
  assignInterviewersController,

  confirmInterviewController,
  startInterviewController,
  completeInterviewController,
  cancelInterviewController,
  markInterviewNoShowController,
};
