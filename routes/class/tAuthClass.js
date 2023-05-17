const router = require("express").Router();
const bcrypt = require('bcrypt');
const crypto = require("crypto");

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
        const classObj = await collection.findOne({ classId : classId});
        if (classObj) {
            let passCheck = bcrypt.compareSync(tPassword, classObj.tPassword);
            if (!passCheck) {
                res.status(404).json({
                    msg: "パスワードが違います。"
                });
                return;
            }
            let sessionPassword = await bcrypt.hash(crypto.randomUUID(), 10);
            const sessionAdminCollection = res.app.locals.db.collection("loginAdminSession");
            await sessionAdminCollection.insertOne({
                classId: classObj.classId,
                sPassword: sessionPassword,
                createdAt: new Date().getTime()
            });
            res.cookie(`adminSession_${classObj.classId}`, sessionPassword);
            res.status(200).json({
                msg: "ログインに成功しました。",
                classId: classId
            });
        } else {
            res.status(404).json({
                msg: "クラスIDが違います。"
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