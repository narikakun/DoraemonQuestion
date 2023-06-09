const router = require("express").Router();

const canvas = require('canvas');
const multer = require('multer');
const path = require("path");
const fs = require("fs");
const sharp = require('sharp');
const crypto = require("crypto");

const multerErrorHandler = (err, req, res, next) => {
    if (err) {
        res.status(500).json({
            msg: err.message || err,
        });
    } else {
        next();
    }
};

const upload = multer({
    dest: 'cache-uploads/',
    limits: {
        fieldSize: 5 * 1024 * 1024
    }
})

const pdfToPng = require("pdf-to-png-converter");
const {ObjectId} = require("mongodb");

router.post('/:classId/create', [upload.array("files", 3), multerErrorHandler], async function (req, res) {
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
        const username = req.cookies.username;
        if (!username) {
            res.status(401).json({
                msg: "先にユーザー名を登録してください。"
            });
            return;
        }
        const postContent = req.body.content;
        if (!postContent && !req.files) {
            res.status(400).json({
                msg: "データが一つも入力されていません。"
            });
            return;
        }
        let teacher = false;
        let adminSessionId = req.cookies[`adminSession_${classId}`];
        if (adminSessionId) {
            const sessionAdminCollection = res.app.locals.db.collection("loginAdminSession");
            const sessionObj = await sessionAdminCollection.findOne({sPassword: adminSessionId});
            if (sessionObj) {
                teacher = true;
            }
        }
        let files = [];
        for (const file of req.files) {
            const filetypes = /jpeg|jpg|png|pdf/;
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = filetypes.test(file.mimetype);
            if (!mimetype || !extname) {
                res.status(400).json({
                    msg: "画像とPDF以外はアップロードできません。"
                });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                res.status(400).json({
                    msg: "ファイルサイズが上限を超えています。"
                });
                return;
            }
        }
        for (const file of req.files) {
            let fileObj = {};
            const ext = path.extname(file.originalname).toLowerCase();
            let getFile = await fs.readFileSync(file.path);
            if (!fs.existsSync(`${path.resolve(".")}/public/uploads/${classId}`)) {
                await fs.mkdirSync(`${path.resolve(".")}/public/uploads/${classId}`);
            }
            let fileUUID = crypto.randomUUID();
            let fileKey = `/${classId}/${fileUUID}${ext}`;
            await fs.writeFileSync(`${path.resolve(".")}/public/uploads${fileKey}`, getFile);
            fileObj.key = fileKey;
            fileObj.uuid = fileUUID;
            fileObj.filename = decodeURIComponent(file.originalname);
            fileObj.mimetype = file.mimetype;
            fileObj.size = file.size;
            if (file.mimetype == "image/png" || file.mimetype == "image/jpeg") {
                let resizeFile = await sharp(getFile).resize(500).png().toBuffer();
                ;
                let resizeKey = `/${classId}/${fileUUID}-500.png`;
                await fs.writeFileSync(`${path.resolve(".")}/public/uploads${resizeKey}`, resizeFile);
                fileObj.resize = resizeKey;
            }
            let pdfImages = null;
            if (file.mimetype == "application/pdf") {
                const pngPages = await pdfToPng.pdfToPng(getFile,
                    {
                        outputFileMask: fileObj.filename,
                        strictPagesToProcess: true,
                        viewportScale: 2.0,
                    });
                pdfImages = {};
                for (const pngPagesKey in pngPages) {
                    if (pngPagesKey > 15) break;
                    let pdfUpKey = `/${classId}/${fileUUID}-${pngPagesKey}.png`;
                    await fs.writeFileSync(`${path.resolve(".")}/public/uploads${pdfUpKey}`, pngPages[pngPagesKey].content);
                    let resizePdfFile = await sharp(pngPages[pngPagesKey].content).resize(500).png().toBuffer();
                    ;
                    let resizePdfKey = `/${classId}/${fileUUID}-${pngPagesKey}-500.png`;
                    await fs.writeFileSync(`${path.resolve(".")}/public/uploads${resizePdfKey}`, resizePdfFile);
                    pdfImages[pngPagesKey] = {
                        image: pdfUpKey,
                        resize: resizePdfKey
                    }
                }
                fileObj.pdf = pdfImages;
            }
            files.push(fileObj);
        }
        const boardListCollection = res.app.locals.db.collection("boardList");
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
        const anonymous = req.body.anonymous;
        if (anonymous) {
            if (classObj.trueAnonymous) {
                boardData["anonymous"] = true;
            }
        }
        const lesson = req.body.lesson;
        if (lesson) {
            const lessonListCollection = res.app.locals.db.collection("lessonList");
            const lessonObj = await lessonListCollection.findOne({classId: classObj.classId, _id: new ObjectId(lesson)});
            if (!lessonObj) {
                res.status(404).json({
                    msg: "授業カテゴリが見つかりません。"
                });
                return;
            }
            boardData["lesson"] = lessonObj._id;
        }
        if (teacher) boardData["teacher"] = true;
        await boardListCollection.insertOne(boardData);
        res.status(200).json({
            msg: "ボードを新規作成しました。",
            data: boardData
        });
        if (req.app.locals.wsList[classId]) {
            for (const wsId of Object.keys(req.app.locals.wsList[classId])) {
                req.app.locals.wsList[classId][wsId].send(JSON.stringify({type: "createBoard", data: boardData}));
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