import { Request } from "express";
import BaseService, { PageWithItems } from "../BaseService";
import "module-alias/register";

class PageService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    public async getAll(): Promise<PageWithItems[]> {
        return this.getPagesBase();
    }
}

export default PageService;
