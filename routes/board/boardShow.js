const {ObjectId} = require("mongodb");
const router = require("express").Router();

router.get('/:classId/board/:boardId', async function (req, res) {
    try {
        const classId = req.params.classId;
        const boardId = req.params.boardId;
        const boardListCollection = res.app.locals.db.collection("boardList");
        const boardObj = await boardListCollection.findOne({classId: classId, _id: new ObjectId(boardId)});
        if (!boardObj) {
            res.status(404).json({
                msg: "ボードを見つけることが出来ませんでした。"
            });
            return;
        }
        if (boardObj.anonymous) {
            boardObj.author = null;
        }
        res.status(200).json({
            msg: "取得しました。",
            classId: classId,
            boardId: boardId,
            data: boardObj
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