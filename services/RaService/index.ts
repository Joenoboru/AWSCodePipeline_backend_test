import { Response } from "express";
import { Op, fn, col, literal, WhereOptions, FindOptions, Order, Transaction } from "sequelize";
import moment from "moment";
import ExcelJS, { Workbook } from "exceljs";
import "module-alias/register";
import {
    Customer,
    RaHeader,
    RaBody,
    RaDetails,
    AccountItemSetting,
    AccountVoucher,
    AccountVoucherDetail,
    AccountItem,
    BankAccount,
} from "@/domain-resource/ts-models";
import { createQueryAll, createWhereFormSearchable, createWhereFormFilter } from "@/helpers/dbHelper";
import { TempNoObj } from "@/types";
import BaseService from "../BaseService";
import EmployeeService from "../EmployeeService";
import FileService, { FileData } from "../FileService";
import AccountitemService from "../AccountitemService";
import AccountVoucherService from "../AccountVoucherService";

import { sortable, searchable } from "./fieldSetting";
import { StdQueryListResult } from "@/types/queryTypes";

class RaService extends BaseService {
    tempData: TempData = {};
    async getPageOfData(
        str?: string,
        filter?: string[],
        order: Order = ["no", "desc"],
        options?: FindOptions<any>
    ): Promise<StdQueryListResult<RaHeader>> {
        //const languageId = await this.getLangId();
        const whereSearch = createWhereFormSearchable(searchable, str);
        const whereFilter = createWhereFormFilter(sortable, filter);
        const where = { ...whereSearch, ...whereFilter };
        const result = await this.getPageListFromTsModel(RaHeader, {
            attributes: [
                "id",
                "no",
                "transDate",
                "payDate",
                "type",
                "inAmount",
                "outAmount",
                "rmk",
                "source",
                "payType",
                [
                    literal(
                        "(CASE `pay_type` WHEN 2 THEN CONCAT(`pay_type`, `employee_id`) WHEN 3 THEN CONCAT(`pay_type`, `customer_id`) ELSE 0 END)"
                    ),
                    "paySource",
                ],
                "empId",
                "customerId",
                "accountId",
                "converted",
            ],
            order,
            where,
            ...options,
        });
        return result;
    }

    async getOne(id: string): Promise<RaHeader> {
        const results = await RaHeader.findOne({
            //attributes: ["id", "type", "accItem", "rmk"],
            where: {
                id,
            },
            include: [
                {
                    model: RaBody,
                },
                {
                    model: RaDetails,
                },
            ],
        });
        return results;
    }

    async createOrUpdateData(data: RaHeader, auditId?: number): Promise<RaHeader> {
        const { sequelize } = this.domainDBResource;
        return await sequelize.transaction(async (transaction) => {
            let model = null;
            if (!data.id) {
                data.no = await this.generateDataNo(transaction);
                this.calcTotalAmount({
                    ...data,
                    converted: 0,
                    createdUser: this.employeeId,
                    updatedUser: this.employeeId,
                });
                model = await RaHeader.create(data, {
                    transaction,
                    include: [RaBody, RaDetails],
                });
                const fileList = await this.processFile(`${model.id}`, JSON.parse(model.attachment), auditId);
                model.attachment = JSON.stringify(fileList);
                await model.save({ transaction });
            } else {
                model = await RaHeader.findOne({
                    where: { id: data.id },
                    transaction,
                });
                const oldAttachments: FileData[] = [...JSON.parse(model.attachment)];
                const newAttachments: FileData[] = [...JSON.parse(data.attachment)];
                const converted = model.converted === 0 ? 0 : 2;
                this.calcTotalAmount(data);
                await model.update(
                    { ...data, converted, updatedUser: this.employeeId },
                    {
                        where: { id: data.id },
                        transaction,
                    }
                );
                //RaBody
                await RaBody.destroy({
                    where: {
                        headerId: data.id,
                    },
                    transaction,
                });
                data.RaBodies.forEach((a) => {
                    a.headerId = model.id;
                });
                await RaBody.bulkCreate(data.RaBodies, { transaction });
                //RaDetails
                await RaDetails.destroy({
                    where: {
                        headerId: data.id,
                    },
                    transaction,
                });
                data.RaDetails.forEach((a) => {
                    a.headerId = model.id;
                });
                await RaDetails.bulkCreate(data.RaDetails, { transaction });
                const keepPathList = newAttachments.map((file) => file.path);
                const fileList = await this.processFile(model.id, newAttachments, auditId);
                model.attachment = fileList;
                await model.save({ transaction });
                const deleteFiles = oldAttachments.filter((file) => keepPathList.indexOf(file.path) === -1);
                await this.deleteFile(deleteFiles);
            }
            return model;
        });
    }

