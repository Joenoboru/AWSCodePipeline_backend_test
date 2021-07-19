import { Request, Response } from "express";
import { Op } from "sequelize";
import moment from "moment";
import XLSX from "xlsx";
import "module-alias/register";
import { EmployeeMonthSalary, Employee, SalaryItem, StaticSalaryItem } from "@/domain-resource/ts-models";
import { toYMFormat } from "@/helpers/dateHelper";
import { exportPDF } from "@/helpers/pdfHelper";
import createDoc from "@/pdf/salary";
import BaseService from "../BaseService";
import { ObjArrToObj } from "./ObjArrToObj";

class SalaryBaseService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    async getLogicItem(req: Request, res: Response): Promise<any> {
        const results = await this.getLogicItemData();
        res.json(results);
    }

    async getItemsData(): Promise<SalaryItem[]> {
        return SalaryItem.findAll({
            attributes: ["id", "name", "chname", "payment_type"],
            order: [["order", "asc"]],
        }).then((results) => {
            return results;
        });
    }

    async getLogicItemData(): Promise<StaticSalaryItem[]> {
        return StaticSalaryItem.findAll();
    }

    /**
     *
     * @param {number} year
     * @param {number} month
     * @param {number} empId
     */
    async getData(year: number, month: number, empId: number): Promise<EmployeeMonthSalary> {
        const yearMonth = toYMFormat(year, month);
        return EmployeeMonthSalary.findOne({
            where: {
                yearMonth: yearMonth,
                employeeId: empId,
            },
        });
    }

    /**
     *
     * @param {number} year
     * @param {number} month
     * @param {Object} options
     * @param {boolean} withDtl
     * @param {boolean} withEmpDtl
     */

    async getList(
        year: number,
        month: number,
        options = {},
        baseDate = 1,
        withDtl = false,
        withEmpDtl = false
    ): Promise<{ count: number; rows: any[] }> {
        const yearMonth = toYMFormat(year, month);
        const attrs = ["employeeId", "totalAmountEmp", "insurance", "taxPaidAmount", "status", "mustDeduct", "mustPay"];
        const empAttrs = ["id", "name", "engname", "emp_num"];

        if (withDtl) {
            attrs.push("detail", "logic");
        }
        if (withEmpDtl) {
            empAttrs.push("email", "personID", "bank_account");
        }
        const thisMonth = moment.utc([year, month - 1, baseDate]).format("YYYY-MM-DD");
        const thisMonthEnd = moment
            .utc([year, month - 1, baseDate])
            .add(1, "months")
            .format("YYYY-MM-DD");
        /**
         * @type {Array<{id:id}>}
         */
        // also need think left employee
        // 需要考慮退職人員

        return await Employee.findAndCountAll({
            attributes: empAttrs,
            order: [["emp_num", "asc"]],
            where: {
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
            },
            include: [
                {
                    model: EmployeeMonthSalary,
                    attributes: attrs,
                    where: {
                        yearMonth: yearMonth,
                    },
                    required: false,
                },
            ],
            ...options,
        }).then((data) => {
            const arrayData = data.rows.map((employee) => {
                if (employee.EmployeeMonthSalaries && employee.EmployeeMonthSalaries.length > 0) {
                    const result = {
                        employeeId: employee.id,
                        status: -1,
                        Employee: {},
                        ...employee.EmployeeMonthSalaries[0].toJSON(),
                    } as any;
                    for (const key in empAttrs) {
                        result.Employee[empAttrs[key]] = employee[empAttrs[key]];
                    }
                    if (result.detail) {
                        result.detail = JSON.parse(result.detail);
                    }
                    if (result.logic) {
                        result.logic = JSON.parse(result.logic);
                    }
                    return result;
                } else {
                    const result = {
                        employeeId: employee.id,
                        status: -1,
                        Employee: {},
                    };
                    for (const key in empAttrs) {
                        result.Employee[empAttrs[key]] = employee[empAttrs[key]];
                    }
                    return result;
                }
            });
            return {
                count: data.count,
                rows: arrayData,
            };
        });
    }

    async getItemData(
        year: number,
        month: number,
        baseDate = 1
    ): Promise<{ dtlItem: SalaryItem[]; logicItem: StaticSalaryItem[]; dataListRows: any }> {
        const dtlItem = await this.getItemsData();
        const logicItem = await this.getLogicItemData();
        const dataList = await this.getList(year, month, {}, baseDate, true, true);
        const dataListRows = dataList.rows;
        return { dtlItem, logicItem, dataListRows };
    }

    /**
     *
     * @param {number} year
     * @param {number} month
     */
    async createXLSX(year: number, month: number, baseDate = 1): Promise<any> {
        const headerPre = [
            { name: "bkname", title: this.i18n("salary.fd.bankname") },
            { name: "no", title: this.i18n("salary.fd.no") },
            { name: "bank_account", title: this.i18n("emp.fd.bankaccount") },
            { name: "account_amount", title: this.i18n("salary.fd.amount") },
            { name: "personID", title: this.i18n("emp.fd.personID") },
            { name: "email", title: this.i18n("emp.fd.email") },
            { name: "emp_num", title: this.i18n("emp.fd.empnum") },
            { name: "name", title: this.i18n("emp.fd.name") },
        ];
        const headerPost = [
            { name: "must_pay", title: "應領薪資" },
            { name: "must_deduct", title: "代扣款合計" },
            { name: "rmk", title: "備註" },
        ];
        const { dtlItem, logicItem, dataListRows } = await this.getItemData(year, month, baseDate);
        const allHeader = [
            ...headerPre.map((item) => item.name),
            ...dtlItem.map((item) => `dtl${item.id}`),
            ...logicItem.map((item) => `log${item.id}`),
            ...headerPost.map((item) => item.name),
        ];
        const sheetRows = [
            { no: this.i18n("salary.fd.cycle"), bank_account: `${year}/${Number(month).toString().padStart(2, "0")}` },
            {
                ...ObjArrToObj(headerPre, (item) => [item.name, item.title]),
                ...ObjArrToObj(dtlItem, (item) => [`dtl${item.id}`, item.name]),
                ...ObjArrToObj(logicItem, (item) => [`log${item.id}`, item.name]),
                ...ObjArrToObj(headerPost, (item) => [item.name, item.title]),
            },
            ...dataListRows.map((row, idx) => {
                try {
                    const empData = { ...row.Employee };
                    delete empData.engname;
                    let dtlData = {};
                    if (row.detail) {
                        dtlData = ObjArrToObj(row.detail, (item) => [`dtl${item.id}`, item.amount]);
                    }
                    let logData = {};
                    if (row.logic) {
                        logData = ObjArrToObj(row.logic, (item) => [`log${item.id}`, item.amount]);
                    }
                    return {
                        bkname: this.i18n("salary.bank.820"),
                        no: idx + 1,
                        ...empData,
                        account_amount: row.totalAmountEmp < 0 ? 0 : row.totalAmountEmp,
                        ...dtlData,
                        ...logData,
                        must_pay: row.mustPay,
                        must_deduct: row.mustDeduct,
                        rmk: "",
                    };
                } catch (e) {
                    console.error(e);
                }
            }),
        ];
        const ws = XLSX.utils.json_to_sheet(sheetRows, { header: allHeader, skipHeader: true });
        return ws;
    }

    async exportXLSX(req: Request, res: Response): Promise<any> {
        const year = Number(req.params.year);
        const month = Number(req.params.month);
        const ymFormat = toYMFormat(year, month);
        const wb = XLSX.utils.book_new();
        const ws = await this.createXLSX(year, month);
        XLSX.utils.book_append_sheet(wb, ws, ymFormat);
        const content = XLSX.write(wb, { type: "buffer", bookType: "xlsx", bookSST: false });
        res.contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(new Buffer(content, "binary"));
    }

    async exportPDF(req: Request, res: Response): Promise<any> {
        const year = Number(req.params.year);
        const month = Number(req.params.month);
        const { dtlItem, logicItem, dataListRows } = await this.getItemData(year, month);
        const doc = createDoc(year, month, dtlItem, logicItem, dataListRows);
        exportPDF(doc, function (binary) {
            res.contentType("application/pdf");
            res.send(new Buffer(binary, "binary"));
        });
    }

    async geInsuranceDataList(year: number, month: number, baseDate = 1, options = {}): Promise<any> {
        const attrs = ["employeeId", "insuranceDetail"];
        const empAttrs = ["id", "name", "engname", "emp_num"];
        const yearMonth = toYMFormat(year, month);
        const thisMonth = moment.utc([year, month - 1, baseDate]).format("YYYY-MM-DD");
        const thisMonthEnd = moment
            .utc([year, month - 1, baseDate])
            .add(1, "months")
            .format("YYYY-MM-DD");
        const result = await Employee.findAll({
            attributes: empAttrs,
            order: [["emp_num", "asc"]],
            where: {
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
            },
            include: [
                {
                    model: EmployeeMonthSalary,
                    attributes: attrs,
                    where: {
                        yearMonth: yearMonth,
                    },
                    required: false,
                },
            ],
            ...options,
        }).then((data) => {
            return data;
        });
        return result;
    }

    async createInsuranceXLSX(year: number, month: number, baseDate = 1): Promise<any> {
        const data = await this.geInsuranceDataList(year, month, baseDate);
        const mData = data.map((row) => {
            const baseRowData = {
                emp_num: row.emp_num || "N/A",
                name: row.name,
            };
            if (row.EmployeeMonthSalary) {
                if (row.EmployeeMonthSalary.insuranceDetail) {
                    const insuranceDetail = row.EmployeeMonthSalary.insuranceDetail;
                    let mInsuranceDetail = null;
                    if (typeof insuranceDetail === "object") {
                        mInsuranceDetail = insuranceDetail;
                    }
                    if (typeof insuranceDetail === "string") {
                        mInsuranceDetail = JSON.parse(insuranceDetail);
                    }
                    return {
                        ...baseRowData,
                        ...mInsuranceDetail,
                    };
                }
            }
            return {
                ...baseRowData,
            };
        });

        const header = [
            { name: "name", title: this.i18n("emp.fd.name") },
            { name: "emp_num", title: this.i18n("emp.fd.empnum") },
            { name: "amtHeal", title: this.i18n("salary.ins.amt") },
            { name: "amtSocial", title: "" },
            { name: "days", title: this.i18n("salary.ins.socialins") },
            { name: "compHeal", title: this.i18n("salary.ins.heal") },
            { name: "heal", title: "" },
            { name: "compSocial", title: this.i18n("salary.ins.social") },
            { name: "social", title: "" },
            { name: "compPension", title: this.i18n("salary.ins.pension") },
            { name: "pension", title: "" },
            { name: "dependents", title: this.i18n("salary.ins.dependents") },
        ];
        const allHeader = header.map((item) => item.name);
        const header2 = {
            amtHeal: this.i18n("salary.ins.heald"),
            amtSocial: this.i18n("salary.ins.sociald"),
            days: this.i18n("salary.ins.days"),
            compHeal: this.i18n("salary.ins.comp"),
            heal: this.i18n("salary.ins.person"),
            compSocial: this.i18n("salary.ins.comp"),
            social: this.i18n("salary.ins.person"),
            compPension: this.i18n("salary.ins.comp"),
            pension: this.i18n("salary.ins.person"),
        };
        const mBody = [
            {
                ...ObjArrToObj(header, (item) => [item.name, item.title]),
            },
            header2,
            ...mData,
        ];
        //merge
        const merges = [
            {
                s: { r: 0, c: 0 },
                e: { r: 1, c: 0 },
            },
            {
                s: { r: 0, c: 1 },
                e: { r: 1, c: 1 },
            },
            {
                s: { r: 0, c: 2 },
                e: { r: 0, c: 3 },
            },
            {
                s: { r: 0, c: 5 },
                e: { r: 0, c: 6 },
            },
            {
                s: { r: 0, c: 7 },
                e: { r: 0, c: 8 },
            },
            {
                s: { r: 0, c: 9 },
                e: { r: 0, c: 10 },
            },
            {
                s: { r: 0, c: 11 },
                e: { r: 1, c: 11 },
            },
        ];
        const ws = XLSX.utils.json_to_sheet(mBody, { header: allHeader, skipHeader: true });
        ws["!merges"] = merges;
        return ws;
    }

    async exportInsuranceXLSX(req: Request, res: Response): Promise<any> {
        const year = Number(req.params.year);
        const month = Number(req.params.month);
        const ymFormat = toYMFormat(year, month);
        const wb = XLSX.utils.book_new();
        const ws = await this.createInsuranceXLSX(year, month);
        XLSX.utils.book_append_sheet(wb, ws, ymFormat);
        const content = XLSX.write(wb, { type: "buffer", bookType: "xlsx", bookSST: false });
        res.contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(new Buffer(content, "binary"));
    }
}

export default SalaryBaseService;
