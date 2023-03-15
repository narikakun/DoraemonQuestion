const router = require("express").Router();

router.post('/authClass', async function(req, res) {
    try {
        const classId = req.body.classId;
        const username = req.body.username;
        if (!classId || !username) {
            res.status(400).json({
                msg: "クラスIDまたはユーザー名が指定されていません。"
            });
            return;
        }
        const collection = res.app.locals.db.collection("classList");
        const classObj = await collection.findOne({ classId : classId});
        if (classObj) {
            res.cookie("username", username);
            res.status(200).json({
                msg: "クラスが見つかりました。名前を登録しました。",
                classId: classId,
                username: username
            });
        } else {
            res.status(404).json({
                msg: "クラスIDが見つかりません。"
            });
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