import BaseService from "../BaseService";
import { FindOptions } from "sequelize";
import "module-alias/register";
import { RaType, RaTypeI18n } from "@/domain-resource/ts-models";
//import { ErrorDef } from "../../wf_common";

class RaTypeService extends BaseService {
    public async getAll(): Promise<any> {
        const languageId = await this.getLangId();
        const options: FindOptions = {
            attributes: ["id", "type", "accItem", "rmk"],
            order: [["id", "ASC"]],
            include: [
                {
                    model: RaTypeI18n,
                    attributes: ["name"],
                    required: false,
                    where: {
                        languageId,
                    },
                },
            ],
        };
        const results = await RaType.findAll(options);
        return results.map((a) => {
            const obj = a.toJSON();
            this.setI18nName(obj, "RaTypeI18ns");
            return obj;
        });
    }

    async getOne(id: string): Promise<RaType> {
        const results = await RaType.findOne({
            attributes: ["id", "type", "accItem", "rmk"],
            where: {
                id,
            },
            include: [
                {
                    model: RaTypeI18n,
                    required: false,
                },
            ],
        });
        return results;
    }

    async getPageOfData(): Promise<any> {
        const languageId = await this.getLangId();
        const result = await this.getPageListFromTsModel(RaType, {
            attributes: ["id", "type", "accItem", "rmk"],
            include: [
                {
                    attributes: ["name"],
                    model: RaTypeI18n,
                    required: false,
                    where: {
                        languageId,
                    },
                },
            ],
        });

        return {
            count: result.count,
            data: result.data.map((a) => {
                const obj = a.toJSON();
                this.setI18nName(obj, "RaTypeI18ns");
                return obj;
            }),
        };
    }

    async getList(type?: number): Promise<any> {
        const languageId = await this.getLangId();
        const options: Record<string, unknown> = {
            attributes: ["id", "type"],
            order: [[{ model: RaTypeI18n }, "name", "ASC"]],
            include: [
                {
                    model: RaTypeI18n,
                    attributes: ["name"],
                    required: false,
                    where: {
                        languageId,
                    },
                },
            ],
        };
        if (type) {
            options.where = {
                type,
            };
        }
        const results = await RaType.findAll(options);
        return results.map((a) => {
            const obj = a.toJSON();
            this.setI18nName(obj, "RaTypeI18ns");
            return obj;
        });
    }

    async createOrUpdateData(data: RaType): Promise<RaType> {
        const { sequelize } = this.domainDBResource;
        return await sequelize.transaction(async (transaction) => {
            let model = null;
            if (!data.id) {
                model = await RaType.create(data, {
                    transaction,
                    include: [RaTypeI18n],
                });
            } else {
                model = await RaType.findOne({
                    attributes: ["id", "type", "accItem", "rmk"],
                    where: { id: data.id },
                    transaction,
                });
                await model.update(data, {
                    where: { id: data.id },
                    transaction,
                });
                await RaTypeI18n.destroy({
                    where: {
                        raTypeId: data.id,
                    },
                    transaction,
                });
                data.RaTypeI18n.forEach((a) => {
                    a.raTypeId = model.id;
                });
                await RaTypeI18n.bulkCreate(data.RaTypeI18n, { transaction });
            }
            return model;
        });
    }

    async deleteData(id: string | number): Promise<boolean> {
        const { sequelize } = this.domainDBResource;
        return await sequelize.transaction(async (transaction) => {
            return await RaType.findOne({
                attributes: ["id", "type", "accItem", "rmk"],
                where: {
                    id,
                },
                transaction,
            })
                .then(async (model) => {
                    if (model) {
                        await RaTypeI18n.destroy({
                            where: {
                                RaTypeId: id,
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

export default RaTypeService;

export interface RaTypeAllBody {
    id: number;
    type: number;
    accItem: number;
    rmk: string;
    ["RaTypeI18n.name"]: string;
}