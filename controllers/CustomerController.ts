import express from "express";
import { query, check } from "express-validator";
import CustomerService, { sortable } from "../services/CustomerService";
import handleErrorAsync from "./handleErrorAsync";

const router = express.Router();

router.get(
    "/all",
    handleErrorAsync(async (req, res) => {
        const service = new CustomerService(req);
        service.getAll(res);
    })
);
router.get(
    "/picker",
    handleErrorAsync(async (req, res) => {
        const service = new CustomerService(req);
        service.getPicker(req, res);
    })
);
router.get(
    "/list",
    [query("order").isIn([null, ""].concat(sortable)), query("orderDir").isIn([null, "", "asc", "desc"])],
    handleErrorAsync(async (req, res) => {
        const service = new CustomerService(req);
        service.getList(req, res);
    })
);
router.get(
    "/:id([0-9]{1,11})",
    handleErrorAsync(async (req, res) => {
        const service = new CustomerService(req);
        service.getData(req, res);
    })
);
router.get(
    "/project/:id([0-9]{1,11})",
    handleErrorAsync(async (req, res) => {
        const service = new CustomerService(req);
        service.getProjects(req, res);
    })
);
router.post(
    "/",
    [
        check("name").not().isEmpty().trim(),
        check("chname").not().isEmpty().trim(),
        check("engname").not().isEmpty().trim(),
        check("cat").trim(),
        check("site").if(check("site").not().isEmpty()).isURL(),
    ],
    handleErrorAsync(async (req, res) => {
        const service = new CustomerService(req);
        service.createData(req, res);
    })
);
router.put(
    "/",
    [
        check("id").isInt({ min: 1 }),
        check("name").not().isEmpty().trim(),
        check("chname").not().isEmpty().trim(),
        check("engname").not().isEmpty().trim(),
        check("cat").trim(),
        check("site").if(check("site").not().isEmpty()).isURL(),
    ],
    handleErrorAsync(async (req, res) => {
        const service = new CustomerService(req);
        service.updateData(req, res);
    })
);
router.delete(
    "/:id([0-9]{1,11})",
    handleErrorAsync(async (req, res) => {
        const service = new CustomerService(req);
        service.deleteData(req, res);
    })
);

export = router;
