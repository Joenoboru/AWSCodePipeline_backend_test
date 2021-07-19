import { Request } from "express";
import { Op, fn, col, FindOptions, Order } from "sequelize";
import "module-alias/register";
import {
    AuditRecord,
    AuditRecordDetail,
    FormSection,
    FormSectionRouteDetail,
    DeputyData,
    FormRoute,
    Route,
    RouteDetail,
} from "@/domain-resource/ts-models";
import { createWhereFormFilter } from "@/helpers/dbHelper";
import { StdQueryListResult } from "@/types/queryTypes";
import { EnumConst } from "@/enums";
import BaseService from "../BaseService";

class AuditQueryDataService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    public async getAuditRecordById(id: number): Promise<AuditRecord> {
        const deputyIds = await this.getDeputyData(this.employeeId);
        deputyIds.push(this.employeeId);
        const permit = await AuditRecordDetail.count({
            where: {
                auditRecordId: id,
                [Op.or]: [
                    {
                        auditorId: {
                            [Op.in]: deputyIds,
                        },
                    },
                    {
                        deputyId: {
                            [Op.in]: deputyIds,
                        },
                    },
                ],
            },
        });
        if (permit === 0) {
            return null;
        }
        const results = await AuditRecord.findOne({
            where: { id: id },
            //include: { AuditRecordDetail, },
            //order: 'seqNo DESC',
        });
        return results;
    }

    public async getAuditRecordData(
        id: number
    ): Promise<{ main: Partial<AuditRecord>; details: AuditRecordDetail[]; sections: any[] }> {
        const service = this;
        const empId = this.employeeId;
        const deputyIds = await this.getDeputyData(this.employeeId);
        deputyIds.push(this.employeeId);
        const permit = await AuditRecordDetail.count({
            where: {
                auditRecordId: id,
                [Op.or]: [
                    {
                        auditorId: {
                            [Op.in]: deputyIds,
                        },
                    },
                    {
                        deputyId: {
                            [Op.in]: deputyIds,
                        },
                    },
                ],
            },
        });
        if (permit === 0) {
            return {
                main: {},
                details: [],
                sections: [],
            };
        }
        let auditData = await AuditRecord.findOne({
            where: {
                id: id,
                // status: { [Op.lte]: 1, },
            },
            include: [
                {
                    model: AuditRecordDetail,
                    as: "arDetail",
                },
            ],
            order: [[{ model: AuditRecordDetail, as: "arDetail" }, "seqNo", "DESC"]],
            limit: 1,
            //raw: true,
        });
        let sectionData = [];

        if (auditData) {
            const detail = auditData.arDetail[0];
            // if audit record is complete, disabled sections;
            if (
                auditData.status !== EnumConst.AuditRecordStatus.MainStatus.DRAFT &&
                auditData.status !== EnumConst.AuditRecordStatus.MainStatus.ONGOING
            ) {
                sectionData = [];
            } else if (detail.stageNo === 0) {
                sectionData = ["Basic"];
                const results = await FormSectionRouteDetail.findAll({
                    where: { stageNo: 0, routeId: detail.routeId },
                    include: {
                        attributes: ["formSectionTag"],
                        model: FormSection,
                        where: { formId: auditData.formId },
                    },
                });
                sectionData = results.map((a) => a.FormSection.formSectionTag);
            } else {
                const results = await FormSectionRouteDetail.findAll({
                    where: { stageNo: detail.stageNo, routeId: detail.routeId },
                    include: {
                        attributes: ["formSectionTag"],
                        model: FormSection,
                        where: { formId: auditData.formId },
                    },
                });
                sectionData = results.map((a) => a.FormSection.formSectionTag);
                await service.getDeputyData(empId, detail.auditorId).then((deputyIds) => {
                    if (deputyIds.length > 0) {
                        detail.deputyId = empId;
                    }
                });
            }
        } else {
            auditData = null;
        }
        if (!auditData.viewed && auditData.createUser === empId) {
            await auditData.update({ viewed: true });
        }
        return {
            main: auditData,
            details: auditData.arDetail || [],
            sections: sectionData,
        };
    }
    async getDeputyData(deputyId: number, empId?: number): Promise<number[]> {
        const now = new Date();
        const searchOption: FindOptions = {
            where: {
                // deputyId: deputyId,
                // // empId: null,
                startAt: {
                    [Op.lte]: now,
                },
                endAt: {
                    [Op.gt]: now,
                },
            },
            attributes: [[fn("DISTINCT", col("emp_id")), "empId"]],
        };
        if (deputyId) {
            searchOption.where["deputyId"] = deputyId;
        }
        if (empId) {
            searchOption.where["empId"] = empId;
        }
        const results = await DeputyData.findAll(searchOption);
        const deputyIds = results.map((a) => a.empId);
        return deputyIds;
    }
    async getAuthDeputyData(empId: number): Promise<number[]> {
        const now = new Date();
        const searchOption: FindOptions = {
            where: {
                // deputyId: deputyId,
                empId: empId,
                startAt: {
                    [Op.lte]: now,
                },
                endAt: {
                    [Op.gt]: now,
                },
            },
            attributes: [[fn("DISTINCT", col("deputy_id")), "deputyId"]],
        };
        const results = await DeputyData.findAll(searchOption);
        const deputyIds = results.map((a) => a.deputyId);
        return deputyIds;
    }
    private createWhere(queryJSON: string): any {
        if (queryJSON) {
            const queryData = JSON.parse(queryJSON);
            const createdAt = {};
            if ("from" in queryData) {
                createdAt[Op.gte] = queryData.from;
            }
            if ("to" in queryData) {
                createdAt[Op.lte] = queryData.to;
            }
            if (Object.entries(queryData).length > 0) {
                return {
                    createdAt,
                };
            }
        }
        return {};
    }
    public async getSelfList(orderData: Order): Promise<StdQueryListResult<AuditRecord>> {
        const empId = this.employeeId;

        // filter
        const whereFilter = createWhereFormFilter(["status", "formId", "formTag"], this.req.query.filter as string[]);
        // search
        const whereSearch = this.createWhere(this.req.query.search as string);
        const where = { ...whereFilter, ...whereSearch, createUser: empId };

        const results = await AuditRecord.findAndCountAll({
            attributes: ["id", "status", "formTag", "formId", "createdAt", "createUser", "actionType"],
            where: where,
            order: orderData,
            limit: this.page.limit,
            offset: this.page.offset,
            include: [
                {
                    model: AuditRecordDetail,
                    attributes: ["auditorId", "status", "updatedAt"],
                    limit: 1,
                    order: [["seqNo", "DESC"]],
                    as: "lastAuditor",
                },
            ],
        });
        return {
            count: results.count,
            data: results.rows,
        };
    }
    public async getPendingList(orderData: Order): Promise<StdQueryListResult<AuditRecord>> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const service = this;
        const empId = this.employeeId;
        const deputyIds = await this.getDeputyData(empId, null);
        // filter
        const whereFilter = createWhereFormFilter(["status", "formId", "formTag"], this.req.query.filter as string[]);
        // search
        const whereSearch = service.createWhere(this.req.query.search as string);

        const details = await AuditRecord.findAndCountAll({
            attributes: ["id", "status", "formTag", "formId", "createdAt", "createUser", "actionType"],
            where: {
                ...whereFilter,
                ...whereSearch,
            },
            include: [
                {
                    model: AuditRecordDetail,
                    attributes: ["auditorId", "status", "updatedAt"],
                    order: [["seqNo", "DESC"]],
                    as: "lastAuditor",
                    where: {
                        auditorId: {
                            [Op.in]: [empId, ...deputyIds],
                        },
                        status: 0,
                    },
                },
            ],
            limit: this.page.limit,
            offset: this.page.offset,
            order: orderData,
        });
        return {
            count: details.count,
            data: details.rows,
        };
    }

    public async getHistoryList(): Promise<StdQueryListResult<AuditRecord>> {
        const empId = this.employeeId;
        const service = this;
        // filter
        const whereFilter = createWhereFormFilter(["status", "formId", "formTag"], this.req.query.filter as string[]);
        // search
        const whereSearch = service.createWhere(this.req.query.search as string);

        const details = await AuditRecordDetail.findAndCountAll({
            attributes: ["auditRecordId"],
            where: {
                [Op.or]: {
                    auditorId: empId,
                    deputyId: empId,
                },
            },
            include: [
                {
                    model: AuditRecord,
                    attributes: [],
                    where: {
                        ...whereFilter,
                        ...whereSearch,
                    },
                },
            ],
            limit: this.page.limit,
            offset: this.page.offset,
            order: [["auditRecordId", "desc"]],
            //order: [[{ model: AuditRecordDetail, as: 'lastAuditor' }, 'seqNo', 'DESC']],
        });
        const recordIds = [...details.rows.map((a) => a.auditRecordId)];
        const records = await AuditRecord.findAll({
            attributes: ["id", "status", "formTag", "formId", "createdAt", "createUser"],
            where: {
                id: {
                    [Op.in]: recordIds,
                },
            },
            include: {
                model: AuditRecordDetail,
                attributes: ["auditorId", "status", "updatedAt"],
                order: [["seqNo", "DESC"]],
                limit: 1,
                as: "lastAuditor",
            },
            //order: [[{ model: AuditRecordDetail, as: 'lastAuditor' }, 'seqNo', 'DESC']],
        });
        return {
            count: details.count,
            data: records,
        };
    }
    async queryRoute(): Promise<RouteDetail[]> {
        const formRoute = await FormRoute.findOne({
            where: { formId: this.req.params.form_id },
        });
        const result = await Route.findOne({
            where: {
                id: formRoute.routeId,
            },
            include: {
                model: RouteDetail,
            },
        });
        return result.RouteDetails;
    }
}

export default AuditQueryDataService;
