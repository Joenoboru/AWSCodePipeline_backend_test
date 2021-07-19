import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { validationResult } from "express-validator";
import "module-alias/register";
import { Project, ProjectAccount } from "@/domain-resource/ts-models";
import { ListQueryParams } from "@/types/queryTypes";
import {
    createWhereFormSearchable,
    createWhereFormFilter,    
    createQueryList,
    createQueryAll,
} from "@/helpers/dbHelper";
import { ErrorDef } from "@/wf_common";
import BaseService from "../BaseService";
import { sortable, searchable, orderDateField } from "./fieldSetting";

class QueryService extends BaseService {
    constructor(req: Request) {
        super(req);
    }
    async getPicker(req: Request<ParamsDictionary, any, any, ListQueryParams>, res: Response): Promise<void> {
        const whereSearch = createWhereFormSearchable(searchable, req.query.str);
        const whereFilter = createWhereFormFilter(sortable, req.query.filter);
        const where = { ...whereSearch, ...whereFilter, selectable: true };
        const results = await Project.findAll({
            attributes: ["id", "name", "customer", "orderYear", "orderMonth", "status"],
            where: where,
        });
        res.json(results);
    }

    async getAll(req: Request, res: Response): Promise<void> {
        const results = await createQueryAll(Project, ["id", "name"]);
        res.json(results);
    }

    async getList(req: Request<ParamsDictionary, any, any, ListQueryParams>, res: Response): Promise<void> {
        const errors = validationResult(req);
        let order = req.query.order;
        const orderDir = req.query.orderDir;
        if (!errors.isEmpty()) {
            order = null;
        }
        let orderData = [];
        if (order) {
            if (order === "orderDate") {
                orderData = [[orderDateField[0], orderDir]];
            } else {
                orderData = [[order, orderDir]];
            }
        }
        const results = await createQueryList(
            Project,
            [...sortable, orderDateField] as any,
            this.page,
            orderData,
            { searchable, str: req.query.str },
            { filterable: sortable, filter: req.query.filter }
        );
        res.json({
            count: results.count,
            data: results.rows,
        });
    }
    async getData(req: Request, res: Response): Promise<void> {        
        const id = req.params.id;
        Project.findOne({
            where: {
                id: id,
            },
            include: [
                {
                    model: ProjectAccount,
                    attributes: ["title", "amount", "rmk"],
                },
            ],
        }).then((result) => {
            if (result === null) {
                return res.send({
                    status: "error",
                    code: ErrorDef.DataNotFound,
                });
            }
            res.json(result);
        });
    }
}

export default QueryService;
