import express from 'express'
import handleErrorAsync from "./handleErrorAsync";
import InterviewService from "../services/InterviewService";

const router = express.Router();

router.get(
    "/",
    handleErrorAsync((req, res) => {
        return new InterviewService(req).getIntervieweeList(req, res);
    })
);
router.get(
    "/:id([0-9]{1,11})",
    handleErrorAsync((req, res) => {
        return new InterviewService(req).getIntervieweeById(req, res);
    })
);
router.get(
    "/hired/:id([0-9]{1,11})",
    handleErrorAsync((req, res) => {
        return new InterviewService(req).getHiredInterviewee(req, res);
    })
);

router.post(
    "/",
    handleErrorAsync((req, res) => {
        return new InterviewService(req).insertInterviewee(req, res);
    })
);
router.put(
    "/",
    handleErrorAsync((req, res) => {
        return new InterviewService(req).updateInterviewee(req, res);
    })
);

module.exports = router;
