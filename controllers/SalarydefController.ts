import { Router } from "express";
import SalarydefService from "../services/SalarydefService";
import handleErrorAsync from "./handleErrorAsync";
const router = Router();

router.post(
    "/:id",
    handleErrorAsync(async (req, res) => {
        const datas = await new SalarydefService(req).updateSalaryDef(req.body.workLevel, req.body.def, Number(req.params.id));
        res.send(datas);
    })
);
export = router;
