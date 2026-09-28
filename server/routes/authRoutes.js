const express = require('express');
const passport = require('../config/passport');
const config = require('../config/env');
const { generateToken, getCookieOptions } = require('../utils/auth');
const {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  updatePassword,
} = require('../controllers/authController');
const {
  githubAuth,
  githubCallback,
  devSocialLogin,
  completeCandidateOnboarding,
} = require('../controllers/oauthController');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', logout);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

router.get('/google', (req, res, next) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID || config.googleClientId;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || config.googleClientSecret;

  if (!googleClientId || !googleClientSecret) {
    return res.status(503).json({
      success: false,
      message:
        'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server/.env.',
    });
  }

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID || config.googleClientId;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || config.googleClientSecret;

    if (!googleClientId || !googleClientSecret) {
      return res.redirect(
        `${config.clientUrl}/auth/callback?error=google_not_configured&message=${encodeURIComponent(
          'Google OAuth credentials not configured in server/.env'
        )}`
      );
    }

    passport.authenticate('google', {
      session: false,
      failureRedirect: `${config.clientUrl}/login?error=google_auth_failed`,
    })(req, res, next);
  },
  (req, res) => {
    console.log('Google authentication successful');
    console.log(req.user);

    const token = generateToken(req.user);
    res.cookie('token', token, getCookieOptions());

    const isNewUser = req.user.role === 'CANDIDATE' && !req.user.isOnboarded;

    return res.redirect(
      `${config.clientUrl}/oauth-success?token=${token}&isNewUser=${isNewUser}&role=${req.user.role}`
    );
  }
);

router.get('/github', (req, res, next) => {
  const githubClientId = process.env.GITHUB_CLIENT_ID || config.githubClientId;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET || config.githubClientSecret;

  if (!githubClientId || !githubClientSecret) {
    return res.status(503).json({
      success: false,
      message:
        'GitHub OAuth is not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in server/.env.',
    });
  }

  passport.authenticate('github', {
    scope: ['user:email'],
  })(req, res, next);
});

router.get(
  '/github/callback',
  (req, res, next) => {
    const githubClientId = process.env.GITHUB_CLIENT_ID || config.githubClientId;
    const githubClientSecret = process.env.GITHUB_CLIENT_SECRET || config.githubClientSecret;

    if (!githubClientId || !githubClientSecret) {
      return res.redirect(
        `${config.clientUrl}/login?error=github_not_configured`
      );
    }

    passport.authenticate('github', {
      session: false,
      failureRedirect: `${config.clientUrl}/login?error=github_auth_failed`,
    })(req, res, next);
  },
  (req, res) => {
    console.log('GitHub authentication successful');
    console.log(req.user);

    const token = generateToken(req.user);

    res.cookie('token', token, getCookieOptions());

    res.redirect(
      `${config.clientUrl}/oauth-success?token=${token}&role=${req.user.role}`
    );
  }
);

router.post('/dev-social', devSocialLogin);

router.put('/onboarding', protect, completeCandidateOnboarding);
router.put('/candidate-onboarding', protect, completeCandidateOnboarding);
router.put('/select-role', protect, completeCandidateOnboarding);

module.exports = router;
