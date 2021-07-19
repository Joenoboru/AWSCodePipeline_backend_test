import express from "express";
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res) {
    res.render("index", { title: "Express" });
});

router.post("/", function (req) {
    console.log(req.body.test);
});

export default router;
