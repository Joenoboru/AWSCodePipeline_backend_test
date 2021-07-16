import { ErrorHandler } from "./../../types/queryTypes";
import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import "module-alias/register";
import {
    Employee,
    DepartPos,
    WorkPosition,
    Department,
    Corporate,
    Attendance,
    WorkProject,
    IntervieweeToEmployee,
    CompanyRule,
    SalaryDef,
} from "@/domain-resource/ts-models";
import { createWhereFormSearchable, createWhereFormFilter } from "@/helpers/dbHelper";
import { ListQueryParams } from "@/types/queryTypes";
import { ErrorDef } from "@/wf_common";
import ProcessService from "./ProcessService";

interface EmployeeWithExtendAttrs extends Employee {
    company?: number;
    depart?: number;
    work_position?: number;
}

class MainService extends ProcessService {
    sortable = ["id", "name", "engname", "emp_num", "status"];
    searchable = ["name", "engname", "emp_num"];
    fillable = [
        "name",
        "engname",
        "emp_num",
        "hire_date",
        "prob_start",
        "prob_end",
        "leave_date",
        "work_position",
        "work_title",
        "sex",
        "birthday",
        "personID",
        "bank_account",
        "nationality",
        "reg_addr",
        "con_addr",
        "tel",
        "mobile",
        "email",
        "private_email",
        "finaledu",
        "gradschool",
        "major",
        "emer_name",
        "emer_relat",
        "emer_tel",
        "rmk",
        "status",
        "dependents",
    ];
    constructor(req: Request) {
        super(req);
    }
    async getAll(): Promise<Employee[]> {
        return await Employee.findAll({
            attributes: ["id", "name", "engname"],
        });
    }

    async getPicker(req: Request<ParamsDictionary, any, any, ListQueryParams>): Promise<EmployeeWithExtendAttrs[]> {
        const whereSearch = createWhereFormSearchable(this.searchable, req.query.str);
        const whereFilter = createWhereFormFilter(this.sortable, req.query.filter);
        const where = Object.assign({ status: 1 }, whereSearch, whereFilter);
        const depWhere = createWhereFormFilter(["company", "depart"], req.query.filter, {
            company: "corp",
            depart: "id",
        });
        const workposWhere = createWhereFormFilter(["work_position"], req.query.filter, {
            work_position: "id",
        });
        return await Employee.findAndCountAll({
            attributes: ["id", "emp_num", "name", "engname"],
            where: where,
            limit: 100,
            include: [
                {
                    model: DepartPos,
                    //as: "main_departs",
                    attributes: ["id"],
                    include: [
                        { model: WorkPosition, attributes: ["id"], where: workposWhere },
                        {
                            model: Department,
                            attributes: ["id"],
                            where: depWhere,
                            //required: false,
                            include: [
                                {
                                    model: Corporate,
                                    attributes: ["id"],
                                },
                            ],
                        },
                    ],
                    through: {
                        attributes: ["ord"],
                        where: {
                            ord: 1,
                            status: 1,
                        },
                    },
                },
            ],
        }).then((results) => {
            const mResults = [];
            results.rows.forEach((row) => {
                const rowJson: EmployeeWithExtendAttrs = row.toJSON() as any;
                if (row.DepartPos.length > 0) {
                    const ewData = row.DepartPos[0];
                    rowJson.company = ewData.Department.Corporate.id;
                    rowJson.depart = ewData.Department.id;
                    rowJson.work_position = ewData.WorkPosition.id;
                } else {
                    rowJson.company = 0;
                    rowJson.depart = 0;
                    rowJson.work_position = 0;
                }
                mResults.push(rowJson);
            });
            return mResults;
        });
    }
    async getList(req: Request<ParamsDictionary, any, any, ListQueryParams>, res: Response): Promise<void> {
        const order = req.query.order;
        const orderDir = req.query.orderDir;
        let orderData = [];
        if (order) {
            if (order === "company") {
                orderData = [["main_departs", Department, Corporate, "name", orderDir]];
            } else if (order === "depart") {
                orderData = [["main_departs", Department, "name", orderDir]];
            } else if (order === "work_position") {
                orderData = [["main_departs", WorkPosition, "name", orderDir]];
            } else {
                orderData = [[order, orderDir]];
            }
        }
        const whereSearch = createWhereFormSearchable(this.searchable, req.query.str);
        const whereFilter = createWhereFormFilter(this.sortable, req.query.filter);
        //let corpWhere = createWhereFormFilterByFields(req.query.filter, "company", "id");
        const depWhere = createWhereFormFilter(["company", "depart"], req.query.filter, {
            company: "corp",
            depart: "id",
        });
        const workposWhere = createWhereFormFilter(["work_position"], req.query.filter, {
            work_position: "id",
        });
        const where = Object.assign(whereSearch, whereFilter);
        const limit = Number(req.query.limit);
        //Nodes: table joined is setted in models
        Employee.findAndCountAll({
            attributes: this.sortable,
            order: orderData,
            limit,
            offset: req.skip,
            where: where,
            include: [
                {
                    model: DepartPos,
                    //as: "main_departs",
                    attributes: ["id"],
                    include: [
                        { model: WorkPosition, attributes: ["id"], where: workposWhere },
                        {
                            model: Department,
                            attributes: ["id"],
                            where: depWhere,
                            //required: false,
                            include: [
                                {
                                    model: Corporate,
                                    attributes: ["id"],
                                },
                            ],
                        },
                    ],
                    through: {
                        attributes: ["ord"],
                        where: {
                            ord: 1,
                            status: 1,
                        },
                    },
                },
            ],
        }).then((results) => {
            const mResults = [];
            results.rows.forEach((row) => {
                const rowJson: EmployeeWithExtendAttrs = row.toJSON() as any;
                if (row.DepartPos.length > 0) {
                    const ewData = row.DepartPos[0];
                    rowJson.company = ewData.Department.Corporate.id;
                    rowJson.depart = ewData.Department.id;
                    rowJson.work_position = ewData.WorkPosition.id;
                } else {
                    rowJson.company = 0;
                    rowJson.depart = 0;
                    rowJson.work_position = 0;
                }
                mResults.push(rowJson);
            });
            res.json({
                count: results.count,
                data: mResults,
                maxpage: Math.ceil(results.count / limit),
            });
        });
    }

