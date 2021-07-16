import BaseService from "../BaseService";
class ProfitLossService extends BaseService {
    constructor(req: any) {
        super(req);
    }
    public async getPLitems(): Promise<any> {
        const languageId = await this.getLangId();
        const {
            ProfitLossMain,
            ProfitLossMainI18n,
            ProfitLoss2nd,
            ProfitLoss3rd,
            ProfitLoss2ndI18n,
            ProfitLoss3rdI18n,
        } = this.domainDB;
        const results = await ProfitLossMain.findAll({
            include: [
                {
                    model: ProfitLossMainI18n,
                    attributes: ["name"],
                    required: false,
                    where: {
                        languageId,
                    },
                },
                {
                    model: ProfitLoss2nd,
                    attributes: ["id"],
                    required: false,
                    include: [
                        {
                            model: ProfitLoss2ndI18n,
                            attributes: ["name"],
                            required: false,
                            where: {
                                languageId,
                            },
                        },
                        {
                            model: ProfitLoss3rd,
                            attributes: ["id"],
                            required: false,
                            include: [
                                {
                                    model: ProfitLoss3rdI18n,
                                    attributes: ["name"],
                                    required: false,
                                    where: {
                                        languageId,
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        return results.map((a) => {
            const obj = a.toJSON();
            this.setI18nName(obj, "ProfitLossMainI18ns");
            obj.ProfitLoss2nds = obj.ProfitLoss2nds.map((a) => {
                this.setI18nName(a, "ProfitLoss2ndI18ns");
                a.ProfitLoss3rds = a.ProfitLoss3rds.map((b) => {
                    this.setI18nName(b, "ProfitLoss3rdI18ns");
                    return b;
                });
                return a;
            });
            return obj;
        });
    }
    public async getMains(): Promise<any> {
        const { ProfitLossMain, ProfitLossMainI18n } = this.domainDB;
        const results = await ProfitLossMain.findAll({
            include: [
                {
                    model: ProfitLossMainI18n,
                    required: false,
                },
            ],
        });
        return results;
    }
    public async getSeconds(profitLossMainId): Promise<any> {
        const { ProfitLoss2nd, ProfitLoss2ndI18n } = this.domainDB;
        const results = await ProfitLoss2nd.findAll({
            where: {
                profitLossMainId,
            },
            include: [
                {
                    model: ProfitLoss2ndI18n,
                    required: false,
                },
            ],
        });
        return results;
    }
    public async getThirds(profitLoss2ndId): Promise<any> {
        const { ProfitLoss3rd, ProfitLoss3rdI18n } = this.domainDB;
        const results = await ProfitLoss3rd.findAll({
            where: {
                profitLoss2ndId,
            },
            include: [
                {
                    model: ProfitLoss3rdI18n,
                    required: false,
                },
            ],
        });
        return results;
    }
    public async getBreadcrumbs(mainId: string | null, secondId: string | null): Promise<any> {
        const languageId = await this.getLangId();
        const { ProfitLossMain, ProfitLossMainI18n, ProfitLoss2nd, ProfitLoss2ndI18n } = this.domainDB;
        const returnResult = {
            main: null,
            second: null,
        };
        if (mainId) {
            const findResult = await ProfitLossMainI18n.findOne({
                attributes: ["name"],
                where: {
                    profitLossMainId: mainId,
                    languageId,
                },
            });
            if (findResult) {
                returnResult.main = findResult.name;
            }
        }
        if (secondId) {
            const findResult = await ProfitLoss2ndI18n.findOne({
                attributes: ["name"],
                where: { profitLoss2ndId: secondId, languageId },
            });
            if (findResult) {
                returnResult.second = findResult.name;
            }
        }
        return returnResult;
    }
    public async createPLItems(data: any): Promise<any> {
        const {
            ProfitLossMain,
            ProfitLossMainI18n,
            ProfitLoss2nd,
            ProfitLoss3rd,
            ProfitLoss2ndI18n,
            ProfitLoss3rdI18n,
            sequelize,
        } = this.domainDB;
        return await sequelize.transaction(async (transaction) => {
            if (data.secondId) {
                let thirdId = data.id;
                if (!thirdId) {
                    const newmodel = await ProfitLoss3rd.build({ profitLoss2ndId: data.secondId }).save({
                        transaction,
                    });
                    thirdId = newmodel.id;
                } else {
                    await ProfitLoss3rd.update(
                        { code: data.code },
                        {
                            transaction,
                            where: {
                                id: thirdId,
                            },
                        }
                    );
                }
                await ProfitLoss3rdI18n.destroy({
                    where: {
                        profitLoss3rdId: thirdId,
                    },
                    transaction,
                });
                data.i18n.forEach((a) => {
                    a.profitLoss3rdId = thirdId;
                });
                await ProfitLoss3rdI18n.bulkCreate(data.i18n, { transaction });
                return "ok";
            } else if (data.mainId) {
                let secondId = data.id;
                if (!secondId) {
                    const newmodel = await ProfitLoss2nd.build({ profitLossMainId: data.mainId }).save({ transaction });
                    secondId = newmodel.id;
                }

                await ProfitLoss2ndI18n.destroy({
                    where: {
                        profitLoss2ndId: secondId,
                    },
                    transaction,
                });
                data.i18n.forEach((a) => {
                    a.profitLoss2ndId = secondId;
                });
                await ProfitLoss2ndI18n.bulkCreate(data.i18n, { transaction });
                return "ok";
            } else {
                let mainId = data.id;
                if (!mainId) {
                    const newmodel = await ProfitLossMain.build({}).save({ transaction });
                    mainId = newmodel.id;
                }

                await ProfitLossMainI18n.destroy({
                    where: {
                        profitLossMainId: mainId,
                    },
                    transaction,
                });
                data.i18n.forEach((a) => {
                    a.profitLossMainId = mainId;
                });
                await ProfitLossMainI18n.bulkCreate(data.i18n, { transaction });
                return "ok";
            }
        });
    }
    public async checkUsage(data) {
        const where: any = {};
        if (data.mainId) {
            where.pl1 = data.mainId;
            if (data.secondId) {
                where.pl2 = data.secondId;
                where.pl3 = data.current;
            } else {
                where.pl2 = data.current;
            }
        } else {
            where.pl1 = data.current;
        }
        const { AccountingDetails } = this.domainDB;
        return await AccountingDetails.count({ where });
    }
    public async deletePLItems(data: any) {
        const { ProfitLossMain, ProfitLoss2nd, ProfitLoss3rd, sequelize } = this.domainDB;
        const { mainId, secondId, current } = data;
        return await sequelize.transaction(async (transaction) => {
            if (!mainId) {
                await ProfitLossMain.destroy({ where: { id: current }, transaction });
            } else {
                if (!secondId) {
                    await ProfitLoss2nd.destroy({ where: { profitLossMainId: mainId, id: current }, transaction });
                } else {
                    await ProfitLoss3rd.destroy({ where: { profitLoss2ndId: secondId, id: current }, transaction });
                }
            }
        });
    }
    public async getPLItemBy3rdName(): Promise<any> {
        const languageId = await this.getLangId();
        const {
            ProfitLossMain,
            ProfitLossMainI18n,
            ProfitLoss2nd,
            ProfitLoss3rd,
            ProfitLoss2ndI18n,
            ProfitLoss3rdI18n,
        } = this.domainDB;
        const pl3results = await ProfitLoss3rd.findAll({
            include: [
                {
                    model: ProfitLoss3rdI18n,
                    attributes: ["name"],
                    required: false,
                    where: {
                        languageId,
                    },
                },
                {
                    model: ProfitLoss2nd,
                    attributes: ["id", "profitLossMainId"],
                    required: false,
                },
            ],
        });
        const pl2results = await ProfitLoss2nd.findAll({
            include: [
                {
                    model: ProfitLoss2ndI18n,
                    attributes: ["name"],
                    required: false,
                    where: {
                        languageId,
                    },
                },
            ],
        });
        const pl1results = await ProfitLossMain.findAll({
            include: [
                {
                    model: ProfitLossMainI18n,
                    attributes: ["name"],
                    required: false,
                    where: {
                        languageId,
                    },
                },
            ],
        });
        let results3 = pl3results.map((a) => {
            const obj = a.toJSON();
            try {
                return {
                    name: obj.ProfitLoss3rdI18ns[0].name,
                    pl3: obj.id,
                    pl2: obj.ProfitLoss2nd.id,
                    pl1: obj.ProfitLoss2nd.profitLossMainId,
                };
            } catch (e) {
                this.logger.error(e);
                return {};
            }
        });
        const results2 = pl2results.map((a) => {
            const obj = a.toJSON();
            try {
                return {
                    name: obj.ProfitLoss2ndI18ns[0].name,
                    pl3: null,
                    pl2: obj.id,
                    pl1: obj.profitLossMainId,
                };
            } catch (e) {
                this.logger.error(e);
                return {};
            }
        });
        const results1 = pl1results.map((a) => {
            const obj = a.toJSON();
            try {
                return {
                    name: obj.ProfitLossMainI18ns[0].name,
                    pl3: null,
                    pl2: null,
                    pl1: obj.id,
                };
            } catch (e) {
                this.logger.error(e);
                return {};
            }
        });
        results3 = results3.concat(results2);
        results3 = results3.concat(results1);
        return results3;
    }

    public async getAllMains(): Promise<any> {
        const { ProfitLossMain, ProfitLossMainI18n } = this.domainDB;
        const results = await ProfitLossMain.findAll({
            include: [
                {
                    model: ProfitLossMainI18n,
                    required: false,
                },
            ],
        });
        return results;
    }
    public async getAllSeconds(): Promise<any> {
        const { ProfitLoss2nd, ProfitLoss2ndI18n } = this.domainDB;
        const languageId = await this.getLangId();
        const options = {
            attributes: ["id", "code"],
            order: [["id", "ASC"]],
            include: [
                {
                    model: ProfitLoss2ndI18n,
                    attributes: ["name"],
                    required: false,
                    where: {
                        languageId,
                    },
                },
            ],
        };
        const results = await ProfitLoss2nd.findAll(options);
        return results.map((a) => {
            const obj = a.toJSON();
            this.setI18nName(obj, "ProfitLoss2ndI18ns");
            return obj;
        });
    }

    public async getAllThirds(): Promise<any> {
        const { ProfitLoss3rd, ProfitLoss3rdI18n } = this.domainDB;
        const languageId = await this.getLangId();
        const options = {
            attributes: ["id", "code"],
            order: [["id", "ASC"]],
            include: [
                {
                    model: ProfitLoss3rdI18n,
                    attributes: ["name"],
                    required: false,
                    where: {
                        languageId,
                    },
                },
            ],
        };
        const results = await ProfitLoss3rd.findAll(options);
        return results.map((a) => {
            const obj = a.toJSON();
            this.setI18nName(obj, "ProfitLoss3rdI18ns");
            return obj;
        });
    }

    async getOneSecond(id: string): Promise<any> {
        const { ProfitLoss2nd, ProfitLoss2ndI18n } = this.domainDB;
        const results = await ProfitLoss2nd.findOne({
            where: {
                id,
            },
            include: [
                {
                    model: ProfitLoss2ndI18n,
                    required: false,
                },
            ],
        });
        return results;
    }

    async getOneThird(id: string): Promise<any> {
        const { ProfitLoss3rd, ProfitLoss3rdI18n } = this.domainDB;
        const results = await ProfitLoss3rd.findOne({
            where: {
                id,
            },
            include: [
                {
                    model: ProfitLoss3rdI18n,
                    required: false,
                },
            ],
        });
        return results;
    }

    public async createOrUpdateSecond(data: any): Promise<any> {
        const { ProfitLoss2nd, ProfitLoss2ndI18n, sequelize } = this.domainDB;
        return await sequelize.transaction(async (transaction) => {
            let model = null;
            if (!data.id) {
                model = await ProfitLoss2nd.create(data, {
                    transaction,
                    include: [ProfitLoss2ndI18n],
                });
            } else {
                model = await ProfitLoss2nd.findOne({
                    where: { id: data.id },
                    transaction,
                });
                await model.update(data, {
                    where: { id: data.id },
                    transaction,
                });
                await ProfitLoss2ndI18n.destroy({
                    where: {
                        profitLoss2ndId: data.id,
                    },
                    transaction,
                });
                data.ProfitLoss2ndI18ns.forEach((a) => {
                    a.profitLoss2ndId = data.id;
                });
                await ProfitLoss2ndI18n.bulkCreate(data.ProfitLoss2ndI18ns, { transaction });
            }
            return model;
        });
    }

    public async createOrUpdateThird(data: any): Promise<any> {
        const { ProfitLoss3rd, ProfitLoss3rdI18n, sequelize } = this.domainDB;
        return await sequelize.transaction(async (transaction) => {
            let model = null;
            if (!data.id) {
                model = await ProfitLoss3rd.create(data, {
                    transaction,
                    include: [ProfitLoss3rdI18n],
                });
            } else {
                model = await ProfitLoss3rd.findOne({
                    where: { id: data.id },
                    transaction,
                });
                await model.update(data, {
                    where: { id: data.id },
                    transaction,
                });
                await ProfitLoss3rdI18n.destroy({
                    where: {
                        profitLoss3rdId: data.id,
                    },
                    transaction,
                });
                data.ProfitLoss3rdI18ns.forEach((a) => {
                    a.profitLoss3rdId = data.id;
                });
                await ProfitLoss3rdI18n.bulkCreate(data.ProfitLoss3rdI18ns, { transaction });
            }
            return model;
        });
    }
}

export default ProfitLossService;
