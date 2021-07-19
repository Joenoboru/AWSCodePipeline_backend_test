import { Request } from "express";
import { Op } from "sequelize";
import moment, { Moment } from "moment";
import "module-alias/register";
import { Attendance, LeaveType, ExtraHoursReq, YearLeaveHour, Employee } from "@/domain-resource/ts-models";
import { GovernmentCalendar } from "@/common-database/ts-models";

import SalaryBaseService from "./SalaryBaseService";
import LeaveService from "../LeaveHourService";

class CalculateBaseService extends SalaryBaseService {
    workDaysData;
    leaveService: LeaveService;
    constructor(req: Request) {
        super(req);
        this.leaveService = new LeaveService(req);
    }
    /**
     * 0 => 工作日
     * 1 => 所定休日（休息日）
     * 2 => 祝日（国定休日）
     * 3 => 法定休日（例假日）
     */
    parseHolidayCatString(date: Moment, row: { name: string; holidayCategory: string }): number {
        const weekday = date.day();
        //TODO 要知道補假的日期是哪一天
        if (["星期六、星期日", "補假", "調整放假日"].indexOf(row.holidayCategory) > -1) {
            if (weekday === 0) {
                return 3;
            }
            return 1;
        }
        if (row.holidayCategory === "放假之紀念日及節日" || row.name === "勞動節") {
            return 2;
        }
        if (row.name === "軍人節") {
            //排除軍人節
            if (weekday === 6) {
                return 1;
            }
            if (weekday === 0) {
                return 3;
            }
        }
        return 0;
    }
    /**
     * 計算工作必須時數總和
     * @param {Date} start
     * @param {Date} end
     * @returns {Array<{date:string, holidayCat:number}}
     */
    async getWorkDays(start: Date, end: Date): Promise<Array<{ date: string; holidayCat: number }>> {
        //console.log(workDaysTemp);
        if (this.workDaysData) {
            return this.workDaysData;
        }
        const specialDays = await GovernmentCalendar.findAll({
            attributes: ["date", "name", "holidayCategory", "isHoliday"],
            where: {
                date: {
                    [Op.between]: [start, end],
                },
            },
            raw: true,
        }).then((result) => {
            return result;
        });
        const workDaysData = [];
        //console.log(specialDays);
        for (let walk = moment(start); walk.isSameOrBefore(end); walk.add(1, "days")) {
            //if()
            const currentDate = walk.format("YYYY-MM-DD"); //dateformat.asString("yyyy-MM-dd", walk);
            const sdRow = specialDays.find((row) => currentDate === row.date);
            if (sdRow && sdRow.isHoliday) {
                const cat = this.parseHolidayCatString(walk, sdRow);
                workDaysData.push({
                    date: currentDate,
                    holidayCat: cat,
                });
                //console.log(currentDate + " " + cat);
            } else {
                workDaysData.push({
                    date: currentDate,
                    holidayCat: 0,
                });
                //console.log(currentDate + " " + 0);
            }
        }
        this.workDaysData = workDaysData;
        return workDaysData;
    }
    /**
     *
     * @param {number} year
     * @param {number} month
     * @param {number} empId
     * @param {number} baseDate
     */
    async calcWorkHour(start: Moment, end: Moment, empId: number, leaveTypes: LeaveType[]): Promise<any> {
        const service = this;
        const workdaysData = await this.getWorkDays(start.toDate(), end.toDate());
        const attendancesData = await this.getAttendances(start.toDate(), end.toDate(), empId);
        const extraHoursReqs = await this.getExtraHoursReqs(start.toDate(), end.toDate(), empId);
        const leaveRecords = await this.leaveService.calculateEmployeeLeaveHours(start.toDate(), end.toDate(), empId);
        //const leavesData = await getLeaves(start, end, empId);
        //console.log(attendancesData);
        let totalHours = 0; //總工作時數 (不含加班)
        let originTotalExtraHours = 0; //總加班時數 (原始)
        let totalExtraHours = 0; //總加班時數 (加成)
        let totalAbsenceHours = 0; //缺勤總計
        let totalLeaveHours = 0; //缺勤總計
        const employeeWorkData = [];

        workdaysData.forEach((workdaysData) => {
            const workDate = workdaysData.date;
            // attendance data;
            const attendances = attendancesData.find((row) => row.date === workDate);
            const extraHoursReq = extraHoursReqs.find((row) => row.date === workDate);
            const stdWorkHours = workdaysData.holidayCat === 0 ? 8 : 0; //應工作時數
            const actualWorkHours = attendances
                ? attendances.workHours > stdWorkHours
                    ? stdWorkHours
                    : attendances.workHours
                : 0; //實際工時數
            // overHours 0.5 hours be a least unit
            const overHours = attendances && extraHoursReq ? extraHoursReq.hours : 0; //加班時數
            const dayTotal = actualWorkHours; //總時數

            let extraHours = 0;
            // 加班歸加班
            if (overHours > 0) {
                if (attendances && attendances.comp === 2) {
                    //加班處理，換錢才算
                    extraHours = service.calOverHour(workdaysData.holidayCat, overHours);
                    totalExtraHours += extraHours;
                    originTotalExtraHours += overHours;
                }
            }
            // 缺勤歸缺勤
            if (!attendances) {
                //缺勤處理
                totalAbsenceHours += stdWorkHours;
            } else if (attendances.workHours < stdWorkHours) {
                totalAbsenceHours += stdWorkHours - attendances.workHours;
            }
            // 請假處理歸請假處理
            // leaveReq data
            const leaveRecord = leaveRecords.find((a) => a.date === workDate);
            let dayLeaveHours = 0;
            const dayLeaveRecords = [];
            if (leaveRecord) {
                for (let index = 0; index < leaveRecord.leaveData.length; index++) {
                    const { leaveType, hours } = leaveRecord.leaveData[index];
                    const discount = leaveTypes.find((a) => a.id === leaveType).discount;
                    const leaveDiscountHours = (hours * (100 - discount)) / 100;
                    totalAbsenceHours -= leaveDiscountHours;
                    dayLeaveHours += hours;
                    dayLeaveRecords.push({
                        leaveType,
                        hours,
                    });
                }
            }
            totalLeaveHours += dayLeaveHours;
            totalHours += dayTotal;
            employeeWorkData.push({
                date: workDate,
                comp: attendances ? attendances.comp : 1,
                cat: workdaysData.holidayCat,
                actualWorkHours,
                overHours,
                extraHours,
                dayLeaveHours,
                dayLeaveRecords,
            });
            // console.log([workdaysData, dayTotal, overHours]);
        });

        //console.log([totalHours, totalAbsenceHours]);
        return {
            totalHours,
            originTotalExtraHours,
            totalExtraHours,
            totalAbsenceHours,
            totalLeaveHours,
            employeeWorkData,
        };
    }

