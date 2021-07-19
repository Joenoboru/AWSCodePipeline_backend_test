import { Request } from "express";
import moment from "moment";
import { Op } from "sequelize";
import "module-alias/register";
import {
    Employee,
    DepartPos,
    EmpWork,
    Attendance,
    WorkProject,
    LeaveReq,
    ExtraHoursReq,
    EmpPermissionGroup,
    PermissionGroup,
} from "@/domain-resource/ts-models";
import { StdQueryListResult, ErrorHandler } from "@/types/queryTypes";
import { ErrorDef } from "@/wf_common";
import BaseService from "../BaseService";

class QueryService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    async getLatestDeptWorkposDataById(empId: number): Promise<DepartPos & { EmpWork: EmpWork }> {
        return await this.getDeptWorkposDataById(empId).then((departPos) => {
            if (departPos) {
                //console.log(`3: ${departPos[0]}`);
                return departPos[0];
            }
        });
    }

    async getDeptWorkposDataById(empId: number): Promise<Array<DepartPos & { EmpWork: EmpWork }>> {
        return await Employee.findOne({
            where: {
                id: empId,
            },
            include: [
                {
                    model: DepartPos,
                    attributes: ["depart", "workpos"],
                    //limit: 1,
                },
            ],
            order: [[DepartPos, "id", "DESC"]],
            //limit: 1,
        }).then((results) => {
            if (results) {
                return results.DepartPos;
            } else {
                return null;
            }
        });
    }
    async getEmployeeByDepartWorkpos(
        applyEmpId: number,
        deptId: number,
        workPos: number,
        excludeSelfFlag = false
    ): Promise<Employee> {
        let whereClause = {};
        if (excludeSelfFlag) {
            whereClause = {
                [Op.not]: [{ id: applyEmpId }],
            };
        }

        return await Employee.findOne({
            //attributes: ['id'],
            where: whereClause,
            include: [
                {
                    model: DepartPos,
                    where: {
                        depart: deptId,
                        workpos: workPos,
                    },
                },
            ],
        }).then((result) => {
            if (result) {
                return result;
            }
        });
    }
    async getEmployeeExcludeSelfByDepartWorkpos(
        applyEmpId: number,
        deptId: number,
        workPos: number
    ): Promise<Employee> {
        return await this.getEmployeeByDepartWorkpos(applyEmpId, deptId, workPos, true);
    }

    async getEmployeeRolesAndFuncs(employeeId: number): Promise<{ roles: string[] }> {
        if (!employeeId) {
            return {
                roles: [],
                //funcs: [],
            };
        }
        return await EmpPermissionGroup.findAll({
            where: { empId: employeeId },
            include: [
                {
                    attributes: ["tag"],
                    model: PermissionGroup,
                },
            ],
        }).then((result) => {
            const roles = result.map((a) => a.PermissionGroup.tag);
            //const funcs = [];
            /*const codes = result.map((d) => {
                return d.PermissionGroup.SysFuncPermissions.map((e) => {
                    const { sysCode, subSysCode, funcCode } = e.System;
                    // console.log(`${sysCode}.${subSysCode}.${funcCode}`);

                    return {
                        func: `${sysCode}.${subSysCode}` + (funcCode ? `.${funcCode}` : ""),
                        permit: (e.permission[0] * 16 + e.permission[1]).toString(2),
                    };
                });
            });
            codes.forEach((code) => {
                funcs.push(...code);
            })*/ return {
                roles,
                //funcs,
            };
        });
    }
    async getAttendanceDatasByEmp(
        year: number,
        month: number,
        employeeId: number,
        orderDir: string,
        limit: number,
        skip: number
    ): Promise<StdQueryListResult<Attendance> | ErrorHandler> {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        if (!orderDir || ["asc", "desc"].indexOf(orderDir) === -1) {
            orderDir = "asc";
        }
        //console.log(startDate,endDate)
        return await Attendance.findAndCountAll({
            order: [["date", orderDir]],
            limit: limit,
            offset: skip,
            where: {
                date: {
                    [Op.between]: [startDate, endDate],
                },
                employee: employeeId,
            },
        }).then((results) => {
            if (results === null) {
                return {
                    status: "error",
                    code: ErrorDef.DataNotFound,
                };
            } else {
                return {
                    count: results.count,
                    data: results.rows,
                    maxpage: Math.ceil(results.count / limit),
                };
            }
        });
    }
    async getAttendanceWeeksDatasByEmp(
        year: number,
        month: number,
        date: string,
        employeeId: number,
        orderDir: string,
        limit: number,
        skip: number
    ): Promise<{ leaves: LeaveReq[]; extrahours: ExtraHoursReq[]; data: Attendance[] }> {
        const startDate = moment.utc([year, month - 1, parseInt(date)]).toDate();
        const endDate = moment
            .utc([year, month - 1, parseInt(date)])
            .add(6, "days")
            .toDate();

        if (!orderDir || ["asc", "desc"].indexOf(orderDir) === -1) {
            orderDir = "asc";
        }
        //console.log(startDate,endDate)
        const results = await Attendance.findAll({
            attributes: ["id", "breakTime", "date", "inTime", "outTime", "reviewed", "rmk"],
            order: [["date", orderDir]],
            limit: limit,
            offset: skip,
            where: {
                date: {
                    [Op.between]: [startDate, endDate],
                },
                employee: employeeId,
            },
            include: { model: WorkProject, attributes: ["project", "usetime"] },
        });
        const leaves = await LeaveReq.findAll({
            attributes: ["endTime", "startTime", "type", "reason"],
            where: {
                [Op.or]: {
                    [Op.and]: {
                        startTime: {
                            [Op.lte]: startDate,
                        },
                        endTime: {
                            [Op.gte]: endDate,
                        },
                    },
                    [Op.or]: {
                        startTime: {
                            [Op.between]: [startDate, endDate],
                        },
                        endTime: {
                            [Op.between]: [startDate, endDate],
                        },
                    },
                },
                status: 2,
                employeeId,
            },
        });
        const extrahours = await ExtraHoursReq.findAll({
            attributes: ["date", "endTime", "startTime", "comp", "type", "hours", "reason", "rmk"],
            order: [["date", "asc"]],
            where: {
                date: {
                    [Op.between]: [startDate, endDate],
                },
                status: 2,
                employeeId,
            },
        });
        return {
            leaves,
            extrahours,
            data: results,
        };
    }
}

export default QueryService;
