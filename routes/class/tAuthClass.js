const router = require("express").Router();

router.post('/teacherAuth', async function(req, res) {
    try {
        const classId = req.body.classId;
        const tPassword = req.body.tPassword;
        if (!classId || !tPassword) {
            res.status(400).json({
                msg: "クラスIDまたは管理画面パスワードが入力されていません。"
            });
            return;
        }
        const collection = res.app.locals.db.collection("classList");
        const classObj = await collection.findOne({ classId : classId, tPassword: tPassword});
        console.log(classObj);
        if (classObj) {
            res.cookie(`adminPass_${classObj._id}`, tPassword);
            res.status(200).json({
                msg: "ログインに成功しました。",
                classId: classId
            });
        } else {
            res.status(404).json({
                msg: "クラスIDまたはパスワードが違います。"
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