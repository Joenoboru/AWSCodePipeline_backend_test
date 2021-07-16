import { Request, Response, NextFunction } from "express";
import BaseService from "../services/BaseService";

type RouteFunc = (req: Request, res: Response, next: NextFunction) => void;

const handleErrorAsync =
    (func: RouteFunc): RouteFunc =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            func(req, res, next);
        } catch (error) {
            const service = new BaseService(req);
            service.logger.error(error);
            next(error);
        }
    };
export default handleErrorAsync;
