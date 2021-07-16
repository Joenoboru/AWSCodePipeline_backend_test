import express from "express";
import { query, check, validationResult } from "express-validator";
import DeputyService, { sortable } from "../services/DeputyService";
import { createOrder } from "../helpers/dbHelper";
import handleErrorAsync from "./handleErrorAsync";
import { ErrorDef } from "../wf_common";
const router = express.Router();

router.get(
    "/",
    [query("order").isIn([null, ""].concat(sortable)), query("orderDir").isIn([null, "", "asc", "desc"])],
    handleErrorAsync(async function (req, res) {
        const oderData = createOrder(req);
        const service = new DeputyService(req);
        const results = await service.getDataByEmp(req.user.employeeId, {
            order: oderData,
            limit: Number(req.query.limit),
            offset: req.skip,
        });
        res.json({
            count: results.count,
            data: results.rows,
        });
    })
);

router.get(
    "/:id([0-9]{1,11})",
    handleErrorAsync(async function (req, res) {
        const id = Number(req.params.id);
        const service = new DeputyService(req);
        const result = await service.getData(req.user.employeeId, id);        
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
    "/",
    [
        check("deputyId").isInt({ min: 0 }).not().isEmpty(),
        check("startAt").toDate(),
        check("endAt")
            .toDate()
            .custom((value, { req }) => value > req.body.startAt)
            .not()
            .isEmpty(),
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
        const service = new DeputyService(req);
        const lastSeqNo = await service.getLastSeqNo(req.user.employeeId);
        const mData = {
            ...req.body,
            empId: req.user.employeeId,
            seqNo: lastSeqNo,
            type: 1,
        };
        service
            .createData(mData)
            .then(async (model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);

router.put(
    "/",
    [
        check("deputyId").isInt({ min: 0 }).not().isEmpty(),
        check("seqNo").isInt({ min: 0 }).not().isEmpty(),
        check("startAt").toDate(),
        check("endAt")
            .toDate()
            .custom((value, { req }) => value > req.body.startAt)
            .not()
            .isEmpty(),
    ],
    handleErrorAsync(function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({
                status: "error",
                code: ErrorDef.formInvalid,
                errors: errors.array(),
            });
        }
        const mData = {
            ...req.body,
            empId: req.user.employeeId,
        };
        const service = new DeputyService(req);
        service
            .updateData(mData)
            .then(async (model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);

export = router;
