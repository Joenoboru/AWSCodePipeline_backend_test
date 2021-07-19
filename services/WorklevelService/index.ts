import { Order, literal } from "sequelize";
import { Request } from "express";
import "module-alias/register";
import { createQueryAll, updateData, deleteData } from "@/helpers/dbHelper";
import { WorkLevel } from "@/domain-resource/ts-models";
import BaseService from "../BaseService";

//const { validationResult } = require("express-validator");
const fillable = ["name", "rmk", "status", "cost", "isHirer"];
const usedCountQuery = "( SELECT COUNT(*) FROM `employees` WHERE `work_level` = `worklevel_id`)";

class WorklevelService extends BaseService {
    constructor(req: Request) {
        super(req);
    }

    async getAll(): Promise<WorkLevel[]> {
        return createQueryAll(WorkLevel, ["id", "name"], { where: { status: 1 }, order: [["name", "asc"]] });
    }

    async getList(order: Order): Promise<{ rows: WorkLevel[]; count: number }> {
        const unsetedCountQuery =
            "(SELECT (SELECT COUNT(*) FROM `salary_items` WHERE `wl_only` = 1) - (SELECT COUNT(*) FROM `salarylvs` WHERE `level` = `worklevel_id`))";
        const result = WorkLevel.findAndCountAll({
            attributes: {
                include: [
                    [literal(usedCountQuery), "usedcount"],
                    [literal(unsetedCountQuery), "unsetedCount"],
                ],
            },
            order: order,
            offset: this.page.offset,
            limit: this.page.limit,
        });
        return result;
    }

    async getData(id: number): Promise<WorkLevel> {
        const result = WorkLevel.findOne({
            attributes: {
                include: [[literal(usedCountQuery), "usedcount"]],
            },
            where: {
                id,
            },
        });
        return result;
    }
    async createData(data: WorkLevel): Promise<WorkLevel> {
        const model = await WorkLevel.build(data).save({ fields: fillable });
        return model;
    }

    async updateData(data: WorkLevel): Promise<WorkLevel> {
        return updateData(WorkLevel, fillable, data, { id: data.id });
    }

    async deleteData(id: number): Promise<WorkLevel> {
        return deleteData(WorkLevel, { id });
    }
}
export default WorklevelService;