    /**
     *
     * @param {number} cat
     * @param {number} overhour
     * @returns {number}
     */
    calOverHour(cat: number, overhour: number): number {
        switch (cat) {
            default:
            case 0: //平日に残業
                if (overhour <= 2) {
                    //8~10hr
                    return overhour * 1.34;
                } else {
                    //10~12hr
                    return 2 * 1.34 + (overhour - 2) * 1.67;
                }
            case 1: //所定休日（休息日）の出勤
                if (overhour <= 2) {
                    //0~2hr
                    return overhour * 1.34;
                } else if (overhour <= 8) {
                    //2~8hr
                    return 2 * 1.34 + (overhour - 2) * 1.67;
                } else {
                    //8~12hr
                    return 2 * 1.34 + 6 * 1.67 + (overhour - 8) * 2.67;
                }
            case 2: //祝日（国定休日）の出勤
                if (overhour <= 8) {
                    //0~8hr
                    return overhour;
                } else if (overhour <= 10) {
                    //8~10hr
                    return 8 + (overhour - 8) * 1.34;
                } else {
                    //10~12hr
                    return 8 + 2 * 1.34 + (overhour - 10) * 1.67;
                }
            case 3: //法定休日（例假日）の出勤
                if (overhour <= 8) {
                    //0~8hr
                    return 8;
                } else {
                    //8~12hr
                    return 8 + (overhour - 8) * 2;
                }
        }
    }

