import { Request } from "express";
import "module-alias/register";
import { SalaryDef, Employee } from "@/domain-resource/ts-models";
import { ErrorDef } from "@/wf_common";
import { ErrorHandler, ResponseHandler } from "@/types/queryTypes";
import BaseService from "../BaseService";

class SalarydefService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    public async updateSalaryDef(
        workLevel: number,
        defs: SalaryDef[],
        employee: number
    ): Promise<ErrorHandler | ResponseHandler> {
        const { sequelize } = this.domainDBResource;
        defs.forEach((def) => {
            def.employee = employee;
        });
        return await new Promise((resolve) => {
            sequelize.transaction(async (transaction) => {
                try {
                    await Employee.update({ workLevel: workLevel }, { where: { id: employee }, transaction });
                    await SalaryDef.destroy({ where: { employee: employee }, transaction });
                    await SalaryDef.bulkCreate(defs, { transaction });
                    resolve({ status: "ok" });
                } catch (error) {
                    resolve({ status: "error", code: ErrorDef.ErrorTran, error: error });
                }
            });
        });
    }
}

export default SalarydefService;
