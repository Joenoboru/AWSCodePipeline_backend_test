import { Request } from "express";
import "module-alias/register";
import { SalaryLv, SalaryItem, WorkLevel } from "@/domain-resource/ts-models";
import { ErrorDef } from "@/wf_common";
import { StdQueryListResult, ResponseHandler, ErrorHandler } from "@/types/queryTypes";
import ProcessService from "../BaseService";

const editable = ["amount", "rmk"];
const fillable = ["level", "item", "amount", "rmk"];

class MainService extends ProcessService {
    constructor(req: Request) {
        super(req);
    }
    async getOne(id: number): Promise<StdQueryListResult<any>> {
        const results = await SalaryItem.findAndCountAll({
            attributes: [["salary_item_id", "item"], "name", "chname", "payment_type"],
            order: [
                ["payment_type", "asc"],
                ["order", "asc"],
            ],
            where: {
                wl_only: 1,
            },
            include: { model: SalaryLv, where: { level: id }, attributes: ["id", "amount", "rmk"], required: false },
        });
        const mData = results.rows.map((row) => {
            const rowObj = row.toJSON() as any;
            let mRow = { ...rowObj };
            delete mRow.SalaryLvs;
            if (rowObj.SalaryLvs.length > 0) {
                mRow = {
                    ...mRow,
                    ...rowObj.SalaryLvs[0],
                };
            }
            return mRow;
        });
        return {
            count: results.count,
            data: mData,
        };
    }

    async deleteSIData(id: number, body: any): Promise<ResponseHandler<SalaryLv> | ErrorHandler> {
        return await SalaryLv.findOne({
            where: {
                item: id,
                level: body.data.level,
            },
        }).then(async (model) => {
            if (model === null) {
                return {
                    status: "error",
                    code: ErrorDef.DataNotFound,
                };
            }
            return await model.destroy().then(() => {
                return { status: "ok", result: model };
            });
        });
    }
    async updateSIData(id: number, body: SalaryLv): Promise<ResponseHandler<SalaryLv> | ErrorHandler> {
        if (!body.id) {
            return this.createSIData(id, body);
        }
        return await SalaryItem.findOne({
            where: {
                id: id,
            },
        }).then(async (result) => {
            if (result === null) {
                return {
                    status: "error",
                    code: ErrorDef.DataNotFound,
                };
            }
            return await SalaryLv.findAll({
                where: {
                    item: id,
                    level: body.level,
                },
            }).then(async (result2) => {
                if (result2.length > 0) {
                    return await result2[0].update(body, { fields: editable }).then((model) => {
                        return { status: "ok", result: model };
                    });
                } else {
                    return {
                        status: "error",
                        code: ErrorDef.DataNotFound,
                    };
                }
            });
        });
    }
    async createSIData(id: number, data: SalaryLv): Promise<ResponseHandler<SalaryLv> | ErrorHandler> {
        data.item = id;
        return await SalaryItem.findOne({
            where: {
                id: id,
            },
        }).then(async (result) => {
            if (result === null) {
                return {
                    status: "error",
                    code: ErrorDef.DataNotFound,
                };
            }

            return await SalaryLv.build(data)
                .save({ fields: fillable })
                .then((model) => {
                    return { status: "ok", result: model };
                })
                .catch((error) => {
                    return { status: "error", code: ErrorDef.ErrorTran, error: error };
                });
        });
    }
    async getSIData(id: number): Promise<StdQueryListResult<any>> {
        const results = await WorkLevel.findAndCountAll({
            attributes: [["worklevel_id", "level"], "name"],
            order: [["name", "asc"]],
            where: { status: 1 },
            include: { model: SalaryLv, where: { item: id }, attributes: ["id", "amount", "rmk"], required: false },
        });
        const mData = results.rows.map((row) => {
            const rowObj = row.toJSON() as any;
            let mRow = { ...rowObj };
            delete mRow.SalaryLvs;
            if (rowObj.SalaryLvs.length > 0) {
                mRow = {
                    ...mRow,
                    ...rowObj.SalaryLvs[0],
                };
            }
            return mRow;
        });
        return {
            count: results.count,
            data: mData,
        };
    }

    async deleteData(id: number, item: number): Promise<ResponseHandler<SalaryLv> | ErrorHandler> {
        return await SalaryLv.findOne({
            where: {
                level: id,
                item: item,
            },
        }).then(async (model) => {
            if (model === null) {
                return {
                    status: "error",
                    code: ErrorDef.DataNotFound,
                };
            }
            return await model.destroy().then(() => {
                return { status: "ok", result: model };
            });
        });
    }

    async updateData(id: number, body: SalaryLv): Promise<ResponseHandler<SalaryLv> | ErrorHandler> {
        if (!body.id) {
            return this.createData(id, body);
        }
        return await WorkLevel.findOne({
            where: {
                id: id,
            },
        }).then(async (result) => {
            if (result === null) {
                return {
                    status: "error",
                    code: ErrorDef.DataNotFound,
                };
            }
            return await SalaryLv.findAll({
                where: {
                    level: id,
                    item: body.item,
                },
            }).then(async (result2) => {
                if (result2.length > 0) {
                    return await result2[0].update(body, { fields: editable }).then((model) => {
                        return { status: "ok", result: model };
                    });
                } else {
                    return {
                        status: "error",
                        code: ErrorDef.DataNotFound,
                    };
                }
            });
        });
    }
    async createData(id: number, data: SalaryLv): Promise<ResponseHandler<SalaryLv> | ErrorHandler> {
        data.level = id;
        return await WorkLevel.findOne({
            where: {
                id: id,
            },
        }).then(async (result) => {
            if (result === null) {
                return {
                    status: "error",
                    code: ErrorDef.DataNotFound,
                };
            }
            return await SalaryLv.build(data)
                .save({ fields: fillable })
                .then((model) => {
                    return { status: "ok", result: model };
                })
                .catch((error) => {
                    return { status: "error", code: ErrorDef.ErrorTran, error: error };
                });
        });
    }
}
export default MainService;
