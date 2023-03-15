const router = require("express").Router();

router.post('/createClass', async function(req, res) {
    try {
        const classId = req.body.classId;
        const tPassword = req.body.tPassword; // 教師用パスワードの入力
        if (!classId || !tPassword) {
            res.status(400).json({
                msg: "クラスIDまたは教師用パスワードが指定されていません。"
            });
            return;
        }
        const classListCollection = res.app.locals.db.collection("classList");
        const classObj = await classListCollection.findOne({classId: classId});
        if (classObj) {
            res.status(400).json({
                msg: "既に存在するクラスIDです。"
            });
            return;
        }
        let classData = {
            classId: classId,
            tPassword: tPassword,
            createdAt: new Date().getTime()
        };
        await classListCollection.insertOne(classData);
        res.status(200).json({
            msg: "クラスを作成しました。",
            data: classData
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