    /**
     * 讀取實際工作時間
     * @param {Date} start
     * @param {Date} end
     * @param {number} empId
     * @returns {Array<{date:string, workHours:number}}
     */
    async getAttendances(
        start: Date,
        end: Date,
        empId: number
    ): Promise<Array<{ date: string; workHours: number; comp: number }>> {
        return await Attendance.findAll({
            attributes: ["date", "in_time", "out_time", "break_time", "comp"],
            where: {
                employee: empId,
                date: {
                    [Op.between]: [start, end],
                },
                reviewed: true,
            },
            raw: true,
        }).then((result) => {
            return result.map((row) => {
                if (!row.inTime || !row.outTime) {
                    return {
                        date: row.date,
                        workHours: 0,
                        comp: 0,
                    };
                }
                const in_time_arr = row.inTime.split(":");
                const out_time_arr = row.outTime.split(":");
                const in_time_hours = Number(in_time_arr[0]) + Number(in_time_arr[1]) / 60;
                const out_time_hours = Number(out_time_arr[0]) + Number(out_time_arr[1]) / 60;
                const workHours = out_time_hours - in_time_hours - Number(row.breakTime);
                return {
                    date: row.date,
                    workHours,
                    comp: row.comp,
                };
            });
        });
    }

    async getExtraHoursReqs(start: Date, end: Date, empId: number): Promise<ExtraHoursReq[]> {
        return await ExtraHoursReq.findAll({
            attributes: ["date", "hours"],
            where: {
                employee: empId,
                date: {
                    [Op.between]: [start, end],
                },
                hours: {
                    [Op.gt]: 0,
                },
                status: 2,
                comp: 2,
            },
            raw: true,
        }).then((results) => {
            return results;
        });
    }

