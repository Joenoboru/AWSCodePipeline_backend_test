import ARBaseService, { ARTableRow } from "./ARBaseService";

class PLReportService extends ARBaseService {
    public setDate(year: number | string, month: number | string): PLReportService {
        super.setDate(year, month);
        return this;
    }

    public async getTable(): Promise<PLReportData> {
        //Part 1 Revenue 收入
        const revenue = await this.getVoucherCatalogTable(4);
        //Part 2 Cost 成本
        const cost = await this.getVoucherCatalogTable(5);

        //Part 3 Expenses 費用
        const expenses = await this.getVoucherCatalogTable(6);

        //Part 4 營業外收益
        const othIncome = await this.getVoucherCatalogTable(7);
        const othOutcome = await this.getVoucherCatalogTable(8);
        return {
            revenue,
            cost,
            expenses,
            othIncome,
            othOutcome,
        };
    }
}

export interface PLReportData {
    revenue: ARTableRow[];
    cost: ARTableRow[];
    expenses: ARTableRow[];
    othIncome: ARTableRow[];
    othOutcome: ARTableRow[];
}

export default PLReportService;
