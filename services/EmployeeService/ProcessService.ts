import { ResponseHandler, ErrorHandler } from "./../../types/queryTypes";
import { Request } from "express";
import { Op, Transaction } from "sequelize";
import "module-alias/register";
import {
    IntervieweeToEmployee,
    SalaryDef,
    EmpWork,
    Employee,
    WorkProject,
    Attendance,
    CompanyRule,
    ExtraHoursReq,
} from "@/domain-resource/ts-models";
import { ErrorDef } from "@/wf_common";
import moment from "moment";
import QueryService from "./QueryService";
import YearLeaveHourService from "../YearLeaveHourService";
class ProcessService extends QueryService {
    yearLeaveHourService = null;
    constructor(req: Request) {
        super(req);
        this.yearLeaveHourService = new YearLeaveHourService(req);
    }
    async createNewEmployee(updateData: any): Promise<void> {
        const { sequelize } = this.domainDBResource;
        await sequelize.transaction(async (transaction) => {
            const interviewee = await IntervieweeToEmployee.findOne({
                where: {
                    intervieweeId: updateData.intervieweeId,
                },
            });
            if (interviewee) {
                throw "501";
            }

            const newEmp = await Employee.create(updateData, { transaction });
            IntervieweeToEmployee.create(
                { intervieweeId: updateData.intervieweeId, employeeId: newEmp.id },
                { transaction }
            );
            updateData.def.forEach((def) => {
                def.employee = newEmp.id;
            });
            await SalaryDef.bulkCreate(updateData.def, { transaction });
            const workData = updateData.workpos.map((a) => {
                return {
                    workpos: a.workpos,
                    ord: a.ord,
                    emp: newEmp.id,
                };
            });
            await EmpWork.bulkCreate(workData, { transaction });
        });
    }
    async updateEmployeeBaseInfo(updateData: Partial<Employee>): Promise<void> {
        const { sequelize } = this.domainDBResource;
        await sequelize.transaction(async (transaction) => {
            if (!updateData.id) {
                await Employee.build(updateData).save({ transaction });
            } else {
                await Employee.update(updateData, { where: { id: updateData.id }, transaction });
            }
        });
    }
    async updateEmployeeWorkposition(updateData: EmpWorkAuditAttrs): Promise<void> {
        const { sequelize } = this.domainDBResource;
        const { employeeId, workpos } = updateData;
        await sequelize.transaction(async (transaction) => {
            await EmpWork.destroy({
                where: {
                    emp: employeeId,
                },
                transaction,
            });
            const workData = workpos.map((a) => {
                return {
                    workpos: a.workpos,
                    ord: a.ord,
                    emp: employeeId,
                };
            });
            await EmpWork.bulkCreate(workData, { transaction });
        });
    }
    async updateEmployeeWeekAttendances(updateData: EmployeeWeekAttendancesAuditAttrs): Promise<void> {
        const { employeeId, date } = updateData;
        // review attendance datas
        let startDate = moment.utc(date, "YYYY-MM-DDTHH:mm:ss.SSSZ").toDate();
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6);

        await Attendance.update(
            { reviewed: true },
            {
                where: {
                    date: {
                        [Op.between]: [startDate, endDate],
                    },
                    employee: employeeId,
                },
            }
        );
        // await ExtraHoursReq.update(
        //     { status: 2 },
        //     {
        //         where: { date: { [Op.between]: [startDate, endDate] }, employeeId },
        //     }
        // );
        // await this.yearLeaveHourService.updateEmployeeOvertimeLeaveHours(employeeId, startDate, endDate);
    }
    async updateAttendanceInfo(
        data: Partial<Attendance>,
        employeeId: number
    ): Promise<ResponseHandler<Attendance> | ErrorHandler> {
        const service = this;
        const { sequelize } = this.domainDBResource;
        const fillable = ["date", "inTime", "outTime", "employee", "breakTime", "comp"];
        return new Promise(function (resolve, reject) {
            sequelize.transaction(async (t) => {
                try {
                    if (!data.id) {
                        const newModel = { ...data, employee: employeeId };
                        await Attendance.build(newModel)
                            .save({ fields: fillable, transaction: t })
                            .then(async (model) => {
                                await service.afterProcessAttendance(model, data, employeeId, t);
                                resolve({ status: "ok", result: model });
                            });
                    } else {
                        await Attendance.findOne({
                            where: {
                                id: data.id,
                                employee: employeeId,
                            },
                            transaction: t,
                        }).then(async (model) => {
                            await model.update(data, { fields: fillable, transaction: t });
                            await service.afterProcessAttendance(model, data, employeeId, t);
                            resolve({ status: "ok", result: model });
                        });
                    }
                } catch (error) {
                    resolve({ status: "error", code: ErrorDef.ErrorTran, error: error });
                }
            });
        });
    }
    async afterProcessAttendance(
        attendanceData: Attendance,
        { WorkProjects, inTime, outTime, date, comp }: Partial<Attendance>,
        employeeId: number,
        transaction: Transaction
    ): Promise<void> {
        const attendanceId = attendanceData.id;
        await WorkProject.destroy({
            where: {
                attendanceId: attendanceId,
            },
            transaction,
        });
        const projects = WorkProjects
            ? WorkProjects.map((a) => {
                  return {
                      ...a,
                      attendanceId: attendanceId,
                  };
              })
            : [];
        const attendanceRule = await CompanyRule.findOne({});
        await WorkProject.bulkCreate(projects, { transaction });
        if (inTime && outTime) {
            let normalWorkHours = 8;
            const mdate = moment(date);
            if (mdate.weekday() === attendanceRule.offday || mdate.weekday() === attendanceRule.holiday) {
                normalWorkHours = 0;
            }
            const start = moment.utc(inTime, "YYYY-MM-DDTHH:mm:ss.SSSZ");
            const end = moment.utc(outTime, "YYYY-MM-DDTHH:mm:ss.SSSZ");
            const workHours = end.diff(start, "hours", true) - attendanceData.breakTime;

            await ExtraHoursReq.findOne({
                where: {
                    employeeId: employeeId,
                    date: date,
                },
                transaction,
            }).then(async (extraResults) => {
                const updateData = {
                    startTime: moment
                        .utc(outTime, "YYYY-MM-DDTHH:mm:ss.SSSZ")
                        .add(normalWorkHours - workHours, "hours")
                        .format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
                    endTime: end.format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
                    comp: comp,
                    hours: workHours > normalWorkHours ? Math.round((workHours - normalWorkHours) / 0.5) * 0.5 : 0, // 0.5為最小單位
                };
                if (extraResults) {
                    await extraResults.update(updateData, { transaction });
                } else {
                    await ExtraHoursReq.build({
                        employeeId: employeeId,
                        date: date,
                        type: 1,
                        status: 1,
                        ...updateData,
                    }).save({ transaction });
                }
            });
        }
    }
}

interface EmpWorkAuditAttrs {
    employeeId: number;
    workpos: Partial<EmpWork>[];
}

interface EmployeeWeekAttendancesAuditAttrs {
    employeeId: number;
    date: string;
}

export default ProcessService;
