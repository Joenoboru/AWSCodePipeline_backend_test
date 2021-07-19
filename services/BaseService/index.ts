import { Request } from "express";
import { TOptions } from "i18next";
import { Op, FindAndCountOptions } from "sequelize";
import { Model as TsModel, ModelCtor } from "sequelize-typescript";
import "module-alias/register";
import getDomainDB from "@/domain-resource/indexBack1";
import getNewDomainDB, { DomainResource } from "@/domain-resource";
import getCommonDatabase, { CommonResource } from "@/common-database";
import { Language, Page } from "@/common-database/ts-models";
import { StdQueryListResult } from "@/types/queryTypes";
import { PermissionGroup, EmpPermissionGroup } from "@/domain-resource/ts-models";
import winston from "winston";

interface SequelizePageList {
    count: number;
    rows: unknown[];
}
interface PageList {
    count: number;
    data: any[];
}
interface PageOptions {
    limit: number;
    offset: number;
    orderDir: any | null;
}
class BaseService {
    public logger: winston.Logger;
    protected req: Request;
    /**
     * use for domain database
     * @deprecated move to domainDBResource
     */
    protected domainDB;

    protected domainDBResource: DomainResource;

    /**
     * use for common database

     */
    protected commonDBResource: CommonResource;

    /**
     * the user of the request language
     */
    protected lang: string;
    protected page: PageOptions = {
        offset: 0,
        limit: 10,
        orderDir: null,
    };
    protected employeeId: number = null;
    protected domain: string = null;
    constructor(req: Request) {
        if (req) {
            this.req = req;
            const user = req.user;
            if (user) {
                if (user.employeeId) {
                    this.employeeId = user.employeeId;
                }
            }
            this.domain = user.domain;
            this.domainDB = getDomainDB(user.domain);
            this.domainDBResource = getNewDomainDB(user.domain);
            this.logger = this.domainDBResource.logger;
            this.lang = req.language as string;
            this.page.offset = req.skip;
            this.page.limit = Number(req.query.limit);
            if (req.query && req.query.orderDir) {
                this.page.orderDir = req.query.orderDir;
            }
        }
        //this.commonDB = commonDB;
        this.commonDBResource = getCommonDatabase();
    }
    protected i18n(key: string, param?: TOptions): string {
        return this.req.i18n.t(key, param);
    }

    /**
     * use language code get default id
     */
    protected async getLangId(): Promise<number> {
        let result = await Language.findOne({
            attributes: ["id"],
            where: {
                lang: this.lang,
            },
        });
        if (result) {
            return result.id;
        } else {
            result = await Language.findOne({
                attributes: ["id"],
                limit: 1,
            });
            return result.id;
        }
    }
    /**
     *
     * @param obj target object
     * @param key the i18n key name (default should be model name)
     */
    protected setI18nName(obj: any, key: string): void {
        if (key in obj) {
            if (obj[key] && obj[key].length > 0) {
                obj.name = obj[key][0].name;
            } else {
                obj.name = "undefined";
            }
            delete obj[key];
        }
    }

    protected async getPageListFromTsModel<M extends TsModel>(
        ormModel: ModelCtor<M>,
        options: FindAndCountOptions = {}
    ): Promise<StdQueryListResult<M>> {
        const result: SequelizePageList = await ormModel.findAndCountAll({
            offset: this.page.offset,
            limit: this.page.limit,
            ...options,
        });
        return this.toPageList(result);
    }

    private toPageList(source: SequelizePageList): PageList {
        const result: PageList = {
            count: source.count,
            data: source.rows,
        };
        return result;
    }

    public async getPages(): Promise<any> {
        if (!this.employeeId) {
            return [];
        }
        const intersect = (array1: string[], array2: string[]) => {
            if (!array1) {
                return false;
            }
            if (!array2) {
                return false;
            }
            return (
                array1.filter((v) => {
                    return array2.indexOf(v) > -1;
                }).length > 0
            );
        };
        const roleTags = await EmpPermissionGroup.findAll({
            attributes: [],
            where: { empId: this.employeeId },
            include: [
                {
                    attributes: ["tag"],
                    model: PermissionGroup,
                },
            ],
        }).then((results) => {
            return results.map((a) => a.PermissionGroup.tag);
        });
        const resourceFilter = (a: PageWithItems) => a.resource === null || intersect(a.resource, roleTags);
        return this.getPagesBase(resourceFilter);
    }

    async getPagesBase(dataFilter?: (page: PageWithItems) => any): Promise<PageWithItems[]> {
        Page.hasMany(Page, { foreignKey: "type", sourceKey: "name", as: "items" });
        return await Page.findAll({
            attributes: ["type", "name", "i18n", "icon", "url", "durl", "resource"],
            where: {
                type: {
                    [Op.in]: ["cat", "item"],
                },
            },
            include: [
                {
                    attributes: ["type", "name", "i18n", "icon", "url", "durl", "resource"],
                    model: Page,
                    as: "items",
                    required: false,
                },
            ],
            order: [["id", "asc"]],
        }).then((results) => {
            const mResults = results as PageWithItems[];
            let firstStep: PageWithItems[] = [];
            if (dataFilter) {
                firstStep = mResults.filter(dataFilter).map<PageWithItems>((a) => a.toJSON());
            } else {
                firstStep = mResults.map<PageWithItems>((a) => a.toJSON());
            }
            firstStep.forEach((a) => {
                if (a.items && a.items.length > 0) {
                    a.items.forEach((b) => {
                        b.resource = JSON.parse(b.resource);
                    });
                    if (dataFilter) {
                        a.items = a.items.filter(dataFilter);
                    }
                    a.items.forEach((b) => {
                        b.icon = JSON.parse(b.icon);
                        if (b.durl) {
                            b.durl = {
                                tag: b.durl,
                            };
                        }
                    });
                }
            });
            return firstStep.filter((a) => a.type === "item" || (a.items && a.items.length > 0));
        });
    }

    async getCurrentUserRoles(): Promise<string[]> {
        return await EmpPermissionGroup.findAll({
            where: { empId: this.employeeId },
            include: [
                {
                    attributes: ["tag"],
                    model: PermissionGroup,
                },
            ],
        }).then((result) => {
            const roles = result.map((a) => a.PermissionGroup.tag);
            return roles;
        });
    }
}
const fakeReq = (domain = "mirai-network.com", employeeId = 1, language = "zh-TW", offset = 0, limit = 10): any => {
    return {
        user: {
            domain,
            employeeId,
        },
        language,
        skip: offset,
        query: {
            limit,
        },
    };
};
export { fakeReq };
export default BaseService;

export interface PageWithItems extends Partial<Page> {
    items?: Page[];
}
