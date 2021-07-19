import express from "express";
import { query, check, validationResult } from "express-validator";
import { ErrorDef } from "../wf_common";
import LeaveReqService, { sortable } from "../services/LeaveReqService";
import handleErrorAsync from "./handleErrorAsync";

const router = express.Router();
router.get(
    "/",
    [query("order").isIn([null, "", ...sortable]), query("orderDir").isIn([null, "", "asc", "desc"])],
    handleErrorAsync(async (req, res) => {
        new LeaveReqService(req).getList(req, res);
    })
);

router.get(
    "/:id([0-9]{1,11})",
    handleErrorAsync(async (req, res) => {
        new LeaveReqService(req).getData(req, res);
    })
);

//insert
router.post(
    "/",
    [
        check("startTime").toDate().not().isEmpty(),
        check("endTime")
            .toDate()
            .not()
            .isEmpty()
            .custom((value, { req }) => value > req.body.startTime),
        check("type").optional().isInt({ min: 0 }),
        check("reason").trim(),
        check("rmk").trim(),
    ],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const newModel = { ...req.body, employeeId: req.user.employeeId, status: 1 };
        const service = new LeaveReqService(req);
        service
            .createData(newModel)
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
        check("startTime").toDate().not().isEmpty(),
        check("endTime")
            .toDate()
            .not()
            .isEmpty()
            .custom((value, { req }) => value > req.body.startTime),
        check("type").optional().isInt({ min: 0 }),
        check("reason").trim(),
        check("rmk").trim(),
    ],
    handleErrorAsync(function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const newModel = { ...req.body };
        const service = new LeaveReqService(req);
        service.updateData(newModel, newModel.employeeId).then((model) => {
            res.send({ status: "ok", result: model });
        });
    })
);
router.delete(
    "/:id",

    handleErrorAsync(function (req, res) {
        const service = new LeaveReqService(req);
        const id = Number(req.params.id);
        service.scrapData(id).then(() => {
            res.send({ status: "ok" });
        });
    })
);
export = router;
