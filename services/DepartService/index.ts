import { Request } from "express";
import { Op, Order } from "sequelize";
import "module-alias/register";
import { Corporate, Department } from "@/domain-resource/ts-models";
import { createWhereFormSearchable, createWhereFormFilter } from "@/helpers/dbHelper";
import { ErrorDef } from "@/wf_common";
import BaseService from "../BaseService";

const fillable = ["name", "chname", "orgp", "corp", "status", "rmk"];
const searchable = ["name", "chname"];
const sortable = ["name", "chname", "status"];

export interface CorpDepartOrgNode {
    dataId: number;
    id: string;
    name: string;
    chname: string;
    engname?: string;
    status?: boolean;
    children?: CorpDepartOrgNode[];
}

class DepartService extends BaseService {
    async getOrg(id: number, isShowAll: boolean): Promise<CorpDepartOrgNode | any> {
        return await Corporate.findOne({
            attributes: ["name", "chname", "engname"],
            where: {
                id: id,
            },
            //raw: true,
            nest: true,
        }).then(async (rootResult) => {
            if (rootResult === null) {
                return {
                    status: "error",
                    code: ErrorDef.DataNotFound,
                };
            }
            const rootOrg: CorpDepartOrgNode = {
                dataId: 0,
                id: "n0",
                name: rootResult.name,
                chname: rootResult.jpName,
                engname: rootResult.enName,
            };
            //CorpDepartOrgNode
            return await findChildren(0, rootOrg).then((result) => {
                return result;
            });
        });

        async function findChildren(nodeId: number, parentData: CorpDepartOrgNode) {
            const where = {
                corp: id,
                orgp: nodeId,
            };
            if (!isShowAll) {
                where["status"] = 1;
            }
            // eslint-disable-next-line no-unused-vars
            return new Promise(function (resolve, reject) {
                Department.findAll({
                    //attributes: [[fn("CONCAT", "n", col("id")), "id"], ["id", "dataId"], "name", "chname", "status"],
                    attributes: ["id", "name", "chname", "status"],
                    where: where,
                    raw: true,
                    nest: true,
                }).then((results) => {
                    if (results && results.length > 0) {
                        const expandPromises = results.map((row) => {
                            const orgNode: CorpDepartOrgNode = {
                                dataId: row.id,
                                id: "n" + row.id,
                                name: row.name,
                                chname: row.chname,
                                status: row.status,
                            };
                            findChildren(row.id, orgNode);
                            return orgNode;
                        });
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
    }
    async deleteDepartment(id: number): Promise<{ status: string; result: Department }> {
        return await Department.findOne({
            where: {
                id: id,
            },
        }).then(async (model) => {
            return await model.destroy().then(() => {
                return { status: "ok", result: model };
            });
        });
    }

    async updateDepartment(id: number, body: Department): Promise<{ status: string; result: Department }> {
        const service = this;
        return await Department.findOne({
            where: {
                id,
            },
        }).then(async (model) => {
            return await model.update(body, { fields: fillable }).then(async (model) => {
                return await service.updateStatus(model, model.status).then(() => {
                    return { status: "ok", result: model };
                });
            });
        });
    }

    //子母節點狀況連動
    async updateStatus(node: Department, status: boolean): Promise<any> {
        const service = this;
        if (status) {
            return new Promise<void>(function (resolve, reject) {
                if (node.orgp === 0) {
                    resolve();
                }
                Department.findOne({
                    where: {
                        id: node.orgp,
                    },
                })
                    .then((model) => {
                        if (!model.status) {
                            model.status = true;
                            model.save({ fields: ["status"] }).then(() => {
                                service.updateStatus(model, true);
                                resolve();
                            });
                        } else {
                            resolve();
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        reject(err);
                    });
            });
        } else {
            return new Promise<void>(function (resolve, reject) {
                Department.findAll({
                    where: {
                        orgp: node.id,
                    },
                })
                    .then((models) => {
                        if (models && models.length > 0) {
                            const expandPromises = models.map(
                                (model) =>
                                    // eslint-disable-next-line no-unused-vars
                                    new Promise<void>((resolve, reject) => {
                                        if (model.status) {
                                            model.status = false;
                                            model.save({ fields: ["status"] }).then(() => {
                                                service.updateStatus(model, false);
                                                resolve();
                                            });
                                        } else {
                                            resolve();
                                        }
                                    })
                            );
                            Promise.all(expandPromises).then(function () {
                                resolve();
                            });
                        } else {
                            resolve();
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        reject(err);
                    });
            });
        }
    }
    async createDepartment(body: Department): Promise<any> {
        return await Department.build(body)
            .save({ fields: fillable })
            .then((model) => {
                return { status: "ok", result: model };
            })
            .catch((error) => {
                return { status: "error", code: ErrorDef.ErrorTran, error: error };
            });
    }
    async getAps(corpId: number, depId: number): Promise<any> {
        const service = this;
        return await Corporate.findOne({
            attributes: ["name", "chname"],
            where: {
                id: corpId,
                // type: 1,
            },
            raw: true,
            nest: true,
        }).then(async (rootResult) => {
            if (rootResult === null) {
                return {
                    status: "error",
                    code: ErrorDef.DataNotFound,
                };
            }
            rootResult.id = 0;
            return await service.findAvailableParents(0, depId, corpId, [rootResult]).then((aps) => {
                return aps;
            });
        });
    }
    async findAvailableParents(rootNode: number, ignoreNote: number, corp: number, data = []): Promise<any> {
        // eslint-disable-next-line no-unused-vars
        const service = this;
        return new Promise(function (resolve, reject) {
            Department.findAll({
                attributes: ["id", "name", "chname"],
                where: {
                    id: {
                        [Op.ne]: ignoreNote,
                    },
                    corp: corp,
                    orgp: rootNode,
                    status: 1,
                },
                raw: true,
            }).then((results) => {
                if (results && results.length > 0) {
                    const expandPromises = results
                        .filter((row) => row.id !== ignoreNote)
                        .map((row) => {
                            data.push(row);
                            return service.findAvailableParents(row.id, ignoreNote, corp, data);
                        });
                    Promise.all(expandPromises).then(function (/*childrenResult*/) {
                        resolve(data);
                    });
                } else {
                    resolve(data);
                }
            });
        });
    }
    async getOne(id: number): Promise<Department | any> {
        return await Department.findOne({
            where: {
                id: id,
            },
        }).then((result) => {
            if (result === null || id === null || Number(id) === 0) {
                return {
                    status: "error",
                    code: ErrorDef.DataNotFound,
                };
            }
            return result;
        });
    }
    async getAllCorp(id: number): Promise<Department[]> {
        return await Department.findAll({
            attributes: ["id", "name", "chname"],
            where: { corp: id, status: 1 },
        });
    }

    async getCorpList(
        id: number,
        orderData: Order,
        str: string,
        filter: string[]
    ): Promise<{
        data: Department[];
        count: number;
    }> {
        const whereSearch = str ? createWhereFormSearchable(searchable, str) : {};
        const whereFilter = filter ? createWhereFormFilter(sortable, filter) : {};
        const mWhere = { ...whereSearch, ...whereFilter, corp: id };
        const results = await Department.findAndCountAll({
            attributes: ["id", ...sortable],
            offset: this.page.offset,
            limit: this.page.limit,
            where: mWhere,
            order: orderData,
        });
        return {
            count: results.count,
            data: results.rows,
        };
    }
    async getList(orderData: Order): Promise<{ count: number; data: Department[] }> {
        return await Department.findAndCountAll({
            order: orderData,
            limit: this.page.limit,
            offset: this.page.offset,
        }).then((results) => {
            return {
                count: results.count,
                data: results.rows,
            };
        });
    }

    async getAll(): Promise<Department[]> {
        return await Department.findAll({
            attributes: ["id", "name", "chname"],
        });
    }

    constructor(req: Request) {
        super(req);
    }
}

export default DepartService;
