import { Request } from "express";
import { Op, Transaction } from "sequelize";
import moment, { Moment } from "moment";
import "module-alias/register";
import {
    YearLeaveHour,
    YearLeaveHourRecord,
    YearLeaveHourExtraRecord,
    ExtraHoursReq,
    CompanyRule,
    LeaveType,
    Employee,
} from "@/domain-resource/ts-models";
import BaseService from "../BaseService";

const momentType = (type) => {
    if (type === "y") {
        return "years";
    } else if (type === "m") {
        return "months";
    } else if (type === "w") {
        return "weeks";
    } else if (type === "d") {
        return "days";
    }
};

class YearLeaveHourService extends BaseService {
    private leaveType = "3";
    constructor(req: Request) {
        super(req);
    }

    public calculateExtraHours(totalHours: number, standardHours: number, extraMinutesLimit: number): number {
        if (totalHours <= standardHours) {
            return 0;
        }
        const extraMinutes = Math.round(((totalHours - standardHours) * 60) / extraMinutesLimit);
        const extraHours = (extraMinutes * extraMinutesLimit) / 60;
        return parseFloat(extraHours.toFixed(2));
    }

    async updateEmployeeOvertimeLeaveHours(employeeId: number, startDate: Date, endDate: Date): Promise<void> {
        const service = this;
        const { sequelize } = this.domainDBResource;
        const extraReqs = await ExtraHoursReq.findAll({
            attributes: ["id", "date", "hours", "status"],
            where: { date: { [Op.between]: [startDate, endDate] }, employeeId, comp: 1 },
        });
        const employee = await Employee.findOne({
            where: {
                id: employeeId,
            },
            attributes: ["hire_date"],
        });
        const attendanceRule = await CompanyRule.findOne({});
        const today = moment();
        await sequelize.transaction(async (transaction) => {
            const employeeYearLeaveHour = await service.getEmployeeYearLeaveHour(
                transaction,
                employeeId,
                employee.hire_date,
                today
            );
            let totalHours = 0;
            for (let index = 0; index < extraReqs.length; index++) {
                const extraReq = extraReqs[index];
                const extraDate = moment(extraReq.date);
                let extraHours = extraReq.hours;

                if (extraDate.weekday() === attendanceRule.holiday) {
                    extraHours = 8 * 2;
                }
                if (extraReq.status === 4) {
                    extraHours = 0;
                }
                const originRecord = await YearLeaveHourExtraRecord.findOne({
                    where: {
                        yearLeaveHourId: employeeYearLeaveHour.id,
                        extrahoursreqId: extraReq.id,
                    },
                });
                if (originRecord) {
                    const originHours = originRecord.hours;
                    originRecord.update({ hours: extraHours }, { transaction });
                    extraHours -= originHours;
                } else {
                    YearLeaveHourExtraRecord.create(
                        {
                            yearLeaveHourId: employeeYearLeaveHour.id,
                            extrahoursreqId: extraReq.id,
                            hours: extraHours,
                        },
                        { transaction }
                    );
                }
                totalHours += extraHours;
            }

            if (!employeeYearLeaveHour.hours[this.leaveType]) {
                employeeYearLeaveHour.hours[this.leaveType] = 0;
            }
            employeeYearLeaveHour.hours[this.leaveType] += totalHours;
            // update employeeYearLeaveHour
            await YearLeaveHour.update(
                { hours: { ...employeeYearLeaveHour.hours } },
                {
                    where: {
                        id: employeeYearLeaveHour.id,
                        employeeId,
                    },
                    transaction,
                }
            );
        });
    }
    async getEmployeeYearLeaveHour(
        transaction: Transaction,
        employeeId: number,
        hire_date: Date,
        today: Moment
    ): Promise<YearLeaveHour> {
        let employeeYearLeaveHour = await YearLeaveHour.findOne({
            where: {
                employeeId,
                startDate: {
                    [Op.lte]: today.format("YYYY-MM-DD"),
                },
                endDate: {
                    [Op.gt]: today.format("YYYY-MM-DD"),
                },
            },
            include: [
                {
                    attributes: ["type"],
                    model: YearLeaveHourRecord,
                },
            ],
            transaction,
        });
        // process one year leave hour init value
        if (!employeeYearLeaveHour) {
            const lastEmployeeYearLeaveHour = await YearLeaveHour.findOne({
                where: {
                    employeeId,
                    startDate: {
                        [Op.lte]: today,
                    },
                },
                transaction,
            });
            let startDate = moment(hire_date);
            if (lastEmployeeYearLeaveHour) {
                startDate = moment(lastEmployeeYearLeaveHour.endDate);
            }
            const totalYears = today.diff(startDate, "years");
            if (totalYears > 1) {
                startDate.add("y", totalYears);
            }
            const startDateString = startDate.format("YYYY-MM-DD");
            const newData = {
                employeeId,
                startDate: startDateString,
                endDate: moment(startDateString).add("y", 1).format("YYYY-MM-DD"),
                hours: {
                    3: 0,
                },
            };
            employeeYearLeaveHour = await YearLeaveHour.create(newData, { transaction });
        }
        return employeeYearLeaveHour;
    }
    async calculateYearLeaveHour(employeeId: number, today: Moment, leaveTypes: any[]): Promise<void> {
        const service = this;
        const { sequelize } = this.domainDBResource;
        leaveTypes = leaveTypes
            ? leaveTypes
            : await LeaveType.findAll({
                  attributes: ["id", "repetitions"],
              }).then((results) => {
                  return results.filter((a) => a.repetitions != null && a.repetitions.length > 0);
              });
        const employee = await Employee.findOne({
            where: {
                id: employeeId,
                status: 1,
            },
            attributes: ["hire_date"],
        });
        if (!employee) {
            // 無此員工
            return null;
        }
        return await sequelize.transaction(async (transaction) => {
            const employeeYearLeaveHour = await service.getEmployeeYearLeaveHour(
                transaction,
                employeeId,
                employee.hire_date,
                today
            );

            const hireMoment = moment(employee.hire_date);
            // process leaveType to give employee leave hours
            for (let index = 0; index < leaveTypes.length; index++) {
                const leaveType = leaveTypes[index];
                if (!employeeYearLeaveHour.hours[`${leaveType.id}`]) {
                    employeeYearLeaveHour.hours[`${leaveType.id}`] = 0;
                }
                for (let rIndex = 0; rIndex < leaveType.repetitions.length; rIndex++) {
                    const repetition = leaveType.repetitions[rIndex];
                    const recordType = `${leaveType.id}_${repetition.type}_${repetition.num}_${repetition.units}`;
                    const giveLeaveHours = parseInt(repetition.days) * 8;
                    if (today.diff(hireMoment, momentType(repetition.units), true) >= parseInt(repetition.num)) {
                        if (repetition.type === "0") {
                            // only once
                            const count = await YearLeaveHourRecord.count({
                                where: {
                                    employeeId,
                                    type: recordType,
                                },
                            });
                            if (count === 0) {
                                employeeYearLeaveHour.hours[`${leaveType.id}`] += giveLeaveHours;
                                const recordData = {
                                    yearLeaveHourId: employeeYearLeaveHour.id,
                                    employeeId,
                                    type: recordType,
                                };
                                await YearLeaveHourRecord.create(recordData, { transaction });
                            }
                        } else {
                            const count = await YearLeaveHourRecord.count({
                                where: {
                                    yearLeaveHourId: employeeYearLeaveHour.id,
                                    employeeId,
                                    type: recordType,
                                },
                            });
                            if (count === 0) {
                                employeeYearLeaveHour.hours[`${leaveType.id}`] += giveLeaveHours;
                                await YearLeaveHourRecord.create(
                                    {
                                        yearLeaveHourId: employeeYearLeaveHour.id,
                                        employeeId,
                                        type: recordType,
                                    },
                                    { transaction }
                                );
                            }
                        }
                    }
                }
            }
            // update employeeYearLeaveHour
            await YearLeaveHour.update(
                { hours: { ...employeeYearLeaveHour.hours } },
                {
                    where: {
                        id: employeeYearLeaveHour.id,
                        employeeId,
                    },
                    transaction,
                }
            );
        });
    }
    async updateAllEmployeeLeaveHour(today: Moment): Promise<void> {
        const service = this;
        const leaveTypes = await LeaveType.findAll({
            attributes: ["id", "repetitions"],
        }).then((results) => {
            return results.filter((a) => a.repetitions != null && a.repetitions.length > 0);
        });
        const employees = await Employee.findAll({
            where: {
                status: 1,
                hire_date: {
                    [Op.ne]: null,
                },
            },
            attributes: ["id"],
        });
        for (let index = 0; index < employees.length; index++) {
            await service.calculateYearLeaveHour(employees[index].id, today, leaveTypes);
        }
    }
}
export default YearLeaveHourService;
