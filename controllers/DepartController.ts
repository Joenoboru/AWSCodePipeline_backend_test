import express, { Request, Response } from "express";
import { query, check, validationResult } from "express-validator";
import { ParamsDictionary } from "express-serve-static-core";
import handleErrorAsync from "./handleErrorAsync";
import { ListQueryParams } from "../types/queryTypes";
import { ErrorDef } from "../wf_common";
import DepartService from "../services/DepartService";

const router = express.Router();

router.get(
    "/all",
    handleErrorAsync(async function (req, res) {
        const result = await new DepartService(req).getAll();
        res.json(result);
    })
);

router.get(
    "/",
    [query("order").isIn([null, "", "id", "name", "chname"]), query("orderDir").isIn([null, "", "asc", "desc"])],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        let order = req.query.order;
        const orderDir = req.query.orderDir;
        if (!errors.isEmpty()) {
            order = null;
        }
        let orderData = [];
        if (order) {
            orderData = [[order, orderDir]];
        }
        const result = await new DepartService(req).getList(orderData);
        res.json(result);
    })
);

router.get(
    "/corp/:id([0-9]{1,11})",
    [query("order").isIn([null, "", "id", "name", "chname"]), query("orderDir").isIn([null, "", "asc", "desc"])],
    async function (req: Request<ParamsDictionary, any, any, ListQueryParams>, res: Response) {
        const errors = validationResult(req);
        const id = req.params.id;
        let order = req.query.order;
        const orderDir = req.query.orderDir;
        if (!errors.isEmpty()) {
            order = null;
        }
        let orderData = [];
        if (order) {
            orderData = [[order, orderDir]];
        }
        const result = await new DepartService(req).getCorpList(Number(id), orderData, req.query.str, req.query.filter);
        res.json(result);
    }
);

router.get(
    "/corp/all/:id([0-9]{1,11})",
    handleErrorAsync(async function (req, res) {
        const id = req.params.id;
        const result = await new DepartService(req).getAllCorp(Number(id));
        res.json(result);
    })
);

router.get(
    "/:id([0-9]{1,11})",
    handleErrorAsync(async function (req, res) {
        const id = req.params.id;
        const result = await new DepartService(req).getOne(Number(id));
        res.json(result);
    })
);

router.get(
    "/aps/:corpId([0-9]{1,11})/:depId([0-9]{1,11})",
    handleErrorAsync(async function (req, res) {
        const corpId = req.params.corpId;
        const depId = req.params.depId;
        const result = await new DepartService(req).getAps(Number(corpId), Number(depId));
        res.json(result);
    })
);

//insert
router.post(
    "/",
    [
        check("corp").isInt({ min: 0 }).not().isEmpty(),
        check("status").toBoolean(),
        check("name").not().isEmpty(),
        check("chname").not().isEmpty(),
    ],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({
                status: "error",
                code: ErrorDef.formInvalid,
                errors: errors.array(),
            });
        }
        const result = await new DepartService(req).createDepartment(req.body);
        res.json(result);
    })
);

//update
router.put(
    "/",
    [
        check("id").isInt({ min: 1 }),
        check("corp").isInt({ min: 0 }).not().isEmpty(),
        check("status").toBoolean(),
        check("name").not().isEmpty(),
        check("chname").not().isEmpty(),
    ],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({
                status: "error",
                code: ErrorDef.formInvalid,
                errors: errors.array(),
            });
        }
        const result = await new DepartService(req).updateDepartment(req.body.id, req.body);
        res.json(result);
    })
);

//delete
router.delete(
    "/:id",
    handleErrorAsync(async function (req, res) {
        const id = req.params.id;
        const result = await new DepartService(req).deleteDepartment(Number(id));
        res.json(result);
    })
);

//org
router.get(
    "/org/:id([0-9]{1,11})",
    [query("showAll").toBoolean()],
    handleErrorAsync(async function (req, res) {
        const id = req.params.id;
        const isShowAll = req.query.showAll;
        // console.log(!isShowAll && 1);
        const result = await new DepartService(req).getOrg(Number(id), !!isShowAll);
        res.json(result);
    })
);

export = router;
