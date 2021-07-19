import { ErrorDef } from "../wf_common";
import express, { Request, Response } from "express";
import handleErrorAsync from "./handleErrorAsync";
import OpeService, { sortable } from "../services/OpeService";
import { query } from "express-validator";
import { ParamsDictionary } from "express-serve-static-core";
import { createOrder } from "../helpers/dbHelper";
//const { query, check, validationResult } = require("express-validator");
//const express = require("express");
const router = express.Router();

router.get(
    "/",
    [query("order").isIn([null, ""].concat(sortable)), query("orderDir").isIn([null, "", "asc", "desc"])],
    handleErrorAsync(async (req: Request, res: Response) => {
        const order = createOrder(req);
        const datas = await new OpeService(req).getPageOfData(req.query.str as string, req.query.filter as string[], order);
        res.send(datas);
    })
);

router.post(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new OpeService(req)
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
        await new OpeService(req)
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
        await new OpeService(req)
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

router.get(
    "/:id/attachment/:index",
    handleErrorAsync(async (req: Request, res: Response) => {
        const id = req.params.id;
        const index = req.params.index;
        await new OpeService(req).downloadFile(res, id, Number(index));
    })
);

router.get(
    "/repayable",
    handleErrorAsync(async (req: Request, res: Response) => {
        const datas = await new OpeService(req).getPayableData();
        res.send(datas);
    })
);

router.post(
    "/repay",
    [
        query("ids").isArray({ min: 1 }),
        query("ids.*").isNumeric(),
        query("account").isNumeric().notEmpty(),
        query("date").toDate(),
    ],
    handleErrorAsync(async (req: Request<ParamsDictionary, any, RepayReqBody>, res: Response) => {
        const ids = req.body.ids;
        const date = req.body.date;
        const account = req.body.account;
        console.log(req.body);
        const mIds: number[] = ids.filter((id) => !Number.isNaN(Number(id))).map((id) => Number(id));
        if (mIds.length > 0) {
            await new OpeService(req)
                .repay(mIds, new Date(date), account)
                .then((model) => {
                    res.send({ status: "ok", result: model });
                })
                .catch((error) => {
                    console.log(error);
                    res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
                });
        } else {
            res.send({ status: "error", code: ErrorDef.ErrorTran });
        }
    })
);

router.get(
    "/convertable",
    handleErrorAsync(async (req: Request, res: Response) => {
        const datas = await new OpeService(req).getConvertableData();
        res.send(datas);
    })
);

router.post(
    "/convert",
    [query("ids").isArray({ min: 1 }), query("ids.*").isNumeric()],
    handleErrorAsync(async (req: Request<ParamsDictionary, any, ConvertReqBody>, res: Response) => {
        const ids = req.body.ids;
        const mIds: number[] = ids.filter((id) => !Number.isNaN(Number(id))).map((id) => Number(id));
        if (mIds.length > 0) {
            await new OpeService(req)
                .convertData(mIds)
                .then((model) => {
                    res.send({ status: "ok", result: model });
                })
                .catch((error) => {
                    console.log(error);
                    res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
                });
        } else {
            res.send({ status: "error", code: ErrorDef.ErrorTran });
        }
    })
);

router.get(
    "/:id",
    handleErrorAsync(async (req: Request, res: Response) => {
        const id = req.params.id;
        const result = await new OpeService(req).getOne(id);
        res.json(result);
    })
);

interface ConvertReqBody {
    //account: []
    ids: string[];
}

interface RepayReqBody {
    //account: []
    ids: string[];
    date: string;
    account: number;
}

export = router;
