const router = require("express").Router();
const bodyParser = require("body-parser");

router.use(bodyParser.json());

router.use((err, req, res, next) => {
    console.error(err);
    if (err.status) res.status(err.status);
    if (!res.statusCode) res.status(500);
    res.json({msg: err.message});
});

router.use("/class", require("./class/createClass"));
router.use("/class", require("./class/authClass"));
router.use("/class", require("./class/tAuthClass"));
router.use("/class", require("./class/getClass"));

router.use("/board", require("./board/boardList"));
router.use("/board", require("./board/createBoard"));
router.use("/board", require("./board/boardShow"));

router.use("/comment", require("./comment/commentList"));
router.use("/comment", require("./comment/commentPost"));

router.use("/ws", require("./websocket/wsConnect"));

router.use("/admin", require("./admin/removeBoard"));
router.use("/admin", require("./admin/removeComment"));

module.exports = router;