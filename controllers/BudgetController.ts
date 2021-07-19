"use strict";
const express = require("express");
const router = express.Router();
import BudgetService from "../services/BudgetService";
import handleErrorAsync from "./handleErrorAsync";
const { Op } = require("sequelize");
router.get(
    "/total/:year/:month",
    handleErrorAsync(async (req, res) => {
        // const searchOptions: any = {};

        const datas = await new BudgetService(req).getBudgetGroup(`${req.params.year}/${req.params.month}`);
        res.json(datas);
    })
);
router.get(
    "/:year/:month",
    handleErrorAsync(async (req, res) => {
        const searchOptions: any = {};
        if (req.query.pl1) {
            searchOptions.pl1 = req.query.pl1;
        }
        if (req.query.pl2) {
            searchOptions.pl2 = req.query.pl2;
        }
        if (req.query.pl3) {
            searchOptions.pl3 = req.query.pl3;
        }
        if (req.query.str) {
            searchOptions.comment = { [Op.like]: `%${req.query.str}%` };
        }
        const datas = await new BudgetService(req).getBudgetList(
            `${req.params.year}/${req.params.month}`,
            searchOptions
        );
        res.json(datas);
    })
);
router.post(
    "/:year/:month",
    handleErrorAsync(async (req, res) => {
        await new BudgetService(req)
            .insertUpdate(`${req.params.year}/${req.params.month}`, req.body)
            .then(() => {
                res.json({ status: "ok" });
            })
            .catch((e) => {
                res.json({ status: "error", code: e, e });
            });
    })
);
router.put(
    "/:year/:month",
    handleErrorAsync(async (req, res) => {
        await new BudgetService(req)
            .insertUpdate(`${req.params.year}/${req.params.month}`, req.body)
            .then(() => {
                res.json({ status: "ok" });
            })
            .catch((e) => {
                res.json({ status: "error", code: e, e });
            });
    })
);
router.delete(
    "/:year/:month",
    handleErrorAsync(async (req, res) => {
        await new BudgetService(req)
            .deleteData(req.body.data.id)
            .then(() => {
                res.json({ status: "ok" });
            })
            .catch((e) => {
                res.json({ status: "error", code: e, e });
            });
    })
);
router.post(
    "/details",
    handleErrorAsync(async (req, res) => {
        const datas = await new BudgetService(req).getBudgetAll(req.body);
        res.json(datas);
    })
);
export = router;
