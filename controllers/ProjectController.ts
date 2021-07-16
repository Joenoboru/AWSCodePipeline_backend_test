import express from "express";
import { check, query, validationResult } from "express-validator";
import { ErrorDef } from "../wf_common";
import handleErrorAsync from "./handleErrorAsync";
import ProjectService, { sortable } from "../services/ProjectService";

const router = express.Router();
router.get(
    "/",
    [query("order").isIn([null, "", "orderDate", ...sortable]), query("orderDir").isIn([null, "", "asc", "desc"])],
    handleErrorAsync((req, res) => {
        new ProjectService(req).getList(req, res);
    })
);
router.get(
    "/all",
    handleErrorAsync((req, res) => {
        new ProjectService(req).getAll(req, res);
    })
);
router.get(
    "/picker",
    handleErrorAsync((req, res) => {
        new ProjectService(req).getPicker(req, res);
    })
);
router.get(
    "/calccost/:id([0-9]{1,11})",
    handleErrorAsync(async (req, res) => {
        const id = Number(req.params.id);
        const service = new ProjectService(req);
        const result = await service.calculateUsedCost(id);
        res.send({ status: "ok", result: result });
    })
);

router.get(
    "/:id([0-9]{1,11})",
    handleErrorAsync((req, res) => {
        new ProjectService(req).getData(req, res);
    })
);

router.post(
    "/",
    [
        check("name").not().isEmpty().trim(),
        check("cat").isInt({ min: 0, max: 5 }).not().isEmpty(),
        check("customer").isInt({ min: 0 }).not().isEmpty(),
        check("status").isInt({ min: 0 }).not().isEmpty(),
        check("budget").isInt({ min: 0 }).not().isEmpty(),
        check("costEst").isInt({ min: 0 }).not().isEmpty(),
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
        const mModel = {
            ...req.body,
            costRateEst: req.body.budget === 0 ? 0 : 1 - req.body.costEst / req.body.budget,
        };
        const service = new ProjectService(req);
        service
            .createData(mModel)
            .then(async (model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);

router.post(
    "/calc",
    handleErrorAsync(function (req, res) {
        const service = new ProjectService(req);
        service.doRenewCost().then(() => {
            res.send({ status: "ok" });
        });
    })
);

router.put(
    "/",
    [
        check("name").not().isEmpty().trim(),
        check("cat").isInt({ min: 0, max: 5 }).not().isEmpty(),
        check("customer").isInt({ min: 0 }).not().isEmpty(),
        check("status").isInt({ min: 0 }).not().isEmpty(),
        check("budget").isInt({ min: 0 }).not().isEmpty(),
        check("costEst").isInt({ min: 0 }).not().isEmpty(),
        check("devStart").toDate(),
        check("devEnd")
            .toDate()
            .if(check("devEnd").not().isEmpty())
            .custom((value, { req }) => value > req.body.devStart),
        check("expectedDate").toDate(),
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
        const mModel = {
            ...req.body,
            costRateEst: req.body.budget === 0 ? 0 : 1 - req.body.costEst / req.body.budget,
        };
        const service = new ProjectService(req);
        service
            .updateData(mModel)
            .then(async (model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);
router.delete(
    "/:id([0-9]{1,11})",
    handleErrorAsync((req, res) => {
        const service = new ProjectService(req);
        service.deleteData(req, res);
    })
);

export = router;
