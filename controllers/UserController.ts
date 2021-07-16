import { Request, Response, Router } from "express";
import UserService from "../services/UserService";
import handleErrorAsync from "./handleErrorAsync";
const router = Router();

router.post(
    "/changepassword",
    handleErrorAsync(async (req: Request, res: Response) => {
        const datas = await new UserService(req)
            .changePassword(req.body)
            .then(() => {
                res.send({ status: "ok" });
            })
            .catch((e) => {
                res.send({ status: "error", code: e });
            });
    })
);
export = router;
