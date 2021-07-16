import { Request } from "express";
import flatten from "flat";
import "module-alias/register";
import { BankAccount, BankAccountI18n, BankAccountState } from "@/domain-resource/ts-models";
import { ErrorDef } from "@/wf_common";
import BaseService from "../BaseService";
import { StdQueryListResult } from "@/types/queryTypes";

class BankaccountService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    public async getBankAccountList(): Promise<any[]> {
        const languageId = await this.getLangId();
        const results = await BankAccount.findAll({
            include: [
                {
                    model: BankAccountI18n,
                    attributes: ["name"],
                    required: false,
                    where: {
                        languageId,
                    },
                },
                {
                    attributes: ["amount", "settleDate", "updatedUser", "updatedAt"],
                    model: BankAccountState,
                    required: false,
                },
            ],
            order: [
                ["id", "ASC"],
                ["BankAccountStates", "settleDate", "DESC"],
            ],
        });
        return results.map((a) => {
            const obj = a.toJSON();
            this.setI18nName(obj, "BankAccountI18n");
            return obj;
        });
    }

    async getAll(): Promise<any[]> {
        const languageId = await this.getLangId();
        const results = await BankAccount.findAll({
            attributes: ["id", "type", "corporateId", "accountNumber", "code", "accItem", "currencyId"],
            include: [
                {
                    model: BankAccountI18n,
                    attributes: ["name"],
                    required: false,
                    where: {
                        languageId,
                    },
                },
            ],
        });
        const mResults = results.map((item) => {
            const obj = item.toJSON() as any;
            if (obj.BankAccountI18n.length > 0) {
                obj.BankAccountI18n = obj.BankAccountI18n[0];
            }
            //delete obj.BankAccountI18n;
            return flatten(obj);
        });
        return mResults;
    }
    async getOneBankAccount(id: string): Promise<BankAccount> {
        return await BankAccount.findOne({
            attributes: ["id", "type", "corporateId", "rmk", "accountNumber", "code", "accItem", "currencyId"],
            where: { id },
            include: [
                {
                    model: BankAccountI18n,
                    attributes: ["name", "languageId"],
                    required: false,
                },
            ],
        });
    }
    async getPageOfAccount(): Promise<StdQueryListResult<BankAccount>> {
        return await this.getPageListFromTsModel(BankAccount, {
            attributes: ["id", "type", "corporateId", "accountNumber", "code", "accItem", "currencyId"],
            include: [
                {
                    model: BankAccountI18n,
                    attributes: ["name", "languageId"],
                    required: false,
                },
            ],
        });
    }
    public async getPageOfState(bankAccountId: string): Promise<StdQueryListResult<BankAccountState>> {
        return await this.getPageListFromTsModel(BankAccountState, {
            order: [["settleDate", "desc"]],
            where: {
                bankAccountId,
            },
        });
    }
    async getOneState(bankAccountId: string, settleDate: string): Promise<BankAccountState> {
        return await BankAccountState.findOne({
            where: {
                bankAccountId,
                settleDate,
            },
        });
    }
    async createOrUpdateData(data: BankAccount): Promise<BankAccount> {
        const { sequelize } = this.domainDBResource;
        return await sequelize.transaction(async (transaction) => {
            let model = null;
            if (!data.id) {
                model = await BankAccount.build(data).save({ transaction });
                data.BankAccountI18n.forEach((a) => {
                    a.bankAccountId = model.id;
                });
                await BankAccountI18n.bulkCreate(data.BankAccountI18n, { transaction });
            } else {
                model = await BankAccount.findOne({ where: { id: data.id } });
                model.update(data, {
                    where: { id: data.id },
                    transaction,
                });
                await BankAccountI18n.destroy({
                    where: {
                        bankAccountId: data.id,
                    },
                    transaction,
                });
                data.BankAccountI18n.forEach((a) => {
                    a.bankAccountId = model.id;
                });
                await BankAccountI18n.bulkCreate(data.BankAccountI18n, { transaction });
            }
            return model;
        });
    }
    public async removeState(bankAccountId: string, settleDate: string): Promise<number> {
        return await BankAccountState.destroy({
            where: {
                bankAccountId,
                settleDate,
            },
        });
    }
    public async createState(bankAccountId: string, data: BankAccountState): Promise<void> {
        const { settleDate } = data;
        try {
            const model = {
                createdUser: this.employeeId,
                updatedUser: this.employeeId,
                bankAccountId,
                settleDate,
                amount: data.amount,
                manual: data.manual,
            };
            if (!data.manual) {
                //model.amount = await this.calculateBankaccountAmount(bankAccountId, data.settleDate);
            }
            await BankAccountState.build(model).save();
        } catch (e) {
            this.logger.error(e);
            throw ErrorDef.BankaccountStateSettleDatePKError;
        }
    }
    public async updateState(bankAccountId: string, data: BankAccountState): Promise<string> {
        const { settleDate } = data;
        const bankAccountState = await BankAccountState.findOne({
            where: {
                bankAccountId,
                settleDate,
            },
        });
        if (bankAccountState) {
            const updateModel = {
                updatedUser: this.employeeId,
                amount: data.amount,
                manual: data.manual,
            };
            if (!data.manual) {
                //updateModel.amount = await this.calculateBankaccountAmount(bankAccountId, data.settleDate);
            }
            await bankAccountState.update(updateModel);
            return "ok";
        } else {
            throw ErrorDef.DataNotFound;
        }
    }
    /**
     * TODO
     * @param bankAccountId
     * @param settleDate
     */
    /*private async calculateBankaccountAmount(bankAccountId, settleDate): Promise<number> {
        throw ErrorDef.NOT_SUPPORT;
        return 0;
        //TODO: change AccountingDetails to RaData        
       const lastState = await BankAccountState.findOne({
            attributes: ["amount", "settleDate"],
            where: {
                settleDate: { [Op.lt]: settleDate },
                bankAccountId,
            },
            order: [["settleDate", "desc"]],
        });
        let initialAmount = 0;
        let lastSettleDate = "1900-01-01";
        if (lastState) {
            initialAmount = lastState.amount;
            lastSettleDate = lastState.settleDate;
        }
        const incomeAmount = await AccountingDetails.findOne({
            where: {
                inAccount: bankAccountId,
                paymentDate: {
                    [Op.lt]: settleDate,
                    [Op.gte]: lastSettleDate,
                },
            },
            raw: true,
            attributes: [[fn("SUM", col("AccountingDetails.amount")), "total"]],
        });
        const outcomeAmount = await AccountingDetails.findOne({
            where: {
                outAccount: bankAccountId,
                paymentDate: {
                    [Op.lt]: settleDate,
                    [Op.gte]: lastSettleDate,
                },
            },
            raw: true,
            attributes: [[fn("SUM", col("AccountingDetails.amount")), "total"]],
        });
        const result = (
            initialAmount +
            (incomeAmount.total ? incomeAmount.total : 0) -
            (outcomeAmount.total ? outcomeAmount.total : 0)
        ).toFixed(3);
        return parseFloat(result);
    }*/
}
/*interface BankAccountAllBody extends BankAccount {
    type: number;
    accountNumber: string | null;
    code: string | null;
    currencyId: number;
    accItem: number | null;
    rmk: string;
    ["BankAccountI18n.name"]: string;
}*/

export default BankaccountService;
