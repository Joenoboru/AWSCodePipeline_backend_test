import { Request, Response } from "express";
import moment from "moment";
import { Op } from "sequelize";
import "module-alias/register";
import { YearLeaveHour, Employee, LeaveReq, CompanyRule } from "@/domain-resource/ts-models";
import { GovernmentCalendar } from "@/common-database/ts-models";
import { ErrorDef } from "@/wf_common";
import CalculateBaseService from "./CalculateService";
import YearLeaveHourService from "../YearLeaveHourService";
class LeaveHourService extends CalculateBaseService {
    yearLeaveHourService: YearLeaveHourService = null;
    constructor(req: Request) {
        super(req);
        this.yearLeaveHourService = new YearLeaveHourService(req);
    }
    async getEmployeeYearLeaveHourFunc(employeeId: number): Promise<YearLeaveHour> {
        const today = moment();
        const { sequelize } = this.domainDBResource;
        const employee = await Employee.findOne({ where: { id: employeeId } });
        const result = await sequelize.transaction(async (transaction) => {
            const employeeYearLeaveHour = await this.yearLeaveHourService.getEmployeeYearLeaveHour(
                transaction,
                employeeId,
                employee.hire_date,
                today
            );
            return employeeYearLeaveHour;
        });
        return result;
    }

    async getEmployeeYearLeaveHour(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        const result = await this.getEmployeeYearLeaveHourFunc(id);
        if (result) {
            res.send(result.hours);
        } else {
            res.send({});
        }
    }

    async calculateLeaveNeedHour(req: Request, res: Response): Promise<void> {
        const { startTime, endTime, employeeId } = req.body;
        // const attendanceRule = {
        //     workOn: "09:30",
        //     workOff: "18:30",
        //     breakStart: "12:00",
        //     breakEnd: "13:00",
        // };

        const attendanceRule = await CompanyRule.findOne({});
        const calendar = await GovernmentCalendar.findAll({
            where: {
                date: {
                    [Op.lte]: endTime,
                    [Op.gte]: startTime,
                },
            },
        });

        const start = moment(startTime);
        const end = moment(endTime);
        const existLeavereqs = await this.getLeaveReqByRange(employeeId, start.toDate(), end.toDate());
        const weekStart = moment(start.local().format("YYYY-MM-DD"), "YYYY-MM-DD");
        let needLeaveHours = 0;
        for (let walkStart = weekStart; walkStart.isBefore(end); walkStart = walkStart.add(1, "days")) {
            console.log(walkStart);
            let isHoliday = false;
            const currentDay = walkStart.local().format("YYYY-MM-DD");
            const matchCalendar = calendar.filter((a) => a.date === currentDay);
            if (matchCalendar.length > 0) {
                isHoliday = matchCalendar[0].isHoliday;
            }
            if (!isHoliday) {
                let oneDayMinutes = 0; //
                let dayStart = moment(new Date(currentDay + " " + attendanceRule.workOn));
                let dayEnd = moment(new Date(currentDay + " " + attendanceRule.workOff));
                const breakStart = moment(new Date(currentDay + " " + attendanceRule.breakStart));
                const breakEnd = moment(new Date(currentDay + " " + attendanceRule.breakEnd));
                if (dayStart.isBefore(start)) {
                    dayStart = start;
                }
                if (dayEnd.isAfter(end)) {
                    dayEnd = end;
                }
                if (dayStart.isBefore(breakEnd)) {
                    if (dayStart.isBefore(breakStart)) {
                        oneDayMinutes += -60;
                    } else {
                        oneDayMinutes += dayStart.diff(breakEnd, "minutes");
                    }
                }
                oneDayMinutes += dayEnd.diff(dayStart, "minutes");
                const halfHours = Math.ceil(oneDayMinutes / 30) / 2.0;
                needLeaveHours += halfHours;
            }
        }
        console.log(weekStart, needLeaveHours);
        res.send({ needLeaveHours, existLeavereqs });
    }
    async addLeaveReqs(data: LeaveReq): Promise<void> {
        const { sequelize } = this.domainDBResource;
        await sequelize.transaction(async (transaction) => {
            const result = await this.getEmployeeYearLeaveHourFunc(data.employeeId);
            if (result && data.type in result.hours) {
                const hours = {
                    ...result.hours,
                };
                hours[data.type] -= data.needhours;
                await result.update({ hours }, { transaction });
            }
            data.status = 2;
            await LeaveReq.build(data).save({ transaction });
        });
    }
    public async forceUpdateEmployeeYearLeaveHour(employeeId: number, data: any): Promise<void> {
        const role = await this.getCurrentUserRoles();
        if (role.includes("super") || role.includes("hr")) {
            const today = moment();
            const { sequelize } = this.domainDBResource;
            const employee = await Employee.findOne({ where: { id: employeeId } });
            await sequelize.transaction(async (transaction) => {
                const employeeYearLeaveHour = await this.yearLeaveHourService.getEmployeeYearLeaveHour(
                    transaction,
                    employeeId,
                    employee.hire_date,
                    today
                );
                if (employeeYearLeaveHour) {
                    await employeeYearLeaveHour.update({ hours: data }, { transaction });
                }
            });
        } else {
            throw ErrorDef.PROHIBIT_ACTION;
        }
    }
}

export default LeaveHourService;
