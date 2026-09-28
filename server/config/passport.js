const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: GitHubStrategy } = require('passport-github2');
const config = require('./env');
const { createOrLinkOAuthUser } = require('../services/oauthService');
const User = require('../models/User');

const googleClientId = process.env.GOOGLE_CLIENT_ID || config.googleClientId;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || config.googleClientSecret;
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL || config.googleCallbackUrl;

if (googleClientId && googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;

          const emailVerified =
            profile.emails?.[0]?.verified === true ||
            profile._json?.email_verified === true ||
            profile._json?.email_verified === 'true' ||
            Boolean(email);

          const user = await createOrLinkOAuthUser({
            provider: 'GOOGLE',
            providerId: profile.id,
            name: profile.displayName,
            email,
            avatar: profile.photos?.[0]?.value || '',
            emailVerified,
          });

          return done(null, user);
        } catch (error) {
          console.error('[Passport Google Strategy Error]:', error);
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn(
    '[Passport Warning]: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured in server/.env. Passport Google OAuth strategy is inactive until credentials are provided.'
  );
}

const githubClientId = process.env.GITHUB_CLIENT_ID || config.githubClientId;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET || config.githubClientSecret;
const githubCallbackUrl = process.env.GITHUB_CALLBACK_URL || config.githubCallbackUrl;

if (githubClientId && githubClientSecret) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: githubClientId,
        clientSecret: githubClientSecret,
        callbackURL: githubCallbackUrl,
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const primaryEmail =
            profile.emails?.find((item) => item.primary) ||
            profile.emails?.[0];

          const email = primaryEmail?.value;
          const emailVerified =
            primaryEmail?.verified === true ||
            Boolean(email);

          const user = await createOrLinkOAuthUser({
            provider: 'GITHUB',
            providerId: profile.id,
            name: profile.displayName || profile.username,
            email,
            avatar: profile.photos?.[0]?.value || '',
            emailVerified,
          });

          return done(null, user);
        } catch (error) {
          console.error('[Passport GitHub Strategy Error]:', error);
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn(
    '[Passport Warning]: GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET not configured in server/.env. Passport GitHub OAuth strategy is inactive until credentials are provided.'
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id || user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
