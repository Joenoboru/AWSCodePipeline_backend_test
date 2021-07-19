import { ErrorDef } from "../wf_common";
import express, { Request, Response } from "express";
import handleErrorAsync from "./handleErrorAsync";
import AccountVoucherService from "../services/AccountVoucherService";

//const { query, check, validationResult } = require("express-validator");
//const express = require("express");
const router = express.Router();

router.get(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        const datas = await new AccountVoucherService(req).getPageOfData();
        res.send(datas);
    })
);

router.get(
    "/:id",
    handleErrorAsync(async (req, res) => {
        const id = req.params.id;
        const result = await new AccountVoucherService(req).getOne(id);
        res.json(result);
    })
);

router.post(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new AccountVoucherService(req)
            .createOrUpdateData(req.body)
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                console.log(error);
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);
router.put(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new AccountVoucherService(req)
            .createOrUpdateData(req.body)
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                console.log(error);
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);

//delete
router.delete(
    "/:id",
    handleErrorAsync(async (req: Request, res: Response) => {
        const id = req.params.id;
        await new AccountVoucherService(req)
            .deleteData(id)
            .then((result) => {
                if (result) {
                    res.send({ status: "ok", result: {} });
                } else {
                    res.send({ status: "error", code: ErrorDef.DataNotFound });
                }
            })
            .catch((error) => {
                console.log(error);
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);

export = router;
