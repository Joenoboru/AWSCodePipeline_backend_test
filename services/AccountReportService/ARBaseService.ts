import { Request } from "express";
import { col, fn, Op } from "sequelize";
import moment, { Moment } from "moment";
import "module-alias/register";
import { AccountItem, AccountVoucher, AccountVoucherDetail, AccountItemI18n } from "@/domain-resource/ts-models";
import { toYMFormat } from "@/helpers/dateHelper";
import BaseService from "../BaseService";

class ARBaseService extends BaseService {
    protected year: number;
    protected month: number;
    protected ymFormat: string;
    protected firstDayOfMonth: Moment;
    protected lastDayOfMonth: Moment;
    protected monthPeriod: string[];

    constructor(req: Request) {
        super(req);
    }

    setDate(year: number | string, month: number | string): ARBaseService {
        this.year = Number(year);
        this.month = Number(month);
        this.ymFormat = toYMFormat(year, month);
        const monthStartMoment = moment.utc([this.year, this.month - 1, 1]);
        const monthStart = monthStartMoment.format("YYYY-MM-DD");
        const monthEndMoment = moment.utc([this.year, this.month - 1, 1]).add(1, "months");
        const monthEnd = monthEndMoment.format("YYYY-MM-DD");
        this.firstDayOfMonth = monthStartMoment;
        this.lastDayOfMonth = monthEndMoment.add(-1, "day");
        this.monthPeriod = [monthStart, monthEnd];
        return this;
    }

    public isBSCatalog(catalog: number): boolean {
        return [1, 2, 3].indexOf(catalog) > -1;
    }

    public async getVoucherDetailByCatalog(catalog: number): Promise<VoucherDetailGroupedRow[]> {
        const languageId = await this.getLangId();
        const getIncludeableByLayer = (layer: 0 | 1 | 2 | 3) => {
            return {
                attributes: ["id", "code", "dcType", "catalog"],
                model: AccountItem,
                as: `catalogL${layer}Data`,
                include: [
                    {
                        attributes: ["name"],
                        model: AccountItemI18n,
                        where: {
                            languageId,
                        },
                    },
                ],
            };
        };
        return AccountVoucherDetail.findAll({
            attributes: [[fn("SUM", col("debit")), "debit"], [fn("SUM", col("credit")), "credit"], "accItem"],
            group: ["accItem"],
            include: [
                {
                    model: AccountVoucher,
                    attributes: [],
                    where: {
                        date: {
                            [Op.lt]: this.monthPeriod[1],
                            [Op.gte]: this.monthPeriod[0],
                        },
                    },
                },
                {
                    model: AccountItem,
                    attributes: ["id", "code", "dcType", "catalog", "catalogL0", "catalogL1", "catalogL2"],
                    where: {
                        catalog,
                    },
                    include: [
                        getIncludeableByLayer(0),
                        getIncludeableByLayer(1),
                        getIncludeableByLayer(2),
                        {
                            attributes: ["name"],
                            model: AccountItemI18n,
                            where: {
                                languageId,
                            },
                        },
                    ],
                },
            ],
        });
    }

    public voucherDetailsToTable(rows: VoucherDetailGroupedRow[], catalog: number): ARTableRow[] {
        const firstLayerItems: ARTableRow[] = [];
        const secondLayerItems: ARTableRow[] = [];
        let firstLayer = "catalogL0";
        let secondLayer = "catalogL1";
        if (this.isBSCatalog(catalog)) {
            firstLayer = "catalogL1";
            secondLayer = "catalogL2";
        }
        rows.forEach((row) => {
            const currentItem = row.AccountItem;
            const fistItem: Partial<AccountItem> = row.AccountItem[`${firstLayer}Data`];
            let secondItem: Partial<AccountItem> = row.AccountItem[`${secondLayer}Data`];
            if (!secondItem) {
                secondItem = currentItem;
            }
            let firstItemRow: ARTableRow = firstLayerItems.find(
                (item) => item.accountItemId === row.AccountItem[firstLayer]
            );
            if (!firstItemRow) {
                firstItemRow = {
                    accountItemId: row.AccountItem[firstLayer],
                    code: fistItem.code,
                    name: fistItem.AccountItemI18n[0].name,
                    debit: 0,
                    credit: 0,
                    amount: 0,
                    subRows: [],
                };
                firstLayerItems.push(firstItemRow);
            }
            let amount = 0;
            if (catalog === 1) {
                //資產
                if (fistItem.dcType === 1) {
                    amount = row.debit - row.credit;
                } else if (fistItem.dcType === 2) {
                    amount = row.credit - row.debit;
                }
            }
            if ([2, 3].indexOf(catalog) > -1) {
                //負債權益
                if (fistItem.dcType === 2) {
                    amount = row.debit - row.credit;
                } else if (fistItem.dcType === 1) {
                    amount = row.credit - row.debit;
                }
            }

            if ([4, 5, 6, 7, 8, 9].indexOf(catalog) > -1) {
                //收入、支出
                if (fistItem.dcType === 1) {
                    amount = row.debit;
                } else if (fistItem.dcType === 2) {
                    amount = row.credit;
                }
            }
            let secondItemRow: ARTableRow = secondLayerItems.find(
                (item) => secondItem.id && item.accountItemId === secondItem.id
            );
            if (!secondItemRow) {
                secondItemRow = {
                    accountItemId: row.AccountItem[secondLayer],
                    code: secondItem.code,
                    name: secondItem.AccountItemI18n[0].name,
                    debit: 0,
                    credit: 0,
                    amount: 0,
                };
                secondLayerItems.push(secondItemRow);
                firstItemRow.subRows.push(secondItemRow);
            }
            /*const secondItemRow: ARTableRow = {
                accountItemId: row.AccountItem[secondLayer],
                code: secondItem.code,
                name: secondItem.AccountItemI18n[0].name,
                debit: row.debit,
                credit: row.credit,
                amount,
            };*/
            firstItemRow.debit += row.debit;
            firstItemRow.credit += row.credit;
            firstItemRow.amount += amount;
            secondItemRow.debit += row.debit;
            secondItemRow.credit += row.credit;
            secondItemRow.amount += amount;
        });
        return firstLayerItems;
    }

    public async getVoucherCatalogTable(catalog: number): Promise<ARTableRow[]> {
        const details = await this.getVoucherDetailByCatalog(catalog);
        const table = this.voucherDetailsToTable(details, catalog);
        return table;
    }
}

export interface VoucherDetailGroupedRow {
    debit: number;
    credit: number;
    AccountItem: Partial<AccountItem>;
}

export interface ARTableRow {
    accountItemId: number;
    name: string;
    code: string;
    debit: number;
    credit: number;
    amount: number;
    subRows?: ARTableRow[];
}

export default ARBaseService;
