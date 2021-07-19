import { Request } from "express";
import {  Op } from "sequelize";
import moment from "moment";
import "module-alias/register";
import { EmployeeMonthSalary, Employee, SalaryItem } from "@/domain-resource/ts-models";
import { toYMFormat } from "@/helpers/dateHelper";

import CalculateService from "./CalculateService";
import getSalaryDefData from "./getSalaryDefData";

class ProcessService extends CalculateService {
    constructor(req: Request) {
        super(req);
    }
    /**
     *
     * @param {number} year
     * @param {number} month
     * @param {number} baseDate
     */
    async calcAllAndSave(year: number, month: number, selection: number[], baseDate = 1): Promise<any[]> {
        const service = this;
        const yearMonth = toYMFormat(year, month);
        await this.del(yearMonth, selection); //clean old record
        const { empData } = await this.calcCheck(year, month, selection, baseDate);
        const salaryItems = await this.getSalaryItems();
        return Promise.all(
            empData.map(
                (empItem) =>
                    new Promise<void>((resolve, reject) => {
                        service
                            .calTotal(year, month, empItem, baseDate, salaryItems)
                            .then((data) => {
                                console.debug(data);
                                service
                                    .create({
                                        employeeId: empItem.id,
                                        yearMonth: Number(yearMonth),
                                        ...data,
                                    })
                                    .then(() => {
                                        resolve();
                                        // console.log(empItem.id);
                                    })
                                    .catch((err) => {
                                        service.logger.error(err);
                                        reject(err);
                                    });
                            })
                            .catch((err) => {
                                service.logger.error(err);
                                service.logger.error(empItem);
                                reject(err);
                            });
                    })
            )
        );
    }

    async calcCheck(year: number, month: number, selection: number[], baseDate = 1): Promise<any> {
        const thisMonth = moment.utc([year, month - 1, baseDate]).format("YYYY-MM-DD");
        const thisMonthEnd = moment
            .utc([year, month - 1, baseDate])
            .add(1, "months")
            .format("YYYY-MM-DD");
        const where = {
            [Op.or]: [
                {
                    [Op.and]: {
                        status: 1,
                        hire_date: {
                            [Op.lt]: thisMonthEnd,
                        },
                    },
                },
                {
                    [Op.and]: {
                        status: 2,
                        hire_date: {
                            [Op.lt]: thisMonthEnd,
                        },
                        leave_date: {
                            [Op.gte]: thisMonth,
                        },
                    },
                },
            ],
        };

        if (selection.length > 0) {
            where["id"] = selection;
        }
        // also need think left employee
        // 需要考慮退職人員
        const empData = await Employee.findAll({
            where: where,
        });
        const mustSalaryItemIds = await SalaryItem.findAll({
            where: {
                payment_type: [1, 2],
                wl_only: 0,
            },
            attributes: ["id"],
        }).then((results) => {
            return results.map((a) => a.id);
        });
        const workLevelErrors = empData
            .filter((a) => a.workLevel === null)
            .map((a) => {
                return {
                    id: a.id,
                };
            });
        const empIds = empData.map((a) => a.id);
        const defData = await getSalaryDefData(mustSalaryItemIds, empIds);
        const salaryDefErrors = empIds
            .filter((empId) => {
                const data = defData.find((b) => b.id === empId);
                if (!data) {
                    return true;
                }
                if (data.count !== mustSalaryItemIds.length) {
                    return true;
                }
                return false;
            })
            .map((b) => {
                return {
                    id: b,
                };
            });
        const calculateEmpData = empData.filter(
            (a) => a.workLevel !== null && !salaryDefErrors.map((b) => b.id).includes(a.id)
        );
        return {
            empData: calculateEmpData,
            workLevelErrors,
            salaryDefErrors: salaryDefErrors,
        };
    }
    /**
     *
     * @param {{ employeeId: number, yearMonth:number, totalAmountEmp:number, totalAmountCompany:number, detail:string }} data
     */
    async create(data: EmployeeMonthSalary): Promise<EmployeeMonthSalary> {
        const model = await EmployeeMonthSalary.build(data).save();
        return model;
    }

    async del(yearMonth: string, selection: number[]): Promise<number> {
        const where = {
            yearMonth: yearMonth,
        };
        if (selection.length > 0) {
            where["employeeId"] = selection;
        }

        return EmployeeMonthSalary.destroy({
            where,
        });
    }
    async pay(yearMonth: string, selection: number[]): Promise<[number, EmployeeMonthSalary[]]> {
        const where = {
            yearMonth: yearMonth,
        };
        if (selection.length > 0) {
            where["employeeId"] = selection;
        }

        return EmployeeMonthSalary.update(
            { status: 1 },
            {
                where,
            }
        );
    }
}

export default ProcessService;
