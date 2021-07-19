import { Request } from "express";
import moment from "moment";
import { Op } from "sequelize";
import "module-alias/register";
import { LeaveReq, CompanyRule } from "@/domain-resource/ts-models";
import { GovernmentCalendar } from "@/common-database/ts-models";
import BaseService from "../BaseService";

const oneDayMillionSeconds = 84000000;
class CalculateService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    dateTimeInSection(start: number, end: number, middle: number): boolean {
        // start 07-26 09:30
        // end 07-29 18:30
        // middle 07-28 00:00
        if (middle >= start && middle <= end) {
            return true;
        }
        // start 07-28 09:30
        // end 07-29 18:30
        // middle 07-28 00:00
        if (start > middle && start - middle < oneDayMillionSeconds) {
            return true;
        }
        // start 07-28 09:30
        // end 07-30 18:30
        // middle 07-30 00:00
        if (end > middle && end - middle < oneDayMillionSeconds) {
            return true;
        }
        return false;
    }
    async getLeaveReqByRange(employeeId: number, startMonth: Date, endMonth: Date): Promise<LeaveReq[]> {
        const leaveReqs = await LeaveReq.findAll({
            // TODO NEED CHECK
            where: {
                status: 2, // 通過的假期申請
                employeeId,
                [Op.or]: [
                    {
                        startTime: { [Op.gte]: startMonth },
                        endTime: { [Op.lte]: endMonth },
                    },
                    {
                        startTime: { [Op.lte]: startMonth },
                        endTime: { [Op.gte]: startMonth },
                    },
                    {
                        startTime: { [Op.lte]: endMonth },
                        endTime: { [Op.gte]: endMonth },
                    },
                    {
                        startTime: { [Op.lte]: startMonth },
                        endTime: { [Op.gte]: endMonth },
                    },
                ],
            },
        });
        return leaveReqs;
    }
    calculateEmployeeLeaveHours = async (startMonth: Date, endMonth: Date, employeeId: number): Promise<any> => {
        const attendanceRule = await CompanyRule.findOne({});
        const calendar = await GovernmentCalendar.findAll({
            where: {
                date: {
                    [Op.lte]: endMonth,
                    [Op.gte]: startMonth,
                },
            },
        });
        const leaveReqs = await this.getLeaveReqByRange(employeeId, startMonth, endMonth);

        return this.calculateLeaveHours(startMonth, endMonth, calendar, leaveReqs, attendanceRule);
    };
    calculateLeaveHours(
        startMonth: Date,
        endMonth: Date,
        calendar: any[],
        leaveReqs: LeaveReq[],
        attendanceRule: any
    ): any[] {
        const service = this;
        const result = [];
        const start = moment(startMonth);
        const end = moment(endMonth);
        for (let walkStart = start; walkStart.isBefore(end); walkStart = walkStart.add(1, "days")) {
            console.log(walkStart);
            let isHoliday = false;
            const currentDay = walkStart.local().format("YYYY-MM-DD");
            const matchCalendar = calendar.filter((a) => a.date === currentDay);
            if (matchCalendar.length > 0) {
                isHoliday = matchCalendar[0].isHoliday;
            }
            if (!isHoliday) {
                const walkStartMilliseconds = walkStart.valueOf();
                const matchLeaveReqs = leaveReqs.filter((a) =>
                    service.dateTimeInSection(
                        moment.utc(a.startTime).toDate().getTime(),
                        moment.utc(a.endTime).toDate().getTime(),
                        walkStartMilliseconds
                    )
                );
                console.log(currentDay);
                for (let i = 0; i < matchLeaveReqs.length; i++) {
                    const { startTime, endTime, type } = matchLeaveReqs[i];
                    console.log(startTime, endTime, type);
                }
                for (let i = 0; i < matchLeaveReqs.length; i++) {
                    const currentLeaveReq = matchLeaveReqs[i];
                    const leaveStart = moment(currentLeaveReq.startTime);
                    const leaveEnd = moment(currentLeaveReq.endTime);
                    const leaveType = currentLeaveReq.type;
                    let oneDayMinutes = 0; //
                    let dayStart = moment(new Date(currentDay + " " + attendanceRule.workOn));
                    let dayEnd = moment(new Date(currentDay + " " + attendanceRule.workOff));
                    const breakStart = moment(new Date(currentDay + " " + attendanceRule.breakStart));
                    const breakEnd = moment(new Date(currentDay + " " + attendanceRule.breakEnd));
                    if (dayStart.isBefore(leaveStart)) {
                        dayStart = leaveStart;
                    }
                    if (dayEnd.isAfter(leaveEnd)) {
                        dayEnd = leaveEnd;
                    }
                    if (dayStart.isBefore(breakEnd)) {
                        if (dayStart.isAfter(breakStart)) {
                            oneDayMinutes += -breakEnd.diff(dayStart, "minutes");
                        } else {
                            oneDayMinutes += -breakEnd.diff(breakStart, "minutes");
                        }
                    }
                    oneDayMinutes += dayEnd.diff(dayStart, "minutes");
                    const halfHours = Math.ceil(oneDayMinutes / 30) / 2.0;
                    const insertData = { leaveType, hours: halfHours };
                    const findData = result.filter((a) => a.date === currentDay);

                    if (findData.length > 0) {
                        const useData = findData[0];
                        useData.leaveData.push(insertData);
                    } else {
                        result.push({
                            date: currentDay,
                            leaveData: [insertData],
                        });
                    }
                }
            }
        }
        return result;
    }
}

export default CalculateService;
