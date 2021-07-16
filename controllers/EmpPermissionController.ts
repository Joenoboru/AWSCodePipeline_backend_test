import express from "express";
import { body, validationResult } from "express-validator";
import EmpPermissionService from "../services/EmpPermissionService";
import { ErrorDef } from "../wf_common";
import handleErrorAsync from "./handleErrorAsync";

const router = express.Router();

router.get(
    "/",
    handleErrorAsync(async function (req, res) {
        const service = new EmpPermissionService(req);
        const results = await service.getList({ limit: Number(req.query.limit), offset: req.skip });
        res.send(results);
    })
);

router.get(
    "/group",
    handleErrorAsync(async function (req, res) {
        const service = new EmpPermissionService(req);
        const results = await service.getGroup();
        res.send(results);
    })
);

router.get(
    "/emp/:empId([0-9]{1,11})",
    handleErrorAsync(async function (req, res) {
        const empId = Number(req.params.empId);
        const service = new EmpPermissionService(req);
        const results = await service.getData(empId);
        res.send(results);
    })
);

router.post(
    "/emp/:empId([0-9]{1,11})",
    [body("permissionGroupId").isInt({ min: 1 }).not().isEmpty()],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({
                status: "error",
                code: ErrorDef.formInvalid,
                errors: errors.array(),
            });
        }
        const empId = Number(req.params.empId);
        const service = new EmpPermissionService(req);
        try {
            const result = await service.create(empId, req.body.permissionGroupId);
            res.send({ status: "ok", result });
        } catch (error) {
            if (error && error === ErrorDef.DataNotFound) {
                res.send({ status: "error", code: ErrorDef.DataNotFound, error: error });
            } else {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            }
        }
    })
);

router.delete(
    "/emp/:empId([0-9]{1,11})",
    [body("data").isInt({ min: 1 }).not().isEmpty()],
    handleErrorAsync(function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({
                status: "error",
                code: ErrorDef.formInvalid,
                errors: errors.array(),
            });
        }
        const empId = Number(req.params.empId);
        const service = new EmpPermissionService(req);
        service
            .del(empId, req.body.data)
            .then((result) => {
                res.send({ status: "ok", result: result });
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

module.exports = router;
