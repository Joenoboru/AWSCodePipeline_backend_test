import express from "express";
import handleErrorAsync from "./handleErrorAsync";
import LeaveHourService from "../services/LeaveHourService";

const router = express.Router();

router.get(
    "/:id([0-9]{1,11})",
    handleErrorAsync(async (req, res) => {
        const service = new LeaveHourService(req);
        return service.getEmployeeYearLeaveHour(req, res);
    })
);
router.put(
    "/:id([0-9]{1,11})",
    handleErrorAsync(async (req, res) => {
        const service = new LeaveHourService(req);
        const id = Number(req.params.id);
        await service
            .forceUpdateEmployeeYearLeaveHour(id, req.body)
            .then(() => {
                res.json({ status: "ok" });
            })
            
            .catch((e) => {
                res.json({ status: "error", code: e });
            });
    })
);
router.post(
    "/calculate",
    handleErrorAsync(async (req, res) => {
        const service = new LeaveHourService(req);
        return service.calculateLeaveNeedHour(req, res);
    })
);

export = router;
