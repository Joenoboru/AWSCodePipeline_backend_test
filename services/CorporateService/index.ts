import { Request } from "express";
import { FindOptions, Order } from "sequelize";
import "module-alias/register";
import { Corporate } from "@/domain-resource/ts-models";
import {
    createWhereFormSearchable,
    createWhereFormFilter,
} from "@/helpers/dbHelper";
import { ErrorDef } from "@/wf_common";
import BaseService from "../BaseService";
import { sortable, searchable, fillable } from "./fieldSetting";

require("app-module-path").addPath(__dirname);

class CorporateService extends BaseService {
    // private Corporate: any;
    readonly fillable: string[] = fillable;
    readonly sortable: string[] = sortable;
    readonly searchable: string[] = searchable;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    constructor(req: Request) {
        super(req);
    }
    //class getList
    async getCorporateList(
        str?: string,
        filter?: string[],
        order?: Order,
        options?: FindOptions<Corporate>
    ): Promise<{ rows: Corporate[]; count: number }> {
        const whereSearch = str ? createWhereFormSearchable(this.searchable, str) : {};
        const whereFilter = filter ? createWhereFormFilter(this.sortable, filter) : {};
        const mWhere = { ...whereSearch, ...whereFilter };
        const result = await Corporate.findAndCountAll({
            attributes: this.sortable,
            offset: this.page.offset,
            limit: this.page.limit,
            where: mWhere,
            order: order,
            ...options,
        });
        return result;
    }

    async getCorporateAll(): Promise<Corporate[]> {
        const result = await Corporate.findAll({
            attributes: ["id", "name", "jpName", "enName"],
        });
        return result;
    }

    async getCorporatePickerData(str?: string, filter?: string[]): Promise<Corporate[]> {
        const whereSearch = createWhereFormSearchable(this.searchable, str);
        const whereFilter = createWhereFormFilter(this.sortable, filter);
        const where = { ...whereSearch, ...whereFilter };
        const result = await Corporate.findAll({
            attributes: ["id", "name", "jpName", "enName"],
            where: where,
        });
        return result;
    }
    async getCorporate(id: number): Promise<Corporate> {
        return Corporate.findOne({
            where: {
                id: id,
            },
        });
    }

    async createCorporate(data: Corporate): Promise<Corporate> {
        const model = await Corporate.build(data).save({ fields: fillable });
        return model;
    }

    async updateCorporate(data: Corporate): Promise<Corporate> {
        return new Promise((resolve, reject) => {
            Corporate.findOne({
                where: { id: data.id },
            })
                .then((model) => {
                    if (model === null) {
                        reject(ErrorDef.DataNotFound);
                    } else {
                        model.update(data, { fields: fillable }).then(() => {
                            resolve(model);
                        });
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
    async del(data: Corporate): Promise<Corporate> {
        return new Promise((resolve, reject) => {
            Corporate.findOne({
                where: { id: data.id },
            })
                .then((model) => {
                    if (model === null) {
                        reject(ErrorDef.DataNotFound);
                    } else {
                        model.destroy().then(() => {
                            resolve(model);
                        });
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
}
export { sortable };
export default CorporateService;
