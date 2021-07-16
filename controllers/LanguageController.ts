import { Request, Response, Router } from "express";
import LanguageService from "../services/LanguageService";
import handleErrorAsync from "./handleErrorAsync";
const router = Router();

router.get(
    "",
    handleErrorAsync(async (req: Request, res: Response) => {
        const data = await new LanguageService(req).getAll();
        res.send(data);
    })
);
export = router;
