import express from "express";
import { check, validationResult } from "express-validator";
import EmpworkService from "../services/EmpworkService";
import { ErrorDef } from "../wf_common";
import handleErrorAsync from "./handleErrorAsync";
const router = express.Router();

router.get(
    "/all/dataonly/:empId([0-9]{1,11})",
    handleErrorAsync(async function (req, res) {
        new EmpworkService(req).getAllDataOnly(req, res);
    })
);

router.get(
    "/all/:empId([0-9]{1,11})",
    handleErrorAsync(function (req, res) {
        new EmpworkService(req).getAll(req, res);
    })
);

router.get(
    "/audit/:empId([0-9]{1,11})",
    handleErrorAsync(function (req, res) {
        new EmpworkService(req).getAudit(req, res);
    })
);

//changeOrder
router.put(
    "/changeOrder",
    [check("list.*.id").isInt({ min: 0 }).not().isEmpty(), check("list.*.ord").isInt({ min: 0 }).not().isEmpty()],
    handleErrorAsync(function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        new EmpworkService(req).changeOrder(req, res);
    })
);

//insert
router.post(
    "/",
    [
        check("emp").isInt({ min: 0 }).not().isEmpty(),
        check("workpos").isInt({ min: 0 }).not().isEmpty(),
        check("status").isInt({ min: 0 }).not().isEmpty(),
        check("ord").isInt({ min: 0 }).not().isEmpty(),
    ],
    handleErrorAsync(function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        new EmpworkService(req).createData(req, res);
    })
);

//delete
router.delete(
    "/:id",
    handleErrorAsync(function (req, res) {
        new EmpworkService(req).deleteData(req, res);
    })
);

module.exports = router;
