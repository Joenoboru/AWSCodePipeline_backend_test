import { Request, Response } from "express";
import moment from "moment";
import { ParamsDictionary } from "express-serve-static-core";
import "module-alias/register";
import { LeaveReq, Employee } from "@/domain-resource/ts-models";
import { ListQueryParams } from "@/types/queryTypes";
import { ErrorDef } from "@/wf_common";
import { createQueryList, createOrder } from "@/helpers/dbHelper";
import BaseService from "../BaseService";
import YearLeaveHourService from "../YearLeaveHourService";

const sortable = ["id", "start_time", "end_time", "type", "status", "needhours"];
const fillable = ["startTime", "endTime", "type", "employeeId", "reason", "rmk", "status"];

class MainService extends BaseService {
    yearLeaveHourService: YearLeaveHourService;

    constructor(req: Request) {
        super(req);
        this.yearLeaveHourService = new YearLeaveHourService(req);
    }
    async getList(req: Request, res: Response): Promise<void> {
        return await this.getListByEmployeeId(req, res, req.user.employeeId);
    }
    async getListByEmployeeId(
        req: Request<ParamsDictionary, any, any, ListQueryParams>,
        res: Response,
        employeeId: number
    ): Promise<void> {
        const order = createOrder(req, [["createdAt", "desc"]]);
        const results = await createQueryList(
            LeaveReq,
            sortable,
            this.page,
            order,
            null,
            { filterable: sortable, filter: req.query.filter },
            { employeeId }
        );
        res.json({
            count: results.count,
            data: results.rows,
        });
    }
    async getData(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        LeaveReq.findOne({
            where: {
                id: id,
                //employeeId: req.user.employeeId,
            },
        }).then((result) => {
            if (result === null) {
                return res.send({
                    status: "error",
                    code: ErrorDef.DataNotFound,
                });
            }
            res.json(result);
        });
    }
    async createData(data: LeaveReq): Promise<LeaveReq> {
        const model = await LeaveReq.build(data).save({ fields: fillable });
        return model;
    }

    async updateData(data: LeaveReq, empId: number): Promise<void> {
        await LeaveReq.findOne({
            where: {
                id: data.id,
                employeeId: empId,
            },
        }).then(async (model) => {
            await model.update(data, { fields: fillable });
        });
    }

    async deleteData(id: number): Promise<LeaveReq> {
        return await LeaveReq.findOne({
            where: {
                id: id,
            },
        }).then(async (model) => {
            return await model.destroy().then(() => {
                return model;
            });
        });
    }
    public async scrapData(id: number): Promise<void> {
        const { sequelize } = this.domainDBResource;
        await sequelize.transaction(async (transaction) => {
            const record = await LeaveReq.findOne({
                where: {
                    id: id,
                },
                transaction,
            });
            const employeeId = record.employeeId;
            await record.update({ status: 4 }, { transaction });
            const employee = await Employee.findOne({
                where: {
                    id: employeeId,
                },
                attributes: ["hire_date"],
            });
            const today = moment();
            const employeeYearLeaveHour = await this.yearLeaveHourService.getEmployeeYearLeaveHour(
                transaction,
                employeeId,
                employee.hire_date,
                today
            );
            if (record.type in employeeYearLeaveHour.hours) {
                const newData = { ...employeeYearLeaveHour.hours };
                newData[record.type] += record.needhours;
                await employeeYearLeaveHour.update({ hours: newData }, { transaction });
            }
        });
    }
}
export { sortable };
export default MainService;
