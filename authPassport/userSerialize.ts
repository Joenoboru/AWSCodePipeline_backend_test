import { PassportStatic } from "passport";
import { UsePermission } from "../common-database/ts-models";
import { Employee } from "../domain-resource/ts-models";
import getDomainDatabase from '../domain-resource'
import { StandardUser } from "../types";

function userSerialize(passport: PassportStatic): void {
    passport.serializeUser(function (user, done) {
        // 只將用戶 id 序列化存到 session 中
        // console.log(user);
        done(null, { ...user });
    });
    passport.deserializeUser(function (user: StandardUser, done) {
        // 透過使用者 id 到 DB 資料庫尋找用戶完整資訊
        // console.log(user);
        getDomainDatabase(user.domain);
        const where = {
            email: user.email,
            status: 1,
        };
        Employee.findOne({
            attributes: ["id"],
            where,
            raw: true,
        }).then((employee) => {
            UsePermission.findOne({
                attributes: ["logo", "name", "id"],
                where: {
                    domain: user.domain,
                },
                raw: true,
            }).then((permission) => {
                const userInfo: StandardUser = {
                    email: user.email,
                    name: user.name,
                    picture: user.picture,
                    UsePermission: permission,
                    domain: user.domain,
                    employeeId: employee ? employee.id : undefined,
                    strategy: user.strategy,
                };
                done(null, userInfo);
            });
        });
    });
}

export default userSerialize;
