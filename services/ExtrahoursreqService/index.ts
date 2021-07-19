import { Request, Response } from "express";
import moment from "moment";
import { validationResult } from "express-validator";
import { ParamsDictionary } from "express-serve-static-core";
import "module-alias/register";
import { ExtraHoursReq, CompanyRule } from "@/domain-resource/ts-models";
import { createWhereFormFilter } from "@/helpers/dbHelper";
import { ListQueryParams } from "@/types/queryTypes";
import { ErrorDef } from "@/wf_common";
import BaseService from "../BaseService";
import YearLeaveHourService from "../YearLeaveHourService";

const filterable = ["date", "start_time", "end_time", "type", "comp", "status"];
const fillable = ["employee", "date", "start_time", "end_time", "type", "reason", "comp", "rmk", "status"];

class ExtrahoursreqService extends BaseService {
    async updateData(req: Request, res: Response): Promise<Response> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({
                status: "error",
                code: ErrorDef.formInvalid,
                errors: errors.array(),
            });
        }
        //let id = req.params.id;
        return await ExtraHoursReq.findOne({
            where: {
                id: req.body.id,
                employee: req.user.employeeId,
            },
        }).then(async (model) => {
            return await model.update(req.body, { fields: fillable }).then(() => {
                return res.send({ status: "ok", result: model });
            });
        });
    }
    async createData(req: Request, res: Response): Promise<Response> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({
                status: "error",
                code: ErrorDef.formInvalid,
                errors: errors.array(),
            });
        }
        //TODO 根據使用者補上employee
        const newModel = { ...req.body, employee: req.user.employeeId, status: 1 };
        return await ExtraHoursReq.build(newModel)
            .save({ fields: fillable })
            .then((model) => {
                return res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                return res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    }
    async getOne(req: Request, res: Response): Promise<Response> {
        const id = req.params.id;
        return await ExtraHoursReq.findOne({
            where: {
                id: id,
                employee: req.user.employeeId,
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
    async getList(req: Request<ParamsDictionary, any, any, ListQueryParams>, res: Response): Promise<any> {
        const errors = validationResult(req);
        let order = req.query.order;
        const orderDir = req.query.orderDir;
        const limit = Number(req.query.limit);
        if (!errors.isEmpty()) {
            order = null;
        }
        let orderData = [["createdAt", "desc"]];
        if (order) {
            orderData = [[order, orderDir]];
        }
        const whereFilter = createWhereFormFilter(filterable, req.query.filter);
        const where = { employee: req.user.employeeId, ...whereFilter };
        ExtraHoursReq.findAndCountAll({
            attributes: ["id", "date", "start_time", "end_time", "type", "comp", "status", "hours"],
            order: orderData as any,
            limit,
            offset: req.skip,
            where: where,
        }).then((results) => {
            res.json({
                count: results.count,
                data: results.rows,
                maxpage: Math.ceil(results.count / limit),
            });
        });
    }
    public async deleteData(id: number): Promise<any> {
        const data = await ExtraHoursReq.findOne({ where: { id } });
        await data.update({ status: 4 });
        await this.yearLeaveHourService.updateEmployeeOvertimeLeaveHours(
            data.employeeId,
            moment.utc(data.date).toDate(),
            moment.utc(data.date).toDate()
        );
    }
    public async processData(data: ExtraHoursReq): Promise<any> {
        const companyRule = await CompanyRule.findOne({});
        const extraLimit = companyRule.extraLimitMinutes;
        const startTime = moment.utc(data.startTime, "HH:mm:00");
        const endTime = moment.utc(data.endTime, "HH:mm:00");
        data.status = 2;
        data.hours = this.yearLeaveHourService.calculateExtraHours(
            endTime.diff(startTime, "minutes") / 60.0,
            0,
            extraLimit
        );
        let outModel = null;
        if (data.id) {
            await ExtraHoursReq.update(data, { where: { id: data.id } });
            outModel = data;
        } else {
            outModel = await ExtraHoursReq.build(data).save();
        }
        await this.yearLeaveHourService.updateEmployeeOvertimeLeaveHours(data.employeeId, outModel.date, outModel.date);
        // await this.yearLeaveHourService.calculateYearLeaveHour(data.employeeId, moment(), leaveTypes);
    }

    private yearLeaveHourService: YearLeaveHourService;
    constructor(req: Request) {
        super(req);
        this.yearLeaveHourService = new YearLeaveHourService(req);
    }
}
export { filterable };
export default ExtrahoursreqService;
