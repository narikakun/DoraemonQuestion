const {ObjectId} = require("mongodb");
const router = require("express").Router();

router.get('/:classId/lesson', async function (req, res) {
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
        let onePagePer = req.query.onePer ? 1 : 20;
        const lessonListCollection = res.app.locals.db.collection("lessonList");
        const lessonListFind = await lessonListCollection.findOne({classId: classObj.classId});
        let pageNumber = Number(req.query.page) || 1;
        if (pageNumber < 1) {
            res.status(400).json({
                msg: "ページ数の指定は１以上の必要があります。"
            });
            return;
        }
        if (!lessonListFind) {
            res.status(200).json({
                msg: "取得しました。",
                classId: classObj.classId,
                lessons: [],
                maxPage: 0,
                pageNumber: pageNumber,
                lessonCount: 0,
                onePer: onePagePer
            });
            return;
        }
        const lessonCount = await lessonListCollection.countDocuments({classId: classObj.classId});
        let lessonList = [];

        let lessonFind = await lessonListCollection.find({classId: classObj.classId}, {
            limit: onePagePer,
            skip: ((pageNumber - 1) * onePagePer)
        }).sort({createdAt: 1}).toArray();
        for (const lessonKey in lessonFind) {
            lessonList.push(lessonFind[lessonKey]);
        }
        res.status(200).json({
            msg: "取得しました。",
            classId: classObj.classId,
            lessons: lessonList,
            maxPage: Math.ceil(lessonCount / onePagePer),
            pageNumber: pageNumber,
            commentCount: lessonCount,
            onePer: onePagePer
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