import { Request } from "express";
import { FindOptions } from "sequelize";
import "module-alias/register";
import { LeaveType } from "@/domain-resource/ts-models";
import { QueryListResult, ErrorHandler } from "@/types/queryTypes";
import { ErrorDef } from "@/wf_common";
import { createWhereFormSearchable, createWhereFormFilter } from "@/helpers/dbHelper";
import BaseService from "../BaseService";

const sortable = ["id", "name", "exchange"];
const fillable = [
    "name",
    "explain",
    "exchange",
    "repetitions",
    "daysLimit",
    "repetition",
    "discount",
    "seniorityCond",
    "seniorityAddition",
    "posCond",
];

class MainService extends BaseService {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    constructor(req: Request) {
        super(req);
    }
    async getAll(): Promise<LeaveType[]> {
        return await LeaveType.findAll({
            attributes: ["id", "name"],
            order: [["id", "asc"]],
        });
    }

    async getList(str?: string, filter?: string[], options?: FindOptions<any>): Promise<QueryListResult<LeaveType>> {
        const whereSearch = createWhereFormSearchable(["name"], str);
        const whereFilter = createWhereFormFilter(sortable, filter);
        const where = { ...whereSearch, ...whereFilter };
        const result = await LeaveType.findAndCountAll({
            attributes: [...sortable, "explain", "discount"],
            offset: this.page.offset,
            limit: this.page.limit,
            where: where,
            ...options,
        });
        return result;
    }

    async getData(id: number): Promise<LeaveType | ErrorHandler> {
        return await LeaveType.findOne({
            where: {
                id,
            },
        }).then((result) => {
            if (result === null) {
                return {
                    status: "error",
                    code: ErrorDef.DataNotFound,
                };
            }
            return result;
        });
    }

    async createData(data: LeaveType): Promise<LeaveType> {
        const model = await LeaveType.build(data).save({ fields: fillable });
        return model;
    }

    async updateData(data: LeaveType): Promise<any> {
        return await LeaveType.findOne({
            where: {
                id: data.id,
            },
        }).then(async (model) => {
            await model.update(data, { fields: fillable });
        });
    }

    async deleteData(id: number): Promise<LeaveType> {
        return await LeaveType.findOne({
            where: {
                id: id,
            },
        }).then((model) => {
            return model.destroy().then(() => {
                return model;
            });
        });
    }
}
export { sortable };
export default MainService;
