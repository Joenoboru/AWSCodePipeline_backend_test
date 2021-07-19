import { Request, Response } from "express";
import { literal } from "sequelize";
import { ParamsDictionary } from "express-serve-static-core";
import "module-alias/register";
import { SalaryItem, SalaryLv } from "@/domain-resource/ts-models";
import { ListQueryParams, ErrorHandler, ResponseHandler } from "@/types/queryTypes";
import { createWhereFormSearchable, createWhereFormFilter } from "@/helpers/dbHelper";
import BaseService from "../BaseService";

const filterable = ["id", "name", "chname", "payment_type", "tax_type", "perday_use", "wl_only"];
const searchable = ["name", "chname"];
const fillable = ["name", "chname", "order", "payment_type", "default_amount", "tax_type", "perday_use", "wl_only"];
import { ErrorDef } from "../../wf_common";
class SalaryItemService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    async getPartData(): Promise<SalaryItem[]> {
        return SalaryItem.findAll({
            attributes: ["id", "name", "chname", "payment_type", "default_amount"],
            order: [["order", "asc"]],
            where: {
                wl_only: 0,
            },
        }).then((results) => {
            return results;
        });
    }
    async getPart(rereq: Request, res: Response): Promise<void> {
        const data = await this.getPartData();
        res.json(data);
    }
    async getListData(req: Request<ParamsDictionary, any, any, ListQueryParams>, res: Response): Promise<void> {
        const whereSearch = createWhereFormSearchable(searchable, req.query.str);
        const whereFilter = createWhereFormFilter(filterable, req.query.filter);
        const where = Object.assign(whereSearch, whereFilter);
        const unsetedCountQuery =
            "(SELECT (SELECT COUNT(*) FROM `worklevels` WHERE `status` = 1) - (SELECT COUNT(*) FROM `salarylvs` WHERE `item` = `salary_item_id`))";
        SalaryItem.findAndCountAll({
            attributes: {
                include: [[literal(unsetedCountQuery), "unsetedCount"]],
            },
            order: [["order", "asc"]],
            where: where,
            limit: Number(req.query.limit),
            offset: req.skip,
        }).then((results) => {
            res.json({
                count: results.count,
                data: results.rows,
            });
        });
    }
    async getAll(): Promise<SalaryItem[]> {
        return await SalaryItem.findAll({
            attributes: ["id", "name", "chname", "order", "payment_type", "default_amount"],
            order: [["order", "asc"]],
        });
    }
    async getWorkLevelAll(): Promise<SalaryItem[]> {
        return await SalaryItem.findAll({
            attributes: ["id", "name", "chname", "order", "payment_type", "default_amount"],
            order: [["order", "asc"]],
            where: {
                wl_only: 1,
            },
        });
    }
    async geCommonAll(): Promise<SalaryItem[]> {
        return await SalaryItem.findAll({
            attributes: ["id", "name", "chname", "order", "payment_type", "default_amount"],
            order: [["order", "asc"]],
            where: {
                wl_only: 0,
            },
        });
    }
    async getSingle(id: number): Promise<SalaryItem | ErrorHandler> {
        return await SalaryItem.findOne({
            where: {
                id: id,
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
    async changeOrder(list: SalaryItem[]): Promise<ResponseHandler | ErrorHandler> {
        return await Promise.all(
            list.map(
                (row) =>
                    new Promise<void>((resolve, reject) => {
                        SalaryItem.update({ order: row.order }, { where: { id: row.id } })
                            .then(() => {
                                resolve();
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    })
            )
        )
            .then(() => {
                return { status: "ok" };
            })
            .catch((error) => {
                return { status: "error", code: ErrorDef.ErrorTran, error: error };
            });
    }
    async insertData(body: SalaryItem): Promise<any> {
        const count = await SalaryItem.count();
        const mModel = { order: count + 1, ...body };
        SalaryItem.build(mModel)
            .save({ fields: fillable })
            .then((model) => {
                return { status: "ok", result: model };
            })
            .catch((error) => {
                return { status: "error", code: ErrorDef.ErrorTran, error: error };
            });
    }
    async updateData(body: SalaryItem): Promise<ResponseHandler<SalaryItem>> {
        return await SalaryItem.findOne({
            where: {
                id: body.id,
            },
        }).then(async (model) => {
            return await model.update(body, { fields: fillable }).then(async (model) => {
                if (body.wl_only === 0) {
                    await SalaryLv.destroy({ where: { item: body.id } });
                }
                return { status: "ok", result: model };
            });
        });
    }
    async deleteData(id: number): Promise<ResponseHandler<SalaryItem>> {
        return await SalaryItem.findOne({
            where: {
                id: id,
            },
        }).then(async (model) => {
            return await model.destroy().then(() => {
                return { status: "ok", result: model };
            });
        });
    }
}

export default SalaryItemService;
