const router = require("express").Router();
const multer = require("multer");
const upload = multer({
    dest: "uploads/",
    fileFilter(req, file, callback) {
        console.log(file.mimetype)
        if (["image/png", "image/jpeg", "application/pdf"].includes(file.mimetype)) {
            callback(null, true);
            return;
        }
        callback(new TypeError("Invalid File Type"));
    },
    limits: { fileSize: 5 }
});

router.post('/:classId/create', upload.array("files"), async function(req, res) {
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
        const username = req.cookies.username;
        if (!username) {
            res.status(401).json({
                msg: "先にユーザー名を登録してください。"
            });
            return;
        }
        const postContent = req.body.content;
        const boardListCollection = res.app.locals.db.collection("boardList");
        let files = [];
        for (const file of req.files) {
            files.push({
                name: file.originalname,
                mimetype: file.mimetype,
                id: file.filename,
                path: file.path,
                size: file.size
            })
        }
        let boardData = {
            classId: classId,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
            author: username,
            data: {
                content: postContent,
                files: files
            }
        };
        await boardListCollection.insertOne(boardData);
        res.status(200).json({
            msg: "ボードを新規作成しました。",
            data: boardData
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