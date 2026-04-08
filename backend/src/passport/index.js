import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GithubStrategy } from "passport-github2";
import User from "../model/user.model.js";
import ApiError from "../utils/ApiError.js";
import { userLoginType, userRoleEnum } from "../constant.js";


passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    if (!id) return done(null, false);

    const user = await User.findById(id);
    return done(null, user || false);
  } catch (error) {
    return done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(
            new ApiError(400, "Google account does not have an email"),
            null
          );
        }

        let user = await User.findOne({ email });

        // User exists
        if (user) {
          if (user.loginType !== userLoginType.GOOGLE) {
            return done(
              new ApiError(
                400,
                `You previously registered using ${user.loginType
                  .toLowerCase()
                  .replace("_", " ")}. Please use that login method.`
              ),
              null
            );
          }
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          email,
          username: email.split("@")[0].replace(/[^a-zA-Z]/g, ''),
          password: profile.id, // or crypto.randomUUID()
          isEmailVerified: true,
          role: userRoleEnum.USER,
          avatar: profile.photos?.[0]?.value,
          loginType: userLoginType.GOOGLE,
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);



passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        

        if (!email) {
          return done(
            new ApiError(
              400,
              "GitHub account does not have a public email"
            ),
            null
          );
        }

        let user = await User.findOne({ email });

        if (user) {
          if (user.loginType !== userLoginType.GITHUB) {
            return done(
              new ApiError(
                400,
                `You previously registered using ${user.loginType
                  .toLowerCase()
                  .replace("_", " ")}. Please use that login method.`
              ),
              null
            );
          }
          return done(null, user);
        }

        const usernameExists = await User.findOne({
          username: profile.username,
        });



        user = await User.create({
          email,
          username: usernameExists
            ? email.split("@")[0]
            : profile.username,
          password: profile.id,
          isEmailVerified: true,
          role: userRoleEnum.USER,
          avatar: profile.photos?.[0]?.value,
          loginType: userLoginType.GITHUB,
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
