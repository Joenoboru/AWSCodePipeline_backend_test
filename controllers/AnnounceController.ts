import express, { Request, Response } from "express";
import AnnounceService, { sortable } from "../services/AnnounceService";
import handleErrorAsync from "./handleErrorAsync";
import { ErrorDef } from "../wf_common";
import { query, check, validationResult } from "express-validator";

const router = express.Router();

router.get(
    "/",
    [query("order").isIn([null, "", ...sortable]), query("orderDir").isIn([null, "", "asc", "desc"])],
    handleErrorAsync(async (req: Request, res: Response) => {
        const service = new AnnounceService(req);
        service.getListData(req, res);
    })
);

router.get(
    "/:id([0-9]{1,11})",
    handleErrorAsync(async (req: Request, res: Response) => {
        const service = new AnnounceService(req);
        service.getData(req, res);
    })
);

//insert
router.post(
    "/",
    [
        check("title").not().isEmpty(),
        check("content").not().isEmpty(),
        check("onTop").isBoolean().not().isEmpty(),
        check("show").isBoolean().not().isEmpty(),
    ],
    handleErrorAsync(function (req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const mData = {
            ...req.body,
            createUser: req.user.employeeId,
        };
        const service = new AnnounceService(req);
        service
            .createData(mData)
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
        check("title").not().isEmpty(),
        check("content").not().isEmpty(),
        check("onTop").isBoolean().not().isEmpty(),
        check("show").isBoolean().not().isEmpty(),
    ],
    handleErrorAsync(function (req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const mData = {
            ...req.body,
            updateUser: req.user.employeeId,
        };
        const service = new AnnounceService(req);
        service.updateData(mData).then((model) => {
            res.send({ status: "ok", result: model });
        });
    })
);

//delete
router.delete(
    "/:id",
    handleErrorAsync(function (req: Request, res: Response) {
        const id = req.params.id;
        const service = new AnnounceService(req);
        service.deleteData(Number(id)).then((model) => {
            res.send({ status: "ok", result: model });
        });
    })
);

export = router;
