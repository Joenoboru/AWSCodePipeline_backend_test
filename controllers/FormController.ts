import express from "express";
import FormService from "../services/FormService";
import handleErrorAsync from "./handleErrorAsync";

const router = express.Router();
router.get(
    "/:id([0-9]{1,11})",
    handleErrorAsync(async (req, res) => {
        const id = Number(req.params.id);
        const service = new FormService(req);
        const data = await service.searchOne(id);
        res.json(data);
    })
);
router.get(
    "/list/all",
    handleErrorAsync(async (req, res) => {
        const service = new FormService(req);
        const data = await service.getList();
        res.json(data);
    })
);
router.get(
    "/route/:id([0-9]{1,11})",
    handleErrorAsync(async (req, res) => {
        const id = Number(req.params.id);
        const service = new FormService(req);
        const data = await service.getRoute(id);
        res.json(data);
    })
);
router.get(
    "/dept/:id([0-9]{1,11})",
    handleErrorAsync(async (req, res) => {
        const id = Number(req.params.id);
        const service = new FormService(req);
        const data = await service.getDept(id);
        res.json(data);
    })
);
router.post(
    "/dept/:id([0-9]{1,11})",
    handleErrorAsync(async (req, res) => {
        const id = Number(req.params.id);
        const service = new FormService(req);
        const data = await service.addDept(id, req.body.deptId);
        res.json(data);
    })
);
router.delete(
    "/dept/:id([0-9]{1,11})",
    handleErrorAsync(async (req, res) => {
        const id = Number(req.params.id);
        const service = new FormService(req);
        const data = await service.deleteDept(id, req.body.data.deptId);
        res.json(data);
    })
);
router.get(
    "/sections/:id([0-9]{1,11})",
    handleErrorAsync(async (req, res) => {
        const id = Number(req.params.id);
        const service = new FormService(req);
        const data = await service.getSections(id);
        res.json(data);
    })
);
router.put(
    "/route/",
    handleErrorAsync(async (req, res) => {
        const service = new FormService(req);
        const data = await service.updateRoute(req.body);
        res.json(data);
    })
);
router.get(
    "/list",
    handleErrorAsync(async (req, res) => {
        const service = new FormService(req);
        const data = await service.searchList(req.params.str, req.params.filter as any);
        res.json(data);
    })
);
router.put(
    "/list",
    handleErrorAsync(async (req, res) => {
        const service = new FormService(req);
        const data = await service.updateForm(req.body);
        res.json(data);
    })
);
router.get(
    "/list/available",
    handleErrorAsync(async (req, res) => {
        const service = new FormService(req);
        const data = await service.getListAvailable(req.user.employeeId);
        res.json(data);
    })
);
// router.put("/:id([0-9]{1,11})", formService.searchOne);

export = router;
