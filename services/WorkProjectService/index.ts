import { Request } from "express";
import { Order } from "sequelize";
import "module-alias/register";
import { WorkProject } from "@/domain-resource/ts-models";
import { StdQueryListResult, ErrorHandler, ResponseHandler } from "@/types/queryTypes";
import { ErrorDef } from "@/wf_common";

import BaseService from "../BaseService";
const fillable = ["date", "project", "employee", "usetime", "detail"];
const editable = ["project", "usetime", "detail"];
const sortable = ["project", "usetime"];

/**
 * unused service?
 */
class WorkProjectService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    async getListData(attendanceId: number, orderData: Order): Promise<StdQueryListResult<WorkProject>> {
        return await WorkProject.findAndCountAll({
            attributes: ["detail", ...sortable],
            order: orderData,
            limit: this.page.limit,
            offset: this.page.offset,
            where: {
                attendanceId,
            },
        }).then((results) => {
            return {
                count: results.count,
                data: results.rows,
            };
        });
    }
    async getOne(id: number, employeeId: number): Promise<WorkProject | ErrorHandler> {
        return await WorkProject.findOne({
            where: {
                id: id,
                employee: employeeId,
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
    async createData(data: WorkProject): Promise<ResponseHandler<WorkProject> | ErrorHandler> {
        return await WorkProject.build(data)
            .save({ fields: fillable })
            .then((model) => {
                return { status: "ok", result: model };
            })
            .catch((error) => {
                return { status: "error", code: ErrorDef.ErrorTran, error: error };
            });
    }
    async updateData(id: number, employeeId: number, data: WorkProject): Promise<ResponseHandler<WorkProject>> {
        return await WorkProject.findOne({
            where: {
                id: id,
                employee: employeeId,
            },
        }).then(async (model) => {
            return await model.update(data, { fields: editable }).then((model) => {
                return { status: "ok", result: model };
            });
        });
    }
    async deleteData(id: number, employeeId: number): Promise<ResponseHandler<WorkProject>> {
        return await WorkProject.findOne({
            where: {
                id: id,
                employee: employeeId,
            },
        }).then(async (model) => {
            return await model.destroy().then(() => {
                return { status: "ok", result: model };
            });
        });
    }
}
export { sortable };
export default WorkProjectService;
