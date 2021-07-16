import { Strategy as LocalStrategy } from "passport-local";
import { PassportStatic } from "passport";
import SHA256 from "crypto-js/sha256";
import { User } from "../common-database/ts-models";

function localStrategy(passport: PassportStatic):void {
    passport.use(
        new LocalStrategy(
            {
                // 改以名為 email 的欄位資訊作為帳號
                usernameField: "email",
                // 改以名為 passwd 的欄位資訊作為密碼
                passwordField: "pass",
            },
            // Verify Callback
            function (email, passwd, done) {
                const usn = email;
                const pass = SHA256(passwd).toString();
                //db
                User.findOne({
                    where: {
                        email: usn,
                        pass: pass,
                    },
                    raw: true,
                }).then((user) => {
                    if (user === null) {
                        return done(102, null);
                    } else {
                        const mUser = user as UserWithStrategy;
                        mUser.strategy = "Local";
                        return done(null, mUser);
                    }
                });
            }
        )
    );
}

export interface UserWithStrategy extends User {
    strategy?: string;
}

export default localStrategy;
