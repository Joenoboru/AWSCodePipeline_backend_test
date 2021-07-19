import { Model as TsModel, ModelCtor } from "sequelize-typescript";
import { WhereOptions, FindOptions, Order, Op, Transaction, FindAttributeOptions } from "sequelize";
import { Request } from "express";
import { ErrorDef } from "../wf_common";

/**
 *
 * @param {Array} searchable
 * @param {String} searchText
 */
export function createWhereFormSearchable(searchable: string[], searchText: string): WhereOptions<any> {
    const where = {};
    if (searchText) {
        const arr = searchable.map((field) => ({
            [field]: {
                [Op.substring]: searchText,
            },
        }));
        where[Op.or] = arr;
    }
    return where;
}

/**
 *
 * @param {Array} filterable
 * @param {Array} filters
 */
export function createWhereFormFilter(
    filterable: string[],
    filters: string[],
    rename: Record<string, string> = null,
    boolFields: string[] = []
): WhereOptions<any> {
    let where = null;
    if (filters) {
        const arr = filters
            .map((f) => JSON.parse(f))
            .filter(
                (obj) =>
                    filterable.indexOf(obj.f) >= 0 &&
                    ((Array.isArray(obj.v) && obj.v.length > 0) || typeof obj.v === "string")
            )
            .map((obj) => {
                const fieldName = rename && obj.f in rename ? rename[obj.f] : obj.f;
                if (Array.isArray(obj.v) && obj.v.length > 0) {
                    return {
                        [fieldName]: {
                            [Op.in]: obj.v,
                        },
                    };
                }
                if (boolFields.indexOf(fieldName) > -1) {
                    if (obj.v === "checked") {
                        return {
                            [fieldName]: {
                                [Op.is]: true,
                            },
                        };
                    }
                    if (obj.v === "unchecked") {
                        return {
                            [fieldName]: {
                                [Op.not]: true,
                            },
                        };
                    }
                }
                return {
                    [fieldName]: {
                        [Op.substring]: obj.v,
                    },
                };
            });
        if (arr.length > 0) {
            where = { [Op.and]: arr };
        }
    }
    return where;
}

/*interface RequestWithOrder extends Request {
    query: {
        order: string;
        orderDir: string;
        any;
    };
}*/

export function createOrder(req: Request, def: Order = []): Order {
    const { validationResult } = require("express-validator");
    const errors = validationResult(req);
    let order = req.query.order;
    const orderDir = req.query.orderDir;
    if (!errors.isEmpty()) {
        order = null;
    }
    let orderData = def;
    if (order) {
        orderData = [[order as string, orderDir as string]];
    }
    return orderData;
}

export async function createQueryList<M extends TsModel>(
    model: ModelCtor<M>,
    attrs: FindAttributeOptions,
    page: { offset: number; limit: number },
    order?: Order,
    searchData?: { searchable: string[]; str?: string } | null,
    filterData?: { filterable: string[]; filter?: string[] } | null,
    where?: WhereOptions<any>,
    options?: FindOptions<M>
): Promise<any> {
    const whereSearch = searchData ? createWhereFormSearchable(searchData.searchable, searchData.str) : {};
    const whereFilter = filterData ? createWhereFormFilter(filterData.filterable, filterData.filter) : {};
    const mWhere = { ...whereSearch, ...whereFilter, ...where };
    const result = await model.findAndCountAll({
        attributes: attrs,
        offset: page.offset,
        limit: page.limit,
        where: mWhere,
        order: order,
        ...options,
    });
    return result;
}

export async function createQueryAll<M extends TsModel>(
    model: ModelCtor<M>,
    attrs: FindAttributeOptions,
    options?: FindOptions<M>
): Promise<M[]> {
    const result = await model.findAll({
        attributes: attrs,
        ...options,
    });
    return result;
}

export async function createData<M extends TsModel>(model: ModelCtor<M>, fillable: string[], data: M): Promise<M> {
    const dataModel = await model.build(data).save({ fields: fillable });
    return dataModel;
}

export async function updateData<M extends TsModel>(
    model: ModelCtor<M>,
    fillable: string[],
    data: M,
    where: WhereOptions<M>,
    transaction?: Transaction
): Promise<M> {
    const extraOptions: { transaction?: Transaction } = {};
    if (transaction) {
        extraOptions.transaction = transaction;
    }
    return new Promise((resolve, reject) => {
        model
            .findOne({
                where: where,
                ...extraOptions,
            })
            .then((model) => {
                if (model === null) {
                    reject(ErrorDef.DataNotFound);
                } else {
                    model.update(data, { fields: fillable, ...extraOptions }).then(() => {
                        resolve(model);
                    });
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
}

export async function deleteData<M extends TsModel>(ormModel: ModelCtor<M>, where: WhereOptions<M>): Promise<M> {
    return new Promise((resolve, reject) => {
        ormModel
            .findOne({
                where: where,
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
