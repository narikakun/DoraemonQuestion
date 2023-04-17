const {ObjectId} = require("mongodb");
const router = require("express").Router();

router.get('/:boardId/list', async function(req, res) {
    try {
        const boardId = req.params.boardId;
        const boardListCollection = res.app.locals.db.collection("boardList");
        const boardObj = await boardListCollection.findOne({ _id : new ObjectId(boardId) });
        if (!boardObj) {
            res.status(404).json({
                msg: "存在しないボードです。"
            });
            return;
        }
        let onePagePer = req.query.onePer ? 1 : 20;
        const commentListCollection = res.app.locals.db.collection("commentList");
        const commentListFind = await commentListCollection.findOne({ boardId : boardId });
        let pageNumber = Number(req.query.page) || 1;
        if (pageNumber < 1) {
            res.status(400).json({
                msg: "ページ数の指定は１以上の必要があります。"
            });
            return;
        }
        if (!commentListFind) {
            res.status(200).json({
                msg: "取得しました。",
                classId: boardObj.classId,
                boardId: boardId,
                comments: [],
                maxPage: 0,
                pageNumber: pageNumber,
                commentCount: 0,
                onePer: onePagePer
            });
            return;
        }
        const commentCount = await commentListCollection.countDocuments({ boardId : boardId });
        let commentList = [];

        let commentFind = await commentListCollection.find({ boardId: boardId },  {limit: onePagePer, skip: ((pageNumber-1)*onePagePer)}).sort( { createdAt: -1 } ).toArray();
        for (const commentKey in commentFind) {
            commentList.push(commentFind[commentKey]);
        }
        res.status(200).json({
            msg: "取得しました。",
            classId: boardObj.classId,
            boardId: boardId,
            comments: commentList,
            maxPage: Math.ceil(commentCount/onePagePer),
            pageNumber: pageNumber,
            commentCount: commentCount,
            onePer: onePagePer
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