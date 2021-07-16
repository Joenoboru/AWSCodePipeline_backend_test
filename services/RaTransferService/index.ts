import { Response } from "express";
import { Op, FindOptions, Order, Transaction } from "sequelize";
import moment from "moment";
import "module-alias/register";
import { createWhereFormSearchable, createWhereFormFilter } from "@/helpers/dbHelper";
import { TempNoObj } from "@/types";
import { StdQueryListResult } from "@/types/queryTypes";
import {
    RaTransfer,
    AccountItemSetting,
    AccountVoucher,
    AccountVoucherDetail,
    BankAccount,
} from "@/domain-resource/ts-models";
import FileService, { FileData } from "../FileService";
import AccountVoucherService from "../AccountVoucherService";
import { sortable, searchable } from "./fieldSetting";
import BaseService from "../BaseService";

class RaTransferService extends BaseService {
    async getPageOfData(
        str?: string,
        filter?: string[],
        order: Order = ["no", "desc"],
        options?: FindOptions<any>
    ): Promise<StdQueryListResult<RaTransfer>> {
        const whereSearch = createWhereFormSearchable(searchable, str);
        const whereFilter = createWhereFormFilter(sortable, filter);
        const where = { ...whereSearch, ...whereFilter };
        //const languageId = await this.getLangId();
        const result = await this.getPageListFromTsModel(RaTransfer, {
            attributes: ["id", "no", "date", "amount", "inAccount", "outAccount", "status", "rmk", "converted"],
            order,
            where,
            ...options,
        });
        return result;
    }

    async getOne(id: string): Promise<RaTransfer> {
        const results = await RaTransfer.findOne({
            where: {
                id,
            },
        });
        return results;
    }
    async createOrUpdateData(data: Partial<RaTransfer>, auditId?: number): Promise<RaTransfer> {
        const { sequelize } = this.domainDBResource;
        return await sequelize.transaction(async (transaction) => {
            let model: RaTransfer = null;
            if (!data.id) {
                data.no = await this.generateDataNo(transaction);
                model = await RaTransfer.create(
                    { ...data, converted: 0, createdUser: this.employeeId, updatedUser: this.employeeId },
                    {
                        transaction,
                    }
                );
                const fileList = await this.processFile(model.id, JSON.parse(model.attachment), auditId);
                model.attachment = JSON.stringify(fileList);
                await model.save({ transaction });
            } else {
                model = await RaTransfer.findOne({
                    where: { id: data.id },
                    transaction,
                });
                const oldAttachments: FileData[] = [...JSON.parse(model.attachment)];
                const newAttachments: FileData[] = [...JSON.parse(data.attachment)];
                const converted = model.converted === 0 ? 0 : 2;
                await model.update(
                    { ...data, converted, updatedUser: this.employeeId },
                    {
                        where: { id: data.id },
                        transaction,
                    }
                );
                const keepPathList = newAttachments.map((file) => file.path);
                const fileList = await this.processFile(model.id, newAttachments, auditId);
                model.attachment = JSON.stringify(fileList);
                await model.save({ transaction });
                const deleteFiles = oldAttachments.filter((file) => keepPathList.indexOf(file.path) === -1);
                await this.deleteFile(deleteFiles);
            }
            return model;
        });
    }

