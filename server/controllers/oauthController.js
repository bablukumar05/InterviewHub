const User = require('../models/User');
const Organization = require('../models/Organization');
const CandidateProfile = require('../models/CandidateProfile');
const config = require('../config/env');
const { generateToken, getCookieOptions } = require('../utils/auth');

const googleAuth = (req, res) => {
  if (!config.googleClientId) {
    return res.redirect(
      `${config.clientUrl}/auth/callback?error=google_not_configured&message=${encodeURIComponent(
        'Google OAuth Client ID is not configured in server/.env. You can use Dev Social Login for testing.'
      )}`
    );
  }

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: config.googleCallbackUrl,
    client_id: config.googleClientId,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const qs = new URLSearchParams(options).toString();
  return res.redirect(`${rootUrl}?${qs}`);
};

const googleCallback = async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect(
      `${config.clientUrl}/auth/callback?error=${encodeURIComponent(
        error || 'Google login cancelled or failed'
      )}`
    );
  }

  try {

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: config.googleClientId,
        client_secret: config.googleClientSecret,
        redirect_uri: config.googleCallbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || 'Failed to exchange Google code');
    }

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profile = await profileResponse.json();

    if (!profile.email) {
      throw new Error('Google did not provide a valid email address');
    }

    const normalizedEmail = profile.email.trim().toLowerCase();
    const providerId = profile.sub;

    let user = await User.findOne({
      $or: [
        { provider: 'GOOGLE', providerId },
        { email: normalizedEmail },
      ],
    });

    let isNewCandidate = false;

    if (user) {

      if (user.provider === 'LOCAL') {
        user.provider = 'GOOGLE';
        user.providerId = providerId;
      }
      if (!user.avatar && profile.picture) {
        user.avatar = profile.picture;
      }
      user.isEmailVerified = true;
      user.lastLogin = new Date();
      await user.save();
    } else {

      isNewCandidate = true;
      user = await User.create({
        name: profile.name || 'Google User',
        firstName: profile.given_name || '',
        lastName: profile.family_name || '',
        email: normalizedEmail,
        avatar: profile.picture || '',
        provider: 'GOOGLE',
        providerId,
        role: 'CANDIDATE',
        isOnboarded: false,
        isEmailVerified: true,
        lastLogin: new Date(),
      });

      const candidateProfile = await CandidateProfile.create({
        userId: user._id,
        headline: '',
      });
      user.candidateProfileId = candidateProfile._id;
      await user.save();
    }

    const token = generateToken(user);
    res.cookie('token', token, getCookieOptions());

    const needsOnboarding = user.role === 'CANDIDATE' && !user.isOnboarded;
    return res.redirect(
      `${config.clientUrl}/auth/callback?token=${token}&isNewUser=${needsOnboarding}&role=${user.role}`
    );
  } catch (err) {
    console.error('[Google OAuth Error]:', err.message);
    return res.redirect(
      `${config.clientUrl}/auth/callback?error=${encodeURIComponent(err.message)}`
    );
  }
};

const githubAuth = (req, res) => {
  if (!config.githubClientId) {
    return res.redirect(
      `${config.clientUrl}/auth/callback?error=github_not_configured&message=${encodeURIComponent(
        'GitHub OAuth Client ID is not configured in server/.env. You can use Dev Social Login for testing.'
      )}`
    );
  }

  const rootUrl = 'https://github.com/login/oauth/authorize';
  const options = {
    client_id: config.githubClientId,
    redirect_uri: config.githubCallbackUrl,
    scope: 'read:user user:email',
  };

  const qs = new URLSearchParams(options).toString();
  return res.redirect(`${rootUrl}?${qs}`);
};

