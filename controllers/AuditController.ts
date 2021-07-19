import AuditService from "../services/AuditService";
import express from 'express'
import { query, validationResult } from "express-validator"
import handleErrorAsync from "./handleErrorAsync";

const router = express.Router();

router.get(
    "/record/:id",
    handleErrorAsync(async (req, res) => {
        const id = Number(req.params.id);
        const result = await new AuditService(req).getAuditRecordData(id);
        res.json(result);
    })
);
router.get(
    "/self/list",
    [
        query("order").isIn([null, ""].concat(["id", "status", "formId", "createAt"])),
        query("orderDir").isIn([null, "", "asc", "desc"]),
    ],
    handleErrorAsync(async (req, res) => {
        const errors = validationResult(req);
        let order = req.query.order;
        const orderDir = req.query.orderDir;
        if (!errors.isEmpty()) {
            order = null;
        }
        let orderData = [];
        if (order) {
            orderData = [[order, orderDir]];
        }
        const result = await new AuditService(req).getSelfList(orderData);
        res.json(result);
    })
);
router.get(
    "/pending/list",
    [
        query("order").isIn([null, ""].concat(["id", "createUser", "status", "formId", "actionType", "createAt"])),
        query("orderDir").isIn([null, "", "asc", "desc"]),
    ],
    handleErrorAsync(async (req, res) => {
        const errors = validationResult(req);
        let order = req.query.order;
        const orderDir = req.query.orderDir;
        if (!errors.isEmpty()) {
            order = null;
        }
        let orderData = [];
        if (order) {
            orderData = [[order, orderDir]];
        }
        const result = await new AuditService(req).getPendingList(orderData);
        res.json(result);
    })
);
router.get(
    "/history/list",
    [
        query("order").isIn([null, ""].concat(["id", "createUser", "status", "formId", "actionType", "createAt"])),
        query("orderDir").isIn([null, "", "asc", "desc"]),
    ],
    handleErrorAsync(async (req, res) => {
        const result = await new AuditService(req).getHistoryList();
        res.json(result);
    })
);
router.post(
    "/draft",
    handleErrorAsync(async (req, res) => {
        const result = await new AuditService(req).saveAuditDraft();
        res.json(result);
    })
);
router.post(
    "/apply",
    handleErrorAsync(async (req, res) => {
        const result = await new AuditService(req).doApplyAuditData();
        res.json(result);
    })
);
router.post(
    "/verify",
    handleErrorAsync(async (req, res) => {
        const result = await new AuditService(req).doOtherActionForAuditData();
        res.json(result);
    })
);
router.get(
    "/route/:form_id",
    handleErrorAsync(async (req, res) => {
        const result = await new AuditService(req).queryRoute();
        res.json(result);
    })
);
router.post(
    "/tempfileupload",
    handleErrorAsync(async (req: any, res) => {
        const datas = await new AuditService(req).processUploadFile();
        res.send(datas);
    })
);
router.get(
    "/downloadauditfile",
    handleErrorAsync(async (req: any, res) => {
        // TODO 要怎麼禁止其他人存取別人的審核記錄的資料
        await new AuditService(req).downloadFile(res);
    })
);
export = router;
