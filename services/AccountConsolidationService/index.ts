import { Op, fn, col } from "sequelize";
import moment, { Moment } from "moment";
import "module-alias/register";
import { toYMFormat } from "@/helpers/dateHelper";
import { TempNoObj } from "@/types";
import { StdQueryListResult } from "@/types/queryTypes";
import {
    AccountConsolidation,
    AccountVoucher,
    AccountVoucherDetail,
    Ope,
    RaHeader,
    RaTransfer,
    AccountItem,
    AccountItemSetting,
} from "@/domain-resource/ts-models";
import BaseService from "../BaseService";
import AccountVoucherService from "../AccountVoucherService";
import { AccItemSettings } from "../RaService";

//import FileService, { FileData } from "../FileService";

class AccountConsolidationService extends BaseService {
    private year: number;
    private month: number;
    private ymFormat: string;
    private lastDayOfMonth: Moment;
    private monthPeriod: string[];
    private lastData: AccountConsolidation;

    async getPageOfData(): Promise<StdQueryListResult<AccountConsolidation>> {
        //const languageId = await this.getLangId();
        return await this.getPageListFromTsModel(AccountConsolidation, {
            attributes: ["id", "yearMonth", "currentPl", "accumPl"],
            order: [["yearMonth", "desc"]],
        });
    }

    async getOne(): Promise<AccountConsolidation> {
        return await AccountConsolidation.findOne({
            where: {
                yearMonth: this.ymFormat,
            },
        });
    }

    async getLastOne(force = false): Promise<AccountConsolidation> {
        if (!force && this.lastData) {
            return this.lastData;
        }
        const result = await AccountConsolidation.findOne({
            order: [["yearMonth", "desc"]],
        });
        this.lastData = result;
        return result;
    }

    async getFirstOneDate(): Promise<Moment> {
        const data = await AccountConsolidation.findOne({
            order: ["yearMonth"],
        });
        if (data) {
            const yearMonth = moment.utc(data.getDataValue("yearMonth"), "YYYYMM");
            return yearMonth;
        } else {
            return null;
        }
    }

    async getLastOneDate(): Promise<Moment> {
        const data = await this.getLastOne();
        if (data) {
            const yearMonth = moment.utc(data.getDataValue("yearMonth"), "YYYYMM");
            return yearMonth;
        } else {
            return null;
        }
    }

    setDate(year: number | string, month: number | string): AccountConsolidationService {
        this.year = Number(year);
        this.month = Number(month);
        this.ymFormat = toYMFormat(year, month);
        const monthStart = moment.utc([this.year, this.month - 1, 1]).format("YYYY-MM-DD");
        const monthEndMoment = moment.utc([this.year, this.month - 1, 1]).add(1, "months");
        const monthEnd = monthEndMoment.format("YYYY-MM-DD");
        this.lastDayOfMonth = monthEndMoment.add(-1, "day");
        this.monthPeriod = [monthStart, monthEnd];
        return this;
    }

    async preProcessCheck(onlyLastData = false, useLastData = false): Promise<PreProcessCheckResult> {
        //檢查使否已經月結資料，無月結資料時必須建立初始資料
        const lastData = await this.getLastOne();
        if (!lastData) {
            return {
                status: "no_initial_data",
            };
        }
        //取得最後月結的月份往後加1個月
        const lastDate = await this.getLastOneDate();
        if (useLastData) {
            const currentYear = lastDate.year();
            const currentMonth = lastDate.month() + 1;
            this.setDate(currentYear, currentMonth);
        } else {
            const currentYearMonth = lastDate.add(1, "month");
            const currentYear = currentYearMonth.year();
            const currentMonth = currentYearMonth.month() + 1;
            this.setDate(currentYear, currentMonth);
        }

        if (onlyLastData) {
            return {
                status: "ok",
            };
        }
        const msgTags = [];
        const whereMonthPeriod = {
            [Op.lt]: this.monthPeriod[1],
            [Op.gte]: this.monthPeriod[0],
        };
        //檢查該月OPE資料是否已轉換完畢
        const opeResult = await Ope.findAll({
            where: {
                converted: { [Op.in]: [0, 2] },
                status: { [Op.not]: 4 },
                [Op.or]: {
                    transDate: whereMonthPeriod,
                    repayDate: whereMonthPeriod,
                },
            },
        });
        if (opeResult.length > 0) {
            msgTags.push("ope");
        }

        //檢查該月轉金資料是否已轉換完畢
        const raTransResult = await RaTransfer.findAll({
            where: {
                converted: { [Op.in]: [0, 2] },
                status: { [Op.not]: 2 },
                date: whereMonthPeriod,
            },
        });
        if (raTransResult.length > 0) {
            msgTags.push("ratrans");
        }

        //檢查該月流水帳是否已轉換完畢
        const raResult = await RaHeader.findAll({
            where: {
                converted: { [Op.in]: [0, 2] },
                status: { [Op.not]: 4 },
                [Op.or]: {
                    transDate: whereMonthPeriod,
                    payDate: whereMonthPeriod,
                },
            },
        });
        if (raResult.length > 0) {
            msgTags.push("ra");
        }
        const aisResult = await AccountItemSetting.findAll({
            attributes: ["tag", "accItem"],
            where: { tag: ["fx_in", "fx_out", "pl", "pl_accu"], accItem: null },
            //raw: true,
        });
        const aisNullList = aisResult.map((row) => row.tag);
        if (aisNullList.length > 0) {
            msgTags.push("ais");
        }
        return {
            status: msgTags.length > 0 ? "warn" : "ok",
            tags: msgTags,
            lastData: lastData.get(),
        };
    }

