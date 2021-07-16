import { Request, Response } from "express";
import { Op, literal } from "sequelize";
import { ParamsDictionary } from "express-serve-static-core";
import "module-alias/register";
import { Route, RouteDetail, FormSectionRouteDetail, FormSection } from "@/domain-resource/ts-models";
import { createWhereFormSearchable, createWhereFormFilter } from "@/helpers/dbHelper";
import { ListQueryParams } from "@/types/queryTypes";
import BaseService from "../BaseService";

const filterable = ["name", "description"];
const searchable = ["name", "description"];

class MainService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    async getMain(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        Route.findOne({
            where: { id },
            attributes: ["name", "description"],
        }).then((result) => res.json(result));
    }
    async getAll(req: Request, res: Response): Promise<void> {
        Route.findAll({
            attributes: ["name", "id"],
        }).then((results) => {
            res.json(results);
        });
    }
    async getList(req: Request<ParamsDictionary, any, any, ListQueryParams>, res: Response): Promise<void> {
        const whereSearch = createWhereFormSearchable(searchable, req.query.str);
        const whereFilter = createWhereFormFilter(filterable, req.query.filter);
        const where = Object.assign(whereSearch, whereFilter);
        const limit = Number(req.query.limit);
        //Nodes: table joined is setted in models
        Route.findAndCountAll({
            attributes: ["description", "name", "id"],
            limit,
            offset: req.skip,
            where: where,
        }).then((results) => {
            res.json({
                count: results.count,
                data: results.rows,
            });
        });
    }
    async getDetail(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        const limit = Number(req.query.limit);
        if (id === "add") {
            res.json({
                count: 0,
                data: [],
                maxpage: Math.ceil(0 / limit),
            });
        } else {
            RouteDetail.findAndCountAll({
                where: {
                    routeId: id,
                    stageNo: { [Op.gt]: 0 },
                },
            }).then((results) => {
                res.json({
                    count: results.count,
                    data: results.rows,
                    maxpage: Math.ceil(results.count / limit),
                });
            });
        }
    }
    async getDetailSections(req: Request, res: Response): Promise<void> {
        const { id, formId } = req.params;

        RouteDetail.findAll({
            attributes: ["auditType", "auditorId", "deptId", "gradeId", "routeId", "stageNo"],
            where: {
                routeId: id,
            },
            raw: true,
            // include: {
            //     model: FormSectionRouteDetail,
            //     attributes: ["fieldType", "formSectionId"],
            //     include: {
            //         model: FormSection,
            //         where: {
            //             formId: formId,
            //         },
            //         attributes: ['formId'],
            //     },
            // },
        }).then(async (results) => {
            const mResults = [];
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const mResult = results[i].toJSON() as any;
                mResult.FormSectionRouteDetails = await FormSectionRouteDetail.findAll({
                    attributes: ["fieldType", "formSectionId"],
                    where: {
                        routeId: id,
                        stageNo: result.stageNo,
                    },
                    include: {
                        model: FormSection,
                        where: {
                            formId: formId,
                        },
                        attributes: [],
                    },
                });
                mResults.push(mResult);
            }
            res.json(mResults);
            // res.json({
            //     count: results.count,
            //     data: results.rows,
            //     maxpage: Math.ceil(results.count / req.query.limit),
            // });
        });
    }
    async removeDetail(req: Request, res: Response): Promise<void> {
        const { sequelize } = this.domainDBResource;
        const { id } = req.params;
        const { stageNo } = req.body.data;
        sequelize.transaction(async (transaction) => {
            await RouteDetail.destroy({ where: { routeId: id, stageNo }, transaction });
            await RouteDetail.update(
                { stageNo: literal("stage_no - 1") },
                {
                    where: { routeId: id, stageNo: { [Op.gt]: stageNo } },
                    transaction,
                }
            );
            res.json({
                status: "ok",
            });
        });
    }
    async updateDetail(req: Request, res: Response): Promise<void> {
        const { sequelize } = this.domainDBResource;
        const { id } = req.params;
        const data = req.body;
        sequelize.transaction(async (transaction) => {
            if (data.auditType === 1) {
                delete data.deptId;
                delete data.gradeId;
            } else {
                delete data.auditorId;
            }
            if (data.stageNo) {
                await RouteDetail.update(data, {
                    where: { routeId: id, stageNo: data.stageNo },
                    transaction,
                });
            } else {
                await RouteDetail.findOne({
                    where: {
                        routeId: id,
                    },
                    order: [["stageNo", "desc"]],
                }).then(async (model) => {
                    data.routeId = id;
                    data.stageNo = model.stageNo + 1;
                    await RouteDetail.build(data).save();
                });
            }
            res.json({
                status: "ok",
            });
        });
        res.json({
            status: "ok",
        });
    }
    async updateAllDetail(req: Request, res: Response): Promise<void> {
        const { sequelize } = this.domainDBResource;
        const { id } = req.params;
        const data = req.body;
        sequelize.transaction(async (transaction) => {
            try {
                await RouteDetail.findOne({
                    where: {
                        routeId: id,
                        stageNo: 0,
                    },
                    order: [["stageNo", "desc"]],
                }).then(async (model) => {
                    if (!model) {
                        await RouteDetail.build({
                            routeId: id,
                            stageNo: 0,
                            auditType: 0,
                        }).save();
                    }
                });
                await RouteDetail.destroy({
                    where: {
                        routeId: id,
                        stageNo: {
                            [Op.gt]: 0,
                        },
                    },
                    transaction,
                });
                for (let index = 0; index < data.length; index++) {
                    const value = data[index];
                    value.routeId = id;
                    await RouteDetail.build(value).save({ transaction });
                }
                res.json({
                    status: "ok",
                });
            } catch (e) {
                res.json({
                    status: "error",
                    code: e,
                });
            }
        });
    }
    async updateRoute(req: Request, res: Response): Promise<void> {
        const { sequelize } = this.domainDBResource;
        const data = req.body;
        sequelize.transaction(async (transaction) => {
            if (data.id) {
                await Route.update(data, { where: { id: data.id }, transaction });
            } else {
                const main = await Route.build(data).save({ transaction });
                await RouteDetail.build({ routeId: main.id, stageNo: 0, auditType: 0 }).save({ transaction });
            }
            res.json({
                status: "ok",
            });
        });
    }
}
export default MainService;
