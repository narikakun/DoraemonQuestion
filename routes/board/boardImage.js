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

router.get('/:classId/image/:boardId', async function(req, res) {
    try {
        const classId = req.params.classId;
        const boardId = req.params.boardId;
        const boardListCollection = res.app.locals.db.collection("boardList");
        const boardObj = await boardListCollection.findOne({ classId : classId, _id: new ObjectId(boardId)});
        if (!boardObj) {
            res.status(404).json({
                msg: "ボードを見つけることが出来ませんでした。"
            });
            return;
        }
        if (!boardObj.data.files) {
            if (!boardObj.data.files[0]) {
                res.status(404).json({
                    msg: "このボードに画像はありません。"
                });
                return;
            }
        }
        let showMimeType = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
        let images = boardObj.data.files.filter(f => showMimeType.includes(f.mimetype));
        let filesBase64 = [];
        for (const img of images) {
            if (!img.key) continue;
            let isPdf = false;
            let pdfUrl = null;
            if (img.pdf) {
                if (img.pdf[0]) {
                    pdfUrl = await getSignedUrl(
                        s3,
                        new GetObjectCommand({
                            Bucket: process.env.S3_bucket,
                            Key: img.pdf[0]
                        }),
                        { expiresIn: 60*60*24 }
                    )
                    isPdf = true;
                }
            }
            let imgUrl = await getSignedUrl(
                s3,
                new GetObjectCommand({
                    Bucket: process.env.S3_bucket,
                    Key: img.key
                }),
                { expiresIn: 60*60*24 }
            )
            let fileD = {
                name: img.name,
                url: imgUrl,
                isPdf: isPdf
            };
            if (pdfUrl) {
                fileD["pdfUrl"] = fileD.url;
                fileD["url"] = pdfUrl;
            }
            filesBase64.push(fileD);
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