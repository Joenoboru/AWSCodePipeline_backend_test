import express from "express";
import passport from "../authPassport";
import EmployeeService from "../services/EmployeeService";
import { ErrorDef } from "../wf_common";

const router = express.Router();
/**
 * login
 */
router.post(
    "/login",
    passport.authenticate("local", { failWithError: true }),
    function (req, res) {
        // handle success
        if (req.user) {
            res.send({ status: "ok" });
        } else {
            res.send({ status: "error", code: ErrorDef.userNotLogin });
        }
    },
    function (err, req, res, next) {
        // handle error
        //if (req.xhr) { return res.json(err); }
        res.send({ status: "error", code: err });
    }
);
router.get("/google", (req, res, next) => {
    // req.session.domain = "test";
    // req.session.save();
    passport.authenticate("google", {
        scope: ["email", "profile"],
    })(req, res, next);
});
router.get(
    "/google/callback",
    passport.authenticate("google", {
        successRedirect: process.env.APP_URL,
        failureRedirect: process.env.APP_URL + "/#login/401",
    })
    // ,
    // (req, res) => {
    //     // return res
    //     //     .status(200)
    //     //     .cookie('jwt', signToken(req.user), {
    //     //         httpOnly: true
    //     //     })
    //     //     .redirect("/")
    //     res.send(req.user);
    // }
);
router.get("/access", async function (req, res) {
    if (req.user) {
        const service = new EmployeeService(req);
        const pageItem = await service.getPages();
        res.send(pageItem);
    } else {
        res.send({});
    }
});
router.get("/login", async function (req, res) {
    if (req.user) {
        const service = new EmployeeService(req);
        const rolesAndFuncs = await service.getEmployeeRolesAndFuncs(req.user.employeeId);
        const pages = await service.getPages();
        const crule = await service.getCompanyRule();
        res.send({
            ...req.user,
            ...rolesAndFuncs,
            pages,
            crule,
        });
    } else {
        res.send({});
    }
});

router.get("/logout", function (req, res) {
    req.logout();
    res.send({ status: "ok" });
});

export = router;
