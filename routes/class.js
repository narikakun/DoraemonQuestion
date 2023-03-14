const router = require("express").Router();
const sqlite3 = require("sqlite3");
const classData = new sqlite3.Database("./db/database.db");

router.get("/authClass", (req, res) => {
    res.send("/user/");
});

module.exports = router;