import express from "express";
import { check, query, validationResult } from "express-validator";
import { createOrder } from "../helpers/dbHelper";
import { ErrorDef } from "../wf_common";
import handleErrorAsync from "./handleErrorAsync";
import WorklevelService from "../services/WorklevelService";

const router = express.Router();

router.get(
    "/all",
    handleErrorAsync(async function (req, res) {
        const results = await new WorklevelService(req).getAll();
        res.json(results);
    })
);

router.get(
    "/",
    [query("order").isIn([null, "", "id", "name", "cost"]), query("orderDir").isIn([null, "", "asc", "desc"])],
    handleErrorAsync(async function (req, res) {
        const order = createOrder(req, [["name", "asc"]]);
        const results = await new WorklevelService(req).getList(order);
        res.json({ count: results.count, data: results.rows });
    })
);

router.get(
    "/:id([0-9]{1,11})",
    handleErrorAsync(async (req, res) => {
        const id = Number(req.params.id);
        const result = await new WorklevelService(req).getData(id);
        if (result === null) {
            return res.send({
                status: "error",
                code: ErrorDef.DataNotFound,
            });
        }
        res.json(result);
    })
);

//insert
router.post(
    "/",
    [check("name").not().isEmpty(), check("cost").isInt({ min: 0 }).not().isEmpty()],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        await new WorklevelService(req)
            .createData(req.body)
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
    "/",
    [check("id").isInt({ min: 1 }), check("name").not().isEmpty(), check("cost").isInt({ min: 0 }).not().isEmpty()],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        await new WorklevelService(req)
            .updateData(req.body)
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

//delete
router.delete(
    "/:id([0-9]{1,11})",
    handleErrorAsync(async function (req, res) {
        const id = Number(req.params.id);
        await new WorklevelService(req)
            .deleteData(id)
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
