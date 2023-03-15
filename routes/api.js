const router = require("express").Router();
const bodyParser = require("body-parser");

router.use(bodyParser.json());

router.use("/class", require("./class/createClass"));
router.use("/class", require("./class/authClass"));

router.use("/board", require("./board/boardList"));

module.exports = router;