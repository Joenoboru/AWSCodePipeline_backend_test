import { fn } from "sequelize";
import "module-alias/register";
import { SalaryDef } from "@/domain-resource/ts-models";

async function getSalaryDefData(
    mustSalaryItemIds: number | number[],
    empIds: number | number[]
): Promise<SalaryDefData[]> {
    const defData = await SalaryDef.findAll({
        group: ["employee"],
        attributes: [
            [fn("COUNT", "item"), "count"],
            ["employee", "id"],
        ],
        where: {
            item: mustSalaryItemIds,
            employee: empIds,
        },
        raw: true,
    });
    return defData as any;
}

export interface SalaryDefData {
    count: number;
    employee: typeof SalaryDef.prototype.employee;
    id: typeof SalaryDef.prototype.id;
}
export default getSalaryDefData;
