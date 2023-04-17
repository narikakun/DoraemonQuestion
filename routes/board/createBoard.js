const router = require("express").Router();
const { S3Client, PutObjectCommand} = require('@aws-sdk/client-s3');
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_accessKeyId,
        secretAccessKey: process.env.S3_secretAccessKey,
    },
    region: process.env.S3_region,
    endpoint: process.env.S3_Endpoint
});

const multer  = require('multer');

const path = require("path");
const fs = require("fs");

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
    dest: 'uploads/',
    limits: {
        fieldSize: 5 * 1024 * 1024
    }
})

const pdfToPng = require("pdf-to-png-converter");

router.post('/:classId/create', [upload.array("files", 3), multerErrorHandler], async function(req, res) {
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
        if (!postContent && !req.files) {
            res.status(400).json({
                msg: "データが一つも入力されていません。"
            });
            return;
        }
        let s3Files = [];
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
            const ext = path.extname(file.originalname).toLowerCase();
            let getFile = await fs.readFileSync(file.path);
            let fileKey = `${process.env.S3_path}/${classId}/${new Date().getTime()}-${file.filename}${ext}`;
            let pdfImages = null;
            if (file.mimetype == "application/pdf") {
                const pngPages = await pdfToPng.pdfToPng(getFile,
                    {
                        outputFileMask: file.filename,
                        strictPagesToProcess: true,
                        viewportScale: 2.0,
                    });
                pdfImages = [];
                for (const pngPagesKey in pngPages) {
                    if (pngPagesKey > 15) break;
                    let pdfUpKey = `${process.env.S3_path}/${classId}/${new Date().getTime()}-${pngPages[pngPagesKey].name}`;
                    let s3UpPdf = await s3.send(
                        new PutObjectCommand({
                            Bucket: process.env.S3_bucket,
                            Key: pdfUpKey,
                            Body: pngPages[pngPagesKey].content,
                            ContentType: "png"
                        })
                    );
                    if (s3UpPdf["$metadata"].httpStatusCode != 200) {
                        res.status(500).json({
                            msg: "ファイルアップロード中にサーバーエラーが発生しました。"
                        });
                        return;
                    }
                    pdfImages.push(pdfUpKey);
                }
            }
            let s3UpRes = await s3.send(
                new PutObjectCommand({
                    Bucket: process.env.S3_bucket,
                    Key: fileKey,
                    Body: getFile,
                    ContentType: file.mimetype
                })
            );
            if (s3UpRes["$metadata"].httpStatusCode != 200) {
                res.status(500).json({
                    msg: "ファイルアップロード中にサーバーエラーが発生しました。"
                });
                return;
            }
            let dbD = {
                name: file.originalname,
                mimetype: file.mimetype,
                id: file.filename,
                key: fileKey,
                size: file.size,
            };
            if (pdfImages) dbD["pdf"] = pdfImages;
            s3Files.push(dbD);
        }
        const boardListCollection = res.app.locals.db.collection("boardList");
        let boardData = {
            classId: classId,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
            author: username,
            data: {
                content: postContent,
                files: s3Files
            }
        };
        await boardListCollection.insertOne(boardData);
        res.status(200).json({
            msg: "ボードを新規作成しました。",
            data: boardData
        });
        for (const wsId of Object.keys(req.app.locals.wsList[classId])) {
            req.app.locals.wsList[classId][wsId].send(JSON.stringify({ type: "createBoard", data: boardData }));
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