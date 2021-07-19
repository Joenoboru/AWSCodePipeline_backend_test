import express from "express";
import { check, query, validationResult } from "express-validator";
import handleErrorAsync from "./handleErrorAsync";
import { ErrorDef } from "../wf_common";
import WorkProjectService, { sortable } from "../services/WorkProjectService";

const router = express.Router();

router.get(
    "/att/:attId",
    [query("order").isIn([null, ""].concat(sortable)), query("orderDir").isIn([null, "", "asc", "desc"])],
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
        const attendanceId = Number(req.params.attId);
        const result = await new WorkProjectService(req).getListData(attendanceId, orderData);
        res.json(result);
    })
);

router.get(
    "/:id([0-9]{1,11})",
    handleErrorAsync(async function (req, res) {
        const id = Number(req.params.id);
        const result = await new WorkProjectService(req).getOne(id, req.user.employeeId);
        res.json(result);
    })
);

//insert
router.post(
    "/",
    [
        check("project").isInt({ min: 0 }).not().isEmpty(),
        check("date").toDate().not().isEmpty(),
        check("usetime").isInt({ min: 0 }).not().isEmpty(),
    ],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const newModel = { ...req.body, employee: req.user.employeeId };
        const result = await new WorkProjectService(req).createData(newModel);
        res.json(result);
    })
);

//update
router.put(
    "/",
    [check("usetime").isInt({ min: 0 }).not().isEmpty()],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const result = await new WorkProjectService(req).updateData(req.body.id, req.user.employeeId, req.body);
        res.json(result);
    })
);

//delete
router.delete(
    "/:id",
    handleErrorAsync(async function (req, res) {
        const id = Number(req.params.id);
        const result = await new WorkProjectService(req).deleteData(id, req.user.employeeId);
        res.json(result);
    })
);

export = router;
