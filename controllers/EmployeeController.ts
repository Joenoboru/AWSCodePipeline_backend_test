import { Router } from "express";
import EmployeeService from "../services/EmployeeService";
import LeaveReqService from "../services/LeaveReqService";
//import BusinessTripService from "../services/BusinessTripService";
import { ErrorDef } from "../wf_common";
import createDoc from "../pdf/employee";
import { exportPDF } from "../helpers/pdfHelper";
import { Employee } from "../domain-resource/ts-models";

import handleErrorAsync from "./handleErrorAsync";

const { check, query, validationResult } = require("express-validator");
const sortable = ["id", "name", "engname", "emp_num", "status"];
const router = Router();

router.get(
    "/all",
    handleErrorAsync(async function (req, res) {
        const service = new EmployeeService(req);
        const data = await service.getAll();
        res.json(data);
    })
);

router.get(
    "/picker",
    handleErrorAsync(async function (req, res) {
        const service = new EmployeeService(req);
        const data = await service.getPicker(req);
        res.json(data);
    })
);

router.get(
    "/",
    [query("order").isIn([null, ""].concat(sortable)), query("orderDir").isIn([null, "", "asc", "desc"])],
    handleErrorAsync(async function (req, res) {
        const service = new EmployeeService(req);
        await service.getList(req, res);
    })
);

router.get(
    "/:id([0-9]{1,11})/info",
    handleErrorAsync(async function (req, res) {
        const id = req.params.id;
        const service = new EmployeeService(req);
        const data = await service.getEmpInfo(id);
        res.json(data);
    })
);

//date filter
router.get(
    "/:employeeId([0-9]{1,11})/attendance/:year(\\d{4})/:month(0?[1-9]|1[012])",
    handleErrorAsync(async function (req: any, res) {
        const { employeeId, year, month } = req.params;
        const service = new EmployeeService(req);
        const returnBody = await service.getAttendanceDatasByEmp(
            year,
            month,
            employeeId,
            req.query.orderDir,
            req.query.limit,
            req.skip
        );
        res.send(returnBody);
    })
);
//date filter
router.get(
    "/:employeeId([0-9]{1,11})/attendanceweek/:year(\\d{4})/:month(0?[1-9]|1[012])/:date([0-9]{1,11})",
    handleErrorAsync(async function (req, res) {
        const { employeeId, year, month, date } = req.params;
        const service = new EmployeeService(req);
        const returnBody = await service.getAttendanceWeeksDatasByEmp(
            Number(year),
            Number(month),
            date,
            Number(employeeId),
            req.query.orderDir as string,
            7,
            0
        );
        res.send(returnBody);
    })
);
//get single data
router.get(
    "/:employeeId([0-9]{1,11})/attendance/single/:id([0-9]{1,11})",
    handleErrorAsync(async function (req, res) {
        const { employeeId, id } = req.params;
        const service = new EmployeeService(req);
        const returnBody = await service.getSingleAttendance(id, employeeId);
        res.send(returnBody);
    })
);
const attendanceProcess = handleErrorAsync(async function (req, res) {
    const employeeId = Number(req.params.employeeId);
    const service = new EmployeeService(req);
    const returnBody = await service.updateAttendanceInfo(req.body, employeeId);
    res.send(returnBody);
});
//get single data
router.post("/:employeeId([0-9]{1,11})/attendance/single/", attendanceProcess);
router.put("/:employeeId([0-9]{1,11})/attendance/single/", attendanceProcess);

router.get(
    "/:id([0-9]{1,11})",
    handleErrorAsync(async function (req, res) {
        const id = req.params.id;
        const service = new EmployeeService(req);
        const returnBody = await service.getEmpFullInfo(id);
        res.send(returnBody);
    })
);

router.get(
    "/:id([0-9]{1,11})/workLevel",
    handleErrorAsync(async function (req, res) {
        const id = req.params.id;
        const service = new EmployeeService(req);
        const returnBody = await service.getEmpWorkLevel(id);
        res.send(returnBody);
    })
);

router.get(
    "/:id([0-9]{1,11})/salaryInfo",
    handleErrorAsync(async function (req, res) {
        const employeeId = req.params.id;
        const service = new EmployeeService(req);
        const returnBody = await service.getEmpSalaryInfo(employeeId);
        res.send(returnBody);
    })
);

