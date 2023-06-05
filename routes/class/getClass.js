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
        let onePagePer = 20;
        const lessonListCollection = res.app.locals.db.collection("lessonList");
        const lessonListFind = await lessonListCollection.find({classId: classObj.classId}, {limit: onePagePer}).sort({createdAt: -1}).toArray();
        let lessonList = [];
        for (const lessonKey in lessonListFind) {
            lessonList.push(lessonListFind[lessonKey]);
        }
        res.status(200).json({
            msg: "クラスが見つかりました。",
            classId: classId,
            className: classObj.className,
            trueAnonymous: classObj.trueAnonymous || false,
            lessonList: lessonList
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