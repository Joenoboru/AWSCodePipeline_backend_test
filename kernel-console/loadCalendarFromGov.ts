import axios from "axios";
import { config } from "dotenv";
import "module-alias/register";
import getCommonDatabase from "@/common-database";
import { GovernmentCalendar } from "@/common-database/ts-models";

async function loadCalendarFromGov(): Promise<void> {
    const { sequelize } = getCommonDatabase();
    sequelize.addModels([GovernmentCalendar]);
    axios.get(`https://data.ntpc.gov.tw/api/v1/rest/datastore/382000000A-000077-002`).then((response) => {
        const records = response.data.result.records;
        records.forEach((element) => {
            element.isHoliday = element.isHoliday === "是" ? true : false;
        });
        GovernmentCalendar.destroy({
            truncate: true,
        }).then(() => {
            sequelize.transaction(async function (t) {
                await GovernmentCalendar.bulkCreate(records, { transaction: t });
            });
        });
    });
}

config(); //load env
loadCalendarFromGov();
