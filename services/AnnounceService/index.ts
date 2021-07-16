import { Request, Response } from "express";
import { Order } from "sequelize/types";
import BaseService from "../BaseService";
import "module-alias/register";
import { ErrorDef } from "@/wf_common";
import { Announce } from "@/domain-resource/ts-models";
import { createWhereFormSearchable, createWhereFormFilter } from "@/helpers/dbHelper";
const { validationResult } = require("express-validator");

const fillable = ["onTop", "show", "title", "content", "createUser", "updateUser"];

const sortable = ["id", "onTop", "show", "title", "createUser", "createdAt"];

class AnnounceService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    async getListData(req: Request, res: Response): Promise<void> {
        const errors = validationResult(req);
        let order = req.query.order as string;
        const orderDir = req.query.orderDir as string;

        if (!errors.isEmpty()) {
            order = null;
        }
        let orderData: Order = [["createdAt", "desc"]];
        if (order) {
            orderData = [[order, orderDir]];
        }
        const whereSearch = createWhereFormSearchable(["title"], req.query.str as string);
        const whereFilter = createWhereFormFilter(sortable, req.query.filter as string[], null, ["onTop", "show"]);
        const where = { ...whereSearch, ...whereFilter };
        return await Announce.findAndCountAll({
            attributes: sortable,
            order: orderData,
            limit: Number(req.query.limit),
            offset: req.skip,
            where: where,
        }).then((results) => {
            res.json({
                count: results.count,
                data: results.rows,
            });
        });
    }

    async getData(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        Announce.findOne({
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

    async createData(data: Announce): Promise<Announce> {
        const model = await Announce.build(data).save({ fields: fillable });
        return model;
    }

    async updateData(data: Announce): Promise<void> {
        return await Announce.findOne({
            where: {
                id: data.id,
            },
        }).then(async (model) => {
            await model.update(data, { fields: fillable });
        });
    }

    async deleteData(id: number): Promise<Announce> {
        return await Announce.findOne({
            where: {
                id: id,
            },
        }).then(async (model) => {
            return await model.destroy().then(() => {
                return model;
            });
        });
    }
}
export { sortable };
export default AnnounceService;
