import * as express from "express";

const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.send("Hello Boy!!");
});

module.exports = router;
