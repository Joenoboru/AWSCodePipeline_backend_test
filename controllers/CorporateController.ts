import express, { Request } from "express";
import { query, check, validationResult } from "express-validator";
import { ParamsDictionary } from "express-serve-static-core";
import { createOrder } from "../helpers/dbHelper";
import CorporateService, { sortable } from "../services/CorporateService";
import handleErrorAsync from "./handleErrorAsync";
import { ListQueryParams } from "../types/queryTypes";
import { ErrorDef } from "../wf_common";

const router = express.Router();
router.get(
    "/list",
    [query("order").isIn([null, ""].concat(sortable)), query("orderDir").isIn([null, "", "asc", "desc"])],
    handleErrorAsync(async function (req: Request<ParamsDictionary, any, any, ListQueryParams>, res) {
        const order = createOrder(req);
        const results = await new CorporateService(req).getCorporateList(req.query.str, req.query.filter, order);
        res.json({ count: results.count, data: results.rows });
    })
);

router.get(
    "/all",
    handleErrorAsync(async function (req, res) {
        const results = await new CorporateService(req).getCorporateAll();
        res.json(results);
    })
);

router.get(
    "/picker",
    handleErrorAsync(async function (req: Request<ParamsDictionary, any, any, ListQueryParams>, res) {
        const results = await new CorporateService(req).getCorporatePickerData(req.query.str, req.query.filter);
        res.json(results);
    })
);

router.get(
    "/:id([0-9]{1,11})",
    handleErrorAsync(async function (req, res) {
        const id = req.params.id;
        const result = await new CorporateService(req).getCorporate(Number(id));
        if (result === null) {
            return res.send({
                status: "error",
                code: ErrorDef.DataNotFound,
            });
        }
        res.json(result);
    })
);

router.post(
    "",
    [
        check("name").not().isEmpty().trim(),
        check("jpName").not().isEmpty().trim(),
        check("enName").not().isEmpty().trim(),
        check("businessScope").trim(),
        check("site").if(check("site").not().isEmpty()).isURL(),
    ],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        await new CorporateService(req)
            .createCorporate(req.body)
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);

router.put(
    "",
    [
        check("id").isInt({ min: 1 }),
        check("name").not().isEmpty().trim(),
        check("jpName").not().isEmpty().trim(),
        check("enName").not().isEmpty().trim(),
        check("businessScope").trim(),
        check("site").if(check("site").not().isEmpty()).isURL(),
    ],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        await new CorporateService(req)
            .updateCorporate(req.body)
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                if (error && error === ErrorDef.DataNotFound) {
                    res.send({ status: "error", code: ErrorDef.DataNotFound, error: error });
                } else {
                    res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
                }
            });
    })
);

export = router;
