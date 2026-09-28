const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');

const createOrLinkOAuthUser = async ({
  provider,
  providerId,
  name,
  email,
  avatar,
  emailVerified,
}) => {
  if (!email) {
    throw new Error(`${provider} account email is not available`);
  }

  if (!emailVerified) {
    throw new Error(`${provider} email must be verified`);
  }

  const normalizedEmail = email.trim().toLowerCase();

  let user = await User.findOne({
    provider,
    providerId,
  });

  if (user) {
    user.lastLogin = new Date();

    if (avatar) {
      user.avatar = avatar;
    }

    await user.save();

    return user;
  }

  user = await User.findOne({
    email: normalizedEmail,
  });

  if (user) {
    user.provider = provider;
    user.providerId = providerId;

    if (avatar) {
      user.avatar = avatar;
    }

    user.isEmailVerified = true;
    user.lastLogin = new Date();

    await user.save();

    return user;
  }

  user = await User.create({
    name: name || 'InterviewHub User',
    email: normalizedEmail,
    provider,
    providerId,
    avatar: avatar || '',
    role: 'CANDIDATE',
    isOnboarded: false,
    isEmailVerified: true,
    isActive: true,
    lastLogin: new Date(),
  });

  const candidateProfile = await CandidateProfile.create({
    userId: user._id,
    headline: '',
  });
  user.candidateProfileId = candidateProfile._id;
  await user.save();

  return user;
};

const findOrCreateGoogleUser = async (profile) => {
  const emailObj = profile.emails?.[0];
  const emailVerified =
    emailObj?.verified === true ||
    profile._json?.email_verified === true ||
    profile._json?.email_verified === 'true' ||
    Boolean(emailObj?.value);

  return createOrLinkOAuthUser({
    provider: 'GOOGLE',
    providerId: profile.id,
    name: profile.displayName,
    email: emailObj?.value,
    avatar: profile.photos?.[0]?.value || '',
    emailVerified,
  });
};

const findOrCreateGitHubUser = async (profile) => {
  const primaryEmail =
    profile.emails?.find((item) => item.primary) || profile.emails?.[0];
  const emailVerified =
    primaryEmail?.verified === true || Boolean(primaryEmail?.value);

  return createOrLinkOAuthUser({
    provider: 'GITHUB',
    providerId: profile.id,
    name: profile.displayName || profile.username,
    email: primaryEmail?.value,
    avatar: profile.photos?.[0]?.value || '',
    emailVerified,
  });
};

module.exports = {
  createOrLinkOAuthUser,
  findOrCreateGoogleUser,
  findOrCreateGitHubUser,
};
