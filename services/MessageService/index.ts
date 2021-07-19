import { Op, FindOptions } from "sequelize";
import { Request } from "express";
import "module-alias/register";
import { Message } from "@/domain-resource/ts-models";
import { createWhereFormSearchable, createWhereFormFilter } from "@/helpers/dbHelper";
import { StdQueryListResult, QueryListResult } from "@/types/queryTypes";
import { publish } from "@/socketio";
import BaseService from "../BaseService";

const sortable = ["id", "contents", "type", "msgkey", "isRead", "createdAt"];
//const fillable = ["email", "contents", "type", "link", "isRead"];

class MessageService extends BaseService {
    constructor(req: Request) {
        super(req);
    }

    async getUnreadByMail(mail: string): Promise<StdQueryListResult<Message>> {
        const pageLimit = 20;
        const data = await Message.findAll({
            attributes: [...sortable, "link"],
            where: { email: mail },
            offset: 0,
            limit: pageLimit,
            order: [["createdAt", "desc"]],
        });
        const countWhere = {
            attributes: [...sortable, "link"],
            where: { email: mail, isRead: false },
            order: [["createdAt", "desc"]],
        };
        if (data.length > 0) {
            const firstId = data[data.length - 1].id;
            countWhere.where["id"] = { [Op.lt]: firstId };
        }
        const count = await Message.count(countWhere);
        return { count, data };
    }

    async getListDataByMail(
        mail: string,
        str?: string,
        filter?: string[],
        options?: FindOptions<any>
    ): Promise<QueryListResult<Message>> {
        const whereSearch = createWhereFormSearchable(["contents"], str);
        const whereFilter = createWhereFormFilter(sortable, filter, null, ["isRead"]);
        const where = { ...whereSearch, ...whereFilter, email: mail };
        const result = await Message.findAndCountAll({
            attributes: [...sortable, "link"],
            offset: this.page.offset,
            limit: this.page.limit,
            where: where,
            ...options,
        });
        return result;
    }

    async updateIsReadById(id: number): Promise<Message> {
        return await Message.findOne({
            where: {
                id: id,
            },
        }).then(async (model) => {
            model.isRead = true;
            await model.save();
            return model;
        });
    }

    /*async function update(data) {
    Message.findOne({
        where: {
            id: data.id,
        },
    }).then(async (model) => {
        await model.update(data, { fields: fillable });
    });
    }*/

    async deleteData(id: number): Promise<Message> {
        return await Message.findOne({
            where: {
                id: id,
            },
        }).then(async (model) => {
            return await model.destroy().then(() => {
                return model;
            });
        });
    }
    /*async createData(data: Message): Promise<Message> {
        const mData = { ...data, isRead: false };
        const model = await Message.build(mData).save({ fields: fillable });
        return model;
    }*/

    async createMessage(email: string, contents: string, msgkey?: string, link?: string): Promise<Message> {
        const data = {
            email,
            contents,
            msgkey,
            link,
            type: msgkey ? 1 : 0,
            isRead: false,
        };
        publish({ email });
        const model = await Message.build(data).save();
        return model;
    }

    async read(id: number): Promise<Message> {
        return await Message.findOne({
            where: {
                id: id,
                isRead: false,
            },
        }).then(async (model) => {
            if (!model) {
                return null;
            }
            return await model.update({ isRead: true });
        });
    }
}
export { sortable };
export default MessageService;
