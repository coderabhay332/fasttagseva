import bcrypt from "bcrypt";
import {} from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import passport from "passport";
import { ExtractJwt, Strategy, Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import {} from "../../user/user.dto";
import * as userService from "../../user/user.service";
import UserSchema from "../../user/user.schema";
import { loadConfig } from "../helper/config.helper";
loadConfig();
const isValidPassword = async function (value, password) {
    const compare = await bcrypt.compare(value, password);
    return compare;
};
const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'default_secret',
};
export const initPassport = () => {
    passport.use(new Strategy({
        secretOrKey: process.env.JWT_ACCESS_SECRET || "default_secret",
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    }, async (token, done) => {
        try {
            if (!token) {
                return done(createError(401, "Token missing"));
            }
            // Check token structure
            done(null, token); // Pass the token to req.user
        }
        catch (error) {
            done(error);
        }
    }));
    passport.use(new JwtStrategy(options, async (jwtPayload, done) => {
        try {
            console.log("JWT Payload received:", jwtPayload);
            if (!jwtPayload.id) {
                console.error("No user ID in JWT payload");
                return done(null, false);
            }
            const user = await UserSchema.findById(jwtPayload.id).select("-password");
            console.log("User lookup result:", user?._id);
            if (user) {
                return done(null, user);
            }
            console.error("No user found for ID:", jwtPayload.id);
            return done(null, false);
        }
        catch (error) {
            console.error("Passport JWT Error:", error);
            return done(error, false);
        }
    }));
    // user login
    passport.use("login", new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
    }, async (email, password, done) => {
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
        }
        catch (error) {
            done(createError(500, error.message));
        }
    }));
};
export const createUserTokens = (user) => {
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
export const decodeToken = (token) => {
    const decode = jwt.decode(token);
    return decode;
};
//# sourceMappingURL=passport-jwt.services.js.map