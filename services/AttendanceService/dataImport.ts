import { Request } from "express";
import moment from "moment";
import { Op } from "sequelize";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import XLSX, { WorkSheet } from "xlsx";
import "module-alias/register";
import { ErrorDef } from "@/wf_common";
import { Attendance, LeaveReq } from "@/domain-resource/ts-models";
import BaseService from "../BaseService";

const vaTypeMap = {
    特休: 1,
    福利假: 2,
    補休加班: 3,
    事假: 0,
    病假: 4,
    喪假: 7,
};

const needHourMap = {
    全休: 8,
    前休: 4,
    後休: 4,
};

class AttendanceDataImportService extends BaseService {
    private attEmployeeId: number;

    constructor(req: Request, employeeId: number) {
        super(req);
        this.attEmployeeId = employeeId;
    }

    public async importExcel(): Promise<any> {
        if (!this.req.files.file) {
            throw ErrorDef.FILE_NOT_FOUND;
        }
        const sequelize = this.domainDBResource.sequelize;
        const newfilename = `${uuidv4()}.tmp`;
        const file = this.req.files.file;
        const path = `./uploads/${newfilename}`;
        if (!Array.isArray(file)) {
            return await new Promise((resolve, reject) => {
                const service = this;
                file.mv(path, async () => {
                    const workbook = XLSX.readFile(path);
                    const sheetNames = workbook.SheetNames;
                    const sheetIdx = sheetNames.findIndex((name) => /^2\d{3}(0[1-9]|1[0-2])$/.test(name));
                    if (sheetIdx > -1) {
                        const sheet = workbook.Sheets[workbook.SheetNames[sheetIdx]];
                        const { attData, vaData } = this.processSheet(sheet, workbook.SheetNames[sheetIdx]);
                        const attDates = attData.map((row) => row.date);
                        const vaDates = [attDates[0], attDates[attDates.length - 1]];
                        await sequelize.transaction(async (transaction) => {
                            try {
                                await Attendance.destroy({
                                    where: {
                                        employee: service.attEmployeeId,
                                        date: { [Op.in]: attDates },
                                    },
                                    transaction,
                                });
                                await LeaveReq.destroy({
                                    where: {
                                        employeeId: service.attEmployeeId,
                                        startTime: { [Op.between]: vaDates },
                                    },
                                    transaction,
                                });
                                await Attendance.bulkCreate(attData, { transaction });
                                await LeaveReq.bulkCreate(vaData, { transaction });
                                resolve({ status: "ok" });
                            } catch (e) {
                                service.logger.error(e);
                                reject(ErrorDef.ErrorTran);
                            }
                        });
                    }
                });
            })
                .catch((e) => {
                    return {
                        status: "error",
                        code: e,
                    };
                })
                .finally(() => {
                    fs.unlinkSync(path);
                });
        }
    }

    private processSheet(sheet: WorkSheet, ym: string): ProcessSheetResult {
        const start = 9;
        const range = XLSX.utils.decode_range(sheet["!ref"]);
        const currentYM = moment(`${ym}01`, "YYYYMMDD");
        const attData = [];
        const vaData = [];
        for (let R = start; R <= range.e.r; ++R) {
            const num = R + 1;
            if (sheet["A" + num] && sheet["A" + num].v !== "") {
                const day = sheet["A" + num].w;
                if (R > start && day === "01") {
                    currentYM.add(1, "M");
                }
                const mYm = currentYM.format("YYYYMM");
                const rDate = moment(`${mYm}${day}`, "YYYYMMDD");
                if (sheet["C" + num] && sheet["D" + num]) {
                    const rInTime = moment.utc(sheet["C" + num].w, "H:mm");
                    const rOutTime = moment.utc(sheet["D" + num].w, "H:mm");
                    const mRow = {
                        employee: this.attEmployeeId,
                        date: rDate.format("YYYY-MM-DD"),
                        inTime: rInTime.format("HH:mm:ss"),
                        outTime: rOutTime.format("HH:mm:ss"),
                        comp: 1,
                        breakTime: 1,
                        reviewed: 1,
                        rmk: "import from excel",
                    };
                    //console.log(mRow);
                    attData.push(mRow);
                }
                if (sheet["E" + num] && sheet["F" + num]) {
                    const rSTime = moment.utc(sheet["G" + num].w, "H:mm");
                    const rETime = moment.utc(sheet["H" + num].w, "H:mm");
                    const mRow = {
                        employeeId: this.attEmployeeId,
                        startTime: `${rDate.format("YYYY-MM-DD")} ${rSTime.format("HH:mm:ss")}`,
                        endTime: `${rDate.format("YYYY-MM-DD")} ${rETime.format("HH:mm:ss")}`,
                        type: vaTypeMap[sheet["F" + num].v],
                        reason: "",
                        rmk: "import from excel",
                        status: 2,
                        needhours: needHourMap[sheet["E" + num].v],
                    };
                    //console.log(mRow);
                    vaData.push(mRow);
                }
            }
        }
        return { attData, vaData };
    }
}

export interface ProcessSheetResult {
    attData: AttRow[];
    vaData: VaRow[];
}

export interface AttRow {
    employee: number;
    date: string;
    inTime: string;
    outTime: string;
    comp: number;
    breakTime: number;
    reviewed: number;
    rmk: string;
}

export interface VaRow {
    employeeId: number;
    startTime: string;
    endTime: string;
    type: number;
    reason: string;
    status: number;
    needhours: number;
    rmk: string;
}

export default AttendanceDataImportService;