    async getEmpInfo(id: string): Promise<Employee> {
        return await Employee.findOne({
            where: {
                id: id,
            },
            attributes: ["email", "name", "emp_num"],
        });
    }

    async getSingleAttendance(id: string, employeeId: string): Promise<any> {
        return await Attendance.findOne({
            where: {
                id: id,
                employee: employeeId,
            },
            include: [{ model: WorkProject }],
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
    async deleteEmp(id: string): Promise<{ status: string; result: Employee }> {
        return await Employee.findOne({
            where: {
                id: id,
            },
        }).then(async (model) => {
            await model.destroy();
            return { status: "ok", result: model };
        });
    }
    async updateBaseInfo(body: Employee): Promise<{ status: string; result: Employee }> {
        const fillable = this.fillable;
        return await Employee.findOne({
            where: {
                id: body.id,
            },
        }).then(async (model) => {
            await model.update(body, { fields: fillable });
            return { status: "ok", result: model };
        });
    }
    async insertBaseInfo(body: Employee): Promise<{ status: string; result?: Employee; code?: string }> {
        return await Employee.build(body)
            .save({ fields: this.fillable })
            .then((model) => {
                return { status: "ok", result: model };
            })
            .catch((error) => {
                return { status: "error", code: ErrorDef.ErrorTran, error: error };
            });
    }

    async getEmpSalaryInfo(employeeId: string): Promise<{ employeeId: string; workLevel: any; def: SalaryDef[] }> {
        const workLevel = await Employee.findOne({
            where: {
                id: employeeId,
            },
            attributes: ["workLevel"],
        }).then((result) => {
            if (result === null) {
                return null;
            } else {
                return result.workLevel;
            }
        });
        const def = await SalaryDef.findAll({
            where: {
                employee: employeeId,
            },
            attributes: ["item", "amount"],
        }).then((results) => {
            return results;
        });
        return {
            employeeId,
            workLevel,
            def,
        };
    }

    async getEmpWorkLevel(id: string): Promise<any> {
        return await Employee.findOne({
            where: {
                id: id,
            },
            attributes: ["workLevel"],
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

    async getEmpFullInfo(id: string): Promise<Employee | ErrorHandler> {
        Employee.hasOne(IntervieweeToEmployee, { foreignKey: "employeeId", sourceKey: "id" });
        return await Employee.findOne({
            where: {
                id: id,
            },
            include: [
                {
                    model: IntervieweeToEmployee,
                    attributes: ["intervieweeId"],
                },
            ],
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

    public async getCompanyRule(): Promise<CompanyRule> {
        return await CompanyRule.findOne({
            attributes: ["timezone", "extraLimitMinutes", "workOn", "workOff"],
        });
    }
}

export default MainService;
