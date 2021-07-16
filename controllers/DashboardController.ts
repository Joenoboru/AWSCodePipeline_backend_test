import express from 'express'
import DashboardService from "../services/DashboardService";
import handleErrorAsync from "./handleErrorAsync";
const router = express.Router();

router.get(
    "/info",
    handleErrorAsync(async (req, res) => {
        const service = new DashboardService(req);
        const result = await service.getInfo();
        res.json(result);
    })
);
router.get(
    "/announce/list",
    handleErrorAsync((req, res) => {
        const service = new DashboardService(req);
        service.getAnnounce(req, res);
    })
);
router.get(
    "/onwork",
    handleErrorAsync((req, res) => {
        const service = new DashboardService(req);
        service.onWork(req, res);
    })
);
router.get(
    "/offwork",
    handleErrorAsync((req, res) => {
        const service = new DashboardService(req);
        service.offWork(req, res);
    })
);
router.get(
    "/announce/:id",
    handleErrorAsync((req, res) => {
        const service = new DashboardService(req);
        service.getAnnounceInfo(req, res);
    })
);
export = router;
