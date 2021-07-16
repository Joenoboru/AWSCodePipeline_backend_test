import { Router } from "express";
import CurrencyService from "../services/CurrencyService";
import handleErrorAsync from "./handleErrorAsync";
const router = Router();

router.get(
    "",
    handleErrorAsync(async (req, res) => {
        const service = new CurrencyService(req);
        const data = await service.getCurrencies();
        res.send(data);
    })
);
export = router;
