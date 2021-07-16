import { Request, Response } from "express";
import moment from "moment";
import "module-alias/register";
import { Attendance } from "@/domain-resource/ts-models";

import DefaultService from "./DefaultService";
class DashboardService extends DefaultService {
    constructor(req: Request) {
        super(req);
    }

    async updateWork(req: Request, res: Response, field = "in_time"): Promise<void> {
        const today = new Date();
        const time = moment().format("HH:mm:ss");
        //const time = dateformat.asString("hh:mm:ss", today);
        const searchRule = {
            date: today,
            employee: req.user.employeeId,
        };
        await Attendance.findOne({
            where: searchRule,
        }).then(async (result) => {
            if (result) {
                await result.update({ [field]: time });
            } else {
                result = await Attendance.build({
                    ...searchRule,
                    [field]: time,
                }).save();
            }
            res.send({
                status: "ok",
                result: {
                    inTime: result.inTime,
                    outTime: result.outTime,
                },
            });
        });
    }
    onWork(req: Request, res: Response): void {
        this.updateWork(req, res, "inTime");
    }
    offWork(req: Request, res: Response): void {
        this.updateWork(req, res, "outTime");
    }
}

export default DashboardService;
