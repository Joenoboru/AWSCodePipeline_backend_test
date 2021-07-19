import { Request } from "express";
import sequelize, { Op, fn, col, FindOptions, WhereOptions } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import XLSX from "xlsx";
import "module-alias/register";
import { StdQueryListResult } from "@/types/queryTypes";
import { AccountItem, AccountItemI18n } from "@/domain-resource/ts-models";
import { Language } from "@/common-database/ts-models";
import { ErrorDef } from "@/wf_common";
import BaseService from "../BaseService";
class AccountitemService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    public async getAll(): Promise<AccountItemWithName[] | null> {
        const languageId = await this.getLangId();
        const options: FindOptions = {
            attributes: [
                "id",
                "code",
                "name",
                "type",
                "dcType",
                "catalog",
                "catalogL0",
                "catalogL1",
                "catalogL2",
                "catalogL3",
            ],
            order: [["code", "ASC"]],
            include: [
                {
                    model: AccountItemI18n,
                    attributes: ["name"],
                    required: false,
                    where: {
                        languageId,
                    },
                },
            ],
        };
        const results = await AccountItem.findAll(options);
        return results.map((a) => {
            const obj = a.toJSON() as AccountItemWithName;
            this.setI18nName(obj, "AccountItemI18n");
            return obj;
        });
    }

    async getOne(id: string): Promise<any> {
        const results = await AccountItem.findOne({
            attributes: [
                "id",
                "code",
                "name",
                "type",
                "dcType",
                "catalog",
                "catalogL0",
                "catalogL1",
                "catalogL2",
                "catalogL3",
                "rmk",
            ],
            where: {
                id,
            },
            include: [
                {
                    model: AccountItemI18n,
                    required: false,
                },
            ],
        });
        return results;
    }

    public async getTree(): Promise<any> {
        const service = this;
        const isShowAll = false;
        const where: WhereOptions = {
            [Op.and]: [sequelize.where(fn("CHARACTER_LENGTH", col("code")), "=", 1 as any)],
        };
        if (!isShowAll) {
            where[Op.and].push({
                status: 1,
            });
        }
        return await AccountItem.findAll({
            attributes: ["id", "code", "name", "chname", "status"],
            where: where,
            order: [["code", "ASC"]],
            raw: true,
            nest: true,
        }).then(async (results) => {
            if (results && results.length > 0) {
                const expandPromises = results.map((row) => service.findChildren(row.code, row, true));
                return await Promise.all(expandPromises).then(function (childrenResult) {
                    return results;
                });
            }
        });
    }
    async findChildren(nodeId: string, parentData: AccountItemNode, isShowAll: boolean): Promise<any> {
        const service = this;
        const codeLen = nodeId.length === 1 ? 2 : nodeId.length === 2 ? 4 : nodeId.length === 4 ? 6 : 0;
        const where: WhereOptions = {
            [Op.and]: [
                {
                    code: {
                        [Op.startsWith]: nodeId,
                    },
                },
                sequelize.where(sequelize.fn("CHARACTER_LENGTH", sequelize.col("code")), codeLen as any),
            ],
        };
        if (!isShowAll) {
            where[Op.and][0].status = 1;
        }
        if (nodeId.length >= 6) {
            parentData.children = [];
            return new Promise(function (resolve) {
                resolve(parentData);
            });
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return new Promise(function (resolve, reject) {
            AccountItem.findAll({
                attributes: ["id", "code", "name", "chname", "status"],
                where: where,
                order: [["code", "ASC"]],
                raw: true,
                nest: true,
            }).then((results) => {
                if (results && results.length > 0) {
                    const expandPromises = results.map((row) => service.findChildren(row.code, row, true));
                    Promise.all(expandPromises).then(function (childrenResult) {
                        parentData.children = childrenResult;
                        resolve(parentData);
                    });
                } else {
                    parentData.children = [];
                    resolve(parentData);
                }
            });
        });
    }
    async getList(): Promise<StdQueryListResult<AccountItem>> {
        return await AccountItem.findAndCountAll({
            offset: this.page.offset,
            limit: this.page.limit,
            order: [["code", "ASC"]],
        }).then((results) => {
            return {
                count: results.count,
                data: results.rows,
            };
        });
    }
    public async processUploadFile(): Promise<any> {
        if (!this.req.files.file) {
            throw ErrorDef.FILE_NOT_FOUND;
        }
        const { sequelize } = this.domainDBResource;
        const newFileName = `${uuidv4()}.xlsx`;
        const file = this.req.files.file;
        const path = `./uploads/${newFileName}`;
        const langData = await Language.findAll();
        const langList = langData.map((a) => ({
            lang: a.lang.toUpperCase(),
            id: a.id,
        }));
        const dcTypeData = { 借: 1, 貸: 2 };
        const getDcType = (rowData) => {
            if (rowData in dcTypeData) {
                return dcTypeData[rowData];
            }
            return 0;
        };
        if (!Array.isArray(file)) {
            return await new Promise((resolve, reject) => {
                file.mv(path, async () => {
                    const workbook = XLSX.readFile(path);
                    const sheet_name_list = workbook.SheetNames;
                    let xlData = XLSX.utils.sheet_to_json<any>(workbook.Sheets[sheet_name_list[0]]);
                    xlData = xlData.filter((a) => a.CODE !== "");
                    if (xlData.length === 0) {
                        reject(ErrorDef.FILE_INVALID);
                    }
                    const map = new Map();
                    for (const item of xlData) {
                        if (!map.has(item.CODE)) {
                            map.set(item.CODE, true); // set any value to Map
                        } else {
                            reject(ErrorDef.ACCOUNTITEM_CODE_INVALID);
                            return;
                        }
                    }
                    const insertData = xlData.map((a) => {
                        const mainData = {
                            code: a.CODE,
                            name: a.NAME_TW,
                            type: a.TYPE,
                            dcType: getDcType(a.DC_TYPE),
                            catalog: a.CATALOG,
                            rmk: a.RMK || "",
                            taxItemPrefix: a.TAX_ITEM_PREFIX,
                            taxItemCode: a.TAX_ITEM_CODE,
                        };
                        const i18n = [];
                        langList.forEach((b) => {
                            const key = "NAME_" + b.lang;
                            if (key in a) {
                                i18n.push({
                                    languageId: b.id,
                                    name: a[key],
                                });
                            }
                        });
                        const assocs = [];
                        if (a.CATALOG_L0 && a.CATALOG_L0 !== "" && a.CATALOG_L0 !== a.CODE) {
                            assocs.push(a.CATALOG_L0.toString());
                            if (a.CATALOG_L1 && a.CATALOG_L1 !== "" && a.CATALOG_L1 !== a.CODE) {
                                assocs.push(a.CATALOG_L1.toString());
                                if (a.CATALOG_L2 && a.CATALOG_L2 !== "" && a.CATALOG_L2 !== a.CODE) {
                                    assocs.push(a.CATALOG_L2.toString());
                                    if (a.CATALOG_L3 && a.CATALOG_L3 !== "" && a.CATALOG_L3 !== a.CODE) {
                                        assocs.push(a.CATALOG_L3.toString());
                                    }
                                }
                            }
                        }
                        return {
                            main: {
                                ...mainData,
                                AccountItemI18n: i18n,
                            },
                            assocs,
                        };
                    });
                    //await foo.createBar({ name: 'yet-another-bar' });
                    const service = this;
                    const modelData = [];
                    await sequelize.transaction(async (transaction) => {
                        try {
                            await AccountItem.destroy({ where: {}, transaction });
                            await AccountItemI18n.destroy({ where: {}, transaction });
                            for (let i = 0; i < insertData.length; i++) {
                                const m = await AccountItem.create(insertData[i].main, {
                                    transaction,
                                    include: [AccountItemI18n],
                                });
                                modelData.push(m);
                            }
                            for (let i = 0; i < insertData.length; i++) {
                                if (insertData[i].main.type !== 0 && insertData[i].assocs.length > 0) {
                                    for (let j = 0; j < insertData[i].assocs.length; j++) {
                                        const am = modelData.find(
                                            (a) => a.code.toString() === insertData[i].assocs[j].toString()
                                        );
                                        if (am) {
                                            modelData[i]["catalogL" + j] = am.id;
                                        } else {
                                            break;
                                        }
                                    }
                                    await modelData[i].save({ transaction });
                                }
                            }
                            resolve({ status: "ok" });
                        } catch (e) {
                            service.logger.error(e);
                            reject(ErrorDef.ErrorTran);
                        }
                    });
                });
            })
                .catch((e) => {
                    return {
                        status: "error",
                        code: e,
                    };
                })
                .finally(() => {
                    fs.unlinkSync(path);
                });
        }
    }

    async createOrUpdateData(data: Partial<AccountItem>): Promise<AccountItem> {
        const { sequelize } = this.domainDBResource;
        return await sequelize.transaction(async (transaction) => {
            let model = null;
            if (!data.id) {
                model = await AccountItem.create(data, {
                    transaction,
                    include: [AccountItemI18n],
                });
            } else {
                model = await AccountItem.findOne({
                    attributes: [
                        "id",
                        "code",
                        "name",
                        "type",
                        "dcType",
                        "catalog",
                        "catalogL0",
                        "catalogL1",
                        "catalogL2",
                        "catalogL3",
                        "rmk",
                    ],
                    where: { id: data.id },
                    transaction,
                });
                model.update(data, {
                    where: { id: data.id },
                    transaction,
                });
                await AccountItemI18n.destroy({
                    where: {
                        accountItemId: data.id,
                    },
                    transaction,
                });
                data.AccountItemI18n.forEach((a) => {
                    a.accountItemId = model.id;
                });
                await AccountItemI18n.bulkCreate(data.AccountItemI18n, { transaction });
            }
            return model;
        });
    }

    async deleteData(id: string | number): Promise<boolean> {
        const { sequelize } = this.domainDBResource;
        return await sequelize.transaction(async (transaction) => {
            return await AccountItem.findOne({
                attributes: [
                    "id",
                    "code",
                    "name",
                    "type",
                    "dcType",
                    "catalog",
                    "catalogL0",
                    "catalogL1",
                    "catalogL2",
                    "catalogL3",
                    "rmk",
                ],
                where: {
                    id,
                },
                transaction,
            })
                .then(async (model) => {
                    if (model) {
                        await AccountItemI18n.destroy({
                            where: {
                                accountItemId: id,
                            },
                            transaction,
                        });
                        await model.destroy({ transaction });
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

export default AccountitemService;

export interface AccountItemWithName extends Partial<AccountItem> {
    name?: string;
}

export interface AccountItemNode extends Partial<AccountItem> {
    children?: AccountItemNode[];
}
