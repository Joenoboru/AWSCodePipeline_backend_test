import { ErrorDef } from "@/wf_common";
import { Request, Response, Router } from "express";
import { query } from "express-validator";
import { PLReportService, BSReportService } from "../services/AccountReportService";
import AccountConsolidationService from "../services/AccountConsolidationService";
import handleErrorAsync from "./handleErrorAsync";

const router = Router();

router.get(
    "/plTable",
    [
        query("year").isInt({ min: 2000, max: 2999 }).not().isEmpty(),
        query("month").isInt({ min: 1, max: 12 }).not().isEmpty(),
    ],
    handleErrorAsync(async (req: Request, res: Response) => {
        const year = req.query.year as string;
        const month = req.query.month as string;
        const data = await new PLReportService(req).setDate(year, month).getTable();
        res.send({ status: "ok", result: data });
    })
);

router.get(
    "/bsTable",
    [
        query("year").isInt({ min: 2000, max: 2999 }).not().isEmpty(),
        query("month").isInt({ min: 1, max: 12 }).not().isEmpty(),
    ],
    handleErrorAsync(async (req: Request, res: Response) => {
        const year = req.query.year as string;
        const month = req.query.month as string;
        const data = await new BSReportService(req).setDate(year, month).getTable();
        if (data) {
            res.send({ status: "ok", result: data });
        } else {
            res.send({ status: "error", code: ErrorDef.DataNotFound, errors: "No data" });
        }
    })
);

router.get(
    "/bsCheck",
    handleErrorAsync(async (req: Request, res: Response) => {
        const firstDate = await new AccountConsolidationService(req).getFirstOneDate();
        const lastDate = await new AccountConsolidationService(req).getLastOneDate();
        res.send({ status: "ok", firstDate, lastDate });
    })
);
export = router;
