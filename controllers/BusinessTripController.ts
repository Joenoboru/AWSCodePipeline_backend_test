"use strict";
const express = require("express");
const router = express.Router();
import { Response } from "express";
import handleErrorAsync from "./handleErrorAsync";
//import BusinessTripService from "../services/BusinessTripService";

router.get(
    "/d/:id([0-9]{1,11})",
    handleErrorAsync(async (req: any, res: Response) => {
        /*const service = new BusinessTripService(req);
        const datas = await service.getDataBySub(req.params.id);
        res.send(datas);*/
        res.send("WIP");
    })
);

router.get(
    "/:id([0-9]{1,11})",
    handleErrorAsync(async (req: any, res: Response) => {
        /*const service = new BusinessTripService(req);
        const datas = await service.getData(req.params.id);
        res.send(datas);*/
        res.send("WIP");
    })
);

export = router;
