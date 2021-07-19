import { Request } from "express";
import SHA256 from "crypto-js/sha256";
import "module-alias/register";
import { User } from "@/common-database/ts-models";
import { ErrorDef } from "@/wf_common";

import BaseService from "../BaseService";
class UserService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    public async changePassword(data: ChangePasswordAttrs): Promise<string> {
        const { oldPassword, newPassword } = data;
        const pass = SHA256(oldPassword).toString();
        const user = await User.findOne({
            where: {
                email: this.req.user.email,
            },
        });
        if (user === null) {
            throw ErrorDef.USER_NOT_FOUND;
        }
        if (user.pass !== pass) {
            throw ErrorDef.USER_PASSWORD_ERROR;
        } else {
            user.update({ pass: SHA256(newPassword).toString() });
            return "";
        }
    }
}

export interface ChangePasswordAttrs {
    oldPassword: string;
    newPassword: string;
}

export default UserService;
