const router = require("express").Router();
const expressWs = require('express-ws')(router);

router.ws('/connect', async (ws, req) => {
    try {
        const classId = req.params.classId;
        const collection = res.app.locals.db.collection("classList");
        const classObj = await collection.findOne({ classId : classId});
        if (!classObj) {
            ws.send("クラスIDが見つかりませんでした。");
            ws.destroy();
            return;
        }
        ws.send('接続成功')
        console.log('接続成功');
        let interval
        interval = setInterval(() => {
            if (ws.readyState === ws.OPEN) {
                console.log('test')
                ws.send(Math.random().toFixed(2))
                ws.send('test')
            } else {
                clearInterval(interval)
            }
        }, 1000)

        ws.on('message', msg => {
            ws.send(msg)
            console.log(msg)
        })
    } catch (err) {
        console.error(err);
        ws.send("エラーが発生しました。");
        ws.destroy();
        return;
    }
});

module.exports = router;