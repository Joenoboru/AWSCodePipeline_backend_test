import { Request } from "express";
import { Op } from "sequelize";
import moment, { Moment } from "moment";
import "module-alias/register";
import { SalaryItem, LeaveType, WorkLevel, SalaryLv, SalaryDef, Employee } from "@/domain-resource/ts-models";
import { TwIncomeTax, InsuranceHirer, Insurance } from "@/common-database/ts-models";
import SalaryBaseService from "./CalculateBaseService";
import itemID from "./specialItem";

class CalculateService extends SalaryBaseService {
    constructor(req: Request) {
        super(req);
    }
    /**
     *
     *  @returns {Array<{id:number, payment_type:number, tax_type:number, perday_use:number, default_amount:number}>}
     */
    async getSalaryItems(): Promise<SalaryItem[]> {
        return await SalaryItem.findAll({
            attributes: ["id", "payment_type", "tax_type", "perday_use", "default_amount"],
            where: {
                payment_type: {
                    [Op.not]: 0,
                },
            },
            raw: true,
        }).then((result) => {
            return result;
        });
    }
    /**
     *
     * @param {number} year
     * @param {number} month
     * @param {{ id: number, workLevel: number, dependents: number}} employee
     * @param {number} baseDate
     * @returns {{ empTotal: number, compTotal: nunber, detail: Array<{id: number, amount: number}> }}
     */
    async calTotal(
        year: number,
        month: number,
        employee: Employee,
        baseDate = 1,
        salaryItems: SalaryItem[]
    ): Promise<any> {
        if (salaryItems === undefined) {
            salaryItems = await this.getSalaryItems();
        }
        const monthStart = moment(new Date(year, month - 1, baseDate));
        const monthEnd = moment(new Date(year, month, baseDate - 1));
        const leaveTypes = await LeaveType.findAll({
            attributes: ["id", "discount", "exchange"],
        });
        const salDtlData = await this.getSalDtl(employee.workLevel, employee.id);

        const isHirer = await WorkLevel.findOne({
            where: { id: employee.workLevel },
            attributes: ["isHirer"],
        }).then((workLevel) => {
            if (workLevel) {
                return workLevel.isHirer;
            }
            return false;
        });
        // const specicalIDs = Object.values(itemID);
        let taxAmount = 0;
        let dayAmount = 0;
        let nonDayAmount = 0;
        const result = salaryItems.map((item) => {
            const dtlData = salDtlData.find((dtlRow) => dtlRow.item === item.id);
            const amount = dtlData ? dtlData.amount : 0;
            const pnn = (-1) ** (item.payment_type + 1); //positive and negative (use payment_type to identify)
            if (item.tax_type === 1) {
                //sum tex amount
                taxAmount += pnn * amount;
            }
            if (item.perday_use === 1) {
                //sum monthly amount
                dayAmount += pnn * amount;
            } else {
                nonDayAmount += pnn * amount;
            }
            return {
                id: item.id,
                amount: amount,
            };
        });
        const hoursAmount = Math.round(dayAmount / 240); // 30 days * 8 hours
        const {
            totalHours,
            originTotalExtraHours,
            totalExtraHours,
            totalAbsenceHours,
            totalLeaveHours,
            employeeWorkData,
        } = await this.calcWorkHour(monthStart, monthEnd, employee.id, leaveTypes);
        const extraHoursAmount = Math.round(hoursAmount * totalExtraHours); //時間外労働残業
        const absenceHoursAmount = Math.round(totalAbsenceHours > 0 ? hoursAmount * totalAbsenceHours : 0); //欠勤、無給休暇控除
        const totalHoursAmount = dayAmount + extraHoursAmount;

        const leaveMoney = await this.calLeaveToMoney(monthStart, monthEnd, employee, hoursAmount, leaveTypes);
        const taxPaidAmount = await this.calTax(taxAmount, absenceHoursAmount, employee.dependents); //所得税
        // 保險應該是用perday_use=1的金額去做保險
        let insuranceData = await this.calInsurance(employee.dependents, dayAmount, isHirer); //保険
        // 健保離職該月不計算，勞保以上班日計算
        insuranceData = await this.useInsurance(employee, monthEnd, insuranceData);
        const insurance = insuranceData.social + insuranceData.heal;
        const mustPay = totalHoursAmount + nonDayAmount + leaveMoney;
        const mustDeduct = absenceHoursAmount + taxPaidAmount + insurance;
        const totalAmountEmp = mustPay - mustDeduct;
        const totalAmountCompany = insuranceData.compHeal + insuranceData.compSocial;

        const logic_result = [];
        /**
         *
         * @param {number} id
         * @param {number} amount
         */
        const addItems = (id, amount) => {
            logic_result.push({ id: id, amount: amount });
        };
        addItems(itemID.OVERTIME, extraHoursAmount);
        addItems(itemID.ABSENCT, absenceHoursAmount);
        addItems(itemID.LABOR_INS, insuranceData.social);
        addItems(itemID.HEAL_INS, insuranceData.heal);
        addItems(itemID.INC_TAX, taxPaidAmount);
        addItems(itemID.LEAVE, leaveMoney);

        return {
            hoursAmount,
            totalHours,
            originTotalExtraHours,
            totalExtraHours,
            totalAbsenceHours,
            totalLeaveHours,
            employeeWorkData,
            totalAmountEmp,
            totalAmountCompany,
            detail: result,
            logic: logic_result,
            insurance,
            insuranceDetail: insuranceData,
            taxPaidAmount,
            mustPay,
            mustDeduct,
        };
    }

