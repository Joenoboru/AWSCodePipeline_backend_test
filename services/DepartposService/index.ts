import { Request, Response } from "express";
import "module-alias/register";
import { Department, DepartPos, WorkPosition, Corporate } from "@/domain-resource/ts-models";
import { ErrorDef } from "@/wf_common";
import BaseService from "../BaseService";

const fillable = ["depart", "workpos"];

class DepartposService extends BaseService {
    async deleteDepartPos(req: Request, res: Response): Promise<Response> {
        const id = req.params.departId;
        return await DepartPos.findOne({
            where: {
                depart: Number(id),
                workpos: req.body.data,
            },
        }).then((model) => {
            if (model === null) {
                return res.send({
                    status: "error",
                    code: ErrorDef.DataNotFound,
                });
            }
            model.destroy().then(() => {
                res.send({ status: "ok", result: model });
            });
        });
    }
    async createDepartPos(req: Request, res: Response): Promise<Response> {
        const id = req.params.departId;
        return await Department.findOne({
            where: {
                id: id,
            },
        }).then((result) => {
            if (result === null) {
                return res.send({
                    status: "error",
                    code: ErrorDef.DataNotFound,
                });
            }
            DepartPos.build({
                depart: id,
                workpos: req.body.workpos,
            })
                .save({ fields: fillable })
                .then((model) => {
                    res.send({ status: "ok", result: model });
                })
                .catch((error) => {
                    res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
                });
        });
    }
    async getByDepartId(req: Request, res: Response): Promise<void> {
        const id = req.params.departId;
        return await DepartPos.findAll({
            where: {
                depart: id,
            },
        }).then((results) => {
            res.json(results);
        });
    }
    async getAllByDepartId(req: Request): Promise<DepartPos[]> {
        const id = req.params.departId;
        return await DepartPos.findAll({
            attributes: ["id", "workpos"],
            where: { depart: id },
            include: {
                model: WorkPosition,
                attributes: ["id", "name", "chname"],
            },
            order: [["WorkPosition", "ord", "asc"]],
        });
    }

    async getAll(): Promise<DepartPos[]> {
        return await DepartPos.findAll({
            attributes: ["id"],
            include: [
                { model: WorkPosition, attributes: ["id", "name", "chname"] },
                {
                    model: Department,
                    attributes: ["id", "name", "chname"],
                    include: [
                        {
                            model: Corporate,
                            attributes: ["id", "name", "chname"],
                        },
                    ],
                },
            ],
        });
    }

    constructor(req: Request) {
        super(req);
    }
}

export default DepartposService;
