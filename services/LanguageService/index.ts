import { Request } from "express";
import BaseService from "../BaseService";
import "module-alias/register";
import { Language } from "@/common-database/ts-models";
import { UsedLanguage } from "@/domain-resource/ts-models";
class LanguageService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    public async getAll(): Promise<any[]> {        
        const useLang = await UsedLanguage.findAll();
        const useLangIds = useLang.map((a) => a.id);
        const langList = await Language.findAll();
        return langList.filter((a) => useLangIds.includes(a.id));
    }
}

export default LanguageService;
