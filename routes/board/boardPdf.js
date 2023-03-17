const router = require("express").Router();

const { S3Client, GetObjectCommand} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {ObjectId} = require("mongodb");
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_accessKeyId,
        secretAccessKey: process.env.S3_secretAccessKey,
    },
    region: process.env.S3_region,
    endpoint: process.env.S3_Endpoint
});

router.get('/:classId/pdf/:boardId/:fileNumber', async function(req, res) {
    try {
        const classId = req.params.classId;
        const boardId = req.params.boardId;
        const fileNumber = req.params.fileNumber;
        const boardListCollection = res.app.locals.db.collection("boardList");
        const boardObj = await boardListCollection.findOne({ classId : classId, _id: new ObjectId(boardId)});
        if (!boardObj) {
            res.status(404).json({
                msg: "ボードを見つけることが出来ませんでした。"
            });
            return;
        }
        if (!boardObj.data.files) {
            if (!boardObj.data.files[Number(fileNumber)]) {
                res.status(404).json({
                    msg: "指定した番号はありません。"
                });
                return;
            }
        }
        let pdfs = [];
        if (boardObj.data.files[Number(fileNumber)].pdf) {
            if (boardObj.data.files[Number(fileNumber)].pdf[0]) {
                pdfs = boardObj.data.files[Number(fileNumber)].pdf;
            }
        }
        if (!pdfs[0]) {
            res.status(404).json({
                msg: "PDFのデータが読み込めません。"
            });
            return;
        }
        let filesBase64 = [];
        for (const pdfKey of pdfs) {
            let imgUrl = await getSignedUrl(
                s3,
                new GetObjectCommand({
                    Bucket: process.env.S3_bucket,
                    Key: pdfKey
                }),
                { expiresIn: 60*60*24 }
            )
            filesBase64.push({
                name: pdfKey,
                url: imgUrl
            })
        }
        res.status(200).json({
            msg: "取得しました。",
            classId: classId,
            boardId: boardId,
            files: filesBase64
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