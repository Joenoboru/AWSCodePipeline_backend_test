import express from "express";
import { query, check } from "express-validator";
import ExtrahousseqService, { filterable } from "../services/ExtrahoursreqService";
import handleErrorAsync from "./handleErrorAsync";

const router = express.Router();

router.get(
    "/",
    [query("order").isIn([null, ""].concat(filterable)), query("orderDir").isIn([null, "", "asc", "desc"])],
    handleErrorAsync(function (req, res) {
        new ExtrahousseqService(req).getList(req, res);
    })
);

router.get(
    "/:id([0-9]{1,11})",
    handleErrorAsync(function (req, res) {
        new ExtrahousseqService(req).getOne(req, res);
    })
);

//insert
router.post(
    "/",
    [
        check("date").toDate().not().isEmpty(),
        check("start_time").toDate().not().isEmpty(),
        check("end_time")
            .toDate()
            .not()
            .isEmpty()
            .custom((value, { req }) => value > req.body.start_time),
        check("type").isInt({ min: 0, max: 2 }).not().isEmpty(),
        check("comp").isInt({ min: 0, max: 2 }).not().isEmpty(),
        check("reason").trim(),
        check("rmk").trim(),
    ],
    handleErrorAsync(function (req, res) {
        new ExtrahousseqService(req).createData(req, res);
    })
);

//update
router.put(
    "/",
    [
        check("id").isInt({ min: 1 }),
        check("start_time").toDate().not().isEmpty(),
        check("end_time")
            .toDate()
            .not()
            .isEmpty()
            .custom((value, { req }) => value > req.body.start_time),
        check("type").isInt({ min: 0, max: 2 }).not().isEmpty(),
        check("reason").trim(),
        check("rmk").trim(),
    ],
    handleErrorAsync(function (req, res) {
        new ExtrahousseqService(req).updateData(req, res);
    })
);
router.delete(
    "/:id",

    handleErrorAsync(function (req, res) {
        new ExtrahousseqService(req)
            .deleteData(Number(req.params.id))
            .then(() => {
                res.json({ status: "ok" });
            })
            .catch((err) => {
                res.json({ status: "error", code: err });
            });
    })
);
export = router;
