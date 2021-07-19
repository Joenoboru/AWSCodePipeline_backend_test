import { FindOptions, Order } from "sequelize";
import "module-alias/register";
import { WorkPosition } from "@/domain-resource/ts-models";
import { createQueryAll, updateData, deleteData } from "@/helpers/dbHelper";
import BaseService from "../BaseService";

const fillable = ["name", "order", "enName", "jpName", "remark"];
const sortable = ["id", "order", "name", "jpName", "enName"];

/**
 * unused service?
 */
class WorkPositionService extends BaseService {
    readonly fillable: string[] = fillable;
    readonly sortable: string[] = sortable;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    constructor(req: any) {
        super(req);
    }
    async deleteWorkPosition(id: number): Promise<WorkPosition> {
        return deleteData<WorkPosition>(WorkPosition, {
            id,
        });
    }
    async updateWorkPosition(data: WorkPosition): Promise<WorkPosition> {
        return updateData<WorkPosition>(WorkPosition, this.fillable, data, { id: data.id });
    }
    async createWorkPosition(data: WorkPosition): Promise<WorkPosition> {
        const model = await WorkPosition.build(data).save({ fields: this.fillable });
        return model;
    }

    async getWorkPositionList(
        order?: Order,
        options?: FindOptions<WorkPosition>
        ): Promise<{ rows: WorkPosition[]; count: number }> {
        const result = await WorkPosition.findAndCountAll({
            attributes: this.sortable,
            offset: this.page.offset,
            limit: this.page.limit,
            order: order,
            ...options,
        });
        return result;
    }

    async getWorkPositionAll(): Promise<WorkPosition[]> {
        return createQueryAll<WorkPosition>(WorkPosition, this.sortable);
    }
}
export { sortable };
export default WorkPositionService;
