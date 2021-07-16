import express from "express";
import { body, validationResult } from "express-validator";
import handleErrorAsync from "./handleErrorAsync";
import { ErrorDef } from "../wf_common";
import DepartposService from "../services/DepartposService";

const router = express.Router();

router.get(
    "/all",
    handleErrorAsync(async function (req, res) {
        const result = await new DepartposService(req).getAll();
        res.json(result);
    })
);

router.get(
    "/all/:departId([0-9]{1,11})", //depart id
    handleErrorAsync(async function (req, res) {
        const result = await new DepartposService(req).getAllByDepartId(req);
        res.json(result);
    })
);

router.get(
    "/:departId([0-9]{1,11})", //depart id
    handleErrorAsync(async function (req, res) {
        await new DepartposService(req).getByDepartId(req, res);
    })
);

router.post(
    "/:departId([0-9]{1,11})",
    [body("workpos").isInt({ min: 1 }).not().isEmpty()],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({
                status: "error",
                code: ErrorDef.formInvalid,
                errors: errors.array(),
            });
        }
        await new DepartposService(req).createDepartPos(req, res);
    })
);

router.delete("/:departId([0-9]{1,11})", [body("data").isInt({ min: 1 }).not().isEmpty()], async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.send({
            status: "error",
            code: ErrorDef.formInvalid,
            errors: errors.array(),
        });
    }
    // console.log([id, req.body.data]);
    await new DepartposService(req).deleteDepartPos(req, res);
});

export = router;
