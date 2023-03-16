const router = require("express").Router();
const { S3Client } = require('@aws-sdk/client-s3');
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_accessKeyId,
        secretAccessKey: process.env.S3_secretAccessKey,
    },
    region: process.env.S3_region,
    endpoint: process.env.S3_Endpoint
});

const multer  = require('multer');
const multerS3 = require('multer-s3');

const crypto = require('crypto');
const path = require("path");

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
    storage: multerS3({
        s3: s3,
        bucket: 'files.nakn.jp',
        location: '/dquestion',
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            const newFileName = crypto.createHash('sha256').update(file.originalname).digest('hex');
            const ext = path.extname(file.originalname).toLowerCase();
            const fullPath = `${process.env.S3_path}/${new Date().getTime()}-${newFileName}${ext}`;
            cb(null, fullPath);
        },
    }),
    limits: { fileSize: 5000000 }, // In bytes: 5000000 bytes = 5 MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

function checkFileType (file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('画像とPDF以外は許可されていません。');
    }
}

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
        const boardListCollection = res.app.locals.db.collection("boardList");
        let files = [];
        for (const file in req.files) {
            files.push({
                name: req.files[file].originalname,
                mimetype: req.files[file].mimetype,
                key: req.files[file].key,
                size: req.files[file].size
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