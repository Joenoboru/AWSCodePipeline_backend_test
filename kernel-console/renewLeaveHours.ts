import moment from "moment";
import { Op } from "sequelize";
import { config } from "dotenv";
import "module-alias/register";
import winLogger from "@/logger";
import getCommonDatabase from "@/common-database";
import { UsePermission } from "@/common-database/ts-models";
import { Employee, LeaveType, YearLeaveHourRecord } from "@/domain-resource/ts-models";
import YearLeaveHourService from "@/services/YearLeaveHourService";
import loadDomainDatabaseForConsole from "./common/loadDomainDatabaseForConsole";

const today = new Date();

async function renewLeaveHours(): Promise<void> {
    const commonDBResource = getCommonDatabase();
    const domainDBResource = await loadDomainDatabaseForConsole();
    commonDBResource.sequelize.addModels([UsePermission]);
    domainDBResource.sequelize.addModels([Employee, LeaveType, YearLeaveHourRecord]);
    UsePermission.findAll({
        where: {
            from: {
                [Op.lt]: today,
            },
            until: {
                [Op.gte]: today,
            },
        },
    }).then(async (usePermissions) => {
        for (let index = 0; index < usePermissions.length; index++) {
            const usePermission = usePermissions[index];
            try {
                const req = {
                    user: {
                        domain: usePermission.domain,
                    },
                    query: { limit: 0 },
                    skip: 0,
                } as any;
                const service = new YearLeaveHourService(req);
                await service.updateAllEmployeeLeaveHour(moment());
            } catch (e) {
                winLogger.error(e);
            }
        }
        console.log("fin.");
        process.exit();
    });
}

config();
renewLeaveHours();
