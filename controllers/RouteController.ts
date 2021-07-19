import express from 'express'
import RouteService from "../services/RouteService";
import handleErrorAsync from "./handleErrorAsync";
const router = express.Router();

router.get(
    "/",
    handleErrorAsync((req, res) => {
        const service = new RouteService(req);
        service.getList(req, res);
    })
);
router.get(
    "/all",
    handleErrorAsync((req, res) => {
        const service = new RouteService(req);
        service.getAll(req, res);
    })
);
router.put(
    "/",
    handleErrorAsync((req, res) => {
        const service = new RouteService(req);
        service.updateRoute(req, res);
    })
);
router.post(
    "/",
    handleErrorAsync((req, res) => {
        const service = new RouteService(req);
        service.updateRoute(req, res);
    })
);
router.get(
    "/:id([0-9]{1,11})",
    handleErrorAsync((req, res) => {
        const service = new RouteService(req);
        service.getDetail(req, res);
    })
);
router.get(
    "/includeSections/:id([0-9]{1,11})/:formId([0-9]{1,11})",
    handleErrorAsync((req, res) => {
        const service = new RouteService(req);
        service.getDetailSections(req, res);
    })
);
router.get(
    "/info/:id([0-9]{1,11})",
    handleErrorAsync((req, res) => {
        const service = new RouteService(req);
        service.getMain(req, res);
    })
);
router.delete(
    "/:id([0-9]{1,11})",
    handleErrorAsync((req, res) => {
        const service = new RouteService(req);
        service.removeDetail(req, res);
    })
);
router.put(
    "/:id([0-9]{1,11})",
    handleErrorAsync((req, res) => {
        const service = new RouteService(req);
        service.updateDetail(req, res);
    })
);
router.put(
    "/detail/:id([0-9]{1,11})",
    handleErrorAsync((req, res) => {
        const service = new RouteService(req);
        service.updateAllDetail(req, res);
    })
);
export = router;
