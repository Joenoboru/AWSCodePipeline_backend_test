import { FindOptions, Order } from "sequelize";
import "module-alias/register";
import { AccountItemSetting } from "@/domain-resource/ts-models";
import { createWhereFormSearchable, createWhereFormFilter } from "@/helpers/dbHelper";
import { sortable, searchable } from "./fieldSetting";
import BaseService from "../BaseService";
import { StdQueryListResult } from "@/types/queryTypes";

class AccountItemSettingService extends BaseService {
    public async getAll(): Promise<AccountItemSetting[]> {
        const results = await AccountItemSetting.findAll({
            attributes: ["tag", "accItem", "conds", "rmk"],
            order: [["tag", "ASC"]],
        });
        return results;
    }

    async getOne(tag: string): Promise<AccountItemSetting> {
        const results = await AccountItemSetting.findOne({
            where: {
                tag,
            },
        });
        return results;
    }

    async getPageOfData(
        str?: string,
        filter?: string[],
        order: Order = ["tag", "asc"],
        options?: FindOptions<any>
    ): Promise<StdQueryListResult<AccountItemSetting>> {
        const whereSearch = createWhereFormSearchable(searchable, str);
        const whereFilter = createWhereFormFilter(sortable, filter);
        const where = { ...whereSearch, ...whereFilter };
        const result = await this.getPageListFromTsModel(AccountItemSetting, {
            attributes: ["tag", "accItem", "conds", "rmk"],
            order,
            where,
            ...options,
        });

        return {
            count: result.count,
            data: result.data,
        };
    }

    async updateData(data: AccountItemSetting): Promise<AccountItemSetting> {
        const { sequelize } = this.domainDBResource;
        return await sequelize.transaction(async (transaction) => {
            let model: AccountItemSetting = null;
            if (data.tag) {
                model = await AccountItemSetting.findOne({
                    where: { tag: data.tag },
                    transaction,
                });
                await model.update(
                    { accItem: data.accItem, rmk: data.rmk, updatedUser: this.employeeId },
                    {
                        where: { id: data.tag },
                        transaction,
                    }
                );
            }
            return model;
        });
    }

    async initData(): Promise<void> {
        const { sequelize } = this.domainDBResource;
        return await sequelize.transaction(async (transaction) => {
            await AccountItemSetting.truncate({ transaction });
            await AccountItemSetting.bulkCreate(
                [
                    { tag: "in", conds: { cat: [4, 7], type: [2] } },
                    { tag: "in_tax", conds: { cat: [1, 2], type: [2] } },
                    { tag: "ar", conds: { cat: [1], type: [2] } },
                    { tag: "ex", conds: { cat: [5, 6], type: [2] } },
                    { tag: "ex_tax", conds: { cat: [1, 2], type: [2] } },
                    { tag: "ap", conds: { cat: [2], type: [2] } },
                    { tag: "tr_fee", conds: { cat: [5, 6], type: [2] } },
                    { tag: "ope", conds: { cat: [2], type: [2] } },
                    { tag: "cash", conds: { cat: [1], type: [2] } },
                    { tag: "salary", conds: { cat: [5], type: [2] } },
                    { tag: "ins_heal", conds: { cat: [5, 6], type: [2] } },
                    { tag: "ins_emp", conds: { cat: [5, 6], type: [2] } },
                    { tag: "pl", conds: { cat: [3], type: [2] } },
                    { tag: "pl_accu", conds: { cat: [3], type: [2] } },
                    { tag: "oe", conds: { cat: [3], type: [2] } },
                    { tag: "agc", conds: { cat: [2], type: [2] } },
                    { tag: "agp", conds: { cat: [1], type: [2] } },
                    { tag: "fx_in", conds: { cat: [4, 7], type: [2] } },
                    { tag: "fx_out", conds: { cat: [5, 6, 8], type: [2] } },
                ],
                { transaction }
            );
        });
    }
}

export default AccountItemSettingService;
export { sortable };
