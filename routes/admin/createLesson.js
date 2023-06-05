const router = require("express").Router();

router.post('/:classId/createLesson', async function (req, res) {
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
        const lessonName = req.body.lessonName;
        if (!lessonName) {
            res.status(400).json({
                msg: "授業カテゴリ名を入力してください。"
            });
            return;
        }
        let adminSessionId = req.cookies[`adminSession_${classObj.classId}`];
        if (!adminSessionId) {
            res.status(400).json({
                msg: "無効なログインです。"
            });
            return;
        }
        const sessionAdminCollection = res.app.locals.db.collection("loginAdminSession");
        const sessionObj = await sessionAdminCollection.findOne({sPassword: adminSessionId});
        if (!sessionObj) {
            res.status(400).json({
                msg: "無効なセッションです。"
            });
            return;
        }
        if (classObj.classId != sessionObj.classId) {
            res.status(400).json({
                msg: "無効なログインです。"
            });
            return;
        }
        const lessonListCollection = res.app.locals.db.collection("lessonList");
        let lessonData = {
            classId: classId,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
            name: lessonName
        };
        await lessonListCollection.insertOne(lessonData);
        res.status(200).json({
            msg: "授業カテゴリを新規作成しました。",
            data: lessonData
        });
        if (req.app.locals.wsList[classId]) {
            for (const wsId of Object.keys(req.app.locals.wsList[classId])) {
                req.app.locals.wsList[classId][wsId].send(JSON.stringify({type: "createLesson", data: lessonData}));
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "エラーが発生しました。"
        });
        return;
    }
});

module.exports = router;