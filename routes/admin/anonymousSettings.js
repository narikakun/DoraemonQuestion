const router = require("express").Router();
const {ObjectId} = require("mongodb");

router.post('/:classId/anonymousSettings', async function (req, res) {
    try {
        const classId = req.params.classId;
        if (!classId) {
            res.status(400).json({
                msg: "クラスIDが入力されていません。"
            });
            return;
        }
        let adminSessionId = req.cookies[`adminSession_${classId}`];
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
        const classListCollection = res.app.locals.db.collection("classList");
        const classObj = await classListCollection.findOne({classId: sessionObj.classId});
        if (!classObj) {
            res.status(404).json({
                msg: "存在しないクラスです。"
            });
            return;
        }
        const anonymousSettings = req.body.anonymousSettings;
        let aS = false;
        if (anonymousSettings) {
            aS = true;
        }
        await classListCollection.updateOne({_id: new ObjectId(classObj._id)}, {
            $set: {
                trueAnonymous: aS
            }
        });
        res.status(200).json({
            msg: `匿名モードを${aS?"有効化":"無効化"}しました。`,
            classId: classObj.classId
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