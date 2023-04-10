const express = require("express");
const expressWs = require('express-ws')
const router = express.Router()
expressWs(router);
const crypto = require("crypto");

router.ws('/connect/:classId', async (ws, req) => {
    try {
        const classId = req.params.classId;
        const collection = req.app.locals.db.collection("classList");
        const classObj = await collection.findOne({ classId : classId});
        if (!classObj) {
            ws.send(JSON.stringify({ type: "error", msg: "クラスIDが違います。" }));
            req.destroy();
            return;
        }
        let connectId = crypto.randomUUID();
        if (!req.app.locals.wsList[classId]) req.app.locals.wsList[classId] = {};
        req.app.locals.wsList[classId][connectId] = ws;
        ws.send(JSON.stringify({ type: "connect", classId: classId, connectId: connectId }));
        req.app.locals.logger.info(`WebSocket Connect ${req.socket.remoteAddress} : ${classId} : ${connectId} : ${Object.keys(req.app.locals.wsList[classId]).length}`);
        ws.on('close', function close() {
           delete req.app.locals.wsList[classId][connectId];
            req.app.locals.logger.info(`WebSocket Disconnect ${req.socket.remoteAddress} : ${classId} : ${connectId} : ${Object.keys(req.app.locals.wsList[classId]).length}`);
        });
    } catch (err) {
        console.error(err);
        ws.send("エラーが発生しました。");
        req.destroy();
        return;
    }
});

module.exports = router;