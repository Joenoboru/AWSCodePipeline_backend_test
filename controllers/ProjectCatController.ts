import express from "express";
import { check, validationResult } from "express-validator";
import { ErrorDef } from "../wf_common";
import handleErrorAsync from "./handleErrorAsync";
import ProjectCatService from "../services/ProjectCatService";

const router = express.Router();

router.get(
    "/",
    handleErrorAsync(async function (req, res) {
        const results = await new ProjectCatService(req).getList({
            limit: Number(req.query.limit),
            offset: req.skip,
        });
        res.json({ count: results.count, data: results.rows });
    })
);

router.get(
    "/all",
    handleErrorAsync(async function (req, res) {
        const results = await new ProjectCatService(req).getAll();
        res.json(results);
    })
);

//insert
router.post(
    "/",
    [check("name").not().isEmpty(), check("status").toBoolean()],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        await new ProjectCatService(req)
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
    [check("id").isInt({ min: 1 }), check("name").not().isEmpty(), check("status").toBoolean()],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const mData = { ...req.body };
        delete mData.id;
        await new ProjectCatService(req)
            .updateData(req.body.id, mData)
            .then((model) => {
                res.send({ status: "ok", result: model });
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
export = router;
