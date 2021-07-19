import express from "express";
import { check, query, validationResult } from "express-validator";
import WorkPositionService, { sortable } from "../services/WorkPositionService";
import { createOrder } from "../helpers/dbHelper";
import { ErrorDef } from "../wf_common";
import handleErrorAsync from "./handleErrorAsync";

const router = express.Router();

router.get(
    "/all",
    handleErrorAsync(async function (req, res) {
        const results = await new WorkPositionService(req).getWorkPositionAll();
        res.json(results);
    })
);

router.get(
    "",
    [query("order").isIn([null, ""].concat(sortable)), query("orderDir").isIn([null, "", "asc", "desc"])],
    handleErrorAsync(async function (req, res) {
        const order = createOrder(req);
        const results = await new WorkPositionService(req).getWorkPositionList({ order: order });
        res.json({ count: results.count, data: results.rows });
    })
);

//insert
router.post(
    "",
    [check("name").not().isEmpty(), check("jpName").not().isEmpty(), check("enName").not().isEmpty()],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        await new WorkPositionService(req)
            .createWorkPosition(req.body)
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);

//update
router.put(
    "",
    [check("id").isInt({ min: 1 }), check("name").not().isEmpty(), check("jpName").not().isEmpty(), check("enName").not().isEmpty()],
    async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        await new WorkPositionService(req)
            .updateWorkPosition(req.body)
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
    }
);

//delete
router.delete(
    "",
    handleErrorAsync(async function (req, res) {
        let id = 0;
        if ("data" in req.body && "id" in req.body.data) {
            id = req.body.data.id;
        }
        await new WorkPositionService(req)
            .deleteWorkPosition(id)
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
