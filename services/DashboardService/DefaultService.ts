import sequelize, { Op } from "sequelize";
import { Request, Response } from "express";
import "module-alias/register";
import { EnumConst } from "@/enums";
import { createWhereFormSearchable } from "@/helpers/dbHelper";
import { Announce, Employee, AuditRecord, AuditRecordDetail, Attendance } from "@/domain-resource/ts-models";
import AuditService from "../AuditService";
import LeaveHourService from "../LeaveHourService";
import BaseService from "../BaseService";

class DefaultService extends BaseService {
    private auditService: AuditService = null;
    private leaveHourService: LeaveHourService = null;
    constructor(req: Request) {
        super(req);
        this.auditService = new AuditService(req);
        this.leaveHourService = new LeaveHourService(req);
    }
    async getInfo(): Promise<Info> {
        const empId = this.employeeId;
        // TODO FIX TS
        const deputyIds: number[] = await this.auditService.getDeputyData(empId, null);
        const authDeputyIds: number[] = await this.auditService.getAuthDeputyData(empId);
        const auditCountData = await this.getAuditCountData(empId, deputyIds);
        const attendanceData = await this.getAttendanceInfo(empId);
        const leaveHours = await this.getLeaveHours(empId);
        // maybe need fix, temporarily do this code
        const deputies: DeputyData[] = await Employee.findAll({
            attributes: ["email", "name"],
            where: {
                id: {
                    [Op.in]: [...deputyIds],
                },
            },
        });
        const authDeputy: DeputyData[] = await Employee.findAll({
            attributes: ["email", "name"],
            where: {
                id: {
                    [Op.in]: [...authDeputyIds],
                },
            },
        });
        const result: Info = {
            audit: auditCountData,
            attendance: attendanceData,
            deputy: deputies,
            authDeputy: authDeputy,
            leave: leaveHours,
        };
        return result;
    }
    async getAuditCountData(empId: number, deputyIds: number[]): Promise<AuditCount> {
        const self = await AuditRecord.count({
            where: {
                createUser: empId,
                status: EnumConst.AuditRecordStatus.MainStatus.ONGOING,
                // status: {
                //     [Op.lt]: EnumConst.AuditRecordStatus.MainStatus.DONE
                // }
            },
        });
        const pending = await AuditRecord.count({
            where: {
                status: EnumConst.AuditRecordStatus.MainStatus.ONGOING,
            },
            include: [
                {
                    model: AuditRecordDetail,
                    attributes: [],
                    as: "lastAuditor",
                    where: {
                        auditorId: {
                            [Op.in]: [empId, ...deputyIds],
                        },
                        status: EnumConst.AuditRecordStatus.DetailStatus.PENDING,
                        seqNo: { [Op.not]: 1 },
                    },
                },
            ],
        });
        const returned = await AuditRecordDetail.count({
            attributes: [[sequelize.literal("COUNT(DISTINCT(AuditRecordDetail.audit_record_id))"), "count"]],
            where: {
                auditorId: {
                    [Op.in]: [empId, ...deputyIds],
                },
                status: EnumConst.AuditRecordStatus.DetailStatus.RETURN,
                // read flag
            },
            include: [
                {
                    model: AuditRecord,
                    attributes: [],
                    where: {
                        viewed: false,
                    },
                },
            ],
        });
        const reject = await AuditRecord.count({
            where: {
                createUser: empId,
                status: EnumConst.AuditRecordStatus.MainStatus.REJECT,
                viewed: false,
                // read flag
            },
        });
        const result: AuditCount = {
            self: self,
            pending: pending,
            return: returned,
            reject: reject,
        };
        return result;
    }
    async getAttendanceInfo(empId: number): Promise<AttendanceInfo> {
        const data = await Attendance.findOne({
            where: {
                date: new Date(),
                employee: empId,
            },
        });
        if (!data) {
            const result: AttendanceInfo = {
                id: null,
                inTime: null,
                outTime: null,
            };
            return result;
        }
        const { id, inTime, outTime } = data;
        const result: AttendanceInfo = {
            id,
            inTime: inTime.slice(0, -3),
            outTime: outTime ? outTime.slice(0, -3) : null,
        };
        return result;
    }
    async getLeaveHours(empId: number): Promise<number> {
        const result = await this.leaveHourService.getEmployeeYearLeaveHourFunc(empId);
        if (result) {
            let total = 0;
            for (const key in result.hours) {
                total += result.hours[key];
            }
            return total;
        } else {
            return 0;
        }
    }
    getAnnounce(req: Request, res: Response): void {
        const whereSearch = createWhereFormSearchable(["title"], req.query.str as string);
        const where = { show: true, ...whereSearch };
        Announce.findAndCountAll({
            attributes: ["id", "onTop", "title", "createdAt", "createUser"],
            where: where,
            limit: Number(req.query.limit),
            offset: req.skip,
            order: [
                ["onTop", "DESC"],
                ["createdAt", "DESC"],
            ],
        }).then((result) => {
            res.send({
                count: result.count,
                data: result.rows,
            });
        });
    }
    getAnnounceInfo(req: Request, res: Response): void {
        Announce.findOne({
            attributes: ["id", "title", "content", "createdAt", "createUser"],
            where: {
                show: true,
                id: req.params.id,
            },
        }).then((result) => {
            if (result) {
                res.send(result);
            } else {
                res.send({});
            }
        });
    }
}
interface AuditCount {
    self: number;
    pending: number;
    return: number;
    reject: number;
}
interface DeputyData {
    email: string;
    name: string;
}
interface AttendanceInfo {
    id: number | null;
    inTime: string | null;
    outTime: string | null;
}
interface Info {
    audit: AuditCount;
    attendance: AttendanceInfo;
    deputy: DeputyData[];
    authDeputy: DeputyData[];
    leave: number;
}
export default DefaultService;
