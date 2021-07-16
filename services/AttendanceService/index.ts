import { FindAndCountOptions, Op, Transaction } from "sequelize";
import { Request } from "express";
import moment from "moment";
import "module-alias/register";
import { Attendance, WorkProject } from "@/domain-resource/ts-models";
import { ErrorDef } from "@/wf_common";
import { ErrorHandler, ResponseHandler, StdQueryListResult } from "@/types/queryTypes";
import BaseService from "../BaseService";
import AttendanceDataImportService from "./dataImport";

class AttendanceService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    public async getOne(id: number, employeeId: number): Promise<ErrorHandler | Attendance> {
        const options = {
            where: {
                id: id,
                employee: null,
            },
            include: [{ model: WorkProject }],
        };
        if (employeeId) {
            options.where.employee = employeeId;
        }
        return await Attendance.findOne(options).then((result) => {
            if (result === null) {
                return {
                    status: "error",
                    code: ErrorDef.DataNotFound,
                };
            }
            return result;
        });
    }

    public async getAttendanceDatasByEmp(
        year: number,
        month: number,
        employeeId: number
    ): Promise<ErrorHandler | StdQueryListResult<Attendance>> {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        let orderDir = this.page.orderDir;
        if (!orderDir || ["asc", "desc"].indexOf(orderDir) === -1) {
            orderDir = "asc";
        }
        const options: FindAndCountOptions = {
            order: [["date", orderDir]],
            limit: this.page.limit,
            offset: this.page.offset,
            where: {
                date: {
                    [Op.between]: [startDate, endDate],
                },
                employee: employeeId || null,
            },
        };
        return await Attendance.findAndCountAll(options).then((results) => {
            if (results === null) {
                return {
                    status: "error",
                    code: ErrorDef.DataNotFound,
                };
            } else {
                return {
                    count: results.count,
                    data: results.rows,
                    maxpage: Math.ceil(results.count / options.limit),
                };
            }
        });
    }

    public async updateAttendanceInfo(
        data: Attendance,
        employeeId: number
    ): Promise<ResponseHandler<Attendance> | ErrorHandler> {
        const service = this;
        const fillable = ["date", "inTime", "outTime", "employee", "breakTime", "comp"];
        return await new Promise(function (resolve, reject) {
            service.domainDBResource.sequelize.transaction(async (transaction) => {
                try {
                    const newModel = {
                        ...data,
                        employee: employeeId,
                    } as Attendance;
                    if (data.inTime) {
                        newModel.inTime = moment
                            .utc(data.inTime, "YYYY-MM-DDTHH:mm:ss.SSSZ")
                            .startOf("minutes")
                            .format("HH:mm:ss.SSS");
                    }
                    if (data.outTime) {
                        newModel.outTime = moment
                            .utc(data.outTime, "YYYY-MM-DDTHH:mm:ss.SSSZ")
                            .startOf("minutes")
                            .format("HH:mm:ss.SSS");
                    }
                    if (!data.id) {
                        await Attendance.build(newModel)
                            .save({ fields: fillable, transaction: transaction })
                            .then(async (model) => {
                                await service.afterProcessAttendance(model, data, employeeId, transaction);
                                resolve({ status: "ok", result: model });
                            });
                    } else {
                        await Attendance.findOne({
                            where: {
                                id: data.id,
                                employee: employeeId,
                            },
                            transaction,
                        }).then(async (model) => {
                            await model.update(newModel, { fields: fillable, transaction });
                            await service.afterProcessAttendance(model, data, employeeId, transaction);
                            resolve({ status: "ok", result: model });
                        });
                    }
                } catch (error) {
                    service.logger.error(error);
                    resolve({ status: "error", code: ErrorDef.ErrorTran, error: error });
                }
            });
        });
    }

    private async afterProcessAttendance(
        attendanceData: Attendance,
        { WorkProjects, inTime, outTime, date, comp }: Attendance,
        employeeId: number,
        transaction: Transaction
    ) {
        //const service = this;
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
        //const companyRule = await CompanyRule.findOne({});
        //const extralimit = companyRule.extraLimitMinutes;

        await WorkProject.bulkCreate(projects, { transaction });
        // 把加班給移到其他部分去作申請處理
        // eslint-disable-next-line no-constant-condition
        // if (false) {
        //     let normalWorkHours = 8;
        //     const mdate = moment(date);
        //     if (mdate.weekday() === companyRule.offday || mdate.weekday() === companyRule.holiday) {
        //         normalWorkHours = 0;
        //     }
        //     const start = moment.utc(inTime, "YYYY-MM-DDTHH:mm:ss.SSSZ");
        //     const end = moment.utc(outTime, "YYYY-MM-DDTHH:mm:ss.SSSZ");
        //     const workHours = end.diff(start, "hours", true) - attendanceData.breakTime;

        //     await ExtraHoursReq.findOne(
        //         {
        //             where: {
        //                 employeeId: employeeId,
        //                 date: date,
        //             },
        //         },
        //         { transaction }
        //     ).then(async (extraResults) => {
        //         const updateData = {
        //             startTime: moment
        //                 .utc(outTime, "YYYY-MM-DDTHH:mm:ss.SSSZ")
        //                 .add(normalWorkHours - workHours, "hours")
        //                 .format("HH:mm:ss.SSS"),
        //             endTime: end.format("HH:mm:ss.SSS"),
        //             comp: comp,
        //             hours: service.calculateExtraHours(workHours, normalWorkHours, extralimit), // 看公司最小單位
        //         };
        //         if (extraResults) {
        //             await extraResults.update(updateData, { transaction });
        //         } else {
        //             await ExtraHoursReq.build({
        //                 employeeId: employeeId,
        //                 date: date,
        //                 type: 1,
        //                 status: 1,
        //                 ...updateData,
        //             }).save({ transaction });
        //         }
        //     });
        // }
    }

    public async deleteAttendanceInfo(id: number, employeeId: number): Promise<ResponseHandler<Attendance>> {
        const options = {
            where: {
                id: id,
                employee: null,
            },
        };
        if (employeeId) {
            options.where.employee = employeeId;
        }
        return await Attendance.findOne(options).then(async (model) => {
            await model.destroy();
            return { status: "ok", result: model };
        });
    }
}
export { AttendanceDataImportService };
export default AttendanceService;