    calcTotalAmount(data: Partial<RaHeader>): void {
        let inAmount = 0;
        let outAmount = 0;
        if (data.RaBodies) {
            data.RaBodies.forEach((row) => {
                const mRow = row as RaBodyWithAmount;
                if (mRow.amount) {
                    if (Number(data.type) === 0) {
                        row.inAmount = mRow.amount;
                    }
                    if (Number(data.type) === 1) {
                        row.outAmount = mRow.amount;
                    }
                    delete mRow.amount;
                }
                if (row.inAmount) {
                    inAmount += row.inAmount;
                }
                if (row.outAmount) {
                    outAmount += row.outAmount;
                }
            });
        }
        data.inAmount = inAmount;
        data.outAmount = outAmount;
    }

    async generateDataNo(transaction: Transaction): Promise<number> {
        const ymd = moment().format("YYYYMMDD");
        const lastRow = await RaHeader.findOne({
            attributes: ["no"],
            where: {
                no: { [Op.between]: [Number(`${ymd}000`), Number(`${ymd}999`)] },
            },
            order: [["no", "DESC"]],
            transaction,
        });
        if (lastRow) {
            return lastRow.no + 1;
        } else {
            return Number(`${ymd}001`);
        }
    }

    async deleteData(id: string | number): Promise<boolean> {
        const { sequelize } = this.domainDBResource;
        return await sequelize.transaction(async (transaction) => {
            return await RaHeader.findOne({
                //attributes: ["id", "type", "accItem", "rmk"],
                where: {
                    id,
                },
                transaction,
            })
                .then(async (model) => {
                    if (model) {
                        await RaBody.destroy({
                            where: {
                                headerId: id,
                            },
                            transaction,
                        });
                        await RaDetails.destroy({
                            where: {
                                headerId: id,
                            },
                            transaction,
                        });
                        await model.destroy({ transaction });
                        await this.deleteFile(JSON.parse(model.attachment));
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

    async queryDetail(
        headerWhere: WhereOptions<RaHeader>,
        bodyWhere: WhereOptions<RaBody>,
        raw = false
    ): Promise<RaBody[]> {
        //const languageId = await this.getLangId();
        const result = RaBody.findAll({
            attributes: ["id", "headerId", "accItem", "inAmount", "outAmount", "taxType", "rmk"],
            where: bodyWhere,
            raw,
            include: [
                {
                    model: RaHeader,
                    attributes: [
                        "id",
                        "no",
                        "transDate",
                        "payDate",
                        "type",
                        "inAmount",
                        "outAmount",
                        "rmk",
                        "source",
                        "payType",
                        [
                            literal(
                                "(CASE `pay_type` WHEN 2 THEN CONCAT(`pay_type`, `employee_id`) WHEN 3 THEN CONCAT(`pay_type`, `customer_id`) ELSE 0 END)"
                            ),
                            "paySource",
                        ],
                        "empId",
                        "customerId",
                        "accountId",
                        "converted",
                    ],
                    where: headerWhere,
                },
            ],
        });
        return result;
    }

    async queryStat(
        headerWhere: WhereOptions<RaHeader>,
        bodyWhere: WhereOptions<RaBody>,
        raw = false
    ): Promise<RaStats[]> {
        //const languageId = await this.getLangId();
        const result = RaBody.findAll({
            attributes: [
                [fn("COUNT", col("ra_body_id")), "count"],
                [fn("SUM", col("RaBody.in_amount")), "inAmount"],
                [fn("SUM", col("RaBody.out_amount")), "outAmount"],
                "accItem",
            ],
            where: bodyWhere,
            group: "accItem",
            raw,
            include: [
                {
                    model: RaHeader,
                    attributes: [],
                    where: headerWhere,
                },
                {
                    model: AccountItem,
                    attributes: ["code"],
                },
            ],
            order: [[AccountItem, "code", "ASC"]],
        });
        return result as any;
    }

    public async exportDtlExcel(
        headerWhere: WhereOptions<RaHeader>,
        bodyWhere: WhereOptions<RaBody>
    ): Promise<Workbook> {
        const data = await this.queryDetail(headerWhere, bodyWhere, true);
        const empData = await new EmployeeService(this.req).getAll();
        const custData = await createQueryAll(Customer, ["id", "name", "chname", "engname"]);
        const paySourceData = {};
        empData.forEach((row) => {
            paySourceData[`2${row.id}`] = row.name;
        });
        custData.forEach((row) => {
            paySourceData[`3${row.id}`] = row.name;
        });
        //const languageId = await this.getLangId();
        const wb = new ExcelJS.Workbook();
        wb.creator = "Future Manager";
        const sheet = wb.addWorksheet("Data");
        const accItems = await new AccountitemService(this.req).getAll();
        const headerFields = [
            "raData.fd.no",
            "raData.fd.transDate",
            "raData.fd.payDate",
            "raData.fd.accitem",
            "raData.fd.inAmount",
            "raData.fd.outAmount",
            "c.rmk",
            "raData.fd.invoice",
            "raData.fd.taxType",
            "raData.fd.source",
            "raData.fd.payType",
            "raData.fd.paySorce",
        ].map((key) => this.i18n(key));
        const taxTypeData = this.i18n("raData.taxType", { returnObjects: true });
        const payTypeData = this.i18n("raData.payType", { returnObjects: true });
        const sourceData = this.i18n("raData.source", { returnObjects: true });
        sheet.addRow(headerFields);
        if (data) {
            data.forEach((row) => {
                const accItem = accItems.find((item) => item.id === row.accItem);
                const rowVals = [
                    row["RaHeader.no"],
                    row["RaHeader.transDate"],
                    row["RaHeader.payDate"],
                    `${accItem.code}- ${accItem.name}`,
                    row.inAmount || 0,
                    row.outAmount || 0,
                    row.rmk,
                    row["RaHeader.invoice"],
                    taxTypeData[row.taxType],
                    sourceData[row["RaHeader.source"]],
                    payTypeData[row["RaHeader.payType"]],
                    paySourceData[row["RaHeader.paySource"]],
                ];
                sheet.addRow(rowVals);
            });
        }
        sheet.getRow(1).font = { bold: true };
        sheet.getColumn(1).width = 12;
        sheet.getColumn(2).width = 10;
        sheet.getColumn(3).width = 10;
        sheet.getColumn(4).width = 20;
        sheet.getColumn(7).width = 25;
        sheet.getColumn(8).width = 12;
        sheet.getColumn(9).width = 12;
        sheet.getColumn(10).width = 12;
        sheet.getColumn(11).width = 20;
        sheet.getColumn(12).width = 20;
        return wb;
    }

    public async exportStatExcel(
        headerWhere: WhereOptions<RaHeader>,
        bodyWhere: WhereOptions<RaBody>
    ): Promise<Workbook> {
        const data = await this.queryStat(headerWhere, bodyWhere, true);
        //const languageId = await this.getLangId();
        const wb = new ExcelJS.Workbook();
        wb.creator = "Future Manager";
        const sheet = wb.addWorksheet("Data");
        const accItems = await new AccountitemService(this.req).getAll();
        const headerFields = ["raData.fd.accitem", "raData.fd.inAmount", "raData.fd.outAmount", "c.count"].map((key) =>
            this.i18n(key)
        );
        sheet.addRow(headerFields);
        if (data) {
            data.forEach((row) => {
                const accItem = accItems.find((item) => item.id === row.accItem);
                const rowVals = [`${accItem.code}- ${accItem.name}`, row.inAmount || 0, row.outAmount || 0, row.count];
                sheet.addRow(rowVals);
            });
        }
        sheet.getRow(1).font = { bold: true };
        sheet.getColumn(1).width = 20;
        sheet.getColumn(4).width = 12;
        return wb;
    }

    private async processFile(dataId: string, files: FileData[], auditId?: number): Promise<FileData[]> {
        if (auditId) {
            return await new FileService(this.req).processAuditFile("ratrans", dataId, auditId, files);
        } else {
            return await new FileService(this.req).processAttachFile("ratrans", dataId, files);
        }
    }

    private async deleteFile(files: FileData[]): Promise<boolean> {
        return await new FileService(this.req).deleteFiles("radata", files);
    }

    public async downloadFile(res: Response, dataId: string, index: number): Promise<void> {
        const fileService = new FileService(this.req);
        return await fileService.downloadFile(res, "radata", RaHeader, dataId, index, "attachment");
    }

    public async loadLastDataNo(ymd: string, tempNo: TempNoObj): Promise<void> {
        const lastRow = await RaHeader.findOne({
            attributes: ["no"],
            where: {
                no: { [Op.between]: [Number(`${ymd}000`), Number(`${ymd}999`)] },
            },
            order: [["no", "DESC"]],
        });
        if (lastRow) {
            tempNo[RaHeader.name][ymd] = lastRow.no + 1;
        }
    }

    async getConvertableData(): Promise<Partial<RaHeader>[]> {
        const result = await RaHeader.findAll({
            attributes: [
                "id",
                "no",
                "transDate",
                "payDate",
                "type",
                "inAmount",
                "outAmount",
                "rmk",
                "source",
                "payType",
                [
                    literal(
                        "(CASE `pay_type` WHEN 2 THEN CONCAT(`pay_type`, `employee_id`) WHEN 3 THEN CONCAT(`pay_type`, `customer_id`) ELSE 0 END)"
                    ),
                    "paySource",
                ],
                "empId",
                "customerId",
                "accountId",
                "converted",
            ],
            order: [["no", "desc"]],
            where: { converted: { [Op.in]: [0, 2] }, status: { [Op.not]: 4 } },
        });
        return result;
    }

    async convertData(ids: number[]): Promise<void> {
        const { sequelize } = this.domainDBResource;
        const accvService = new AccountVoucherService(this.req);
        const tempNo = {
            [AccountVoucher.name]: {},
        };
        return await sequelize.transaction(async (transaction) => {
            const accItemSettings = await this.loadAccItemSettings();
            const models = await RaHeader.findAll({
                where: { id: { [Op.in]: ids }, converted: { [Op.in]: [0, 2] }, status: { [Op.not]: 4 } },
                include: [
                    {
                        model: RaBody,
                    },
                ],
                transaction,
            });
            models.forEach((row) => {
                const ymd = moment(new Date(row.createdAt)).format("YYYYMMDD");
                tempNo[AccountVoucher.name][ymd] = Number(`${ymd}001`);
            });
            const loadAccvDataNoAsyncs = Object.keys(tempNo[AccountVoucher.name]).map((key) =>
                accvService.loadLastDataNo(key, tempNo)
            );
            await Promise.all([...loadAccvDataNoAsyncs]);
            const createVoucherDataAsyncs = models.map((row) =>
                this.createVoucherData(row, transaction, tempNo, accItemSettings)
            );
            const processConvertedDataAsyncs = models.map((row) => this.processConvertedData(row, transaction));
            await Promise.all([...createVoucherDataAsyncs, ...processConvertedDataAsyncs]);
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    async createVoucherData(
        data: RaHeader,
        transaction: Transaction,
        tempNo: TempNoObj,
        accItemSettings: AccItemSettings
    ): Promise<void> {
        this.tempData.amount = 0;
        this.tempData.tax = 0;
        const mDetails = [];
        if (data.converted > 0) {
            await AccountVoucher.destroy({
                where: {
                    sourceId: data.id,
                    source: { [Op.in]: [1, 2] },
                },
                transaction,
            });
        }
        const ymd = moment(new Date(data.createdAt)).format("YYYYMMDD");
        const commonVoucherData = {
            sourceId: data.id,
            //source: 1,
            status: 1,
            rmk: data.rmk,
        };
        //處理表身
        if (data.RaBodies) {
            data.RaBodies.forEach((row) => {
                this.processDetailData(row, data.type, data.taxRate, mDetails);
            });
        }
        const amount = this.tempData.amount;
        const tax = this.tempData.tax;
        const total = amount + tax; //總數
        //收入帳
        if (data.type === 0) {
            //銷項稅額處理
            const taxDetailRow = {
                accItem: accItemSettings.in_tax,
                accItemSub: null,
                debit: 0,
                credit: tax,
            };
            if (tax > 0) {
                mDetails.push(taxDetailRow);
            }
            //稅收支 出且 入金對象為為代收
            if (data.payType === 1 && data.payDate && moment(data.transDate).isSame(data.payDate)) {
                //同一天 且 入金對象為為帳貨戶現金
                const dataPayRows = await this.payDataToVoucherData(data, 0, accItemSettings, total);
                //建立收入傳票
                await AccountVoucher.create(
                    {
                        ...commonVoucherData,
                        no: tempNo[AccountVoucher.name][ymd]++,
                        date: data.transDate,
                        source: 1,
                        type: 1,
                        totalDebit: total,
                        totalCredit: total,
                        AccountVoucherDetails: [...mDetails, ...dataPayRows],
                    },
                    { transaction, include: [AccountVoucherDetail] }
                );
            } else {
                //不同天
                //入金部分
                const dataPayRows0 = await this.payDataToVoucherData(data, 1, accItemSettings, total);
                await AccountVoucher.create(
                    {
                        ...commonVoucherData,
                        no: tempNo[AccountVoucher.name][ymd]++,
                        date: data.transDate,
                        source: 1,
                        type: 1,
                        totalDebit: total,
                        totalCredit: total,
                        AccountVoucherDetails: [...mDetails, ...dataPayRows0],
                    },
                    { transaction, include: [AccountVoucherDetail] }
                );
                if (data.payDate) {
                    //結清
                    const dataPayRows1 = await this.payDataToVoucherData(data, 2, accItemSettings, total);
                    await AccountVoucher.create(
                        {
                            ...commonVoucherData,
                            no: tempNo[AccountVoucher.name][ymd]++,
                            date: data.payDate,
                            source: 1,
                            type: 3,
                            totalDebit: total,
                            totalCredit: total,
                            AccountVoucherDetails: dataPayRows1,
                        },
                        { transaction, include: [AccountVoucherDetail] }
                    );
                }
            }
        }

        //支出帳
        if (data.type === 1) {
            //進項稅額處理
            const taxDetailRow = {
                accItem: accItemSettings.ex_tax,
                accItemSub: null,
                debit: tax,
                credit: 0,
            };
            if (tax > 0) {
                mDetails.push(taxDetailRow);
            }
            //const taxPayRows = await this.payDataToVoucherData(data, accItemSettings, this.tempData.tax);
            if (data.payType === 1 && data.payDate && moment(data.transDate).isSame(data.payDate)) {
                //同一天 且 入金對象為為帳貨戶現金
                //出金部分
                const dataPayRows = await this.payDataToVoucherData(data, 0, accItemSettings, total);
                //建立支出傳票
                await AccountVoucher.create(
                    {
                        ...commonVoucherData,
                        no: tempNo[AccountVoucher.name][ymd]++,
                        date: data.transDate,
                        type: 2,
                        source: 2,
                        totalDebit: total,
                        totalCredit: total,
                        AccountVoucherDetails: [...mDetails, ...dataPayRows],
                    },
                    { transaction, include: [AccountVoucherDetail] }
                );
            }

            //不同天 且 入金對象為為帳貨戶現金
            if (data.payType === 1 && (!data.payDate || !moment(data.transDate).isSame(data.payDate))) {
                //不同天
                const dataPayRows0 = await this.payDataToVoucherData(data, 1, accItemSettings, total);
                await AccountVoucher.create(
                    {
                        ...commonVoucherData,
                        no: tempNo[AccountVoucher.name][ymd]++,
                        date: data.transDate,
                        type: 2,
                        source: 2,
                        totalDebit: total,
                        totalCredit: total,
                        AccountVoucherDetails: [...mDetails, ...dataPayRows0],
                    },
                    { transaction, include: [AccountVoucherDetail] }
                );
                if (data.payDate) {
                    //結清
                    const dataPayRows1 = await this.payDataToVoucherData(data, 2, accItemSettings, total);
                    await AccountVoucher.create(
                        {
                            ...commonVoucherData,
                            no: tempNo[AccountVoucher.name][ymd]++,
                            date: data.payDate,
                            type: 3,
                            source: 2,
                            totalDebit: total,
                            totalCredit: total,
                            AccountVoucherDetails: dataPayRows1,
                        },
                        { transaction, include: [AccountVoucherDetail] }
                    );
                }
            }
        }
    }

    //處理收支明細
    private processDetailData(data: RaBody, type: number, taxRate: number, result: any[]): void {
        let amount = type === 0 ? data.inAmount : data.outAmount;
        let tax = 0;
        const mTaxRate = taxRate * 0.01;
        switch (data.taxType) {
            case 1: //含稅
                amount = Math.round(amount / (1 + mTaxRate));
                tax = Math.round(amount * mTaxRate);
                break;
            case 2: //未稅
                tax = Math.round(amount * mTaxRate);
                break;
            default: //免稅
            case 0:
                break;
        }
        const mDetailRow = {
            accItem: data.accItem,
            accItemSub: null,
            debit: type === 1 ? amount : 0,
            credit: type === 0 ? amount : 0,
        };
        this.tempData.amount += amount;
        this.tempData.tax += tax;
        result.push(mDetailRow);
    }

    //付款處理
    private async payDataToVoucherData(
        data: RaHeader,
        step: number,
        accItemSettings: AccItemSettings,
        amount: number
    ): Promise<any[]> {
        const paytype = data.payType;
        const accountData = await BankAccount.findOne({ where: { id: data.accountId } });
        //借貸
        const payAmountRow = {
            debit: data.type === 0 ? amount : 0,
            credit: data.type === 1 ? amount : 0,
        };
        //會計科目
        const accountMap = {
            0: { accItem: accountData.accItem, accItemSub: accountData.accItemSub }, //帳戶
            1: { accItem: data.type === 1 ? accItemSettings.ap : accItemSettings.ar, accItemSub: null }, //分期
            2: {
                //員工代墊
                accItem:
                    data.type === 1
                        ? data.source === 2
                            ? accItemSettings.ope
                            : accItemSettings.ap
                        : accItemSettings.ar,
                accItemSub: null,
            },
            3: {
                //公司代收代付
                accItem: data.type === 1 ? accItemSettings.agc : accItemSettings.agp,
                accItemSub: null,
            },
        };
        //同一天直接從銀行帳戶入出金
        if (step === 0 && paytype === 1) {
            return [
                {
                    ...accountMap[0],
                    ...payAmountRow,
                },
            ];
        }
        //不同天或不直接從銀行帳戶入出金 --交易日
        if (step === 1 && paytype > 0) {
            return [
                {
                    ...accountMap[paytype],
                    ...payAmountRow,
                },
            ];
        }
        //不同天或不直接從銀行帳戶入出金 --出入金日
        if (step === 2 && paytype > 0) {
            //結清應收/應付借貸相反
            const repayAmountRow = {
                debit: data.type === 1 ? amount : 0,
                credit: data.type === 0 ? amount : 0,
            };
            const acconutPayRow = {
                ...accountMap[0],
                ...payAmountRow,
            };
            return [
                {
                    ...accountMap[paytype],
                    ...repayAmountRow,
                },
                acconutPayRow,
            ];
        }
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    async processConvertedData(data: RaHeader, transaction: Transaction): Promise<void> {
        data.converted = 1;
        await data.save({ transaction });
    }

    async loadAccItemSettings(): Promise<AccItemSettings> {
        const aisData = await AccountItemSetting.findAll({
            attributes: ["tag", "accItem"],
            where: { tag: ["agc", "agp", "ap", "ar", "in_tax", "ex_tax", "ope"] },
            raw: true,
        });
        const aisDataMap = {};
        aisData.forEach((row) => {
            aisDataMap[row.tag] = row.accItem;
        });
        return aisDataMap;
    }

    async preconvertCheck(): Promise<string[]> {
        const aisResult = await AccountItemSetting.findAll({
            attributes: ["tag", "accItem"],
            where: { tag: ["agc", "agp", "ap", "ar", "in_tax", "ex_tax", "ope"], accItem: null },
            //raw: true,
        });
        const aisNullList = aisResult.map((row) => row.tag);
        return aisNullList;
    }
}

export default RaService;

export interface RaBodyWithAmount extends Partial<RaBody> {
    amount: number;
}

export interface RaStats {
    AccountItem: {
        code: string;
    };
    accItem: number;
    count: number;
    inAmount: number;
    outAmount: number;
}

export interface AccItemSettings {
    [key: string]: number;
}

interface TempData {
    amount?: number;
    tax?: number;
}

export { sortable };
