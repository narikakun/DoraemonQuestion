require("dotenv").config();
const express = require("express");
const app = express();
const log4js = require('log4js')
const logger = log4js.getLogger("default");
logger.level = 'ALL';
const bodyParser = require('body-parser');
const {MongoClient} = require("mongodb");

const server = app.listen(3000, function(){
    logger.info(`Expressで起動しました。 ポート番号: ${server.address().port}`);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(log4js.connectLogger(log4js.getLogger('express'), {}));

app.get("/", (req, res) => {
    res.status(200).send("Hello World");
});

connectDB();
app.use("/api", require("./routes/class.js"));
app.use(express.static('public'));

async function connectDB () {
    let dbClient;
    try {
        dbClient = await MongoClient.connect(process.env.MongoDB);
        app.locals.db = await dbClient.db("dQuestion");
    } catch (err) {
        console.log(err);
    } finally {
        if (dbClient) await dbClient.close();
    }
}