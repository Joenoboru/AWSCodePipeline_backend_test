import { Response } from "express";
import { Op, FindOptions, Order, Transaction } from "sequelize";
import moment from "moment";
import "module-alias/register";
import { createWhereFormSearchable, createWhereFormFilter } from "@/helpers/dbHelper";
import { TempNoObj } from "@/types";
import { StdQueryListResult } from "@/types/queryTypes";
import { Ope, OpeDetail, RaHeader, RaBody, AccountItemSetting } from "@/domain-resource/ts-models";
import FileService, { FileData } from "../FileService";
import BaseService from "../BaseService";
import RaService from "../RaService";
import { sortable, searchable } from "./fieldSetting";
import AccountitemSettingService from "../AccountitemSettingService";

class OpeService extends BaseService {
    async getPageOfData(
        str?: string,
        filter?: string[],
        order: Order = ["no", "desc"],
        options?: FindOptions<any>
    ): Promise<StdQueryListResult<Ope>> {
        //const languageId = await this.getLangId();
        const whereSearch = createWhereFormSearchable(searchable, str);
        const whereFilter = createWhereFormFilter(sortable, filter);
        const where = { ...whereSearch, ...whereFilter };
        const result = await this.getPageListFromTsModel(Ope, {
            attributes: [
                "id",
                "no",
                "transDate",
                "repayDate",
                "amount",
                "empId",
                "accountId",
                "status",
                "converted",
                "rmk",
                "createdAt",
            ],
            order,
            where,
            ...options,
        });
        return result;
    }

    async getOne(id: string, options: FindOptions = {}): Promise<Ope> {
        const results = await Ope.findOne({
            //attributes: ["id", "type", "accItem", "rmk"],
            where: {
                id,
            },
            include: [
                {
                    model: OpeDetail,
                },
            ],
            ...options,
        });
        return results;
    }

