import { Request, Response } from "express";
import "module-alias/register";
import { Interviewee } from "@/domain-resource/ts-models";

import SalaryItemService from "../../services/SalaryItemService";
class InterviewService extends SalaryItemService {
    baseColumns = [
        "name",
        "nameKana",
        "sex",
        "birthday",
        "married",
        "fristVisitJPDate",
        "address",
        "tel",
        "mobile",
        "nearestStationLine",
        "nearestStation",
        "commuteTime",
        "jpLangLevel",
        "email",
        "remark",
        "utilizeExpRemark",
        "utilizeKnowledgeRemark",
        "utilizeSkillRemark",
        "isHired",
        "status",
        "createUser",
        "updateUser",
    ];
    constructor(req: Request) {
        super(req);
    }
    async getIntervieweeList(req: Request, res: Response): Promise<void> {
        const pageLimit = Number();
        Interviewee.findAll({
            //attributes: ["id", "name", "chname", "engname"],
        }).then((results) => {
            res.json({
                count: results.length,
                data: results,
                maxpage: Math.ceil(results.length / pageLimit),
            });
        });
    }

    async getIntervieweeById(req: Request, res: Response): Promise<void> {
        const id = req.params.id;

        Interviewee.findOne({
            where: {
                id: id,
            },
            //attributes: ['email', 'name']
        }).then(async (interviewee) => {
            if (interviewee) {
                const result = await this.dealUIData({ ...interviewee.toJSON() });
                res.json(result);
            }
        });
    }
    async getHiredInterviewee(req: Request, res: Response): Promise<void> {
        const service = this;

        const id = req.params.id;
        Interviewee.findOne({
            where: {
                id: id,
                isHired: "1",
            },
            //attributes: ['email', 'name']
        }).then(async (interviewee) => {
            if (interviewee) {
                const newemp = await service.dealUIData({ ...interviewee.toJSON() });
                const defSalaryItems = await service.getPartData();
                const def = defSalaryItems.map((a) => {
                    return {
                        item: a.id,
                        amount: a.default_amount,
                    };
                });
                const result = {
                    intervieweeId: id,
                    name: newemp.name,
                    engname: newemp.nameKana,
                    birthday: newemp.birthday,
                    sex: newemp.sex,
                    con_addr: newemp.address,
                    tel: newemp.tel,
                    mobile: newemp.mobile,
                    finaledu: "",
                    gradschool: "",
                    major: "",
                    workpos: [],
                    def: def,
                };
                if (newemp.educations.length > 0) {
                    const highest = newemp.educations[0];
                    result.finaledu = highest.degree;
                    result.gradschool = highest.school;
                    result.major = highest.department;
                }
                res.json(result);
            }
            //res.json({});
        });
    }
    async dealUIData(modelData: any): Promise<any> {
        if (modelData) {
            // commute_time
            if (modelData.commuteTimeHour) {
                modelData.commuteTimeHour = modelData.commuteTime.slice(0, 2);
                modelData.commuteTimeMin = modelData.commuteTime.slice(3, 5);
            }

            // jp_lang_level
            if (modelData.jpLangLevelList) {
                modelData.jpLangLevelList = await this.getCheckBoxArrayData(modelData.jpLangLevel, 4);
            }
        }

        return modelData;
    }

    async getCheckBoxArrayData(bitBufferValue: any[], bitLength: number): Promise<any[]> {
        const bitValue = bitBufferValue[0].toString(2).padStart(bitLength, "0");

        const valueArray = [];
        let i = bitValue.length;
        while (i--) {
            if (bitValue.charAt(i) === "1") {
                valueArray.push(i);
            }
        }

        return valueArray;
    }
    async saveInterviewee(req: Request, res: Response): Promise<void> {
        const formData = await this.dealUIData({ ...req.body });

        return await Interviewee.upsert(formData, { fields: this.baseColumns, returning: true })
            .then((result) => {
                res.json({
                    status: "ok",
                    result: {
                        result,
                    },
                    code: "",
                });
            })
            .catch((err) => {
                // Transaction has been rolled back
                console.log(`err:${err}`);
                throw err;
            });
    }
    async updateInterviewee(req: Request, res: Response): Promise<void> {
        const id = req.body.id;

        await this.updateByFormData(id, { ...req.body })
            .then((result) => {
                res.json({
                    status: "ok",
                    result: {
                        result,
                    },
                    code: "",
                });
            })
            .catch((err) => {
                // Transaction has been rolled back
                console.log(`err:${err}`);
                throw err;
            });
    }
    async updateByFormData(id: number, reqFormData: Interviewee): Promise<Interviewee> {
        const service = this;

        return await Interviewee.findOne({
            where: {
                id: id,
            },
        })
            .then(async (model) => {
                if (model) {
                    const updateFormData = await service.dealUIData({ ...reqFormData });

                    return await model
                        .update(updateFormData)
                        .then((result) => result)
                        .catch((err) => {
                            // Transaction has been rolled back
                            console.log(`err:${err}`);
                            throw err;
                        });
                }
            })
            .catch((err) => {
                // Transaction has been rolled back
                console.log(`err:${err}`);
                throw err;
            });
    }
    async insertInterviewee(req: Request, res: Response): Promise<void> {
        return await this.insertIntervieweeByData({ ...req.body })
            .then((result) => {
                res.json({
                    status: "ok",
                    result: {
                        id: result.id,
                    },
                    code: "",
                });
            })
            .catch((err) => {
                // Transaction has been rolled back
                console.log(`err:${err}`);
                throw err;
            });
    }
    async insertIntervieweeByData(reqFormData: Interviewee): Promise<Interviewee> {
        const formData = await this.dealUIData({ ...reqFormData });

        return await Interviewee.create(formData)
            .then((result) => result)
            .catch((err) => {
                // Transaction has been rolled back
                console.log(`err:${err}`);
                throw err;
            });
    }
    async updateIntervieweeByData(data: Interviewee): Promise<void> {
        const id = data.id;
        await this.updateByFormData(id, data);
    }
}

export default InterviewService;
