import BaseService from "../BaseService";
const { validationResult } = require("express-validator");
const { createWhereFormSearchable, createWhereFormFilter } = require("../../helpers/dbHelper");
const fillable = ["onTop", "show", "title", "content", "createUser", "updateUser"];
const sequelize = require("sequelize");
const { Op } = sequelize;
const moment = require("moment");
const sortable = ["id", "onTop", "show", "title", "createUser", "createAt"];
import { ErrorDef } from "../../wf_common";
class AnnounceService extends BaseService {
    constructor(req) {
        super(req);
    }
    async getBudgetList(yearMonth, searchOptions) {
        /*const { BudgetDetails } = this.domainDB;
        return await this.getPageList(BudgetDetails, {
            where: {
                yearMonth,
                ...searchOptions,
            },
        });*/
    }
    public async getBudgetAll(body: any) {
        /*const { BudgetDetails } = this.domainDB;
        const month = moment(body.yearMonth, "YYYY-MM");
        const yearMonth = month.format("YYYY/M");
        const where = {
            yearMonth,
            pl1: body.pl1,
            pl2: body.pl2,
            pl3: body.pl3,
        };
        if (where.pl1 === undefined) {
            delete where.pl1;
        }
        if (where.pl2 === undefined) {
            delete where.pl2;
        }
        if (where.pl3 === undefined) {
            delete where.pl3;
        }
        if (where.pl1 === null) {
            where.pl1 = { [Op.is]: null };
        }
        if (where.pl2 === null) {
            where.pl2 = { [Op.is]: null };
        }
        if (where.pl3 === null) {
            where.pl3 = { [Op.is]: null };
        }
        return await BudgetDetails.findAll({
            where: where,
        });*/
    }
    async insertUpdate(yearMonth, data) {
        /*const { BudgetDetails } = this.domainDB;
        const baseData = {
            updatedUser: this.employeeId,
        };
        if (!data.id) {
            await BudgetDetails.build({
                yearMonth,
                ...data,
                createdUser: this.employeeId,
                ...baseData,
            }).save();
        } else {
            await BudgetDetails.update({ ...data, ...baseData }, { where: { id: data.id } });
        }*/
    }

    async deleteData(id) {
        /*const { BudgetDetails } = this.domainDB;
        return await BudgetDetails.findOne({
            where: {
                id: id,
            },
        }).then(async (model) => {
            if (model) {
                return await model.destroy().then(() => {
                    return model;
                });
            } else {
                return null;
            }
        });*/
    }
    public async getBudgetGroup(yearMonth: string) {
        /*const { BudgetDetails } = this.domainDB;
        return await BudgetDetails.findAll({
            where: {
                yearMonth,
            },
            group: ["pl1", "pl2", "pl3", "currency"],
            attributes: ["pl1", "pl2", "pl3", "currency", [sequelize.fn("sum", sequelize.col("amount")), "amount"]],
            raw: true,
        });*/
    }
}
export { sortable };
export default AnnounceService;
