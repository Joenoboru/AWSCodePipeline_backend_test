import express from "express";
import InterviewskillService from "../services/InterviewskillService";
import handleErrorAsync from "./handleErrorAsync";

const router = express.Router();

router.get(
    "/:type",
    handleErrorAsync(async (req, res) => {
        const data = await new InterviewskillService(req).getAll(Number(req.params.type));
        res.json(data);
    })
);

export = router;
