import ProcessService from "./ProcessService";
import { toYMFormat } from "../../helpers/dateHelper";
import moment from "moment";
import Blob from "cross-blob";
import sequelize from "sequelize";
const XLSX = require("xlsx");

const { Op } = sequelize;
class MainService extends ProcessService {
    constructor(req: any) {
        super(req);
    }

    //TODO: Remove
    public async calcOPE(year: number, month: number): Promise<OPEResult> {
        const { AccountingDetails, CompanyRule } = this.domainDB;
        const companyRule = await CompanyRule.findOne();
        let enddate = null;
        let startdate = null;
        if (companyRule.ope === "first") {
            enddate = moment.utc([year, month - 1, 1]);
            startdate = moment.utc([year, month - 2, 1]);
        } else if (companyRule.ope === "end") {
            enddate = moment.utc([year, month - 1, 1]).endOf("month");
            startdate = moment.utc([year, month - 2, 1]).endOf("month");
        } else {
            const date = parseInt(companyRule.ope);
            enddate = moment.utc([year, month - 1, date]);
            startdate = moment.utc([year, month - 2, date]);
        }
        const result: OPEofEmployee[] = await AccountingDetails.findAll({
            attributes: [
                ["employee_id", "employeeId"],
                [sequelize.fn("sum", sequelize.col("amount")), "amount"],
            ],
            where: {
                employeeId: { [Op.ne]: null },
                paymentDate: {
                    [Op.gt]: startdate,
                    [Op.lte]: enddate,
                },
            },
            raw: true,
            group: ["employee_id"],
        });
        const res: OPEResult = {
            startdate: startdate.add(1, "days").format("YYYY-MM-DD"),
            enddate: enddate.format("YYYY-MM-DD"),
            result,
        };
        return res;
    }

    //TODO: Remove
    public async createOPEXlsx(year: number, month: number) {
        const { Employee } = this.domainDB;
        const opeResult = await this.calcOPE(year, month);
        const employeeIds = opeResult.result.map((a) => a.employeeId);
        const empData = await Employee.findAll({
            attributes: ["id", "name", "bank_account", "personID", "email", "emp_num"],
            where: { id: { [Op.in]: employeeIds } },
        });
        const ymFormat = toYMFormat(year, month);
        const wb = XLSX.utils.book_new();
        const writeDatas = [
            [
                "",
                "",
                this.i18n("salary.fd.cycle"),
                `${year}/${("" + month).padStart(2, "0")}`,
                opeResult.startdate,
                opeResult.enddate,
            ],
            [
                this.i18n("salary.fd.bankname"),
                this.i18n("salary.fd.no"),
                this.i18n("emp.fd.bankaccount"),
                this.i18n("salary.fd.amount"),
                this.i18n("emp.fd.personID"),
                this.i18n("emp.fd.email"),
                this.i18n("emp.fd.empnum"),
                this.i18n("emp.fd.name"),
            ],
        ];
        opeResult.result.forEach((result, index) => {
            const emp = empData.find((a) => a.id === result.employeeId);
            writeDatas.push([
                this.i18n("salary.bank.820"),
                index + 1,
                emp.bank_account,
                result.amount,
                emp.personID,
                emp.email,
                emp.emp_num,
                emp.name,
            ]);
        });
        const ws = XLSX.utils.aoa_to_sheet(writeDatas);
        this.autoFitColumn(writeDatas, ws);
        XLSX.utils.book_append_sheet(wb, ws, ymFormat);
        const content = XLSX.write(wb, { type: "buffer", bookType: "xlsx", bookSST: false });
        return content;
    }
    public async getOPEDetail(employeeId: number, year: number, month: number): Promise<OPEDetail> {
        const { AccountingDetails, CompanyRule } = this.domainDB;
        const companyRule = await CompanyRule.findOne();
        let enddate = null;
        let startdate = null;
        if (companyRule.ope === "first") {
            enddate = moment.utc([year, month - 1, 1]);
            startdate = moment.utc([year, month - 2, 1]);
        } else if (companyRule.ope === "end") {
            enddate = moment.utc([year, month - 1, 1]).endOf("month");
            startdate = moment.utc([year, month - 2, 1]).endOf("month");
        } else {
            const date = parseInt(companyRule.ope);
            enddate = moment.utc([year, month - 1, date]);
            startdate = moment.utc([year, month - 2, date]);
        }
        const result: AccountingDetailFullModel[] = await AccountingDetails.findAll({
            attributes: [
                "id",
                "expectedPaymentDate",
                "paymentDate",
                "inAccount",
                "outAccount",
                "amount",
                "invoice",
                "comment",
                "pl1",
                "pl2",
                "pl3",
            ],
            where: {
                employeeId: employeeId,
                paymentDate: {
                    [Op.gt]: startdate,
                    [Op.lte]: enddate,
                },
            },
        });
        const res: OPEDetail = {
            startdate: startdate.add(1, "days").format("YYYY-MM-DD"),
            enddate: enddate.format("YYYY-MM-DD"),
            result,
        };
        return res;
    }

    public autoFitColumn(sourceData, worksheet): void {
        const objectMaxLength = [];

        sourceData.map((arr) => {
            Object.keys(arr).map((key) => {
                const value = arr[key] === null ? "" : arr[key];

                if (typeof value === "number") {
                    return (objectMaxLength[key] = 10);
                }
                const length = new Blob([value]).size;
                objectMaxLength[key] = objectMaxLength[key] >= length ? objectMaxLength[key] : length;
            });
        });

        const worksheetCols = objectMaxLength.map((width) => {
            return {
                width,
            };
        });

        worksheet["!cols"] = worksheetCols;
    }
}
interface OPEDetail {
    startdate: string;
    enddate: string;
    result: AccountingDetailFullModel[];
}
interface AccountingDetailFullModel {
    id: number;
    expectedPaymentDate: string;
    paymentDate: string;
    inAccount?: number;
    outAccount?: number;
    amount: number;
    invoice: string;
    comment: string;
    employeeId?: number;
    pl1?: number;
    pl2?: number;
    pl3?: number;
}
interface OPEResult {
    startdate: string;
    enddate: string;
    result: OPEofEmployee[];
}
interface OPEofEmployee {
    employeeId: number;
    amount: number;
}
export { toYMFormat };
export default MainService;
