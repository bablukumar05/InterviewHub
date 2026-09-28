const path = require('path');
const fs = require('fs');
const CandidateProfile = require('../models/CandidateProfile');
const User = require('../models/User');

const getMyProfile = async (userId) => {
  const profile = await CandidateProfile.findOne({
    userId,
  })
    .populate('userId', 'name email phone avatar bio title skills resumeUrl')
    .lean();

  if (!profile) {
    return null;
  }

  return profile;
};

const createProfile = async (userId, profileData = {}) => {

  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  if (user.role !== 'CANDIDATE') {
    throw new Error('Only candidates can create a candidate profile');
  }

  const existingProfile = await CandidateProfile.findOne({
    userId,
  });

  if (existingProfile) {
    const error = new Error('Candidate profile already exists');
    error.statusCode = 409;
    throw error;
  }

  const profile = await CandidateProfile.create({
    userId,

    organizationId: user.organizationId || undefined,

    headline: profileData.headline || '',

    bio: profileData.bio || '',

    phone: profileData.phone || '',

    location: profileData.location || '',

    dateOfBirth: profileData.dateOfBirth || undefined,

    skills: Array.isArray(profileData.skills) ? profileData.skills : [],

    education: Array.isArray(profileData.education) ? profileData.education : [],

    experience: Array.isArray(profileData.experience) ? profileData.experience : [],

    certifications: Array.isArray(profileData.certifications) ? profileData.certifications : [],

    portfolioUrl: profileData.portfolioUrl || '',

    githubUrl: profileData.githubUrl || '',

    linkedinUrl: profileData.linkedinUrl || '',

    salaryExpectation: profileData.salaryExpectation || undefined,

    preferredRole: profileData.preferredRole || '',

    expectedSalary: profileData.expectedSalary || 0,

    noticePeriodDays: profileData.noticePeriodDays ?? 30,
  });

  user.candidateProfileId = profile._id;

  if (profile.phone) {
    user.phone = profile.phone;
  }

  if (profile.bio) {
    user.bio = profile.bio;
  }

  if (profile.headline) {
    user.title = profile.headline;
  }

  if (profile.skills?.length) {
    user.skills = profile.skills;
  }

  await user.save();

  return profile;
};

const updateProfile = async (userId, profileData = {}) => {

  let profile = await CandidateProfile.findOne({
    userId,
  });

  if (!profile) {
    const error = new Error('Candidate profile not found');
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = [
    'headline',
    'bio',
    'phone',
    'location',
    'dateOfBirth',
    'skills',
    'education',
    'experience',
    'certifications',
    'portfolioUrl',
    'githubUrl',
    'linkedinUrl',
    'salaryExpectation',
    'preferredRole',
    'expectedSalary',
    'noticePeriodDays',
  ];

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(profileData, field)) {
      profile[field] = profileData[field];
    }
  });

  await profile.save();

  const user = await User.findById(userId);

  if (user) {
    user.candidateProfileId = profile._id;

    if (profile.phone !== undefined) {
      user.phone = profile.phone;
    }

    if (profile.bio !== undefined) {
      user.bio = profile.bio;
    }

    if (profile.headline !== undefined) {
      user.title = profile.headline;
    }

    if (profile.skills !== undefined) {
      user.skills = profile.skills;
    }

    if (profile.resumeUrl) {
      user.resumeUrl = profile.resumeUrl;
    }

    await user.save();
  }

  return profile;
};

const uploadResume = async (userId, file) => {
  if (!file) {
    const error = new Error('Resume file is required');
    error.statusCode = 400;
    throw error;
  }

  const profile = await CandidateProfile.findOne({
    userId,
  });

  if (!profile) {
    const error = new Error(
      'Candidate profile not found. Create your profile first.'
    );
    error.statusCode = 404;
    throw error;
  }

  const oldResumeUrl = profile.resumeUrl;

  const resumeUrl = `/uploads/resumes/${file.filename}`;

  profile.resumeUrl = resumeUrl;
  profile.resumeOriginalName = file.originalname;
  profile.resumeSize = file.size;

  await profile.save();

  const user = await User.findById(userId);

  if (user) {
    user.candidateProfileId = profile._id;
    user.resumeUrl = resumeUrl;
    await user.save();
  }

  if (oldResumeUrl && oldResumeUrl !== resumeUrl) {
    const oldFileName = path.basename(oldResumeUrl);
    const oldFilePath = path.join(
      __dirname,
      '../uploads/resumes',
      oldFileName
    );

    fs.unlink(oldFilePath, (error) => {
      if (error && error.code !== 'ENOENT') {
        console.error('Failed to remove old resume:', error.message);
      }
    });
  }

  return profile;
};

const deleteResume = async (userId) => {
  const profile = await CandidateProfile.findOne({ userId });
  if (!profile) {
    throw new Error('Candidate profile not found');
  }

  if (profile.resumeUrl) {
    try {
      const fileName = path.basename(profile.resumeUrl);
      const filePathInResumes = path.resolve(__dirname, '../uploads/resumes', fileName);
      const filePathInRoot = path.resolve(__dirname, '../uploads', fileName);

      if (fs.existsSync(filePathInResumes)) {
        fs.unlinkSync(filePathInResumes);
      } else if (fs.existsSync(filePathInRoot)) {
        fs.unlinkSync(filePathInRoot);
      }
    } catch (err) {
      console.warn('Could not delete resume file:', err.message);
    }
  }

  profile.resumeUrl = '';
  profile.resumeOriginalName = '';
  profile.resumeSize = 0;

  await profile.save();

  const user = await User.findById(userId);
  if (user) {
    user.resumeUrl = '';
    await user.save();
  }

  return profile;
};

const getProfileById = async (id) => {
  return await CandidateProfile.findById(id).populate(
    'userId',
    'name email phone avatar bio title skills resumeUrl'
  );
};

module.exports = {
  getMyProfile,
  createProfile,
  updateProfile,
  uploadResume,
  deleteResume,
  getProfileById,
  getProfileByUserId: getMyProfile,
};
