import { Request } from "express";
import { Strategy as GoogleStrategy, VerifyCallback } from "passport-google-oauth2";
import { PassportStatic } from "passport";
import { Op } from "sequelize";
import { User, UsePermission } from "../common-database/ts-models";

function googleStrategy(passport: PassportStatic): void {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK,
                passReqToCallback: true,
            },
            (request: Request, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) => {
                // console.log(accessToken, refreshToken, profile);
                /**
                 * TODO 沒有使用者可以建立使用者
                 * 如果是沒有權限的用戶可以擋在外面
                 * 必須要先開通才能夠做操作
                 */
                const today = new Date();
                const user = profile._json;
                if (!user.domain) {
                    User.findOne({ where: { email: user.email }, attributes: ["domain"] }).then((result) => {
                        if (result) {
                            user.accessToken = accessToken;
                            user.strategy = "Google";
                            user.domain = result.domain;
                            user.isPrivate = true;
                            return done(null, user);
                        } else {
                            done(null, null);
                        }
                    });
                } else {
                    UsePermission.findOne({
                        where: {
                            domain: user.domain,
                            from: {
                                [Op.lt]: today,
                            },
                            until: {
                                [Op.gte]: today,
                            },
                        },
                    }).then((result) => {
                        if (result) {
                            user.accessToken = accessToken;
                            user.strategy = "Google";
                            return done(null, user);
                        } else {
                            done(null, null);
                        }
                    });
                }
            }
        )
    );
}

export default googleStrategy;
