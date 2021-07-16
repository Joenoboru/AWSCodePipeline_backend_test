import { Request } from "express";
import "module-alias/register";
import { Currency, CurrencyI18n, Language } from "@/common-database/ts-models";
import BaseService from "../BaseService";

require("app-module-path").addPath(__dirname);
class CurrencyService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    async getCurrencies(): Promise<CurrencyWithName[]> {
        const data = await Currency.findAll({
            include: [
                {
                    model: CurrencyI18n,
                    attributes: ["name"],
                    required: false,
                    include: [
                        {
                            attributes: [],
                            model: Language,
                            where: {
                                lang: this.lang,
                            },
                        },
                    ],
                },
            ],
        });
        return data.map<CurrencyWithName>((a) => {
            const obj = a.toJSON() as CurrencyWithName;
            if (obj.CurrencyI18n && obj.CurrencyI18n.length > 0) {
                obj.name = a.CurrencyI18n[0].name;
                delete obj.CurrencyI18n;
            }
            return obj;
        });
    }
}

export interface CurrencyWithName extends Partial<Currency> {
    name?: string;
}

export default CurrencyService;
