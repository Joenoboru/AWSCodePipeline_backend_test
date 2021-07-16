import { Request, Response } from "express";
import { QueryTypes, Op } from "sequelize";
import "module-alias/register";
import { Project, ProjectAccount } from "@/domain-resource/ts-models";
import { fillable, accountFillable, orderDateField, sortable } from "./fieldSetting";
import QueryService from "./QueryService";

class ProcessService extends QueryService {
    constructor(req: Request) {
        super(req);
    }
    async createData(data: Project): Promise<Project> {        
        const model = await Project.build(data).save({ fields: fillable });
        await data.ProjectAccounts.forEach(async (subRow) => {
            await ProjectAccount.build({ ...subRow, project_id: model.id }).save({
                fields: accountFillable,
            });
        });
        return model;
    }

    async updateData(data: Project): Promise<void> {
        await Project.findOne({
            where: {
                id: data.id,
            },
        }).then(async (model) => {
            await ProjectAccount.destroy({ where: { project_id: model.id } });
            await data.ProjectAccounts.forEach(async (subRow) => {
                await ProjectAccount.build({ ...subRow, project_id: model.id }).save({
                    fields: accountFillable,
                });
            });
            await model.update(data, { fields: fillable });
        });
    }
    async deleteData(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        Project.findOne({
            where: {
                id: id,
            },
        }).then((model) => {
            model.destroy().then(() => {
                res.send({ status: "ok", result: model });
            });
        });
    }
    async calculateUsedCost(projId: number): Promise<any> {
        const { sequelize } = this.domainDBResource;
        const sql =
            "SELECT (SELECT IFNULL(SUM(`amount`),0) FROM `project_accounts` WHERE `project_id` = :projId) " +
            "+ (SELECT IFNULL(SUM(`usetime` * `worklevels`.`cost`),0) FROM `workprojects` " +
            "JOIN `attendances` ON `attendances`.`attendance_id` = `workprojects`.`attendance_id` " +
            "JOIN `employees` ON `employees`.`id` = `attendances`.`employee_id` " +
            "JOIN `worklevels` ON `worklevels`.`worklevel_id` = `employees`.`work_level`" +
            "WHERE `reviewed` = 1 AND `project` = :projId) AS result";
        const queryRes = (await sequelize.query(sql, {
            replacements: { projId: projId },
            type: QueryTypes.SELECT,
        })) as any;
        return queryRes[0].result;
    }
    async calculateAllUsedCost(): Promise<any> {
        const { sequelize } = this.domainDBResource;
        const queryRes = await sequelize.query(
            "SELECT `projects`.`project_id` AS `project_id`, IFNULL(`acc_data`.`amount`, 0) + IFNULL(`emp_data`.`amount`, 0) AS `total` FROM `projects` " +
                "LEFT JOIN (SELECT `project_id`, SUM(`amount`) AS `amount` FROM `project_accounts` " +
                "   GROUP BY `project_id`) AS `acc_data` ON `acc_data`.`project_id` = `projects`.`project_id`" +
                "LEFT JOIN (SELECT `project` as `project_id`, SUM(`usetime` * `worklevels`.`cost`) AS `amount` FROM `workprojects` " +
                "  JOIN `attendances` ON `attendances`.`attendance_id` = `workprojects`.`attendance_id` " +
                "  JOIN `employees` ON `employees`.`id` = `attendances`.`employee_id` " +
                "  JOIN `worklevels` ON `worklevels`.`worklevel_id` = `employees`.`work_level` " +
                "  WHERE `reviewed` = 1 GROUP BY `project`, `reviewed`) AS `emp_data` ON `emp_data`.`project_id` = `projects`.`project_id` ",
            {
                type: QueryTypes.SELECT,
            }
        );
        return queryRes;
    }
    async doRenewCost(): Promise<void> {
        const service = this;
        const models = await Project.findAll({
            where: { status: { [Op.in]: [1, 2, 3, 5] } },
        });
        Promise.all(
            models.map(
                (model) =>
                    new Promise<void>((resolve, reject) => {
                        service
                            .calculateUsedCost(model.id)
                            .then((mCost) => {
                                model.costCalc = mCost;
                                model.costRateCalc = model.budget === 0 ? 0 : 1 - mCost / model.budget;
                                model.usedRate = model.costEst === 0 ? 0 : mCost / model.costEst;
                                model.costRateEst = model.budget === 0 ? 0 : 1 - model.costEst / model.budget;
                                model
                                    .save()
                                    .then(() => {
                                        resolve();
                                    })
                                    .catch((err) => {
                                        reject(err);
                                    });
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    })
            )
        ).then(() => {
            console.log("done!");
        });
    }
}
export { orderDateField, sortable };
export default ProcessService;
