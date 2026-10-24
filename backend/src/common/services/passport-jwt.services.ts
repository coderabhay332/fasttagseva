import bcrypt from "bcrypt";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import { type IUser } from "../../user/user.dto";
import * as userService from "../../user/user.service";
import UserSchema from "../../user/user.schema";
import { loadConfig } from "../helper/config.helper";

loadConfig();

const isValidPassword = async function (value: string, password: string) {
  const compare = await bcrypt.compare(value, password);
  return compare;
};

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // Access tokens are signed with JWT_ACCESS_SECRET in createUserTokens.
  secretOrKey: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'default_secret',
};

export const initPassport = () => {
  passport.use(
    new JwtStrategy(options, async (jwtPayload: any, done: any) => {
      try {
        // Tokens carry the user id under `_id` (see createUserTokens).
        // Fall back to `id` for backward compatibility with older tokens.
        const userId = jwtPayload?._id ?? jwtPayload?.id;
        if (!userId) {
          console.error("No user ID in JWT payload");
          return done(null, false);
        }

        const user = await UserSchema.findById(userId).select("-password");

        if (user) {
          return done(null, user);
        }
        console.error("No user found for ID:", userId);
        return done(null, false);
      } catch (error) {
        console.error("Passport JWT Error:", error);
        return done(error, false);
      }
    })
  );

  // user login
  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await userService.getUserByEmail(email, true);
          if (user == null) {
            done(createError(401, "Invalid email or password"), false);
            return;
          }

          const validate = await isValidPassword(password, user.password);
          if (!validate) {
            done(createError(401, "Invalid email or password"), false);
            return;
          }
          const { password: _p, ...result } = user;
          const userResult = { ...result, password: user.password }; // Ensure the password is included
          done(null, userResult, { message: "Logged in Successfully" });
        } catch (error: any) {
          done(createError(500, error.message));
        }
      }
    )
  );
};

export const createUserTokens = (user: IUser) => {
  const accessTokenSecret = process.env.JWT_ACCESS_SECRET ?? '';
  const refreshTokenSecret = process.env.JWT_REFRESH_SECRET ?? '';

  const payload = {
    _id: user._id,     
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, accessTokenSecret, { expiresIn: '1d' });
  const refreshToken = jwt.sign(payload, refreshTokenSecret, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};


export const decodeToken = (token: string) => {
  const decode = jwt.decode(token);
  return decode as IUser;
};