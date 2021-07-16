import { Request } from "express";
import BaseService from "../BaseService";
import "module-alias/register";
import { BankCode } from "@/common-database/ts-models";

class BankcodeService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    public async getBankCodeList(): Promise<BankCode[]> {
        return await BankCode.findAll({});
    }
}

export default BankcodeService;
