import { Request } from "express";
import BaseService from "../BaseService";
import "module-alias/register";
import { InterviewSkill } from "@/domain-resource/ts-models";
class InterviewskillService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    async getAll(type: number): Promise<InterviewSkill[]> {
        return await InterviewSkill.findAll({
            where: { type: type },
            attributes: ["id", "skillName", "skillType"],
        });
    }
}

export default InterviewskillService;
