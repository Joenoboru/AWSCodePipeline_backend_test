import { Request, Response, Router } from "express";
import ProfitLossService from "../services/ProfitLossService";
import { ErrorDef } from "../wf_common";
import handleErrorAsync from "./handleErrorAsync";
const router = Router();

interface RequestWithItemId extends Request {
    query: {
        mainId: string | null;
        secondId: string | null;
    };
}

router.get(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        const datas = await new ProfitLossService(req).getPLitems();
        res.send(datas);
    })
);
router.get(
    "/datas",
    handleErrorAsync(async (req: Request, res: Response) => {
        const datas = await new ProfitLossService(req).getMains();
        res.send(datas);
    })
);
router.get(
    "/:main/datas",
    handleErrorAsync(async (req: Request, res: Response) => {
        const datas = await new ProfitLossService(req).getSeconds(req.params.main);
        res.send(datas);
    })
);
router.get(
    "/:main/:second/datas",
    handleErrorAsync(async (req: Request, res: Response) => {
        const datas = await new ProfitLossService(req).getThirds(req.params.second);
        res.send(datas);
    })
);

router.get(
    "/l2",
    handleErrorAsync(async (req: Request, res: Response) => {
        const datas = await new ProfitLossService(req).getAllSeconds();
        res.send(datas);
    })
);

router.get(
    "/l3",
    handleErrorAsync(async (req: Request, res: Response) => {
        const datas = await new ProfitLossService(req).getAllThirds();
        res.send(datas);
    })
);

router.get(
    "/l2/:id",
    handleErrorAsync(async (req, res) => {
        const id = req.params.id;
        const result = await new ProfitLossService(req).getOneSecond(id);
        res.json(result);
    })
);

router.get(
    "/l3/:id",
    handleErrorAsync(async (req, res) => {
        const id = req.params.id;
        const result = await new ProfitLossService(req).getOneThird(id);
        res.json(result);
    })
);

router.post(
    "/l2",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new ProfitLossService(req)
            .createOrUpdateSecond(req.body)
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);

router.post(
    "/l3",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new ProfitLossService(req)
            .createOrUpdateThird(req.body)
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);

router.put(
    "/l2",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new ProfitLossService(req)
            .createOrUpdateSecond(req.body)
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
    "/l3",
    handleErrorAsync(async (req: Request, res: Response) => {
        await new ProfitLossService(req)
            .createOrUpdateThird(req.body)
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                console.log(error);
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);

router.get(
    "/breadcrumbs",
    handleErrorAsync(async (req: RequestWithItemId, res: Response) => {
        const datas = await new ProfitLossService(req).getBreadcrumbs(req.query.mainId, req.query.secondId);
        res.send(datas);
    })
);
router.post(
    "/checkusage",
    handleErrorAsync(async (req: Request, res: Response) => {
        new ProfitLossService(req)
            .checkUsage(req.body)
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);
router.post(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        new ProfitLossService(req)
            .createPLItems(req.body)
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
        new ProfitLossService(req)
            .createPLItems(req.body)
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);
router.delete(
    "/",
    handleErrorAsync(async (req: Request, res: Response) => {
        new ProfitLossService(req)
            .deletePLItems(req.body)
            .then((model) => {
                res.send({ status: "ok", result: model });
            })
            .catch((error) => {
                res.send({ status: "error", code: ErrorDef.ErrorTran, error: error });
            });
    })
);
export = router;
