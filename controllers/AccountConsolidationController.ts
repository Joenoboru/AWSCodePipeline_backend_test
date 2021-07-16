import { ErrorDef } from "../wf_common";
import express, { Request, Response } from "express";
import { check } from "express-validator";
import { ParamsDictionary } from "express-serve-static-core";
import handleErrorAsync from "./handleErrorAsync";
import AccountConsolidationService from "../services/AccountConsolidationService";
import { toYMFormat } from "../helpers/dateHelper";

//const { query, check, validationResult } = require("express-validator");
//const express = require("express");
const router = express.Router();

router.get(
    "/list",
    handleErrorAsync(async (req: Request, res: Response) => {
        const data = await new AccountConsolidationService(req).getPageOfData();
        res.send(data);
    })
);

router.get(
    "/data/:year(2[0-9]{3})/:month(1[012]|[1-9])",
    handleErrorAsync(async (req: Request, res: Response) => {
        const year = req.params.year;
        const month = req.params.month;
        const result = await new AccountConsolidationService(req).setDate(year, month).getOne();
        res.json(result);
    })
);

router.get(
    "/preprocessCheck",
    handleErrorAsync(async (req: Request, res: Response) => {
        const list = await new AccountConsolidationService(req).preProcessCheck();
        res.send(list);
    })
);

router.get(
    "/dateCheck",
    handleErrorAsync(async (req: Request, res: Response) => {
        const date = await new AccountConsolidationService(req).getLastOneDate();
        res.send({ status: "ok", date });
    })
);

router.post(
    "/init",
    [
        check("year").isInt({ min: 2000, max: 2999 }).not().isEmpty(),
        check("month").isInt({ min: 1, max: 12 }).not().isEmpty(),
        check("currentPl").isInt().not().isEmpty(),
        check("accumPl").isInt().not().isEmpty(),
    ],
    handleErrorAsync(async (req: Request<ParamsDictionary, any, ACInitPostReqBody>, res: Response) => {
        const list = await new AccountConsolidationService(req)
            .createInitialData({
                yearMonth: toYMFormat(req.body.year, req.body.month),
                currentPl: req.body.currentPl,
                accumPl: req.body.accumPl,
            })
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
        res.send(list);
    })
);

router.post(
    "/",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleErrorAsync(async (req: Request, res: Response) => {
        await new AccountConsolidationService(req)
            .createOrUpdateData()
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
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new AccountConsolidationService(req)
            .deleteData()
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

interface ACInitPostReqBody {
    year: string | number;
    month: string | number;
    currentPl: number;
    accumPl: number;
}

export = router;
