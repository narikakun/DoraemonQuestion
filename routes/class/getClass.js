const router = require("express").Router();

router.get('/get/:classId', async function (req, res) {
    try {
        const classId = req.params.classId;
        const classListCollection = res.app.locals.db.collection("classList");
        const classObj = await classListCollection.findOne({classId: classId});
        if (!classObj) {
            res.status(404).json({
                msg: "存在しないクラスです。"
            });
            return;
        }
        res.status(200).json({
            msg: "クラスが見つかりました。",
            classId: classId,
            className: classObj.className,
            trueAnonymous: classObj.trueAnonymous || false
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "エラーが発生しました。"
        });
        return;
    }
});

module.exports = router;