import express from "express";
import MessageService, { sortable } from "../services/MessageService";
import { query } from "express-validator";
import { createOrder } from "../helpers/dbHelper";
import handleErrorAsync from "./handleErrorAsync";

const router = express.Router();

router.get(
    "/unread",
    handleErrorAsync(async function (req, res) {
        const service = new MessageService(req);
        const result = await service.getUnreadByMail(req.session.passport.user.email);
        res.json(result);
    })
);

router.get(
    "/list",
    [query("order").isIn([null, "", ...sortable]), query("orderDir").isIn([null, "", "asc", "desc"])],

    handleErrorAsync(async (req, res) => {
        const order = createOrder(req, [["createdAt", "desc"]]);
        const results = await new MessageService(req).getListDataByMail(
            req.session.passport.user.email,
            req.query.str as string,
            req.query.filter as string[],
            { order: order }
        );
        res.json({ count: results.count, data: results.rows });
    })
);

router.get(
    "/doread/:id",
    handleErrorAsync(function (req, res) {
        const service = new MessageService(req);
        service
            .read(Number(req.params.id))
            .then(() => {
                res.json({
                    status: "ok",
                });
            })
            .catch(() => {
                res.json({
                    status: "error",
                });
            });
    })
);

export = router;
