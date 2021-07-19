import { StdQueryListResult } from "@/types/queryTypes";
import { Request } from "express";
import { FindAndCountOptions, Order } from "sequelize";
import { validationResult } from "express-validator";
import "module-alias/register";
import { BusinessTrip } from "@/domain-resource/ts-models";
import BaseService from "../BaseService";
//import { CategoryList } from "../AccountingdetailService";
import { ErrorDef } from "../../wf_common";

class BusinessTripService extends BaseService {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    constructor(req: Request) {
        super(req);
    }
    public async processData(data: Partial<BusinessTrip>, updateUser: number): Promise<void> {
        //TODO: BusinessTripService processData
        //console.log("this method is wip");
        const { sequelize } = this.domainDBResource;
        await sequelize.transaction(async (transaction) => {
            const btData = {
                title: data.title,
                startTime: data.startTime,
                endTime: data.endTime,
                reason: data.reason,
                employeeId: data.employeeId,
                projectId: data.projectId,
                attachFiles: data.attachFiles,
                outAccount: data.outAccount,
            };
            let mId = -1;
            if (data.id) {
                mId = data.id;
                await BusinessTrip.update(btData, {
                    where: {
                        id: mId,
                    },
                    transaction,
                });
                //TODO: save BusinessTripDetails
            } else {
                const btResult = await BusinessTrip.build(btData).save({ transaction });
                mId = btResult.id;
            }
            //TODO: AccountingDetails will be replaced with BusinessTripDetail
            /*const accPromises = data.costDetail.map(
                (row) =>
                    new Promise<void>((resolve, reject) => {
                        const mRow = {
                            ...row,
                            outAccount: data.outAccount,
                            createdUser: updateUser,
                            status: 1,
                            category: CategoryList.businessTrip,
                        };
                        delete mRow.id;
                        AccountingDetails.build(mRow)
                            .save({ transaction })
                            .then((result) => {
                                BusinessTripCostDetail.build({
                                    businessTripId: mId,
                                    accountingDetailsId: result.id,
                                })
                                    .save({ transaction })
                                    .then(() => {
                                        resolve();
                                    })
                                    .catch((err) => reject(err));
                            })
                            .catch((err) => reject(err));
                    })
            );*/
            //return await Promise.all(accPromises);
        });
    }

    public async processCancel(data: Partial<BusinessTrip>, updateUser: number): Promise<void> {
        //TODO: BusinessTripService processCancel
        console.log("this function is wip");
        const { sequelize } = this.domainDBResource;
        await sequelize.transaction(async (transaction) => {
            const btData = await BusinessTrip.findOne({
                where: {
                    id: data.id,
                },
                attributes: this.attrs as any,
                //include: [{ model: BusinessTripDetail }],
                transaction,
            });
            //TODO: AccountingDetails will be replaced with BusinessTripDetail
            /*const accIds = btData.BusinessTripCostDetails.map((row) => row.accountingDetailsId);
            AccountingDetails.update(
                { status: 2, updatedUser: updateUser },
                {
                    where: {
                        id: { [Op.in]: accIds },
                    },
                    transaction: transaction,
                }
            );
            btData.status = 2;
            btData.updatedUser = updateUser;*/
            return btData.save({ transaction });
        });
    }

    private attrs = [
        "id",
        "title",
        "startTime",
        "endTime",
        "reason",
        "employeeId",
        ["project_id", "project"],
        "attachFiles",
        "outAccount",
    ];

    public async getDataBySub(sid: string): Promise<BusinessTrip> {
        //TODO: BusinessTripService processCancel
        console.log("this function is wip");
        throw ErrorDef.NOT_SUPPORT;
        /*const { AccountingDetails, BusinessTripCostDetail } = this.domainDB;
        const btcdata = await BusinessTripCostDetail.findOne({
            where: {
                accountingDetailsId: sid,
            },
        });
        const btData = await btcdata.getBusinessTrip({
            attributes: this.attrs,
            include: [{ model: BusinessTripCostDetail, include: [{ model: AccountingDetails, where: { status: 1 } }] }],
        });
        const mBtData = { ...btData.toJSON() };
        delete mBtData.BusinessTripCostDetails;
        return {
            ...mBtData,
            costDetail: btData.BusinessTripCostDetails.map((subrow) => subrow.AccountingDetail.toJSON()),
        };*/
    }

    public async getData(id: string): Promise<BusinessTrip> {
        const btData = await BusinessTrip.findOne({
            where: {
                id,
            },
            attributes: this.attrs as any,
            //include: [{ model: BusinessTripDetail }],
        });
        if (!btData) {
            throw ErrorDef.DataNotFound;
        }
        return btData;
    }

    public async getByEmployee(
        empId: string,
        options: FindAndCountOptions = {}
    ): Promise<StdQueryListResult<BusinessTrip>> {
        const errors = validationResult(this.req);
        let order = String(this.req.query.order);
        const orderDir = String(this.req.query.orderDir);
        if (!errors.isEmpty()) {
            order = null;
        }
        if (order === "project") {
            order = "projectId";
        }
        let orderData = [["startTime", "desc"]];
        if (order && order !== undefined && order !== "undefined") {
            orderData = [[order, orderDir]];
        }
        const results = await BusinessTrip.findAndCountAll({
            where: {
                employeeId: empId,
            },
            attributes: ["id", "title", "startTime", "endTime", ["project_id", "project"]],
            limit: Number(this.req.query.limit),
            offset: this.req.skip,
            order: orderData as Order,
            ...options,
        });
        return {
            count: results.count,
            data: results.rows,
        };
    }
}

export default BusinessTripService;