    //初始值設定
    async createInitialData(data: Partial<AccountConsolidation>): Promise<AccountConsolidation> {
        //檢查是否已有資料，資料為空才能建立
        const check = await this.preProcessCheck(true);
        if (check.status !== "no_initial_data") {
            return null;
        }
        const { sequelize } = this.domainDBResource;
        return await sequelize.transaction(async (transaction) => {
            const model = await AccountConsolidation.create(
                {
                    currentPl: data.currentPl,
                    accumPl: data.accumPl,
                    yearMonth: data.yearMonth,
                    createdUser: this.employeeId,
                },
                {
                    transaction,
                }
            );
            return model;
        });
    }

    async createOrUpdateData(): Promise<AccountConsolidation> {
        const { sequelize } = this.domainDBResource;
        //1. 資料檢查
        const check = await this.preProcessCheck();
        if (check.status !== "ok") {
            return null;
        }
        // 傳票編號處理
        const avService = new AccountVoucherService(this.req);
        const ymd = this.lastDayOfMonth.format("YYYYMMDD");
        const tempNo = {
            [AccountVoucher.name]: {
                [ymd]: Number(`${ymd}001`),
            },
        };
        await avService.loadLastDataNo(ymd, tempNo);
        return await sequelize.transaction(async (transaction) => {
            //2. 建立調整傳票 (暫時不支援)
            //兌換盈虧、折舊、等調整帳
            //3. 建立月結傳票
            const acVoucherDataResult = await this.generateACVoucher(tempNo);
            const { profit, data } = acVoucherDataResult;
            if (data.AccountVoucherDetails && data.AccountVoucherDetails.length > 0) {
                await AccountVoucher.create(data, { transaction, include: [AccountVoucherDetail] });
            }
            //4. 建立月結紀錄
            const lastAC = await this.getLastOne();
            const acData = {
                yearMonth: this.ymFormat,
                currentPl: profit,
                accumPl: lastAC.getDataValue("accumPl") + profit,
                createdUser: this.employeeId,
            };
            return await AccountConsolidation.create(acData, { transaction });
            //return { data, acData };
        });
    }

