import { ErrorDef } from "../wf_common";
import express, { Request, Response } from "express";
import handleErrorAsync from "./handleErrorAsync";
import RaTypeService from "../services/RaTypeService";
//const { query, check, validationResult } = require("express-validator");
//const express = require("express");
const router = express.Router();

router.get(
    "/list/:type([0-2]{1})",
    handleErrorAsync(async (req: Request, res: Response) => {
        const data = await new RaTypeService(req).getList(Number(req.params.type));
        res.send(data);
    })
);
router.get(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        const data = await new RaTypeService(req).getPageOfData();
        res.send(data);
    })
);
router.get(
    "/all",
    handleErrorAsync(async function (req, res) {
        const results = await new RaTypeService(req).getAll();
        res.json(results);
    })
);

router.get(
    "/:id",
    handleErrorAsync(async (req, res) => {
        const id = req.params.id;
        const result = await new RaTypeService(req).getOne(id);
        res.json(result);
    })
);

router.post(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new RaTypeService(req)
            .createOrUpdateData(req.body)
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);
router.put(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new RaTypeService(req)
            .createOrUpdateData(req.body)
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);

//delete
router.delete(
    "/:id",
    handleErrorAsync(async (req: Request, res: Response) => {
        const id = req.params.id;
        await new RaTypeService(req)
            .deleteData(id)
            .then((result) => {
                if (result) {
                    res.send({ status: "ok", result: {} });
                } else {
                    res.send({ status: "error", code: ErrorDef.DataNotFound });
                }
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);

export = router;
