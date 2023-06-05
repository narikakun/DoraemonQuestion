const {ObjectId} = require("mongodb");
const router = require("express").Router();

router.get('/:classId/list', async function (req, res) {
    try {
        const classId = req.params.classId;
        const classListCollection = res.app.locals.db.collection("classList");
        const classObj = await classListCollection.findOne({classId: classId});
        if (!classObj) {
            res.status(404).json({
                msg: "存在しないクラスです。"
            });
            return;
        }
        let onePagePer = 9;
        let pageNumber = Number(req.query.page) || 1;
        if (pageNumber < 1) {
            res.status(400).json({
                msg: "ページ数の指定は１以上の必要があります。"
            });
            return;
        }
        let lessonFilter = req.query.lesson;
        let filterSql = {$and: [{classId: classObj.classId}]};
        if (lessonFilter) {
            filterSql["$and"].push({lesson: new ObjectId(lessonFilter)});
        }
        console.log(filterSql);
        const boardListCollection = res.app.locals.db.collection("boardList");
        const classBoardCollection = await boardListCollection.findOne(filterSql);
        console.log(classBoardCollection);
        if (!classBoardCollection) {
            res.status(200).json({
                msg: "取得しました。",
                classId: classId,
                boards: [],
                maxPage: 0,
                pageNumber: pageNumber,
                boardCount: 0,
                onePer: onePagePer
            });
            return;
        }
        const boardCount = await boardListCollection.countDocuments(filterSql);
        let boardList = [];

        let boardFind = await boardListCollection.find(filterSql, {
            limit: onePagePer,
            skip: ((pageNumber - 1) * onePagePer)
        }).sort({createdAt: -1}).toArray();

        const lessonListCollection = res.app.locals.db.collection("lessonList");
        const lessonListFind = await lessonListCollection.find({classId: classObj.classId}).toArray();
        const commentListCollection = res.app.locals.db.collection("commentList");
        let teacherMode = false;
        if (req.query.teacher) {
            let adminSessionId = req.cookies[`adminSession_${classObj.classId}`];
            if (adminSessionId) {
                const sessionAdminCollection = res.app.locals.db.collection("loginAdminSession");
                const sessionObj = await sessionAdminCollection.findOne({sPassword: adminSessionId});
                if (sessionObj) {
                    teacherMode = true;
                }
            }
        }
        for (const boardKey in boardFind) {
            let boardData = boardFind[boardKey];
            const commentFind = await commentListCollection.find({boardId: String(boardData._id)}, {limit: 1}).sort({createdAt: -1}).toArray();
            if (commentFind[0]) {
                boardData.lastComment = commentFind[0];
                const commentCount = await commentListCollection.countDocuments({boardId: String(boardData._id)});
                boardData.lastComment.commentCount = commentCount;
            }
            if (boardData.anonymous && !teacherMode) {
                boardData.author = null;
            }
            if (boardData.lesson) {
                let lessonFilter = lessonListFind.find(f => String(f._id) == boardData.lesson);
                boardData.lessonName = lessonFilter?.name || "不明な授業カテゴリ";
            }
            boardList.push(boardData);
        }
        res.status(200).json({
            msg: "取得しました。",
            classId: classId,
            boards: boardList,
            maxPage: Math.ceil(boardCount / onePagePer),
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