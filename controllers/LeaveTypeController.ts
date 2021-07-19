import express from "express";
import { query, check, validationResult } from "express-validator";
import LeaveTypeService, { sortable } from "../services/LeaveTypeService";
import { createOrder } from "../helpers/dbHelper";
import { ErrorDef } from "../wf_common";
import handleErrorAsync from "./handleErrorAsync";

const router = express.Router();

router.get(
    "/all",
    handleErrorAsync(async (req, res) => {
        const results = await new LeaveTypeService(req).getAll();
        res.json(results);
    })
);

router.get(
    "/",
    [query("order").isIn([null, "", ...sortable]), query("orderDir").isIn([null, "", "asc", "desc"])],
    handleErrorAsync(async (req, res) => {
        const order = createOrder(req, [["id", "asc"]]);
        const results = await new LeaveTypeService(req).getList(req.query.str as string, req.query.filter as string[], {
            order: order,
        });
        res.json({ count: results.count, data: results.rows });
    })
);

router.get(
    "/:id([0-9]{1,11})",
    handleErrorAsync(async (req, res) => {
        const service = new LeaveTypeService(req);
        const data = await service.getData(Number(req.params.id));
        res.json(data);
    })
);
//insert
router.post(
    "/",
    [
        check("name").not().isEmpty(),
        //check("repetition").isJSON(),
        //check("seniorityCond").isJSON(),
        //check("seniorityAddition").isJSON(),
    ],
    handleErrorAsync(function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const service = new LeaveTypeService(req);
        service
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
    [
        check("id").isInt({ min: 0 }),
        check("name").not().isEmpty(),
        //check("repetition").isJSON(),
        //check("seniorityCond").isJSON(),
        //check("seniorityAddition").isJSON(),
    ],
    handleErrorAsync(function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const service = new LeaveTypeService(req);
        service.updateData(req.body).then((model) => {
            res.send({ status: "ok", result: model });
        });
    })
);

//delete
router.delete(
    "/:id",
    handleErrorAsync(function (req, res) {
        const id = Number(req.params.id);
        const service = new LeaveTypeService(req);
        service.deleteData(id).then((model) => {
            res.send({ status: "ok", result: model });
        });
    })
);

export = router;
