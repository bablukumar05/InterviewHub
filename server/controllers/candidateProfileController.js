const {
  getMyProfile,
  createProfile,
  updateProfile,
  uploadResume,
  deleteResume,
  getProfileById,
} = require('../services/candidateProfileService');

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMyProfile(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Candidate profile fetched successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const createCandidateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await createProfile(
      userId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: 'Candidate profile created successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const updateCandidateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await updateProfile(
      userId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Candidate profile updated successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const uploadCandidateResume = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await uploadResume(userId, req.file);

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resumeUrl: profile.resumeUrl,
        resumeOriginalName: profile.resumeOriginalName,
        resumeSize: profile.resumeSize,
        profileCompletion: profile.profileCompletion,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteCandidateResume = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await deleteResume(userId);
    return res.status(200).json({
      success: true,
      message: 'Resume removed successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const getCandidateProfileById = async (req, res, next) => {
  try {
    const profile = await getProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found',
        data: null,
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Candidate profile fetched successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  createCandidateProfile,
  updateCandidateProfile,
  uploadResume: uploadCandidateResume,
  deleteResume: deleteCandidateResume,
  getProfileById: getCandidateProfileById,

  getMyProfile: getProfile,
  updateMyProfile: updateCandidateProfile,
};
