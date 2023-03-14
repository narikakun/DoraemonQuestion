const express = require("express");
const app = express();
const log4js = require('log4js')
const logger = log4js.getLogger("default");
logger.level = 'ALL';

const server = app.listen(3000, function(){
    logger.info(`Expressで起動しました。 ポート番号: ${server.address().port}`);
});

app.use(log4js.connectLogger(log4js.getLogger('express'), {}));

app.get("/", (req, res) => {
    res.status(200).send("Hello World");
});

app.use(express.static('public'));

app.use("api", require("./routes/class.js"));