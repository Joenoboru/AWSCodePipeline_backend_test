import { Response, Router } from "express";
import { check } from "express-validator";
import AttendanceService, { AttendanceDataImportService } from "../services/AttendanceService";
import handleErrorAsync from "./handleErrorAsync";
const router = Router();

router.get(
    "/:id([0-9]{1,11})",
    handleErrorAsync(async (req: any, res: Response) => {
        const data = await new AttendanceService(req).getOne(req.params.id, req.user.employeeId);
        res.send(data);
    })
);
router.get(
    "/:year(\\d{4})/:month(0?[1-9]|1[012])",
    handleErrorAsync(async function (req: any, res) {
        const { year, month } = req.params;
        const data = await new AttendanceService(req).getAttendanceDatasByEmp(year, month, req.user.employeeId);
        res.send(data);
    })
);
router.post(
    "/",
    handleErrorAsync(async function (req: any, res) {
        const { employeeId } = req.user;
        const data = await new AttendanceService(req).updateAttendanceInfo(req.body, employeeId);
        res.send(data);
    })
);
router.put(
    "/",
    [check("id").isInt({ min: 1 })],
    handleErrorAsync(async function (req: any, res) {
        const { employeeId } = req.user;
        const data = await new AttendanceService(req).updateAttendanceInfo(req.body, employeeId);
        res.send(data);
    })
);
//delete
router.delete(
    "/:id",
    handleErrorAsync(async function (req: any, res) {
        const { id } = req.params;
        const { employeeId } = req.user;
        const data = await new AttendanceService(req).deleteAttendanceInfo(id, employeeId);
        res.send(data);
    })
);

router.post(
    "/excelimport/:id([0-9]{1,11})",
    handleErrorAsync(async function (req: any, res) {
        //const { employeeId } = req.user;
        const { id } = req.params;
        const data = await new AttendanceDataImportService(req, Number(id)).importExcel();
        res.send(data);
    })
);
export = router;
