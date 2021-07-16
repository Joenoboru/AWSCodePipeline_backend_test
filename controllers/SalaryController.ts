import express from "express";
import { check, validationResult } from "express-validator";
import SalaryService from "../services/SalaryService";
import { toYMFormat } from "../helpers/dateHelper";
import { ErrorDef } from "../wf_common";
import handleErrorAsync from "./handleErrorAsync";
const router = express.Router();

router.get(
    "/logicitem",
    handleErrorAsync((req, res) => {
        const service = new SalaryService(req);
        service.getLogicItem(req, res);
    })
);
router.post(
    "/calccheck",
    [
        check("year").isInt({ min: 2000, max: 2999 }).not().isEmpty(),
        check("month").isInt({ min: 1, max: 12 }).not().isEmpty(),
    ],
    handleErrorAsync(function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({
                status: "error",
                code: ErrorDef.formInvalid,
                errors: errors.array(),
            });
        }
        const year = Number(req.body.year);
        const month = Number(req.body.month);
        const selection = req.body.selection;
        const service = new SalaryService(req);
        service.calcCheck(year, month, selection).then((data) => {
            res.send({
                workLevelErrors: data.workLevelErrors,
                salaryDefErrors: data.salaryDefErrors,
            });
        });
    })
);
router.post(
    "/calc",
    [
        check("year").isInt({ min: 2000, max: 2999 }).not().isEmpty(),
        check("month").isInt({ min: 1, max: 12 }).not().isEmpty(),
    ],
    handleErrorAsync(function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({
                status: "error",
                code: ErrorDef.formInvalid,
                errors: errors.array(),
            });
        }
        const year = Number(req.body.year);
        const month = Number(req.body.month);
        const selection = req.body.selection;
        const service = new SalaryService(req);
        service.calcAllAndSave(year, month, selection).then(() => {
            res.send({ status: "ok" });
        });
    })
);
router.post(
    "/pay/:year(2[0-9]{3})/:month(1[012]|[1-9])",
    handleErrorAsync(function (req, res) {
        const year = Number(req.params.year);
        const month = Number(req.params.month);
        const yearMonth = toYMFormat(year, month);
        const selection = req.body.selection;
        const service = new SalaryService(req);
        service.pay(yearMonth, selection).then(() => {
            res.send({ status: "ok" });
        });
    })
);
router.delete(
    "/calc/:year(2[0-9]{3})/:month(1[012]|[1-9])",
    handleErrorAsync(function (req, res) {
        const year = Number(req.params.year);
        const month = Number(req.params.month);
        const yearMonth = toYMFormat(year, month);
        const selection = req.body.selection;
        const service = new SalaryService(req);
        service.del(yearMonth, selection).then(() => {
            res.send({ status: "ok" });
        });
    })
);

router.get(
    "/list/:year(2[0-9]{3})/:month(1[012]|[1-9])",
    handleErrorAsync(function (req, res) {
        const year = Number(req.params.year);
        const month = Number(req.params.month);
        new SalaryService(req).getList(year, month, { limit: req.query.limit, offset: req.skip }).then((results) => {
            res.send({
                count: results.count,
                data: results.rows,
            });
        });
    })
);

router.get(
    "/export/:year(2[0-9]{3})/:month(1[012]|[1-9])/xlsx",
    handleErrorAsync(function (req, res) {
        const service = new SalaryService(req);
        service.exportXLSX(req, res);
    })
);

router.get(
    "/export/:year(2[0-9]{3})/:month(1[012]|[1-9])/insurance",
    handleErrorAsync(function (req, res) {
        const service = new SalaryService(req);
        service.exportInsuranceXLSX(req, res);
    })
);

router.get(
    "/export/:year(2[0-9]{3})/:month(1[012]|[1-9])/pdf",
    handleErrorAsync(function (req, res) {
        const service = new SalaryService(req);
        service.exportPDF(req, res);
    })
);

router.get(
    "/emp/:empId([0-9]{1,11})/:year(2[0-9]{3})/:month(1[012]|[1-9])",
    handleErrorAsync(function (req, res) {
        const empId = Number(req.params.empId);
        const year = Number(req.params.year);
        const month = Number(req.params.month);
        const service = new SalaryService(req);
        service.getData(year, month, empId).then((results) => {
            res.json(results);
        });
    })
);

router.get(
    "/ope/calc/:year(2[0-9]{3})/:month(1[012]|[1-9])",
    handleErrorAsync(async function (req, res) {
        const year = Number(req.params.year);
        const month = Number(req.params.month);
        const service = new SalaryService(req);
        const data = await service.calcOPE(year, month);
        res.send(data);
    })
);

router.get(
    "/ope/export/:year(2[0-9]{3})/:month(1[012]|[1-9])",
    handleErrorAsync(async function (req, res) {
        const year = Number(req.params.year);
        const month = Number(req.params.month);
        const service = new SalaryService(req);
        const content = await service.createOPEXlsx(year, month);
        res.contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(new Buffer(content, "binary"));
    })
);

router.get(
    "/ope/detail/:employeeId/:year(2[0-9]{3})/:month(1[012]|[1-9])",
    handleErrorAsync(async function (req, res) {
        const year = Number(req.params.year);
        const month = Number(req.params.month);
        const employeeId = Number(req.params.employeeId);
        const service = new SalaryService(req);
        const data = await service.getOPEDetail(employeeId, year, month);
        res.send(data);
    })
);

export = router;
