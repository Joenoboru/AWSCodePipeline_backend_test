import { Request, Response, Router } from "express";
import BankaccountService from "../services/BankaccountService";
import { ErrorDef } from "../wf_common";
import handleErrorAsync from "./handleErrorAsync";
const router = Router();

router.get(
    "/list",
    handleErrorAsync(async (req: Request, res: Response) => {
        const datas = await new BankaccountService(req).getPageOfAccount();
        res.send(datas);
    })
);
router.get(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        const datas = await new BankaccountService(req).getBankAccountList();
        res.send(datas);
    })
);
router.get(
    "/all",
    handleErrorAsync(async function (req, res) {
        const results = await new BankaccountService(req).getAll();
        res.json(results);
    })
);
router.post(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new BankaccountService(req)
            .createOrUpdateData(req.body)
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);
router.put(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new BankaccountService(req)
            .createOrUpdateData(req.body)
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);
router.get(
    "/:id([0-9]{1,11})",
    handleErrorAsync(async (req: Request, res: Response) => {
        const data = await new BankaccountService(req).getOneBankAccount(req.params.id);
        res.send(data);
    })
);
router.get(
    "/:id([0-9]{1,11})/state",
    handleErrorAsync(async (req: Request, res: Response) => {
        const datas = await new BankaccountService(req).getPageOfState(req.params.id);
        res.send(datas);
    })
);
router.get(
    "/:id([0-9]{1,11})/state/:date",
    handleErrorAsync(async (req: Request, res: Response) => {
        const datas = await new BankaccountService(req).getOneState(req.params.id, req.params.date);
        res.send(datas);
    })
);
router.post(
    "/:id([0-9]{1,11})/state",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new BankaccountService(req)
            .createState(req.params.id, req.body)
            .then(() => {
                res.json({ status: "ok" });
            })
            .catch((e) => {
                res.json({ status: "error", code: e });
            });
    })
);
router.put(
    "/:id([0-9]{1,11})/state",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new BankaccountService(req)
            .updateState(req.params.id, req.body)
            .then(() => {
                res.json({ status: "ok" });
            })
            .catch((e) => {
                res.json({ status: "error", code: e });
            });
    })
);
router.delete(
    "/:id([0-9]{1,11})/state/",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new BankaccountService(req)
            .removeState(req.params.id, req.body.data.settleDate)
            .then(() => {
                res.json({ status: "ok" });
            })
            .catch((e) => {
                res.json({ status: "error", code: e });
            });
    })
);
export = router;
