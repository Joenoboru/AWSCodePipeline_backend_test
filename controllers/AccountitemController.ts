import { Request, Response, Router } from "express";
import AccountitemService from "../services/AccountitemService";
import handleErrorAsync from "./handleErrorAsync";
import { ErrorDef } from "../wf_common";
const router = Router();

router.get(
    "/all",
    handleErrorAsync(async (req: Request, res: Response) => {
        const datas = await new AccountitemService(req).getAll();
        res.send(datas);
    })
);
router.get(
    "/tree",
    handleErrorAsync(async function (req, res) {
        const datas = await new AccountitemService(req).getTree();
        res.send(datas);
    })
);

router.get(
    "/data/:id",
    handleErrorAsync(async (req, res) => {
        const id = req.params.id;
        const result = await new AccountitemService(req).getOne(id);
        res.json(result);
    })
);

router.get(
    "/",
    handleErrorAsync(async function (req, res) {
        const datas = await new AccountitemService(req).getList();
        res.send(datas);
    })
);
router.get(
    "/example",
    handleErrorAsync(async (req: any, res) => {
        const datas = await new AccountitemService(req).processUploadFile();
        res.send(datas);
    })
);
router.post(
    "/upload",
    handleErrorAsync(async (req: any, res) => {
        const datas = await new AccountitemService(req).processUploadFile();
        res.send(datas);
    })
);

router.post(
    "/data",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new AccountitemService(req)
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
    "/data",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new AccountitemService(req)
            .createOrUpdateData(req.body)
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);

//delete
router.delete(
    "/:id",
    handleErrorAsync(async (req: Request, res: Response) => {
        const id = req.params.id;
        await new AccountitemService(req)
            .deleteData(id)
            .then((result) => {
                if (result) {
                    res.send({ status: "ok", result: {} });
                } else {
                    res.send({ status: "error", code: ErrorDef.DataNotFound });
                }
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);

export = router;
