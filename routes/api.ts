import express from "express";
import { ErrorDef } from "../wf_common";
import BaseService from "../services/BaseService";

// const fs = require("fs");
//const path = require("path");
// const db = require("../common-database");
//const { User, sequelize } = require('../models/index');
//const { check, validationResult } = require('express-validator');

const router = express.Router();

router.all(/\/(.*?)/, function (req, res, next) {
    try {
        if (!req.user) {
            res.send({ status: "error", code: ErrorDef.userNotLogin, msg: "Not logined." });
        } else {
            // db.test().then(() => {
            //     //檢查資料庫連線
            //     if (db.error) {
            //         res.send({ status: "error", code: ErrorDef.dbConnError, msg: "Faild to connect database" });
            //     } else {
            //         next();
            //     }
            // });
            next();
        }
    } catch (err) {
        const service = new BaseService(req);
        service.logger.error(err);
    }
});

const CurrencyController = require("../controllers/CurrencyController");
const ProfitlossController = require("../controllers/ProfitlossController");
const BankaccountController = require("../controllers/BankaccountController");
const LanguageController = require("../controllers/LanguageController");
const AccountitemController = require("../controllers/AccountitemController");
const AccountItemSettingController = require("../controllers/AccountItemSettingController");
const AttendanceController = require("../controllers/AttendanceController");
const SalarydefController = require("../controllers/SalarydefController");
const AuditController = require("../controllers/AuditController");
const InterviewController = require("../controllers/InterviewController");
const InterviewSkillController = require("../controllers/InterviewSkillController");
const LeaveHourController = require("../controllers/LeaveHourController");
const ProjectController = require("../controllers/ProjectController");
const DashboardController = require("../controllers/DashboardController");
const EmployeeController = require("../controllers/EmployeeController");
const LeaveReqController = require("../controllers/LeaveReqController");
const RouteController = require("../controllers/RouteController");
const WorklevelController = require("../controllers/WorklevelController");
const SalaryController = require("../controllers/SalaryController");
const SalaryitemController = require("../controllers/SalaryitemController");
const HoldController = require("../controllers/HoldController");
const FormController = require("../controllers/FormController");
const LeaveTypeController = require("../controllers/LeaveTypeController");
const MessageController = require("../controllers/MessageController");
const DeputyController = require("../controllers/DeputyController");
const EmpPermissionController = require("../controllers/EmpPermissionController");
const AnnounceController = require("../controllers/AnnounceController");
const CustomerController = require("../controllers/CustomerController");
const CorporateController = require("../controllers/CorporateController");
const ProjectCatController = require("../controllers/ProjectCatController");
const WorkprojectController = require("../controllers/WorkprojectController");
const WorkPositionController = require("../controllers/WorkPositionController");
const SalarylvController = require("../controllers/SalarylvController");
const DepartposController = require("../controllers/DepartposController");
const DepartController = require("../controllers/DepartController");
const EmpworkController = require("../controllers/EmpworkController");
const ExtrahoursreqController = require("../controllers/ExtrahoursreqController");
const BankcodeController = require("../controllers/BankcodeController");
const ExchangerateController = require("../controllers/ExchangerateController");
const UserController = require("../controllers/UserController");
const BudgetController = require("../controllers/BudgetController");
const BusinessTripController = require("../controllers/BusinessTripController");
const RaTypeController = require("../controllers/RaTypeController");
const RaDataController = require("../controllers/RaDataController");
const RaTransferController = require("../controllers/RaTransferController");
const RaReportController = require("../controllers/RaReportController");
const OpeController = require("../controllers/OpeController");
const AccountVoucherController = require("../controllers/AccountVoucherController");
const AccountReportController = require("../controllers/AccountReportController");
const AccountConsolidationController = require("../controllers/AccountConsolidationController");
const PageController = require("../controllers/PageController");
const UploadController = require("../controllers/UploadController");
const PermissionRoleController = require("../controllers/PermissionRoleController");

router.use("/currency", CurrencyController);
router.use("/profitloss", ProfitlossController);
router.use("/bankaccount", BankaccountController);
router.use("/language", LanguageController);
router.use("/accountitem", AccountitemController);
router.use("/accsettings", AccountItemSettingController);
router.use("/attendance", AttendanceController);
router.use("/salarydef", SalarydefController);
router.use("/audit", AuditController);
router.use("/interview", InterviewController);
router.use("/interviewSkill", InterviewSkillController);
router.use("/leavehour", LeaveHourController);
router.use("/project", ProjectController);
router.use("/dashboard", DashboardController);
router.use("/employee", EmployeeController);
router.use("/leavereq", LeaveReqController);
router.use("/route", RouteController);
router.use("/worklevel", WorklevelController);
router.use("/salary", SalaryController);
router.use("/salaryitem", SalaryitemController);
router.use("/hold", HoldController);
router.use("/form", FormController);
router.use("/leavetype", LeaveTypeController);
router.use("/message", MessageController);
router.use("/deputy", DeputyController);
router.use("/empPermission", EmpPermissionController);
router.use("/announce", AnnounceController);
router.use("/customer", CustomerController);
router.use("/corporate", CorporateController);
router.use("/projectcat", ProjectCatController);
router.use("/workproject", WorkprojectController);
router.use("/workPosition", WorkPositionController);
router.use("/salarylv", SalarylvController);
router.use("/departpos", DepartposController);
router.use("/depart", DepartController);
router.use("/empwork", EmpworkController);
router.use("/extrahoursreq", ExtrahoursreqController);
router.use("/bankcode", BankcodeController);
router.use("/exchangerate", ExchangerateController);
router.use("/user", UserController);+


router.use("/businessTrip", BusinessTripController);
router.use("/ratype", RaTypeController);
router.use("/radata", RaDataController);
router.use("/ratrans", RaTransferController);
router.use("/rareport", RaReportController);
router.use("/ope", OpeController);
router.use("/accVoucher", AccountVoucherController);
router.use("/accReport", AccountReportController);
router.use("/accConso", AccountConsolidationController);
router.use("/page", PageController);
router.use("/upload", UploadController);
router.use("/permissionRole", PermissionRoleController);

// //include all api router under ./apis folder
// fs.readdirSync(__dirname + "/apis")
//     .filter((file) => {
//         return file.indexOf(".") !== 0 && file.slice(-3) === ".js";
//     })
//     .forEach((file) => {
//         let name = file.slice(0, -3);
//         const subRouter = require("./apis/" + file);
//         router.use("/" + name, subRouter);
//     });

// //include all api router under ./apis folder
// fs.readdirSync(__dirname + "/controllers")
//     .filter((file) => {
//         return file.indexOf(".") !== 0 && file.slice(-3) === ".js";
//     })
//     .forEach((file) => {
//         const controllerName = file.toLocaleLowerCase().replace("controller", "").slice(0, -3);
//         const subRouter = require("./controllers/" + file);
//         router.use("/" + controllerName, subRouter);
//     });

export default router;
