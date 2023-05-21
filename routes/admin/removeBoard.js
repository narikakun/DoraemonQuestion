const router = require("express").Router();
const {ObjectId} = require("mongodb");

router.post('/:classId/removeBoard/:boardId', async function (req, res) {
    try {
        const classId = req.params.classId;
        const boardId = req.params.boardId;
        if (!classId || !boardId) {
            res.status(400).json({
                msg: "クラスIDまたはボードIDが入力されていません。"
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
        const boardCollection = res.app.locals.db.collection("boardList");
        const boardFind = await boardCollection.findOne({_id: new ObjectId(boardId)});
        if (!boardFind) {
            res.status(404).json({
                msg: "ボードIDが無効です。"
            });
            return;
        }
        if (boardFind.classId != sessionObj.classId) {
            res.status(400).json({
                msg: "無効なログインです。"
            });
            return;
        }
        await boardCollection.deleteOne({_id: new ObjectId(boardId)});
        res.status(200).json({
            msg: "削除しました。",
            classId: classId,
            boardId: boardId
        });
        if (req.app.locals.wsList[boardFind.classId]) {
            for (const wsId of Object.keys(req.app.locals.wsList[boardFind.classId])) {
                req.app.locals.wsList[boardFind.classId][wsId].send(JSON.stringify({
                    type: "removeBoard",
                    boardId: boardId
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