    //產生月結傳票 結清分錄
    async generateACVoucher(tempNo: TempNoObj): Promise<ACVoucherGenerateResult> {
        //1 取得資料
        const data = await AccountVoucherDetail.findAll({
            attributes: [
                [fn("COUNT", col("voucher_id")), "count"],
                [fn("SUM", col("debit")), "debit"],
                [fn("SUM", col("credit")), "credit"],
                //[col("AccountItem.catalog"), "catalog"],
                "accItem",
            ],
            //where: {},
            raw: true,
            group: "accItem",
            include: [
                {
                    model: AccountVoucher,
                    attributes: [],
                    where: {
                        date: {
                            [Op.lt]: this.monthPeriod[1],
                            [Op.gte]: this.monthPeriod[0],
                        },
                    },
                },
                {
                    model: AccountItem,
                    attributes: ["id", "catalog"],
                    where: {
                        type: [2, 3],
                        catalog: [4, 5, 6, 7, 8],
                    },
                },
            ],
        });
        //2 月結傳票表身
        const accItemSettings = await this.loadAccItemSettings();
        let plTotalDebit = 0;
        let plTotalCredit = 0;
        //2.1 收入(借)-->本期損益(貸)
        const acVoucherIncomeDetails = data
            .filter((row) => [4, 7].indexOf(row["AccountItem.catalog"]) > -1 && row.credit > 0)
            .map((row) => {
                plTotalCredit += row.credit;
                return {
                    accItem: row.accItem,
                    accItemSub: row.accItemSub,
                    debit: row.credit,
                    credit: 0,
                };
            });
        if (plTotalCredit > 0 && acVoucherIncomeDetails.length > 0) {
            acVoucherIncomeDetails.push({
                accItem: accItemSettings.pl, //本期損益
                accItemSub: null,
                debit: 0,
                credit: plTotalCredit,
            });
        }
        //2.2 費用(貸)-->本期損益(借)
        const acVoucherOutcomeDetails = data
            .filter((row) => [5, 6, 8].indexOf(row["AccountItem.catalog"]) > -1 && row.debit > 0)
            .map((row) => {
                plTotalDebit += row.debit;
                return {
                    accItem: row.accItem,
                    accItemSub: row.accItemSub,
                    debit: 0,
                    credit: row.debit,
                };
            });
        if (plTotalDebit > 0 && acVoucherOutcomeDetails.length > 0) {
            acVoucherOutcomeDetails.push({
                accItem: accItemSettings.pl, //本期損益
                accItemSub: null,
                debit: plTotalDebit,
                credit: 0,
            });
        }
        //2.3 本期損益-->保留盈餘
        const profit = plTotalCredit - plTotalDebit;
        let profitDetails = [];
        if (profit > 0) {
            profitDetails = [
                {
                    accItem: accItemSettings.pl, //本期損益
                    accItemSub: null,
                    debit: profit,
                    credit: 0,
                },
                {
                    accItem: accItemSettings.pl_accu, //保留盈餘
                    accItemSub: null,
                    debit: 0,
                    credit: profit,
                },
            ];
        }
        //3 產生月結傳票
        //const transDateMoment = moment.utc([year, month - 1, 0]).add(1, "months");
        const acVoucher: Partial<AccountVoucher> = {
            no: tempNo[AccountVoucher.name][this.lastDayOfMonth.format("YYYYMMDD")]++,
            date: this.lastDayOfMonth.toDate(),
            type: 3,
            totalDebit: plTotalDebit + plTotalCredit + profit,
            totalCredit: plTotalDebit + plTotalCredit + profit,
            status: 1,
            rmk: "月底結清",
            source: 4,
            sourceId: Number(this.ymFormat),
            createdUser: this.employeeId,
            AccountVoucherDetails: [...acVoucherIncomeDetails, ...acVoucherOutcomeDetails, ...profitDetails],
        };
        return {
            data: acVoucher,
            profit,
        };
    }

    async loadAccItemSettings(): Promise<AccItemSettings> {
        const aisData = await AccountItemSetting.findAll({
            attributes: ["tag", "accItem"],
            where: { tag: ["pl", "pl_accu"] },
            raw: true,
        });
        const aisDataMap = {};
        aisData.forEach((row) => {
            aisDataMap[row.tag] = row.accItem;
        });
        return aisDataMap;
    }

    //刪除月結，必須從最後一個月分開始刪除
    async deleteData(): Promise<boolean> {
        const { sequelize } = this.domainDBResource;
        //1.檢查
        const check = await this.preProcessCheck(true, true);
        if (check.status !== "ok") {
            return false;
        }
        return await sequelize.transaction(async (transaction) => {
            //2.取得最後一筆資料
            const lastData = await this.getLastOne();
            //3. 刪除月結傳票
            await AccountVoucher.destroy({
                where: {
                    sourceId: this.ymFormat,
                    source: 4,
                },
                transaction,
            });
            //4. 刪除自動產生之調整傳票 (暫時不支援)
            //5. 刪除月結紀錄
            await lastData.destroy({ transaction });
            return true;
        });
    }
}

export default AccountConsolidationService;

interface ACVoucherGenerateResult {
    data: Partial<AccountVoucher>;
    profit: number;
}

export interface PreProcessCheckResult {
    status: string;
    tags?: string[];
    lastData?: AccountConsolidation;
}
