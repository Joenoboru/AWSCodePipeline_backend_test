import { Request } from "express";
import { FindOptions } from "sequelize";
import "module-alias/register";
import { DeputyData } from "@/domain-resource/ts-models";
import { QueryListResult } from "@/types/queryTypes";
import BaseService from "../BaseService";
import { sortable, fillable } from "./fieldSetting";

class DeputyService extends BaseService {
    private DeputyData: any;
    readonly fillable: string[] = fillable;
    readonly sortable: string[] = sortable;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    constructor(req: Request) {
        super(req);
    }

    async createData(data: DeputyData): Promise<DeputyData> {
        const model = await DeputyData.build(data).save({ fields: fillable });
        return model;
    }

    async updateData(data: DeputyData): Promise<DeputyData> {
        return await DeputyData.findOne({
            where: {
                empId: data.empId,
                seqNo: data.seqNo,
                deputyId: data.deputyId,
            },
        }).then(async (model) => {
            return await model.update(data, { fields: fillable });
        });
    }

    async deleteData(empId: number, deputyId: number, seqNo: number): Promise<DeputyData> {
        return await DeputyData.findOne({
            where: {
                empId: empId,
                seqNo: seqNo,
                deputyId: deputyId,
            },
        }).then(async (model) => {
            return await model.destroy().then(() => {
                return model;
            });
        });
    }
    async getDataByEmp(empId: number, otherOptions: FindOptions<any> = {}): Promise<QueryListResult<DeputyData>> {
        return await DeputyData.findAndCountAll({
            attributes: sortable,
            where: {
                empId: empId,
            },
            ...otherOptions,
        }).then((results) => {
            return results;
        });
    }

    async getData(empId: number, seqNo: number): Promise<DeputyData> {
        return await DeputyData.findOne({
            where: {
                empId: empId,
                seqNo: seqNo,
            },
        }).then((result) => {
            return result;
        });
    }

    async getLastSeqNo(empId: number): Promise<number> {
        return await DeputyData.findOne({
            attributes: ["seqNo"],
            where: {
                empId: empId,
            },
            order: [["seqNo", "DESC"]],
        }).then((result) => {
            if (result) {
                return result.seqNo + 1;
            } else {
                return 1;
            }
        });
    }
}
export { sortable };
export default DeputyService;
