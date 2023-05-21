const router = require("express").Router();
const bcrypt = require('bcrypt');

router.post('/create', async function (req, res) {
    try {
        const classId = req.body.classId;
        const tPassword = req.body.tPassword; // 教師用パスワードの入力
        const className = req.body.className;
        if (!classId || !tPassword) {
            res.status(400).json({
                msg: "クラスIDまたは教師用パスワードが指定されていません。"
            });
            return;
        }
        if (!classId.match(/^\w{3,20}$/)) {
            res.status(400).json({
                msg: "クラスIDに半角英数字とアンダースコア（_）以外が含まれているか、3文字以上20文字以下になっていません。"
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
        let tPasswordHashed = bcrypt.hashSync(tPassword, 10);
        let classData = {
            classId: classId,
            tPassword: tPasswordHashed,
            className,
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