import express from "express";
import { check, validationResult } from "express-validator";
import { ErrorDef } from "../wf_common";
import handleErrorAsync from "./handleErrorAsync";
import SalaryItemService from "../services/SalaryItemService";

const router = express.Router();

//get all data
router.get(
    "/",
    handleErrorAsync(function (req, res) {
        const service = new SalaryItemService(req);
        service.getListData(req, res);
    })
);

router.get(
    "/all",
    handleErrorAsync(async function (req, res) {
        const service = new SalaryItemService(req);
        const data = await service.getAll();
        res.json(data);
    })
);

router.get(
    "/wl",
    handleErrorAsync(async function (req, res) {
        const service = new SalaryItemService(req);
        const data = await service.getWorkLevelAll();
        res.json(data);
    })
);

router.get(
    "/common",
    handleErrorAsync(async function (req, res) {
        const service = new SalaryItemService(req);
        const data = await service.geCommonAll();
        res.json(data);
    })
);

//get part data
router.get(
    "/part",
    handleErrorAsync(async function (req, res) {
        const service = new SalaryItemService(req);
        const data = await service.getPartData();
        res.json(data);
    })
);

//get single data
router.get("/:id([0-9]{1,11})", async function (req, res) {
    const id = Number(req.params.id);
    const service = new SalaryItemService(req);
    const data = await service.getSingle(id);
    res.json(data);
});

//changeOrder
router.put(
    "/changeOrder",
    [check("list.*.id").isInt({ min: 0 }).not().isEmpty(), check("list.*.order").isInt({ min: 0 }).not().isEmpty()],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const service = new SalaryItemService(req);
        const data = await service.changeOrder(req.body.list);
        res.json(data);
    })
);

//insert
router.post(
    "/",
    [
        check("name").not().isEmpty().trim(),
        check("chname").not().isEmpty().trim(),
        check("default_amount").isInt({ min: 0 }).not().isEmpty(),
        check("payment_type").isInt({ min: 0, max: 2 }).not().isEmpty(),
        check("tax_type").isInt({ min: 0, max: 1 }).not().isEmpty(),
        check("perday_use").isInt({ min: 0, max: 1 }).not().isEmpty(),
        check("wl_only").isInt({ min: 0, max: 1 }).not().isEmpty(),
    ],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const service = new SalaryItemService(req);
        const data = await service.insertData(req.body);
        res.json(data);
    })
);

//update
router.put(
    "/",
    [
        check("id").isInt({ min: 1 }),
        check("name").not().isEmpty().trim(),
        check("chname").not().isEmpty().trim(),
        check("default_amount").isInt({ min: 0 }).not().isEmpty(),
        check("payment_type").isInt({ min: 0, max: 2 }).not().isEmpty(),
        check("tax_type").isInt({ min: 0, max: 1 }).not().isEmpty(),
        check("perday_use").isInt({ min: 0, max: 1 }).not().isEmpty(),
        check("wl_only").isInt({ min: 0, max: 1 }).not().isEmpty(),
    ],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const service = new SalaryItemService(req);
        const data = await service.updateData(req.body);
        res.json(data);
    })
);

//delete
router.delete(
    "/:id",
    handleErrorAsync(async function (req, res) {
        const id = Number(req.params.id);
        const service = new SalaryItemService(req);
        const data = await service.deleteData(id);
        res.json(data);
    })
);

export = router;
