import { Request } from "express";
import { Op, FindOptions } from "sequelize";
import "module-alias/register";
import { EmpPermissionGroup, PermissionGroup, Employee } from "@/domain-resource/ts-models";
import { ErrorDef } from "@/wf_common";
import { StdQueryListResult } from "@/types/queryTypes";
import BaseService from "../BaseService";

class EmpPermissionService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    async checkEmployee(empId: number): Promise<Employee | null> {
        return new Promise((resolve, reject) => {
            return Employee.findOne({
                where: {
                    id: empId,
                },
            })
                .then((result) => {
                    if (result === null) {
                        reject(ErrorDef.DataNotFound);
                    } else {
                        resolve(result);
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    async create(empId: number, pgId: number): Promise<EmpPermissionGroup> {
        return await this.checkEmployee(empId).then(() => {
            return EmpPermissionGroup.build({
                empId: empId,
                permissionGroupId: pgId,
            }).save();
        });
    }

    async del(empId: number, pgId: number): Promise<EmpPermissionGroup> {
        return await new Promise((resolve, reject) => {
            EmpPermissionGroup.findOne({
                where: {
                    empId: empId,
                    permissionGroupId: pgId,
                },
            })
                .then((model) => {
                    if (model === null) {
                        reject(ErrorDef.DataNotFound);
                    } else {
                        model.destroy().then(() => {
                            resolve(model);
                        });
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
    async getList(options: FindOptions): Promise<StdQueryListResult<Employee>> {
        const where = {
            email: { [Op.not]: null, [Op.ne]: "" },
            [Op.or]: [{ status: 1 }, { status: 2, leave_date: { [Op.gte]: new Date() } }],
        };
        const count = await Employee.count({
            where,
        });
        const data = await Employee.findAll({
            attributes: ["id", "name", "engname", "emp_num"],
            where,
            order: [["emp_num", "asc"]],
            include: [
                {
                    model: PermissionGroup,
                    attributes: ["id", "name"],
                },
            ],
            ...options,
        });
        return { count, data };
    }

    async getData(id: number): Promise<EmpPermissionGroup[]> {
        return await EmpPermissionGroup.findAll({
            attributes: ["permissionGroupId"],
            where: {
                empId: id,
            },
        });
    }

    async getGroup(): Promise<PermissionGroup[]> {
        return await PermissionGroup.findAll({
            attributes: ["id", "name", "description"],
        });
    }
}

export default EmpPermissionService;