    /**
     * TODO: 休暇賃金換算
     * @param {*} year
     * @param {*} month
     * @param {*} employee
     * @param {*} baseDate
     * @param {*} hoursAmount
     * @param {*} leaveTypes
     */
    async calLeaveToMoney(
        monthStart: Moment,
        monthEnd: Moment,
        employee: Employee,
        hoursAmount: number,
        leaveTypes: LeaveType[]
    ): Promise<number> {
        const service = this;
        let leaveMoney = 0;
        let lastYearLeaveHour = await YearLeaveHour.findOne({
            where: {
                employeeId: employee.id,
                endDate: {
                    [Op.gte]: monthStart.format("YYYY-MM-DD"),
                    [Op.lt]: monthEnd.format("YYYY-MM-DD"),
                },
            },
        });
        // employee本月內離職的話
        if (employee.status === 2) {
            lastYearLeaveHour = await YearLeaveHour.findOne({
                where: {
                    employeeId: employee.id,
                    endDate: {
                        [Op.gte]: moment.utc(employee.hire_date).format("YYYY-MM-DD"),
                    },
                },
            });
        }
        if (lastYearLeaveHour) {
            const hours = lastYearLeaveHour.hours;
            for (const key in hours) {
                let leaveRemainHours = hours[key];
                if (leaveRemainHours > 0) {
                    if (leaveTypes.find((a) => a.id === parseInt(key)).exchange) {
                        if (key === "3") {
                            //補休是特別的處理方式

                            const allExtraReqs = (await ExtraHoursReq.findAll({
                                attributes: ["date", "hours"],
                                where: {
                                    employeeId: employee.id,
                                    comp: 2,
                                    status: 2,
                                    date: {
                                        [Op.gte]: lastYearLeaveHour.startDate,
                                        [Op.lt]: lastYearLeaveHour.endDate,
                                    },
                                    hours: { [Op.gt]: 0 },
                                },
                                raw: true,
                            })) as ExtraHoursReqExtendObj[];

                            const workdays = await this.getWorkDaysInMemory(
                                moment.utc(lastYearLeaveHour.startDate).toDate(),
                                moment.utc(lastYearLeaveHour.endDate).add(-1, "days").toDate()
                            );

                            allExtraReqs.forEach((data) => {
                                data.holidayCat = workdays.find((b) => b.date === data.date).holidayCat;
                                data.originHours = data.hours;
                                if (data.holidayCat === 3 && data.originHours < 8) {
                                    data.originHours = 8; //休息日不管加多久就是8小時
                                }
                                data.hours = 0;
                            });
                            //TODO: 休暇賃金換算

                            // console.debug(leaveRemainHours);
                            const normalExtraReqs = allExtraReqs.filter((a) => {
                                return a.holidayCat === 0;
                            });
                            const breakExtraReqs = allExtraReqs.filter((a) => {
                                return a.holidayCat > 0 && a.holidayCat < 3;
                            });
                            const mostExpensiveExtraReqs = allExtraReqs.filter((a) => {
                                return a.holidayCat === 3;
                            });
                            // ==== monday to friday ====
                            // 2 hours first
                            leaveRemainHours = service.processExtraHours(leaveRemainHours, normalExtraReqs, 2);
                            // 2~4 hours
                            leaveRemainHours = service.processExtraHours(
                                leaveRemainHours,
                                normalExtraReqs.filter((a) => a.originHours > 2),
                                8
                            );
                            // ==== saturday ====
                            // 2 hours first
                            leaveRemainHours = service.processExtraHours(leaveRemainHours, breakExtraReqs, 2);
                            // 2~8 hours
                            leaveRemainHours = service.processExtraHours(
                                leaveRemainHours,
                                breakExtraReqs.filter((a) => a.originHours > 2),
                                6
                            );
                            // ==== sunday ====
                            // 2 hours first
                            leaveRemainHours = service.processExtraHours(leaveRemainHours, mostExpensiveExtraReqs, 8);
                            // 2~4 hours
                            leaveRemainHours = service.processExtraHours(
                                leaveRemainHours,
                                mostExpensiveExtraReqs.filter((a) => a.originHours > 8),
                                16
                            );
                            // ==== saturday ====
                            // 8 hours over
                            leaveRemainHours = service.processExtraHours(
                                leaveRemainHours,
                                breakExtraReqs.filter((a) => a.originHours > 8),
                                8
                            );

                            let overHours = 0;
                            allExtraReqs
                                .filter((a) => a.hours > 0)
                                .forEach((a) => {
                                    overHours += service.calOverHour(a.holidayCat, a.hours);
                                });
                            overHours += leaveRemainHours;
                            //TODO 補休要推斷回去原本的工作時間算加班費
                            leaveMoney += Math.round(overHours * hoursAmount);
                        } else {
                            leaveMoney += Math.round(leaveRemainHours * hoursAmount);
                        }
                    }
                }
            }
        }
        return leaveMoney;
    }
    /**
     * 計算工作必須時數總和
     * @param {Date} start
     * @param {Date} end
     * @returns {Array<{date:string, holidayCat:number}}
     */
    async getWorkDaysInMemory(start: Date, end: Date): Promise<Array<{ date: string; holidayCat: number }>> {
        const specialDays = await GovernmentCalendar.findAll({
            attributes: ["date", "name", "holidayCategory", "isHoliday"],
            where: {
                date: {
                    [Op.between]: [start, end],
                },
            },
            raw: true,
        }).then((result) => {
            return result;
        });
        const workDaysData = [];
        //console.log(specialDays);
        for (let walk = moment(start); walk.isSameOrBefore(end); walk.add(1, "days")) {
            //if()
            const currentDate = walk.format("YYYY-MM-DD"); //dateformat.asString("yyyy-MM-dd", walk);
            const sdRow = specialDays.find((row) => currentDate === row.date);
            if (sdRow && sdRow.isHoliday) {
                const cat = this.parseHolidayCatString(walk, sdRow);
                workDaysData.push({
                    date: currentDate,
                    holidayCat: cat,
                });
                //console.log(currentDate + " " + cat);
            } else {
                workDaysData.push({
                    date: currentDate,
                    holidayCat: 0,
                });
                //console.log(currentDate + " " + 0);
            }
        }
        return workDaysData;
    }

    processExtraHours(
        leaveRemainHours: number,
        normalExtraReqs: ExtraHoursReqExtendObj[],
        defaultSubHours: number
    ): number {
        for (let index = 0; leaveRemainHours > 0 && index < normalExtraReqs.length; index++) {
            let subHours = defaultSubHours > leaveRemainHours ? leaveRemainHours : defaultSubHours;
            const normalExtraReq = normalExtraReqs[index];
            if (subHours + normalExtraReq.hours > normalExtraReq.originHours) {
                subHours = normalExtraReq.originHours - normalExtraReq.hours;
            }
            normalExtraReq.hours += subHours;
            leaveRemainHours -= subHours;
        }
        return leaveRemainHours;
    }
}

interface ExtraHoursReqExtendObj extends ExtraHoursReq {
    holidayCat?: any;
    originHours?: number;
}

export default CalculateBaseService;
