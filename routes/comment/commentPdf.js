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

router.get('/:commentId/pdf/:fileNumber', async function(req, res) {
    try {
        const commentId = req.params.commentId;
        const fileNumber = req.params.fileNumber;
        const commentListCollection = res.app.locals.db.collection("commentList");
        const commentObj = await commentListCollection.findOne({ _id: new ObjectId(commentId)});
        if (!commentObj) {
            res.status(404).json({
                msg: "コメントを見つけることが出来ませんでした。"
            });
            return;
        }
        if (!commentObj.data.files) {
            if (!commentObj.data.files[Number(fileNumber)]) {
                res.status(404).json({
                    msg: "指定した番号はありません。"
                });
                return;
            }
        }
        let pdfs = [];
        if (commentObj.data.files[Number(fileNumber)].pdf) {
            if (commentObj.data.files[Number(fileNumber)].pdf[0]) {
                pdfs = commentObj.data.files[Number(fileNumber)].pdf;
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
            classId: commentObj.classId,
            boardId: commentObj.boardId,
            commentId: commentId,
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