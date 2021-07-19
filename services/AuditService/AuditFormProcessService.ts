import { Request } from "express";
import AuditQueryDataService from "./AuditQueryDataService";
import SalarydefServie from "../SalarydefService";
import InterviewService from "../InterviewService";
import LeaveHourService from "../LeaveHourService";
import EmpProcessService from "../EmployeeService/ProcessService";
import CustomerProcessService from "../CustomerService/ProcessService";
import ProjectProcessService from "../ProjectService";
//import BusinessTripService from "../BusinessTripService";
import RaService from "../RaService";
import RaTransferService from "../RaTransferService";
import OpeService from "../OpeService";
import ExtrahoursreqService from "../ExtrahoursreqService";
import "module-alias/register";
import { Form } from "@/domain-resource/ts-models";
import { ErrorDef } from "@/wf_common";
class AuditFormProcessService extends AuditQueryDataService {
    constructor(req: Request) {
        super(req);
    }
    async getFormTag(formId: number): Promise<string> {
        const formTag = await Form.findOne({
            attributes: ["formTag"],
            where: { id: formId },
        }).then((results) => {
            return results.formTag;
        });
        return formTag;
    }

    async processForm(formData: any, updateUser, transaction): Promise<any> {
        const formId = formData.formId;
        const data = { ...formData.auditData };
        const auditId = formData.id;
        try {
            const formTag = await this.getFormTag(formId);
            if (formTag === "customer") {
                const service = new CustomerProcessService(this.req);
                await service.updateAuditCustomer(data);
            } else if (formTag === "salary") {
                const service = new SalarydefServie(this.req);
                await service.updateSalaryDef(data.workLevel, data.def, data.employeeId);
            } else if (formTag === "employee") {
                const service = new EmpProcessService(this.req);
                await service.updateEmployeeBaseInfo(data);
            } else if (formTag === "workposition") {
                const service = new EmpProcessService(this.req);
                await service.updateEmployeeWorkposition(data);
            } else if (formTag === "attendance") {
                const service = new EmpProcessService(this.req);
                await service.updateEmployeeWeekAttendances(data);
            } else if (formTag === "new_employee") {
                const service = new EmpProcessService(this.req);
                await service.createNewEmployee(data);
            } else if (formTag === "project") {
                const service = new ProjectProcessService(this.req);
                if (data.id) {
                    await service.updateData(data);
                } else {
                    await service.createData(data);
                }
            } else if (formTag === "leavereq") {
                const service = new LeaveHourService(this.req);
                await service.addLeaveReqs(data);
            } else if (formTag === "interview") {
                const service = new InterviewService(this.req);
                if (data.id) {
                    await service.updateIntervieweeByData(data);
                } else {
                    await service.insertIntervieweeByData(data);
                }
            } else if (formTag === "ope") {
                const service = new OpeService(this.req);
                const mData = { ...data };
                delete mData.attachFiles;
                await service.createOrUpdateData(mData, Number(auditId));
            /*} else if (formTag === "business_trip") {
                const service = new BusinessTripService(this.req);
                await service.processData(data, updateUser);*/
            } else if (formTag === "ra_data") {
                const service = new RaService(this.req);
                const mData = { ...data };
                delete mData.attachFiles;
                await service.createOrUpdateData(mData, Number(auditId));
            } else if (formTag === "ra_transfer") {
                const service = new RaTransferService(this.req);
                const mData = { ...data };
                delete mData.attachFiles;
                await service.createOrUpdateData(mData, Number(auditId));
            } else if (formTag === "extrahoursreq") {
                const service = new ExtrahoursreqService(this.req);
                await service.processData(data);
            } else {
                throw ErrorDef.FormNotFound;
            }
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async processFormDelete(formData, updateUser, transaction): Promise<any> {
        const formId = formData.formId;
        const data = formData.auditData;
        try {
            const formTag = await this.getFormTag(formId);
            if (formTag === "ope") {
                //const service = new ADCancelProcessService(this.req, updateUser);
                //await service.processOPE(data);
            } else if (formTag === "business_trip") {
                //const service = new BusinessTripService(this.req);
                //await service.processCancel(data, updateUser);
            } else {
                throw ErrorDef.FormNotFound;
            }
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }
}

export default AuditFormProcessService;
