import { ErrorDef } from "../wf_common";
import express, { Request, Response } from "express";
import { query } from "express-validator";
import handleErrorAsync from "./handleErrorAsync";
import AccountItemSetting, { sortable } from "../services/AccountitemSettingService";
import { createOrder } from "../helpers/dbHelper";
const router = express.Router();

router.get(
    "/",
    [query("order").isIn([null, ""].concat(sortable)), query("orderDir").isIn([null, "", "asc", "desc"])],
    handleErrorAsync(async (req: Request, res: Response) => {
        const order = createOrder(req);
        const datas = await new AccountItemSetting(req).getPageOfData(req.query.str as string, req.query.filter as string[], order);
        res.send(datas);
    })
);
router.get(
    "/all",
    handleErrorAsync(async function (req, res) {
        const results = await new AccountItemSetting(req).getAll();
        res.json(results);
    })
);

/*router.get(
    "/:id",
    handleErrorAsync(async (req, res) => {
        const id = req.params.id;
        const result = await new AccountItemSetting(req).getOne(id);
        res.json(result);
    })
);*/

router.put(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new AccountItemSetting(req)
            .updateData(req.body)
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                console.log(error);
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);

router.post(
    "/init",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new AccountItemSetting(req)
            .initData()
            .then(() => {
                res.send({ status: "ok" });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);

export = router;
