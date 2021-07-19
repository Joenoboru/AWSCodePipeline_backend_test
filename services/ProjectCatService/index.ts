import { Request } from "express";
import { FindOptions } from "sequelize";
import "module-alias/register";
import { ProjectCat } from "@/domain-resource/ts-models";
import { updateData, deleteData } from "@/helpers/dbHelper";
import { QueryListResult } from "@/types/queryTypes";
import BaseService from "../BaseService";

class ProjectCatService extends BaseService {
    readonly fillable: string[] = ["name", "status", "rmk"];

    constructor(req: Request) {
        super(req);
    }

    //class getList
    async getList(options: FindOptions): Promise<QueryListResult<ProjectCat>> {
        const result = await ProjectCat.findAndCountAll({
            attributes: ["id", "name", "status", "rmk"],
            ...options,
        });
        return result;
    }
    async getAll(): Promise<ProjectCat[]> {
        const result = await ProjectCat.findAll({
            attributes: ["id", "name"],
            where: { status: 1 },
        });
        return result;
    }
    async createData(data: ProjectCat): Promise<ProjectCat> {
        return ProjectCat.build(data).save({ fields: this.fillable });
    }
    async updateData(id: number, data: ProjectCat): Promise<ProjectCat> {
        return updateData<ProjectCat>(ProjectCat, this.fillable, data, {
            id,
        });
    }
    async deleteData(id: number): Promise<ProjectCat> {
        return deleteData<ProjectCat>(ProjectCat, {
            id,
        });
    }
}
export default ProjectCatService;
