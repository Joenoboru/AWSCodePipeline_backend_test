import { Request, Response, Router } from "express";
import PageService from "../services/PageService";
import handleErrorAsync from "./handleErrorAsync";
const router = Router();

router.get(
    "",
    handleErrorAsync(async (req: Request, res: Response) => {
        const data = await new PageService(req).getAll();
        res.send(data);
    })
);
export = router;
