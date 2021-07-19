import { Request, Response, Router } from "express";
import BankcodeService from "../services/BankcodeService";
import handleErrorAsync from "./handleErrorAsync";
const router = Router();

router.get(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        const data = await new BankcodeService(req).getBankCodeList();
        res.send(data);
    })
);

export = router;
