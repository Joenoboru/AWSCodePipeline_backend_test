import { ErrorDef } from "../wf_common";
import express, { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import handleErrorAsync from "./handleErrorAsync";
import RaTransferService, { sortable } from "../services/RaTransferService";
import { createOrder } from "../helpers/dbHelper";
import { query } from "express-validator";

const router = express.Router();

router.get(
    "/",
    [query("order").isIn([null, ""].concat(sortable)), query("orderDir").isIn([null, "", "asc", "desc"])],
    handleErrorAsync(async (req: Request, res: Response) => {
        const order = createOrder(req);
        const datas = await new RaTransferService(req).getPageOfData(req.query.str as string, req.query.filter as string[], order);
        res.send(datas);
    })
);

router.post(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new RaTransferService(req)
            .createOrUpdateData(req.body)
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                console.log(error);
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);

router.put(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new RaTransferService(req)
            .createOrUpdateData(req.body)
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                console.log(error);
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);

//delete
router.delete(
    "/:id",
    handleErrorAsync(async (req: Request, res: Response) => {
        const id = req.params.id;
        await new RaTransferService(req)
            .deleteData(id)
            .then((result) => {
                if (result) {
                    res.send({ status: "ok", result: {} });
                } else {
                    res.send({ status: "error", code: ErrorDef.DataNotFound });
                }
            })
            .catch((error) => {
                console.log(error);
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);

router.get(
    "/:id/attachment/:index",
    handleErrorAsync(async (req, res) => {
        const id = req.params.id;
        const index = Number(req.params.index);
        await new RaTransferService(req).downloadFile(res, id, index);
    })
);

router.get(
    "/convertable",
    handleErrorAsync(async (req: Request, res: Response) => {
        const datas = await new RaTransferService(req).getConvertableData();
        res.send(datas);
    })
);

router.get(
    "/preconvertCheck",
    handleErrorAsync(async (req: Request, res: Response) => {
        const list = await new RaTransferService(req).preconvertCheck();
        res.send(list);
    })
);

router.post(
    "/convert",
    [query("ids").isArray({ min: 1 }), query("ids.*").isNumeric()],
    handleErrorAsync(async (req: Request<ParamsDictionary, any, ConvertReqBody>, res: Response) => {
        const ids = req.body.ids;
        const mIds: number[] = ids.filter((id) => !Number.isNaN(Number(id))).map((id) => Number(id));
        if (mIds.length > 0) {
            await new RaTransferService(req)
                .convertData(mIds)
                .then((model) => {
                    res.send({ status: "ok", result: model });
                })
                .catch((error) => {
                    console.log(error);
                    res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
                });
        } else {
            res.send({ status: "error", code: ErrorDef.ErrorTran });
        }
    })
);

router.get(
    "/:id",
    handleErrorAsync(async (req, res) => {
        const id = req.params.id;
        const result = await new RaTransferService(req).getOne(id);
        res.json(result);
    })
);

export = router;

interface ConvertReqBody {
    ids: string[];
}
