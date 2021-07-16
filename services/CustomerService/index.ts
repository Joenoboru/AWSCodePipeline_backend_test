import { Request, Response } from "express";
import { FindAttributeOptions } from "sequelize";
import { ParamsDictionary } from "express-serve-static-core";
import "module-alias/register";
import { Customer, Project } from "@/domain-resource/ts-models";
import { createWhereFormSearchable, createWhereFormFilter, createOrder } from "@/helpers/dbHelper";
import { ErrorDef } from "@/wf_common";
import { ListQueryParams } from "@/types/queryTypes";
import { sortable as projSortable, orderDateField } from "../ProjectService";
import ProcessService from "./ProcessService";
import { sortable, searchable } from "./fieldSetting";

class CustomerService extends ProcessService {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    constructor(req: Request) {
        super(req);
    }
    async getProjects(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        const attrs = [...projSortable, orderDateField];
        return await Project.findAndCountAll({
            attributes: attrs as FindAttributeOptions,
            limit: Number(req.query.limit),
            offset: req.skip,
            order: [[orderDateField[0], "desc"]],
            where: {
                customer: id,
            },
        }).then((results) => {
            res.json({
                count: results.count,
                data: results.rows,
            });
        });
    }

    async getPicker(req: Request<ParamsDictionary, any, any, ListQueryParams>, res: Response): Promise<void> {
        const whereSearch = createWhereFormSearchable(searchable, req.query.str);
        const whereFilter = createWhereFormFilter(sortable, req.query.filter);
        const where = Object.assign(whereSearch, whereFilter);
        const results = await Customer.findAll({
            attributes: ["id", "name", "chname", "engname", "account_num"],
            where: where,
        });
        res.json(results);
    }

    async getList(req: Request<ParamsDictionary, any, any, ListQueryParams>, res: Response): Promise<void> {
        const order = createOrder(req);
        const str = req.query.str;
        const filter = req.query.filter;
        const whereSearch = str ? createWhereFormSearchable(searchable, str) : {};
        const whereFilter = filter ? createWhereFormFilter(sortable, filter) : {};
        const mWhere = { ...whereSearch, ...whereFilter };
        const result = await Customer.findAndCountAll({
            attributes: sortable,
            offset: this.page.offset,
            limit: this.page.limit,
            where: mWhere,
            order: order,
        });
        res.json({ count: result.count, data: result.rows });
    }

    async getAll(res: Response): Promise<void> {
        const results = await Customer.findAll({
            attributes: ["id", "name", "chname", "engname", "account_num"],
        });
        res.json(results);
    }

    async getData(req: Request, res: Response): Promise<any> {
        const id = req.params.id;
        return await Customer.findOne({
            where: {
                id: id,
            },
        }).then((result) => {
            if (result === null) {
                return res.send({
                    status: "error",
                    code: ErrorDef.DataNotFound,
                });
            }
            res.json(result);
        });
    }
}
export default CustomerService;
export { sortable };
