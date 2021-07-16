import { float } from "aws-sdk/clients/lightsail";
import BaseService from "../BaseService";
interface ExchangerateModel {
    currencyId: number;
    exrate: float;
}
interface ExchangerateDataBody {
    main: number;
    refRates: ExchangerateModel[];
}
class ExchangerateService extends BaseService {
    constructor(req: any) {
        super(req);
    }
    public async current(): Promise<ExchangerateDataBody> {
        const { CompanyRule, ExchangeRate } = this.domainDB;
        const companyrule = await CompanyRule.findOne({ attributes: ["mainCurrency"], where: {} });
        const ratedata = await ExchangeRate.findAll({
            where: {},
            order: [["id", "asc"]],
        });
        const data: ExchangerateDataBody = {
            main: companyrule.mainCurrency,
            refRates: ratedata.map((a) => ({
                currencyId: a.id,
                exrate: a.exrate,
            })),
        };
        return data;
    }
    public async update(data: ExchangerateDataBody): Promise<any> {
        const { CompanyRule, ExchangeRate, sequelize } = this.domainDB;
        return await sequelize
            .transaction(async (transaction) => {
                await CompanyRule.update({ mainCurrency: data.main }, { where: {}, transaction });
                data.refRates
                    .filter((a) => a.currencyId === data.main)
                    .forEach((a) => {
                        a.exrate = 1;
                    });
                const transformData = data.refRates.map((a) => ({
                    id: a.currencyId,
                    exrate: a.exrate,
                }));
                await ExchangeRate.destroy({ where: {}, transaction });
                await ExchangeRate.bulkCreate(transformData, { transaction });
                return { status: "ok" };
            })
            .catch((e) => {
                return { status: "error", e };
            });
    }
}

export default ExchangerateService;
