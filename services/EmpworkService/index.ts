import { Request, Response } from "express";
import "module-alias/register";
import { EmpWork, DepartPos, WorkPosition, Department, Corporate } from "@/domain-resource/ts-models";
import { QueryListResult } from "@/types/queryTypes";
import { ErrorDef } from "@/wf_common";
import BaseService from "../BaseService";

const fillable = ["emp", "workpos", "ord", "status"];
class EmpworkService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    async deleteData(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        return await EmpWork.findOne({
            where: {
                id: id,
            },
        }).then(async (model) => {
            if (model === null) {
                res.send({
                    status: "error",
                    code: ErrorDef.DataNotFound,
                });
            }
            await model.destroy().then(() => {
                return res.send({ status: "ok", result: model });
            });
        });
    }

    async createData(req: Request, res: Response): Promise<void> {
        return await EmpWork.build(req.body)
            .save({ fields: fillable })
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    }
    async changeOrder(req: Request, res: Response): Promise<void> {
        return await Promise.all(
            req.body.list.map(
                (row) =>
                    new Promise<void>((resolve, reject) => {
                        EmpWork.update({ ord: row.ord }, { where: { id: row.id } })
                            .then(() => {
                                resolve();
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    })
            )
        )
            .then(() => {
                res.send({ status: "ok" });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    }
    async getAudit(req: Request, res: Response): Promise<void> {
        const id = req.params.empId;
        EmpWork.findAll({
            attributes: ["id", "workpos", "ord"],
            where: { emp: id },
            order: [["ord", "ASC"]],
        }).then((results) => {
            res.json({
                employeeId: id,
                workpos: results,
            });
        });
    }
    async getAllDataOnly(req: Request, res: Response): Promise<void> {
        const id = req.params.empId;
        this.findWorkPositionByEmpId(Number(id)).then((results) => {
            res.json(results.rows);
        });
    }
    async getAll(req: Request, res: Response): Promise<void> {
        const id = req.params.empId;
        this.findWorkPositionByEmpId(Number(id)).then((results) => {
            res.json({
                count: results.count,
                data: results.rows,
                maxpage: Math.ceil(results.count / Number(req.query.limit)),
            });
        });
    }

    private async findWorkPositionByEmpId(empId: number): Promise<QueryListResult<EmpWork>> {
        return EmpWork.findAndCountAll({
            attributes: ["id", "ord"],
            where: { emp: empId },
            include: {
                model: DepartPos,
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
            },
            order: [
                ["ord", "ASC"],
                /*[DepartPos, Department, Corporate, 'name', 'ASC'],
                [DepartPos, Department, 'name', 'ASC'],
                [DepartPos, WorkPosition, 'name', 'ASC']*/
            ],
        });
    }
}

export default EmpworkService;