//TODO:BusinessTripService is WIP
router.get(
    "/:id([0-9]{1,11})/businessTrip",
    [
        query("order").isIn([null, ""].concat(["id", "title", "startTime", "endTime", "project"])),
        query("orderDir").isIn([null, "", "asc", "desc"]),
    ],
    handleErrorAsync(async function (req, res) {
        /*const employeeId = req.params.id;
        const service = new BusinessTripService(req);
        const returnBody = await service.getByEmployee(employeeId);
        res.send(returnBody);*/
        res.send("WIP");
    })
);

router.get(
    "/pdf/:id([0-9]{1,11})",
    handleErrorAsync(async function (req, res) {
        const id = req.params.id;
        const service = new EmployeeService(req);
        const result = await service.getEmpFullInfo(id);
        const empResult = result as Employee;
        if (empResult.id) {
            const doc = createDoc(empResult);
            exportPDF(doc, function (binary) {
                res.contentType("application/pdf");
                res.send(new Buffer(binary, "binary"));
            });
        } else {
            return res.send(result);
        }
    })
);

//insert
router.post(
    "/",
    [
        check("name").not().isEmpty().trim(),
        check("engname").not().isEmpty().trim(),
        check("status").isInt({ min: 0, max: 2 }).not().isEmpty(),
        check("sex").isInt({ min: 0, max: 2 }),
        check("bank_account").isInt().not().isEmpty(),
        check("email").if(check("email").not().isEmpty()).isEmail(),
        check("private_email").if(check("private_email").not().isEmpty()).isEmail(),
        check("birthday").toDate(),
        check("hire_date")
            .toDate()
            .if(check("status").isIn([1, 2]))
            .not()
            .isEmpty(),
        check("prob_start")
            .toDate()
            .if(check("status").isIn([1, 2]))
            .custom((value, { req }) => value >= req.body.hire_date)
            .not()
            .isEmpty(),
        check("prob_end")
            .toDate()
            .if(check("status").isIn([1, 2]))
            .custom((value, { req }) => value >= req.body.prob_start)
            .not()
            .isEmpty(),
        check("leave_date")
            .toDate()
            .if(check("leave_date").isIn([2]))
            .custom((value, { req }) => value >= req.body.hire_date)
            .not()
            .isEmpty(),
    ],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({
                status: "error",
                code: ErrorDef.formInvalid,
                errors: errors.array(),
            });
        }
        const service = new EmployeeService(req);
        const response = await service.insertBaseInfo(req.body);
        res.json(response);
    })
);

//update
router.put(
    "/",
    [
        check("id").isInt({ min: 1 }),
        check("name").not().isEmpty().trim(),
        check("engname").not().isEmpty().trim(),
        check("status").isInt({ min: 0, max: 2 }).not().isEmpty(),
        check("sex").isInt({ min: 0, max: 2 }),
        check("bank_account").isInt(),
        check("email").if(check("email").not().isEmpty()).isEmail(),
        check("private_email").if(check("private_email").not().isEmpty()).isEmail(),
        check("birthday").toDate(),
        check("hire_date")
            .toDate()
            .if(check("status").isIn([1, 2]))
            .not()
            .isEmpty(),
        check("prob_start")
            .toDate()
            .if(check("status").isIn([1, 2]))
            .custom((value, { req }) => value >= req.body.hire_date)
            .not()
            .isEmpty(),
        check("prob_end")
            .toDate()
            .if(check("status").isIn([1, 2]))
            .custom((value, { req }) => value >= req.body.prob_start)
            .not()
            .isEmpty(),
        check("leave_date")
            .toDate()
            .if(check("leave_date").isIn([2]))
            .custom((value, { req }) => value >= req.body.hire_date)
            .not()
            .isEmpty(),
    ],
    handleErrorAsync(async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({
                status: "error",
                code: ErrorDef.formInvalid,
                errors: errors.array(),
            });
        }
        const service = new EmployeeService(req);
        const response = await service.updateBaseInfo(req.body);
        res.json(response);
    })
);

//delete
router.delete(
    "/:id",
    handleErrorAsync(async function (req, res) {
        const id = req.params.id;
        const service = new EmployeeService(req);
        const response = await service.deleteEmp(id);
        res.json(response);
    })
);

router.get(
    "/:id/leavereq",
    handleErrorAsync(function (req, res) {
        const id = Number(req.params.id);
        const service = new LeaveReqService(req);
        service.getListByEmployeeId(req, res, id);
    })
);
export = router;
