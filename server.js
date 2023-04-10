require("dotenv").config();
const express = require("express");
const app = express();
const log4js = require('log4js')
const logger = log4js.getLogger("default");
logger.level = 'ALL';
const {MongoClient, Collection} = require("mongodb");
const cookieParser = require('cookie-parser')
const expressWs = require('express-ws')
expressWs(app);
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(log4js.connectLogger(log4js.getLogger('express'), {}));
app.set('view engine', 'ejs');

const server = app.listen(3000, function(){
    logger.info(`Expressで起動しました。 ポート番号: ${server.address().port}`);
});

app.use("/", require("./views/views"));

connectDB();
app.locals.logger = logger;

app.use("/api", require("./routes/api"));
app.use(express.static('public'));

app.locals.wsList = {};
app.use('/ws',  require('./routes/websocket/wsConnect'))

async function connectDB () {
    try {
        let dbClient = await MongoClient.connect(process.env.MongoDB);
        let db = await dbClient.db("dQuestion");
        app.locals.db = db;
    } catch (err) {
        console.log(err);
    }
}