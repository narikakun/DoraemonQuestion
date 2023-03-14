const router = require("express").Router();

const { MongoClient } = require('mongodb');
const bodyParser = require("body-parser");

router.use(bodyParser.json());

router.post('/authClass', async function(req, res) {
    const classId = req.body.classId;
    console.log(res.app.locals);
    const collection = res.app.locals.db.collection("classList");
    const classObj = await collection.findOne({ classId : classId});
    if (classObj) {
        res.status(200).json({
            msg: "クラスが見つかりました。"
        });
    } else {
        res.status(401).json({
            msg: "クラスIDが見つかりません。"
        });
    }
});

router.post('/createClass', async function(req, res) {
    const classId = req.body.classId;

    const collection = res.app.locals.db.collection("classList");
    const classObj = await collection.findOne({ classId : classId});
    if (classObj) {
        res.status(200).json({
            msg: "クラスが見つかりました。"
        });
    } else {
        res.status(401).json({
            msg: "クラスIDが見つかりません。"
        });
    }
});

module.exports = router;