const githubCallback = async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect(
      `${config.clientUrl}/auth/callback?error=${encodeURIComponent(
        error || 'GitHub login cancelled or failed'
      )}`
    );
  }

  try {

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: config.githubClientId,
        client_secret: config.githubClientSecret,
        code,
        redirect_uri: config.githubCallbackUrl,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error(tokenData.error_description || 'Failed to exchange GitHub authorization code');
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'InterviewHub-Platform',
      },
    });

    const githubUser = await userResponse.json();

    let email = githubUser.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'InterviewHub-Platform',
        },
      });

      const emails = await emailResponse.json();
      const primaryEmail = emails.find((e) => e.primary && e.verified) || emails[0];
      if (primaryEmail) {
        email = primaryEmail.email;
      }
    }

    if (!email) {
      email = `${githubUser.login}@github.users.interviewhub.dev`;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const providerId = String(githubUser.id);

    let user = await User.findOne({
      $or: [
        { provider: 'GITHUB', providerId },
        { email: normalizedEmail },
      ],
    });

    let isNewCandidate = false;

    if (user) {
      if (user.provider === 'LOCAL') {
        user.provider = 'GITHUB';
        user.providerId = providerId;
      }
      if (!user.avatar && githubUser.avatar_url) {
        user.avatar = githubUser.avatar_url;
      }
      user.isEmailVerified = true;
      user.lastLogin = new Date();
      await user.save();
    } else {
      isNewCandidate = true;
      user = await User.create({
        name: githubUser.name || githubUser.login || 'GitHub User',
        email: normalizedEmail,
        avatar: githubUser.avatar_url || '',
        bio: githubUser.bio || '',
        provider: 'GITHUB',
        providerId,
        role: 'CANDIDATE',
        isOnboarded: false,
        isEmailVerified: true,
        lastLogin: new Date(),
      });

      const candidateProfile = await CandidateProfile.create({
        userId: user._id,
        headline: githubUser.bio || '',
        githubUrl: githubUser.html_url || `https://github.com/${githubUser.login}`,
      });
      user.candidateProfileId = candidateProfile._id;
      await user.save();
    }

    const token = generateToken(user);
    res.cookie('token', token, getCookieOptions());

    const needsOnboarding = user.role === 'CANDIDATE' && !user.isOnboarded;
    return res.redirect(
      `${config.clientUrl}/auth/callback?token=${token}&isNewUser=${needsOnboarding}&role=${user.role}`
    );
  } catch (err) {
    console.error('[GitHub OAuth Error]:', err.message);
    return res.redirect(
      `${config.clientUrl}/auth/callback?error=${encodeURIComponent(err.message)}`
    );
  }
};

const devSocialLogin = async (req, res, next) => {
  try {
    const { provider = 'GOOGLE' } = req.body;

    const validProviders = ['GOOGLE', 'GITHUB', 'LINKEDIN', 'TWITTER'];
    if (!validProviders.includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid social provider',
      });
    }

    const mockEmail = `dev.${provider.toLowerCase()}@interviewhub.dev`;
    const mockName = `Test ${provider.charAt(0) + provider.slice(1).toLowerCase()} User`;
    const mockId = `mock_${provider.toLowerCase()}_${Date.now()}`;

    let user = await User.findOne({ email: mockEmail });

    if (!user) {
      user = await User.create({
        name: mockName,
        email: mockEmail,
        provider,
        providerId: mockId,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${provider}`,
        role: 'CANDIDATE',
        isOnboarded: false,
        isEmailVerified: true,
        lastLogin: new Date(),
      });

      const profile = await CandidateProfile.create({
        userId: user._id,
        headline: 'Software Engineer',
      });
      user.candidateProfileId = profile._id;
      await user.save();
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    const token = generateToken(user);
    res.cookie('token', token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: `${provider} simulation login successful`,
      data: {
        token,
        isNewUser: !user.isOnboarded,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          provider: user.provider,
          avatar: user.avatar,
          isOnboarded: user.isOnboarded,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const completeCandidateOnboarding = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const {
      headline,
      skills,
      experienceYears,
      bio,
      location,
      preferredRole,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let profile = await CandidateProfile.findOne({ userId: user._id });
    if (!profile) {
      profile = new CandidateProfile({ userId: user._id });
    }

    if (headline) profile.headline = headline.trim();
    if (bio) profile.bio = bio.trim();
    if (location) profile.location = location.trim();
    if (preferredRole) profile.preferredRole = preferredRole.trim();
    if (portfolioUrl) profile.portfolioUrl = portfolioUrl.trim();
    if (githubUrl) profile.githubUrl = githubUrl.trim();
    if (linkedinUrl) profile.linkedinUrl = linkedinUrl.trim();
    if (Array.isArray(skills)) profile.skills = skills.map((s) => s.trim()).filter(Boolean);

    profile.calculateProfileCompletion();
    await profile.save();

    if (headline) user.title = headline.trim();
    if (bio) user.bio = bio.trim();
    if (experienceYears !== undefined) user.experienceYears = Number(experienceYears) || 0;
    if (Array.isArray(skills)) user.skills = profile.skills;
    user.candidateProfileId = profile._id;
    user.isOnboarded = true;

    await user.save();

    const token = generateToken(user);
    res.cookie('token', token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: 'Candidate profile onboarded successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          title: user.title,
          isOnboarded: user.isOnboarded,
          skills: user.skills,
        },
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
  devSocialLogin,
  completeCandidateOnboarding,
};
