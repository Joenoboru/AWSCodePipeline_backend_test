import { Request, Response } from "express";
import { validationResult } from "express-validator";
import "module-alias/register";
import { Customer } from "@/domain-resource/ts-models";
import { ErrorDef } from "@/wf_common";
import { fillable } from "./fieldSetting";
import BaseService from "../BaseService";

class ProcessService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    async updateAuditCustomer(data: Customer): Promise<void> {
        if (data.id) {
            // do update
            await Customer.findOne({
                where: { id: data.id },
            }).then(async (model) => {
                await model.update(data);
            });
        } else {
            await Customer.build(data).save();
        }
    }
    async createData(req: Request, res: Response): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.send({
                status: "error",
                code: ErrorDef.formInvalid,
                errors: errors.array(),
            });
            return;
        }
        await Customer.build(req.body)
            .save({ fields: fillable })
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    }

    async updateData(req: Request, res: Response): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.send({
                status: "error",
                code: ErrorDef.formInvalid,
                errors: errors.array(),
            });
            return;
        }
        //let id = req.params.id;
        Customer.findOne({
            where: {
                id: req.body.id,
            },
        }).then((model) => {
            model.update(req.body, { fields: fillable }).then(() => {
                res.send({ status: "ok", result: model });
            });
        });
    }

    async deleteData(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        Customer.findOne({
            where: {
                id: id,
            },
        }).then((model) => {
            model.destroy().then(() => {
                res.send({ status: "ok", result: model });
            });
        });
    }
}

export default ProcessService;
