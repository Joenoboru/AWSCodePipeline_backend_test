import express from "express";
import { check, validationResult } from "express-validator";
import SalarylvService from "../services/SalarylvService";
import { ErrorDef } from "../wf_common";
import handleErrorAsync from "./handleErrorAsync";
/* By WorkLevel */
const router = express.Router();

router.get(
    "/:wlId([0-9]{1,11})",
    handleErrorAsync(async function (req, res) {
        const id = Number(req.params.wlId);
        const result = await new SalarylvService(req).getOne(id);
        res.json(result);
    })
);

//insert
router.post(
    "/:wlId([0-9]{1,11})",
    [check("item").isInt({ min: 0 }).not().isEmpty(), check("amount").isInt({ min: 0 }).not().isEmpty()],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const id = Number(req.params.wlId);
        const data = {
            level: id,
            ...req.body,
        };
        const result = await new SalarylvService(req).createData(id, data);
        res.json(result);
    })
);

//insert
router.put(
    "/:wlId([0-9]{1,11})",
    [check("item").isInt({ min: 0 }).not().isEmpty(), check("amount").isInt({ min: 0 }).not().isEmpty()],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const id = Number(req.params.wlId);
        const result = await new SalarylvService(req).updateData(id, req.body);
        res.json(result);
    })
);

//delete
/*router.delete("/:wlId([0-9]{1,11})", async function (req, res) {
    const id = req.params.wlId;
    const result = await new SalarylvService(req).deleteData(id, req.body.data.item);
    res.json(result);
});*/

/* By SalaryItem */

router.get(
    "/si/:siId([0-9]{1,11})",
    handleErrorAsync(async function (req, res) {
        const id = Number(req.params.siId);
        const result = await new SalarylvService(req).getSIData(id);
        res.json(result);
    })
);

//insert
router.post(
    "/si/:siId([0-9]{1,11})",
    [check("level").isInt({ min: 0 }).not().isEmpty(), check("amount").isInt({ min: 0 }).not().isEmpty()],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const id = Number(req.params.siId);
        const result = await new SalarylvService(req).createSIData(id, {
            item: id,
            ...req.body,
        });
        res.json(result);
    })
);

//insert
router.put(
    "/si/:siId([0-9]{1,11})",
    [check("level").isInt({ min: 0 }).not().isEmpty(), check("amount").isInt({ min: 0 }).not().isEmpty()],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const id = Number(req.params.siId);
        const result = await new SalarylvService(req).updateSIData(id, req.body);
        res.json(result);
    })
);

//delete
/*router.delete("/si/:siId([0-9]{1,11})", async function (req, res) {
    const id = req.params.siId;
    const result = await new SalarylvService(req).deleteSIData(id, req.body);
    res.json(result);
});*/

export = router;
