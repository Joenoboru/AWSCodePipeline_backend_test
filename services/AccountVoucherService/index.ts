import { Op, Transaction } from "sequelize";
import moment from "moment";
import BaseService from "../BaseService";
import "module-alias/register";
import { AccountVoucher, AccountVoucherDetail } from "@/domain-resource/ts-models";
import { StdQueryListResult, TempNoObj } from "@/types/queryTypes";
//import FileService, { FileData } from "../FileService";

class AccountVoucherService extends BaseService {
    async getPageOfData(): Promise<StdQueryListResult<AccountVoucher>> {
        //const languageId = await this.getLangId();
        const result = await this.getPageListFromTsModel(AccountVoucher, {
            attributes: ["id", "no", "date", "type", "totalDebit", "totalCredit", "rmk", "source", "status"],
            order: [["no", "desc"]],
        });
        return result;
    }

    async getOne(id: string): Promise<AccountVoucher> {        
        const results = await AccountVoucher.findOne({
            //attributes: ["id", "type", "accItem", "rmk"],
            where: {
                id,
            },
            include: [
                {
                    model: AccountVoucherDetail,
                },
            ],
        });
        return results;
    }

    async createOrUpdateData(data: AccountVoucher): Promise<AccountVoucher> {
        const { sequelize } = this.domainDBResource;
        return await sequelize.transaction(async (transaction) => {
            let model = null;
            if (!data.id) {
                data.no = await this.generateDataNo(transaction);
                this.calcTotalAmount(data);
                model = await AccountVoucher.create(data, {
                    transaction,
                    include: [AccountVoucherDetail],
                });
                await model.save({ transaction });
            } else {
                model = await AccountVoucher.findOne({
                    where: { id: data.id },
                    transaction,
                });
                this.calcTotalAmount(data);
                await model.update(data, {
                    where: { id: data.id },
                    transaction,
                });
                //AccountVoucherDetail
                await AccountVoucherDetail.destroy({
                    where: {
                        voucherId: data.id,
                    },
                    transaction,
                });
                data.AccountVoucherDetails.forEach((a) => {
                    a.voucherId = model.id;
                });
                await AccountVoucherDetail.bulkCreate(data.AccountVoucherDetails, { transaction });
            }
            return model;
        });
    }

    calcTotalAmount(data: AccountVoucher): void {
        //console.log("calcTotalAmount");
        //console.log(data);
        let d = 0;
        let c = 0;
        if (data.AccountVoucherDetails) {
            data.AccountVoucherDetails.forEach((row) => {
                d += row.debit;
                c += row.credit;
            });
        }
        data.totalCredit = c;
        data.totalDebit = d;
    }

    async generateDataNo(transaction: Transaction): Promise<number> {
        const ymd = moment().format("YYYYMMDD");
        const lastRow = await AccountVoucher.findOne({
            attributes: ["no"],
            where: {
                no: { [Op.between]: [Number(`${ymd}000`), Number(`${ymd}999`)] },
            },
            order: [["no", "DESC"]],
            transaction,
        });
        if (lastRow) {
            return lastRow.no + 1;
        } else {
            return Number(`${ymd}001`);
        }
    }

    public async loadLastDataNo(ymd: string, tempNo: TempNoObj): Promise<void> {
        const lastRow = await AccountVoucher.findOne({
            attributes: ["no"],
            where: {
                no: { [Op.between]: [Number(`${ymd}000`), Number(`${ymd}999`)] },
            },
            order: [["no", "DESC"]],
        });
        if (lastRow) {
            tempNo[AccountVoucher.name][ymd] = lastRow.no + 1;
        } else {
            tempNo[AccountVoucher.name][ymd] = Number(`${ymd}001`);
        }
    }

    async deleteData(id: string | number): Promise<boolean> {
        const { sequelize } = this.domainDBResource;
        return await sequelize.transaction(async (transaction) => {
            return await AccountVoucher.findOne({
                //attributes: ["id", "type", "accItem", "rmk"],
                where: {
                    id,
                },
                transaction,
            })
                .then(async (model) => {
                    if (model) {
                        await AccountVoucherDetail.destroy({
                            where: {
                                voucherId: id,
                            },
                            transaction,
                        });
                        await model.destroy({ transaction });
                        //await this.deleteFile(model.attachment);
                        return true;
                    } else {
                        return false;
                    }
                })
                .catch((e) => {
                    console.log(e);
                    return false;
                });
        });
    }
}

export default AccountVoucherService;