    async useInsurance(employee: Employee, monthEnd: Moment, insuranceData: InsuranceData): Promise<InsuranceData> {
        const leave_date = moment(employee.leave_date);
        const hire_date = moment(employee.hire_date);
        const leaveMonths = monthEnd.diff(leave_date, "months", true);
        const hire_days = monthEnd.diff(hire_date, "days");
        if (leaveMonths > 0 && leaveMonths < 1) {
            insuranceData.heal = 0;
            insuranceData.compHeal = 0;
            const leave_days = monthEnd.diff(leave_date, "days");
            if (leave_days > 1) {
                const insuranceDays = 30 - leave_days;
                insuranceData.days = insuranceDays;
                insuranceData.social = Math.round((insuranceData.social * insuranceDays) / 30);
                insuranceData.compSocial = Math.round((insuranceData.compSocial * insuranceDays) / 30);
            }
        }
        if (hire_days < 30) {
            insuranceData.social = Math.round((insuranceData.social * hire_days) / 30);
            insuranceData.compSocial = Math.round((insuranceData.compSocial * hire_days) / 30);
        }
        return insuranceData;
    }
    /**
     *
     * @param {number} workLevel
     * @param {number} empId
     * @returns {Array<{item:number, amount:number}>}
     */
    async getSalDtl(workLevel: number, empId: number): Promise<SalaryDtlItem[]> {
        const salaryLvData = await SalaryLv.findAll({
            attributes: ["item", "amount"],
            where: {
                level: workLevel,
            },
            raw: true,
        }).then((result) => {
            return result;
        });
        const empLvData = await SalaryDef.findAll({
            attributes: ["item", "amount"],
            where: {
                employee: empId,
            },
            raw: true,
        }).then((result) => {
            return result;
        });
        return [...salaryLvData, ...empLvData];
    }

    /**
     *
     * @param {number} texSalary
     * @param {number} absenceSalary
     * @param {number} dependents
     * @returns {number}
     */
    async calTax(texSalary: number, absenceSalary: number, dependents: number): Promise<number> {
        const amount = texSalary - absenceSalary;
        return await TwIncomeTax.findOne({
            where: {
                amount: { [Op.lt]: amount },
                dependents: dependents,
            },
            order: [["amount", "DESC"]],
            limit: 1,
        }).then((result) => {
            if (!result) {
                return 0;
            }
            return result.tax;
        });
    }

    /**
     *
     * @param {number} dependents 扶養している家族の人数
     * @param {number} amounts 所得金額
     * @returns {{ heal: number, social:number, compHeal: number, compSocial: number }}
     */
    async calInsurance(dependents: number, amounts: number, isHirer: boolean): Promise<InsuranceData> {
        const initData = {
            dependents,
            days: 30,
        };
        if (isHirer) {
            return await InsuranceHirer.findOne({
                where: {
                    amount: { [Op.gte]: amounts },
                },
                order: [["amount", "ASC"]],
                raw: true,
            }).then(async (result) => {
                if (result) {
                    return {
                        ...initData,
                        heal: result.healthInsurancePerson * (1 + dependents),
                        social: result.socialInsurancePerson,
                        compHeal: result.healthInsuranceCompany,
                        compSocial: result.socialInsuranceCompany,
                        amtHeal: result.amount,
                        amtSocial: result.amount > 45800 ? 45800 : result.amount,
                        pension: result.pension,
                        compPension: 0,
                    };
                } else {
                    return await InsuranceHirer.findOne({
                        order: [["amount", "DESC"]],
                        raw: true,
                    }).then(async (result) => {
                        return {
                            ...initData,
                            heal: result.healthInsurancePerson * (1 + dependents),
                            social: result.socialInsurancePerson,
                            compHeal: result.healthInsuranceCompany,
                            compSocial: result.socialInsuranceCompany,
                            amtHeal: result.amount,
                            amtSocial: result.amount > 45800 ? 45800 : result.amount,
                            pension: result.pension,
                            compPension: 0,
                        };
                    });
                }
            });
        } else {
            return await Insurance.findOne({
                where: {
                    amount: { [Op.gte]: amounts },
                },
                order: [["amount", "ASC"]],
                raw: true,
            }).then(async (result) => {
                if (result) {
                    return {
                        ...initData,
                        heal: result.healthInsurancePerson * (1 + dependents),
                        social: result.socialInsurancePerson,
                        compHeal: result.healthInsuranceCompany,
                        compSocial: result.socialInsuranceCompany,
                        amtHeal: result.amount,
                        amtSocial: result.amount > 45800 ? 45800 : result.amount,
                        pension: 0,
                        compPension: result.pension,
                    };
                } else {
                    return await Insurance.findOne({
                        order: [["amount", "DESC"]],
                        raw: true,
                    }).then(async (result) => {
                        return {
                            ...initData,
                            heal: result.healthInsurancePerson * (1 + dependents),
                            social: result.socialInsurancePerson,
                            compHeal: result.healthInsuranceCompany,
                            compSocial: result.socialInsuranceCompany,
                            amtHeal: result.amount,
                            amtSocial: result.amount > 45800 ? 45800 : result.amount,
                            pension: 0,
                            compPension: result.pension,
                        };
                    });
                }
            });
        }
    }
}

export interface InsuranceData {
    amtHeal: number;
    amtSocial: number;
    heal: number;
    social: number;
    compHeal: number;
    compSocial: number;
    days: number;
    dependents: number;
    pension: number;
    compPension: number;
}

export interface SalaryDtlItem {
    item: number;
    amount: number;
}

export default CalculateService;
