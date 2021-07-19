import { Request, Response, Router } from "express";
import ExchangerateService from "../services/ExchangerateService";
import { ErrorDef } from "../wf_common";
import handleErrorAsync from "./handleErrorAsync";
const router = Router();

router.get(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        const datas = await new ExchangerateService(req).current();
        res.send(datas);
    })
);
router.post(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        const datas = await new ExchangerateService(req).update(req.body);
        res.send(datas);
    })
);

export = router;
