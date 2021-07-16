import ARBaseService, { ARTableRow } from "./ARBaseService";
import AccountConsolidationService from "../AccountConsolidationService";

class BSReportService extends ARBaseService {
    public setDate(year: number | string, month: number | string): BSReportService {
        super.setDate(year, month);
        return this;
    }
    public async getTable(): Promise<BSReportData> {
        if (!(await this.checkDate())) {
            return null;
        }
        //Part 1 Assets 資產
        const assets = await this.getVoucherCatalogTable(1);
        //Part 2 Liabilities 負債
        const liabilities = await this.getVoucherCatalogTable(2);

        //Part 3 Equity 股東權益
        const equity = await this.getVoucherCatalogTable(3);

        return {
            assets,
            liabilities,
            equity,
        };
    }
    public async checkDate(): Promise<boolean> {
        const acService = new AccountConsolidationService(this.req);
        const firstConsolidationDate = await acService.getFirstOneDate();
        const lastConsolidationDate = await acService.getLastOneDate();
        const currentDate = this.firstDayOfMonth;
        if (!firstConsolidationDate || !lastConsolidationDate || !currentDate) {
            return false;
        }
        return currentDate.isAfter(firstConsolidationDate) && currentDate.isSameOrBefore(lastConsolidationDate);
    }
}

export interface BSReportData {
    assets: ARTableRow[];
    liabilities: ARTableRow[];
    equity: ARTableRow[];
}

export default BSReportService;