    async createOrUpdateData(data: Ope, auditId?: number): Promise<Ope> {
        const { sequelize } = this.domainDBResource;
        return await sequelize.transaction(async (transaction) => {
            let model: Ope = null;
            if (!data.id) {
                data.no = await this.generateDataNo(transaction);
                model = await Ope.create(
                    { ...data, status: 1, converted: 0, createdUser: this.employeeId, updatedUser: this.employeeId },
                    {
                        transaction,
                        include: [OpeDetail],
                    }
                );
                const fileList = await this.processFile(model.id, JSON.parse(model.attachment), auditId);
                model.attachment = JSON.stringify(fileList);
            } else {
                model = await Ope.findOne({
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
                //OpeDetail
                await OpeDetail.destroy({
                    where: {
                        headerId: data.id,
                    },
                    transaction,
                });
                data.OpeDetails.forEach((a) => {
                    a.headerId = model.id;
                });
                await OpeDetail.bulkCreate(data.OpeDetails, { transaction });
                //attachment
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
        const lastRow = await Ope.findOne({
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

    async repay(ids: number[], date: Date, accountId: number): Promise<void> {
        const { sequelize } = this.domainDBResource;
        return await sequelize.transaction(async (transaction) => {
            //TODO:check if accountId is invalid
            const models = await Ope.findAll({
                where: { repayDate: null, id: { [Op.in]: ids }, status: { [Op.not]: 3 } },
                transaction,
            });
            const doRepayAsyncs = models.map((row) => this.doRepay(row, date, accountId, transaction)); //borrow
            await Promise.all([...doRepayAsyncs]);
        });
        //
    }

    private async doRepay(data: Ope, date: Date, accountId: number, transaction: Transaction): Promise<Ope> {
        data.repayDate = date;
        data.accountId = accountId;
        data.status = 2;
        return await data.save({ transaction });
    }

    async getOpeAccItem(): Promise<AccountItemSetting> {
        const aicData = await new AccountitemSettingService(this.req).getOne("ope");
        return aicData;
    }

    async checkAccItemSetting(): Promise<boolean> {
        const aicData = await this.getOpeAccItem();
        if (aicData) {
            return true;
        }
        return false;
    }

    async convertData(ids: number[]): Promise<void> {
        const { sequelize } = this.domainDBResource;
        const raService = new RaService(this.req);
        const tempNo = {
            [RaHeader.name]: {},
        };
        return await sequelize.transaction(async (transaction) => {
            const models = await Ope.findAll({
                where: { id: { [Op.in]: ids }, converted: { [Op.in]: [0, 2] }, status: { [Op.not]: 3 } },
                include: [
                    {
                        model: OpeDetail,
                    },
                ],
                transaction,
            });
            models.forEach((row) => {
                const ymd = moment(new Date(row.createdAt)).format("YYYYMMDD");
                tempNo[RaHeader.name][ymd] = Number(`${ymd}001`);
            });
            const loadRaDataNoAsyncs = Object.keys(tempNo[RaHeader.name]).map((key) =>
                raService.loadLastDataNo(key, tempNo)
            );
            await Promise.all([...loadRaDataNoAsyncs]);
            const createRaDataAsyncs = models.map((row) => this.createRaData(row, transaction, tempNo)); //borrow
            const processConvertedDataAsyncs = models.map((row) => this.processConvertedData(row, transaction));
            await Promise.all([...createRaDataAsyncs, ...processConvertedDataAsyncs]);
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    async createRaData(data: any, transaction: any, tempNo: TempNoObj): Promise<void> {
        if (data.converted > 0) {
            await RaHeader.destroy({
                where: {
                    sourceId: data.id,
                    source: 2,
                },
                transaction,
            });
        }
        const ymd = moment(new Date(data.createdAt)).format("YYYYMMDD");
        await RaHeader.create(
            {
                no: tempNo[RaHeader.name][ymd]++,
                transDate: data.transDate,
                payDate: data.repayDate,
                type: 1,
                inAmount: 0,
                outAmount: data.amount,
                rmk: data.rmk,
                source: 2,
                sourceId: data.id,
                payType: 2,
                status: 2,
                empId: data.empId,
                accountId: data.accountId,
                attachment: data.attachment,
                taxRate: 5,
                converted: 0,
                RaBodies: data.OpeDetails.map((row) => ({
                    accItem: row.accItem,
                    inAmount: 0,
                    outAmount: row.amount,
                    rmk: row.comment,
                    taxType: row.taxType,
                })),
            },
            { transaction, include: [RaBody] }
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    async processConvertedData(data: Ope, transaction: Transaction): Promise<void> {
        data.converted = 1;
        await data.save({ transaction });
    }

    async getConvertableData(): Promise<Partial<Ope>[]> {
        const result = await Ope.findAll({
            attributes: [
                "id",
                "no",
                "transDate",
                "repayDate",
                "amount",
                "empId",
                "accountId",
                "status",
                "converted",
                "rmk",
                "createdAt",
            ],
            where: { converted: { [Op.in]: [0, 2] }, status: { [Op.not]: 3 } },
        });
        return result;
    }

    async getPayableData(): Promise<Partial<Ope>[]> {
        const result = await Ope.findAll({
            attributes: [
                "id",
                "no",
                "transDate",
                "repayDate",
                "amount",
                "empId",
                "accountId",
                "status",
                "converted",
                "rmk",
                "createdAt",
            ],
            where: { repayDate: null, status: { [Op.not]: 3 } },
        });
        return result;
    }

    async deleteData(id: string | number): Promise<boolean> {
        const { sequelize } = this.domainDBResource;
        return await sequelize.transaction(async (transaction) => {
            return await Ope.findOne({
                //attributes: ["id", "type", "accItem", "rmk"],
                where: {
                    id,
                },
                transaction,
            })
                .then(async (model) => {
                    if (model) {
                        await OpeDetail.destroy({
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

    private async processFile(dataId: number, files: FileData[], auditId?: number): Promise<FileData[]> {
        if (auditId) {
            return await new FileService(this.req).processAuditFile("ratrans", dataId, auditId, files);
        } else {
            return await new FileService(this.req).processAttachFile("ratrans", dataId, files);
        }
    }

    private async deleteFile(files: FileData[]): Promise<boolean> {
        return await new FileService(this.req).deleteFiles("ope", files);
    }

    public async downloadFile(res: Response, dataId: string, index: number): Promise<void> {
        const fileService = new FileService(this.req);
        return await fileService.downloadFile(res, "ope", Ope, dataId, index, "attachment");
    }
}

export default OpeService;

export { sortable };
