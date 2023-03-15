const router = require("express").Router();

router.get('/:classId/list', async function(req, res) {
    try {
        const classId = req.params.classId;
        const classListCollection = res.app.locals.db.collection("classList");
        const classObj = await classListCollection.findOne({ classId : classId});
        if (!classObj) {
            res.status(404).json({
                msg: "存在しないクラスです。"
            });
            return;
        }
        let onePagePer = 20;

        const boardListCollection = res.app.locals.db.collection("boardList");
        const classBoardCollection = await boardListCollection.findOne({ classId : classId });
        let pageNumber = req.body.page || 0;
        if (!classBoardCollection) {
            res.status(200).json({
                msg: "取得しました。",
                classId: classId,
                boards: [],
                maxPage: 0,
                pageNumber: pageNumber,
                boardCount: 0
            });
            return;
        }
        const boardCount = classBoardCollection.countDocuments();
        let boardList = [];

        let boardFind = classBoardCollection.find(Document.init(),  {limit: onePagePer, skip: ((pageNumber-1)*onePagePer)});
        for (const boardFindElement of boardFind) {
            boardList.push(boardFindElement);
        }
        res.status(200).json({
            msg: "取得しました。",
            classId: classId,
            boards: boardList,
            maxPage: Math.ceil(boardCount/onePagePer),
            pageNumber: pageNumber,
            boardCount: boardCount
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