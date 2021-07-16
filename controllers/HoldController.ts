import { Request, Response, Router } from "express";
import handleErrorAsync from "./handleErrorAsync";
// import AccountitemService from "../services/AccountitemService";
const router = Router();
router.get(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        res.json([]);
    })
);
export = router;