    async generateDataNo(transaction: Transaction): Promise<number> {
        const ymd = moment().format("YYYYMMDD");
        const lastRow = await RaTransfer.findOne({
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
            return await RaTransfer.findOne({
                //attributes: ["id"],
                where: {
                    id,
                },
                transaction,
            })
                .then(async (model) => {
                    if (model) {
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

    private async processFile(dataId: number, files: FileData[], auditId?: number): Promise<FileData[]> {
        if (auditId) {
            return await new FileService(this.req).processAuditFile("ratrans", dataId, auditId, files);
        } else {
            //processTempFile
            return await new FileService(this.req).processAttachFile("ratrans", dataId, files);
        }
    }

    private async deleteFile(files: FileData[]): Promise<boolean> {
        return await new FileService(this.req).deleteFiles("ratrans", files);
    }

    public async downloadFile(res: Response, dataId: string, index: number): Promise<void> {
        const fileService = new FileService(this.req);
        return await fileService.downloadFile(res, "ratrans", RaTransfer, dataId, index, "attachment");
    }

    async getConvertableData(): Promise<RaTransfer[]> {
        const result = await RaTransfer.findAll({
            attributes: ["id", "no", "date", "amount", "inAccount", "outAccount", "status", "rmk", "converted"],
            where: { converted: { [Op.in]: [0, 2] }, status: { [Op.not]: 3 } },
        });
        return result;
    }

    async preconvertCheck(): Promise<string[]> {
        const aisResult = await AccountItemSetting.findAll({
            attributes: ["tag", "accItem"],
            where: { tag: ["tr_fee"], accItem: null },
            //raw: true,
        });
        const aisNullList = aisResult.map((row) => row.tag);
        return aisNullList;
    }

    async loadAccItemSettings(): Promise<AccItemSettings> {
        const aisData = await AccountItemSetting.findAll({
            attributes: ["tag", "accItem"],
            where: { tag: ["tr_fee"] },
            raw: true,
        });
        const aisDataMap = {};
        aisData.forEach((row) => {
            aisDataMap[row.tag] = row.accItem;
        });
        return aisDataMap;
    }

    async convertData(ids: number[]): Promise<void> {
        const { sequelize } = this.domainDBResource;
        const accvService = new AccountVoucherService(this.req);
        const tempNo = {
            [AccountVoucher.name]: {},
        };
        return await sequelize.transaction(async (transaction) => {
            const models = await RaTransfer.findAll({
                where: { id: { [Op.in]: ids }, converted: { [Op.in]: [0, 2] }, status: { [Op.not]: 3 } },
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
            const createVoucherDataAsyncs = models.map((row) => this.createVoucherData(row, transaction, tempNo));
            const processConvertedDataAsyncs = models.map((row) => this.processConvertedData(row, transaction));
            await Promise.all([...createVoucherDataAsyncs, ...processConvertedDataAsyncs]);
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    async createVoucherData(data: RaTransfer, transaction: Transaction, tempNo: TempNoObj): Promise<void> {
        if (data.converted > 0) {
            await AccountVoucher.destroy({
                where: {
                    sourceId: data.id,
                    source: 3,
                },
                transaction,
            });
        }
        const ymd = moment(new Date(data.createdAt)).format("YYYYMMDD");
        const inAccountData = await BankAccount.findOne({ where: { id: data.inAccount } });
        const outAccountData = await BankAccount.findOne({ where: { id: data.outAccount } });
        const detailsData = [
            { accItem: inAccountData.accItem, accItemSub: inAccountData.accItemSub, debit: data.amount, credit: 0 },
            { accItem: outAccountData.accItem, accItemSub: outAccountData.accItemSub, debit: 0, credit: data.amount },
        ];

        //手續費處理
        if (data.fee > 0) {
            const accItemSettings = await this.loadAccItemSettings();
            if (data.feeTarget === 1) {
                //轉出帳戶
                detailsData.push(
                    {
                        accItem: accItemSettings.tr_fee,
                        accItemSub: null,
                        debit: data.fee,
                        credit: 0,
                    },
                    {
                        accItem: outAccountData.accItem,
                        accItemSub: outAccountData.accItemSub,
                        debit: 0,
                        credit: data.fee,
                    }
                );
            }
            if (data.feeTarget === 2) {
                //轉入帳戶
                detailsData.push(
                    {
                        accItem: accItemSettings.tr_fee,
                        accItemSub: null,
                        debit: data.fee,
                        credit: 0,
                    },
                    {
                        accItem: outAccountData.accItem,
                        accItemSub: outAccountData.accItemSub,
                        debit: 0,
                        credit: data.fee,
                    }
                );
            }
        }
        // 建立傳票資料
        await AccountVoucher.create(
            {
                no: tempNo[AccountVoucher.name][ymd]++,
                sourceId: data.id,
                source: 3,
                date: data.date,
                type: 3,
                totalDebit: data.amount + data.fee,
                totalCredit: data.amount + data.fee,
                status: 1,
                rmk: data.rmk,
                AccountVoucherDetails: detailsData,
            },
            { transaction, include: [AccountVoucherDetail] }
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    async processConvertedData(data: RaTransfer, transaction: Transaction): Promise<void> {
        data.converted = 1;
        await data.save({ transaction });
    }
}

export default RaTransferService;

export { sortable };

interface AccItemSettings {
    [key: string]: number;
}
