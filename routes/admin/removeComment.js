const router = require("express").Router();
const {ObjectId} = require("mongodb");

router.post('/:classId/removeComment/:commentId', async function (req, res) {
    try {
        const classId = req.params.classId;
        const commentId = req.params.commentId;
        if (!classId || !commentId) {
            res.status(400).json({
                msg: "クラスIDまたはコメントIDが入力されていません。"
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
        const commentCollection = res.app.locals.db.collection("commentList");
        const commentFind = await commentCollection.findOne({_id: new ObjectId(commentId)});
        if (!commentFind) {
            res.status(404).json({
                msg: "コメントIDが無効です。"
            });
            return;
        }
        if (commentFind.classId != sessionObj.classId) {
            res.status(400).json({
                msg: "無効なログインです。"
            });
            return;
        }
        await commentCollection.deleteOne({_id: new ObjectId(commentId)});
        res.status(200).json({
            msg: "削除しました。",
            classId: classId,
            commentId: commentId
        });
        if (req.app.locals.wsList[commentFind.classId]) {
            for (const wsId of Object.keys(req.app.locals.wsList[commentFind.classId])) {
                req.app.locals.wsList[commentFind.classId][wsId].send(JSON.stringify({
                    type: "removeComment",
                    commentId: commentId
                }));
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