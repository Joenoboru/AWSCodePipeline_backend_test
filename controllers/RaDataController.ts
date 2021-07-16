import express, { Request, Response } from "express";
import { query } from "express-validator";
import { ParamsDictionary } from "express-serve-static-core";
import handleErrorAsync from "./handleErrorAsync";
import { ErrorDef } from "../wf_common";
import RaService, { sortable } from "../services/RaService";
import { createOrder } from "../helpers/dbHelper";



const router = express.Router();

router.get(
    "/",
    [query("order").isIn([null, ""].concat(sortable)), query("orderDir").isIn([null, "", "asc", "desc"])],
    handleErrorAsync(async (req: Request, res: Response) => {
        const order = createOrder(req);
        const data = await new RaService(req).getPageOfData(req.query.str as string, req.query.filter as string[], order);
        res.send(data);
    })
);

router.post(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new RaService(req)
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
        await new RaService(req)
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
        await new RaService(req)
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
        await new RaService(req).downloadFile(res, id, index);
    })
);

router.get(
    "/convertable",
    handleErrorAsync(async (req: Request, res: Response) => {
        const data = await new RaService(req).getConvertableData();
        res.send(data);
    })
);

router.get(
    "/preconvertCheck",
    handleErrorAsync(async (req: Request, res: Response) => {
        const list = await new RaService(req).preconvertCheck();
        res.send(list);
    })
);

router.post(
    "/convert",
    [query("ids").isArray({ min: 1 }), query("ids.*").isNumeric()],
    handleErrorAsync(async (req: Request<ParamsDictionary, any, ConvertReqBody>, res: Response) => {
        const ids = req.body.ids;
        console.log(ids);
        const mIds: number[] = ids.filter((id) => !Number.isNaN(Number(id))).map((id) => Number(id));
        if (mIds.length > 0) {
            await new RaService(req)
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
        const result = await new RaService(req).getOne(id);
        res.json(result);
    })
);

export = router;

interface ConvertReqBody {
    ids: string[];
}
