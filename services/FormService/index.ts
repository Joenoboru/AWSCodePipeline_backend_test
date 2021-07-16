import { Request } from "express";
import { Op } from "sequelize";
import "module-alias/register";
import {
    Form,
    FormDept,
    DepartPos,
    FormRoute,
    FormSectionRouteDetail,
    FormSection,
    EmpWork,
} from "@/domain-resource/ts-models";
import { createWhereFormSearchable, createWhereFormFilter } from "@/helpers/dbHelper";
import { StdQueryListResult, ResponseHandler, ErrorHandler } from "@/types/queryTypes";
import { ErrorDef } from "@/wf_common";
import BaseService from "../BaseService";

const filterable = ["name", "description"];
const searchable = ["name", "description"];

class FormService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    async searchList(str: string, filter: string[]): Promise<StdQueryListResult<Form>> {
        const service = this;
        const whereSearch = createWhereFormSearchable(searchable, str);
        const whereFilter = createWhereFormFilter(filterable, filter);
        const where = Object.assign(whereSearch, whereFilter);
        //Nodes: table joined is setted in models
        return await Form.findAndCountAll({
            attributes: ["formTag", "name", "id", "description"],
            limit: service.page.limit,
            offset: service.page.offset,
            where: where,
        }).then((results) => {
            return {
                count: results.count,
                data: results.rows,
                maxpage: Math.ceil(results.count / service.page.limit),
            };
        });
    }
    async getListAvailable(employeeId: number): Promise<Form[]> {
        return await Form.findAll({
            attributes: ["id", "name", "form_tag"],
            where: {
                status: 1,
            },
            include: {
                model: FormDept,
                attributes: ["deptId"],
            },
        }).then(async (results) => {
            const empDeparts = await DepartPos.findAll({
                attributes: ["depart"],
                include: {
                    model: EmpWork,
                    attributes: ["workpos"],
                    where: {
                        emp: employeeId,
                    },
                },
            });
            const departIds = empDeparts.map((a) => a.depart);
            results = results.filter((a) => {
                if (a.FormDepts.length === 0) {
                    return true;
                } else {
                    const formDeptIds = a.FormDepts.map((a) => a.deptId);
                    for (let i = 0; i < formDeptIds.length; i++) {
                        if (departIds.includes(formDeptIds[i])) {
                            return true;
                        }
                    }
                    return false;
                }
            });
            return results;
        });
    }

    async getList(): Promise<Form[]> {
        return await Form.findAll({
            attributes: ["id", "name", "form_tag"],
        });
    }

    async searchOne(id: number): Promise<any> {
        return await Form.findOne({
            where: { id },
            raw: true,
            attributes: ["id", "formTag", "name"],
        }).then(async (form) => {
            if (!form) {
                return null;
            }
            let sectionData = ["Basic"];
            const routeId = await FormRoute.findOne({
                where: { formId: form.id },
                attributes: ["routeId"],
            }).then((formRoute) => {
                if (formRoute == null) {
                    return null;
                }
                return formRoute.routeId;
            });
            if (routeId) {
                await FormSectionRouteDetail.findAll({
                    where: { stageNo: 0, routeId: routeId },
                    include: {
                        attributes: ["formSectionTag"],
                        model: FormSection,
                        where: { formId: form.id },
                    },
                }).then((results) => {
                    if (results.length > 0) {
                        sectionData = results.map((a) => a.FormSection.formSectionTag);
                    }
                });
            }
            return { ...form, sections: sectionData };
        });
    }
    async getOne(id: number): Promise<Form> {
        return await Form.findOne({
            where: { id },
            raw: true,
            attributes: ["id", "formTag", "name"],
        });
    }
    async updateForm(data: Form): Promise<ResponseHandler> {
        return await Form.findOne({
            where: { id: data.id },
        }).then(async (model) => {
            return await model.update(data).then(() => {
                return {
                    status: "ok",
                };
            });
        });
    }
    async getRoute(id: number): Promise<{ formName: string; name: string; routeId: number }> {
        const form = await Form.findOne({
            where: { id },
            attributes: ["name"],
        });
        const formRoute = await FormRoute.findOne({
            where: {
                formId: id,
            },
            attributes: ["name", "routeId"],
        });
        return {
            formName: form.name,
            name: formRoute.name,
            routeId: formRoute.routeId,
        };
    }
    async getSections(id: number): Promise<FormSection[]> {
        return await FormSection.findAll({
            where: {
                formId: id,
            },
        });
    }
    async updateRoute(
        body: Partial<FormRoute> & { details: Partial<FormSectionRouteDetail>[] }
    ): Promise<ResponseHandler> {
        const { sequelize } = this.domainDBResource;
        const { formId, routeId, details } = body;
        const mDetails = details.filter((a) => a.fieldType === 0);
        mDetails.forEach((a) => {
            a.routeId = routeId;
        });
        return await sequelize.transaction(async (transaction) => {
            await FormRoute.findOne({
                where: {
                    formId: formId,
                },
                attributes: ["name", "routeId"],
                transaction,
            }).then(async (model) => {
                if (!model) {
                    await FormRoute.create({ formId, routeId }, { transaction });
                } else {
                    await model.update({ routeId }, { transaction });
                }
            });
            const sectionIds = await FormSection.findAll({
                where: {
                    formId: formId,
                },
                attributes: ["id"],
                transaction,
            }).then((results) => {
                return results.map((a) => a.id);
            });
            await FormSectionRouteDetail.destroy({ where: { formSectionId: { [Op.in]: sectionIds } }, transaction });
            await FormSectionRouteDetail.bulkCreate(mDetails, { transaction });
            return {
                status: "ok",
            };
        });
    }
    async getDept(id: number): Promise<StdQueryListResult<FormDept>> {
        const results = await FormDept.findAndCountAll({
            limit: this.page.limit,
            offset: this.page.offset,
            where: {
                formId: id,
            },
        });
        return {
            count: results.count,
            data: results.rows,
            maxpage: Math.ceil(results.count / this.page.limit),
        };
    }
    async addDept(id: number, deptId: number): Promise<ResponseHandler | ErrorHandler> {
        const { sequelize } = this.domainDBResource;
        // let { id } = req.params;
        // let { deptId } = req.body;
        return await sequelize.transaction(async (transaction) => {
            try {
                await FormDept.create(
                    {
                        formId: id,
                        deptId: deptId,
                    },
                    { transaction }
                );
                return {
                    status: "ok",
                };
            } catch (error) {
                return {
                    status: "error",
                    code: ErrorDef.ErrorTran,
                    error: error,
                };
            }
        });
    }
    async deleteDept(id: number, deptId: number): Promise<ResponseHandler | ErrorHandler> {
        const { sequelize } = this.domainDBResource;
        return await sequelize.transaction(async (transaction) => {
            try {
                await FormDept.destroy({
                    where: {
                        formId: id,
                        deptId: deptId,
                    },
                    transaction,
                });
                return {
                    status: "ok",
                };
            } catch (error) {
                return {
                    status: "error",
                    code: ErrorDef.ErrorTran,
                    error: error,
                };
            }
        });
    }
}

export default FormService;
