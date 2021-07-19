import FileService from "../services/FileService";
import express, { Request, Response } from "express";
import handleErrorAsync from "./handleErrorAsync";
const router = express.Router();

router.post(
    "/temp",
    handleErrorAsync(async function (req: Request, res: Response) {
        const tempFileList = await new FileService(req).uploadTempFile();
        res.json(tempFileList);
    })
);

export = router;
