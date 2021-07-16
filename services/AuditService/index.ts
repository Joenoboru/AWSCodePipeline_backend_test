/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-this-alias */
import { Op } from "sequelize";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import "module-alias/register";
import { EnumConst } from "@/enums";
import { StandardResponse, NextStageAuditor } from "@/types";
import { ErrorDef } from "@/wf_common";
import { sendSampleMail } from "@/helpers/sesHelper";
import { AuditRecord, AuditRecordDetail, FormRoute, RouteDetail, Employee } from "@/domain-resource/ts-models";
import EmpProcessService from "../EmployeeService/QueryService";
import MessageService from "../MessageService";
import FileService, { FileData } from "../FileService";
import AuditFormProcessService from "./AuditFormProcessService";

class AuditService extends AuditFormProcessService {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    employeeService = null;
    messageService: MessageService | null = null;
    basefilepath = "files";
    tempfilepath = "temp";
    auditfilepath = "audit";
    constructor(req: any) {
        super(req);
        this.employeeService = new EmpProcessService(req);
        this.messageService = new MessageService(req);
        let path = `./${this.basefilepath}/${this.domain}`;
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
        path = `./${this.basefilepath}/${this.domain}/${this.tempfilepath}`;
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
        path = `./${this.basefilepath}/${this.domain}/${this.auditfilepath}`;
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }
    }

    async downloadFile(res: any) {
        const empId = this.employeeId;
        const deputyIds = await this.getDeputyData(this.employeeId);
        deputyIds.push(this.employeeId);
        const permit = await AuditRecordDetail.count({
            where: {
                auditRecordId: this.req.query.recordId,
                [Op.or]: [
                    {
                        auditorId: {
                            [Op.in]: deputyIds,
                        },
                    },
                    {
                        deputyId: {
                            [Op.in]: deputyIds,
                        },
                    },
                ],
            },
        });
        if (permit === 0) {
            res.status(404).send();
        } else {
            const mainData = await AuditRecord.findOne({
                where: { id: this.req.query.recordId },
            });
            if (!mainData.auditData || !mainData.auditData.attachFiles) {
                res.status(404).send();
            }
            if (mainData.auditData.attachFiles.filter((a) => a.path === this.req.query.path).length === 0) {
                res.status(404).send();
            } else {
                res.download(`./files/${this.domain}/` + this.req.query.path, this.req.query.title);
            }
        }
    }
    public baseFilePath() {
        return `./${this.basefilepath}/${this.domain}`;
    }
    public async processUploadFile() {
        const list = [];
        try {
            if (!fs.existsSync(this.baseFilePath() + `/${this.tempfilepath}`)) {
                fs.mkdirSync(this.baseFilePath() + `/${this.tempfilepath}`);
            }
            if (this.req.files) {
                const files = this.req.files.file;
                const processMethod = (file) => {
                    const newfilename = `${uuidv4()}`;
                    const path = `/${this.tempfilepath}/${newfilename}`;
                    file.mv(this.baseFilePath() + path);
                    list.push({
                        title: file.name,
                        path: path,
                    });
                };
                if (Array.isArray(files)) {
                    for (const key in files) {
                        processMethod(files[key]);
                    }
                } else {
                    processMethod(files);
                }
            }
        } catch (e) {
            this.logger.error(e);
        }
        return list;
    }
    async processAttachFileInAuditData(auditData, recordId): Promise<void> {
        const fileService = new FileService(this.req);
        if (recordId) {
            if (auditData.attachFiles) {
                const fileList = await fileService.processAttachFile(
                    this.auditfilepath,
                    recordId,
                    auditData.attachFiles
                );
                auditData.attachFiles = fileList;
                /*const baseFilePath = this.baseFilePath(); 
                const path = basePath + `${baseFilePath}/${this.auditfilepath}/${recordId}`;
                if (!fs.existsSync(path)) {
                    fs.mkdirSync(path);
                }
                auditData.attachFiles
                    .filter((a) => a.path.indexOf(`${this.tempfilepath}/`) >= 0)
                    .forEach((fileInfo) => {
                        const oldpath = fileInfo.path;
                        const newpath = oldpath.replace(this.tempfilepath, `${this.auditfilepath}/${recordId}`);
                        fs.rename(basePath + oldpath, basePath + newpath, (err) => {
                            if (err) {
                                this.logger.error(err);
                            }
                        });
                        fileInfo.path = newpath.substring(1);
                    });*/
            }
        }
    }
    public async doOtherActionForAuditData(): Promise<any> {
        const service = this;
        const formData = this.req.body;
        const empId = this.employeeId;
        const actionStatus = formData.status;

        if (formData.id) {
            await this.processAttachFileInAuditData(formData.auditData, formData.id);
            return await this.createNextAuditRecordData(empId, formData, actionStatus)
                .then((arData) => {
                    return {
                        status: "ok",
                        result: {
                            id: arData.id,
                            formId: arData.formId,
                        },
                        code: "",
                    };
                })
                .catch((err) => {
                    service.logger.error(err);
                    return {
                        status: "error",
                        code: err,
                    };
                });
        }
    }
    public async doApplyAuditData(): Promise<StandardResponse> {
        const service = this;
        const formData = this.req.body;
        const empId = this.employeeId;

        if (formData.id) {
            await this.processAttachFileInAuditData(formData.auditData, formData.id);
            return await this.createNextAuditRecordData(empId, formData, EnumConst.AuditRecordStatus.DetailStatus.PASS)
                .then((arData) => {
                    // Transaction has been committed
                    return <StandardResponse>{
                        status: "ok",
                        result: {
                            id: arData.id,
                            formId: arData.formId,
                        },
                        code: "",
                    };
                })
                .catch((err) => {
                    service.logger.error(err);
                    return <StandardResponse>{
                        status: "error",
                        code: err,
                    };
                });
        } else {
            return await this.createNewAuditRecordData(empId, formData)
                .then((arData) => {
                    return <StandardResponse>{
                        status: "ok",
                        result: {
                            id: arData.id,
                            formId: arData.formId,
                        },
                        code: "",
                    };
                })
                .catch((err) => {
                    service.logger.error(err);
                    return <StandardResponse>{
                        status: "error",
                        code: err,
                    };
                });
        }
    }
    public async saveAuditDraft(): Promise<StandardResponse> {
        const service = this;
        const { sequelize } = this.domainDBResource;
        const empId = this.employeeId;
        const formData = this.req.body;

        return await sequelize.transaction(async (transaction) => {
            try {
                if (formData.id) {
                    await this.processAttachFileInAuditData(formData.auditData, formData.id);
                    const arData = await AuditRecord.findOne({
                        where: { id: formData.id },
                        transaction,
                    });
                    if (arData) {
                        await arData.update(
                            {
                                auditData: formData.auditData,
                                formTag: formData.formTag,
                            },
                            { transaction }
                        );
                    }

                    const arDetail = await AuditRecordDetail.findOne({
                        where: {
                            auditRecordId: formData.id,
                            seqNo: 1,
                        },
                        transaction,
                    });
                    if (arDetail) {
                        await arDetail.update(
                            {
                                auditData: formData.auditData,
                                remark: formData.remark,
                            },
                            { transaction: transaction }
                        );
                    }
                    return <StandardResponse>{
                        status: "ok",
                        result: {
                            id: arData.id,
                            formId: arData.formId,
                        },
                        code: "",
                    };
                } else {
                    const formRoute = await FormRoute.findOne({
                        where: {
                            formId: formData.formId,
                        },
                        transaction,
                    });

                    const arData = await AuditRecord.create(
                        {
                            formId: formRoute.formId,
                            routeId: formRoute.routeId,
                            formTag: formData.formTag,
                            status: 0, //draft
                            actionType: formData.actionType,
                            auditData: formData.auditData,
                            createUser: empId,
                            updateUser: empId,
                            arDetail: [
                                {
                                    stageNo: 0,
                                    routeId: formRoute.routeId,
                                    auditorId: empId,
                                    status: 0,
                                    seqNo: 1,
                                    auditData: formData.auditData,
                                    remark: formData.remark,
                                    createUser: empId,
                                    updateUser: empId,
                                },
                            ],
                        },
                        {
                            include: [
                                {
                                    association: AuditRecord.associations.arDetail,
                                },
                            ],
                            transaction,
                        }
                    );
                    await this.processAttachFileInAuditData(formData.auditData, arData.id);
                    await arData.update({ auditData: formData.auditData }, { transaction });
                    await AuditRecordDetail.update(
                        { auditData: formData.auditData },
                        {
                            transaction,
                            where: {
                                auditRecordId: arData.id,
                            },
                        }
                    );
                    return <StandardResponse>{
                        status: "ok",
                        result: {
                            id: arData.id,
                            formId: arData.formId,
                        },
                        code: "",
                    };
                }
            } catch (err) {
                service.logger.error(err);
                return <StandardResponse>{
                    status: "error",
                    code: ErrorDef.AuditFail,
                };
            }
        });
    }

    async getNextStageAuditor(empId: number, routeId: number, stageNo: number): Promise<NextStageAuditor> {
        // find next route stage
        const results = await RouteDetail.findAll({
            where: {
                routeId: routeId,
                //stageNo: stageNo,
            },
        });
        if (results) {
            const count = results.length;
            let auditorId;

            const tempData = results.filter((detail) => detail.stageNo === stageNo);

            if (tempData.length > 0) {
                const routeDetail = tempData[0];

                let auditDept = routeDetail.deptId;

                switch (routeDetail.auditType) {
                    case EnumConst.AuditType.BYDEPTANDGRADE:
                        if (!auditDept) {
                            // self dept
                            // 1. find self info
                            const selfWorkPosData = await this.employeeService.getLatestDeptWorkposDataById(empId);
                            // 2. get self dept
                            auditDept = selfWorkPosData.depart;
                        }

                        // find auditor
                        auditorId = await this.employeeService
                            .getEmployeeByDepartWorkpos(empId, auditDept, routeDetail.gradeId)
                            .then((result) => {
                                if (result) {
                                    return result.id;
                                } else {
                                    return null;
                                }
                            });

                        break;
                    case EnumConst.AuditType.BYEMP:
                        auditorId = routeDetail.auditorId;

                        break;
                    default:
                }
                return <NextStageAuditor>{
                    routeDetailCount: count,
                    auditorId: auditorId,
                };
            } else {
                return <NextStageAuditor>{
                    routeDetailCount: count,
                    auditorId: null,
                };
            }
        } else {
            return <NextStageAuditor>{
                routeDetailCount: 0,
                auditorId: null,
            };
        }
    }

    async createNewAuditRecordData(empId: number, formData: any): Promise<any> {
        const service = this;
        const { sequelize } = this.domainDBResource;
        const formRoute = await FormRoute.findOne({
            where: {
                formId: formData.formId,
            },
        }).then((result) => {
            return result;
        });
        if (formRoute === null) {
            throw ErrorDef.FormRouteNotSet;
        }
        // find auditorId of stage 1
        const { auditorId } = await this.getNextStageAuditor(empId, formRoute.routeId, 1);

        return await sequelize
            .transaction(async (transaction) => {
                const newData = {
                    formId: formRoute.formId,
                    routeId: formRoute.routeId,
                    formTag: formData.formTag,
                    actionType: formData.actionType,
                    status: EnumConst.AuditRecordStatus.MainStatus.ONGOING,
                    auditData: formData.auditData,
                    createUser: empId,
                    updateUser: empId,
                    arDetail: [
                        {
                            stageNo: 0,
                            routeId: formRoute.routeId,
                            auditorId: empId,
                            status: EnumConst.AuditRecordStatus.DetailStatus.PASS,
                            seqNo: 1,
                            auditData: formData.auditData,
                            remark: formData.remark,
                            createUser: empId,
                            updateUser: empId,
                        },
                    ],
                };
                if (auditorId != null) {
                    const newDetail = {
                        stageNo: 1,
                        routeId: formRoute.routeId,
                        auditorId: auditorId,
                        status: EnumConst.AuditRecordStatus.DetailStatus.PENDING,
                        seqNo: 2,
                        remark: null,
                        auditData: formData.auditData,
                        createUser: empId,
                        updateUser: empId,
                    };
                    newData.arDetail.push(newDetail);
                }
                let arData = await AuditRecord.create(newData, {
                    include: [
                        {
                            association: AuditRecord.associations.arDetail,
                        },
                    ],
                    transaction,
                });
                const newAuditDataWithNewFilePath = {
                    ...arData.auditData,
                };
                await service.processAttachFileInAuditData(newAuditDataWithNewFilePath, arData.id);
                arData = await arData.update({ auditData: newAuditDataWithNewFilePath }, { transaction });
                await AuditRecordDetail.update(
                    { auditData: arData.auditData },
                    {
                        transaction,
                        where: {
                            auditRecordId: arData.id,
                        },
                    }
                );
                return arData;
            })
            .then(async (result) => {
                if (auditorId === null) {
                    return await service.createNextAuditRecordData(
                        empId,
                        result,
                        EnumConst.AuditRecordStatus.DetailStatus.PASS
                    );
                } else {
                    service.mailNextAuditor(result, auditorId, result.createUser);
                    return result;
                }
            })
            .catch((err) => {
                // Transaction has been rolled back
                console.log(`err:${err}`);
                throw err;
            });
    }
    async createNextAuditRecordData(empId: number, formData: any, actionStatus: number): Promise<any> {
        const service = this;
        const { sequelize } = this.domainDBResource;
        let updateMainStatus;

        switch (actionStatus) {
            case EnumConst.AuditRecordStatus.DetailStatus.REJECT:
                updateMainStatus = EnumConst.AuditRecordStatus.MainStatus.REJECT;
                break;
            default:
                updateMainStatus = EnumConst.AuditRecordStatus.MainStatus.ONGOING;
        }

        return await sequelize
            .transaction(async (t) => {
                // 1.update main record data
                const arData = await AuditRecord.findOne({
                    where: { id: formData.id },
                    transaction: t,
                });
                if (arData) {
                    await arData.update(
                        {
                            auditData: formData.auditData,
                            formTag: formData.formTag,
                            status: updateMainStatus,
                            viewed: false,
                        },
                        { transaction: t }
                    );
                }

                // 2.update latest detail record data
                const arDetails = await AuditRecordDetail.findAll({
                    where: {
                        auditRecordId: formData.id,
                    },
                    order: [["seqNo", "DESC"]],
                    transaction: t,
                });
                if (arDetails) {
                    const updateData = {
                        auditData: formData.auditData,
                        remark: formData.remark,
                        status: actionStatus,
                        deputyId: null,
                    };

                    if (arDetails[0].auditorId !== empId) {
                        const canDeputy = await service
                            .getDeputyData(empId, arDetails[0].auditorId)
                            .then((deputyIds) => {
                                return deputyIds.length > 0;
                            });
                        if (canDeputy) {
                            updateData.deputyId = empId;
                        } else {
                            throw "DEPUTY-001";
                        }
                    }

                    await arDetails[0].update(updateData, { transaction: t });
                }

                // 3.create next audit_record_detail if needed
                const auditUserStatus = {
                    auditorId: null,
                    tempMainStatus: null,
                };
                if (actionStatus !== EnumConst.AuditRecordStatus.DetailStatus.REJECT) {
                    const { newStageNo, newMainStatus } = service.nextStageNoAndStatus(actionStatus, arDetails);

                    // 3.1.find auditorId
                    const { routeDetailCount, auditorId } = await service.getNextStageAuditorByStageNo(
                        actionStatus,
                        arDetails,
                        empId,
                        newStageNo
                    );
                    // 3.2.create next audit_record_detail
                    let tempMainStatus = newMainStatus;

                    if (auditorId) {
                        await AuditRecordDetail.create(
                            {
                                auditRecordId: arDetails[0].auditRecordId,
                                stageNo: newStageNo,
                                seqNo: arDetails[0].seqNo + 1,
                                routeId: arDetails[0].routeId,
                                auditorId: auditorId, // next Auditor
                                status: EnumConst.AuditRecordStatus.DetailStatus.PENDING,
                                createUser: empId,
                                updateUser: empId,
                            },
                            { transaction: t }
                        );
                    } else {
                        if (routeDetailCount) {
                            // can't find stage data, it means no more stage, the end of route
                            tempMainStatus = EnumConst.AuditRecordStatus.MainStatus.DONE;
                        }
                    }
                    auditUserStatus.auditorId = auditorId;
                    auditUserStatus.tempMainStatus = tempMainStatus;

                    if (tempMainStatus !== undefined) {
                        if (arData) {
                            await arData.update(
                                {
                                    status: tempMainStatus,
                                    updateUser: empId,
                                },
                                { transaction: t }
                            );
                            // .then((result) => {
                            //     return result;
                            // });
                        }
                    }
                    if (tempMainStatus === EnumConst.AuditRecordStatus.MainStatus.DONE) {
                        // do insert data to databse;
                        if (formData.actionType === 0 || formData.actionType === 1) {
                            await service.processForm(formData, empId, t);
                        } else if (formData.actionType === 2) {
                            await service.processFormDelete(formData, empId, t);
                        } else {
                            throw ErrorDef.ACTION_TYPE_INVALID;
                        }
                    }
                } else {
                    auditUserStatus.tempMainStatus = EnumConst.AuditRecordStatus.MainStatus.REJECT;
                }
                return {
                    actionStatus,
                    ...auditUserStatus,
                    arData,
                };
            })
            .then(async (result) => {
                if (result.tempMainStatus === EnumConst.AuditRecordStatus.MainStatus.DONE) {
                    // finish, send email to first audit user;
                    service.mailNextAuditorDone(formData, result.arData.createUser);
                } else {
                    if (result.tempMainStatus === EnumConst.AuditRecordStatus.MainStatus.REJECT) {
                        // rejected, send email to first audit user;
                        service.mailNextAuditorReject(formData, result.arData.createUser);
                    } else if (result.actionStatus === EnumConst.AuditRecordStatus.DetailStatus.RETURN) {
                        // send email to pre audit user
                        service.mailNextAuditorReturn(formData, this.employeeId);
                    } else {
                        // send email to next audit user
                        service.mailNextAuditor(formData, result.auditorId, result.arData.createUser);
                    }
                }
                return result.arData;
            })
            .catch((err) => {
                // Transaction has been rolled back
                console.log(`err:${err}`);
                throw err;
            });
    }
    private async mailNextAuditorDone(formData, createUser) {
        const employee = await Employee.findOne({ attributes: ["email"], where: { id: createUser } });
        const url = `${process.env.APP_URL}/#/audit/${formData.formId}/${formData.id}`;
        sendSampleMail(
            [employee.email],
            this.i18n("audit.done.title", {}),
            this.i18n("audit.done.content", { url }),
            "html"
        );
        this.messageService.createMessage(
            employee.email,
            JSON.stringify({ formId: formData.formId, formData: formData.id }),
            "auditApproved",
            `/audit/${formData.formId}/${formData.id}`
        );
    }
    private async mailNextAuditorReject(formData, createUser) {
        const employee = await Employee.findOne({ attributes: ["email"], where: { id: createUser } });
        const url = `${process.env.APP_URL}/#/audit/${formData.formId}/${formData.id}`;
        sendSampleMail(
            [employee.email],
            this.i18n("audit.reject.title", {}),
            this.i18n("audit.reject.content", { url }),
            "html"
        );
        this.messageService.createMessage(
            employee.email,
            JSON.stringify({ formId: formData.formId, formData: formData.id }),
            "auditRejust",
            `/audit/${formData.formId}/${formData.id}`
        );
    }
    private async mailNextAuditorReturn(formData, auditorId) {
        const deputyIds = await this.getAuthDeputyData(auditorId);
        const employeeMails = await Employee.findAll({
            attributes: ["email"],
            where: { id: { [Op.in]: [auditorId, ...deputyIds] } },
        }).then((results) => {
            return results.map((a) => a.email);
        });

        const url = `${process.env.APP_URL}/#/audit/${formData.formId}/${formData.id}`;
        sendSampleMail(
            employeeMails,
            this.i18n("audit.return.title", {}),
            this.i18n("audit.return.content", { url }),
            "html"
        );
        const messageService = this.messageService;
        employeeMails.forEach((mail) => {
            messageService.createMessage(
                mail,
                JSON.stringify({ formId: formData.formId, formData: formData.id }),
                "auditReturn",
                `/audit/${formData.formId}/${formData.id}`
            );
        });
    }
    private async mailNextAuditor(formData, auditorId, createUser) {
        const deputyIds = await this.getAuthDeputyData(auditorId);
        const employeeMails = await Employee.findAll({
            attributes: ["email"],
            where: { id: { [Op.in]: [auditorId, ...deputyIds] } },
        }).then((results) => {
            return results.map((a) => a.email);
        });
        const url = `${process.env.APP_URL}/#/audit/${formData.formId}/${formData.id}`;
        sendSampleMail(
            employeeMails,
            this.i18n("audit.pass.title", {}),
            this.i18n("audit.pass.content", { url }),
            "html"
        );
        const messageService = this.messageService;
        employeeMails.forEach((mail) => {
            messageService.createMessage(
                mail,
                JSON.stringify({ formId: formData.formId, formData: formData.id, auditorId, createUser }),
                "auditAwait",
                `/audit/${formData.formId}/${formData.id}`
            );
        });
    }
    private nextStageNoAndStatus(actStatus: number, arDetails: any[]): NextStageNoAndStatus {
        let newStageNo;
        let newMainStatus;

        switch (actStatus) {
            case EnumConst.AuditRecordStatus.DetailStatus.RETURN:
                if (arDetails.length > 1) {
                    newStageNo = arDetails[1].stageNo;

                    if (newStageNo === 0) {
                        newMainStatus = EnumConst.AuditRecordStatus.MainStatus.DRAFT;
                    }
                }

                break;
            default:
                newStageNo = arDetails[0].stageNo + 1;
        }

        return <NextStageNoAndStatus>{
            newStageNo: newStageNo,
            newMainStatus: newMainStatus,
        };
    }
    private async getNextStageAuditorByStageNo(
        actStatus: number,
        arDetails: any[],
        empId: number,
        newStageNo: number
    ): Promise<NextStageAuditor> {
        const service = this;
        if (actStatus === EnumConst.AuditRecordStatus.DetailStatus.RETURN) {
            return <NextStageAuditor>{
                routeDetailCount: undefined,
                auditorId: arDetails.length > 1 ? arDetails[1].auditorId : undefined,
            };
        } else {
            return service.getNextStageAuditor(empId, arDetails[0].routeId, newStageNo);
        }
    }
}
type NextStageNoAndStatus = {
    newStageNo: number;
    newMainStatus: any;
};
export default AuditService;
