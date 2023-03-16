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
        let onePagePer = 6;

        const boardListCollection = res.app.locals.db.collection("boardList");
        const classBoardCollection = await boardListCollection.findOne({ classId : classId });
        let pageNumber = Number(req.query.page) || 1;
        if (pageNumber < 1) {
            res.status(400).json({
                msg: "ページ数の指定は１以上の必要があります。"
            });
            return;
        }
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
        const boardCount = await boardListCollection.countDocuments();
        let boardList = [];

        let boardFind = await boardListCollection.find({ classId: classId },  {limit: onePagePer, skip: ((pageNumber-1)*onePagePer)}).sort( { createdAt: -1 } ).toArray();
        for (const boardKey in boardFind) {
            boardList.push(boardFind[boardKey]);
        }
        res.status(200).json({
            msg: "取得しました。",
            classId: classId,
            boards: boardList,
            maxPage: Math.ceil(boardCount/onePagePer),
            pageNumber: pageNumber,
            boardCount: boardCount,
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