// process.env.NODE_ENV = 'local'; //'development'; // production
if(process.env.NODE_ENV === undefined) process.env.NODE_ENV = 'local';

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true }));
const mRouter = require('./route.js');
const db = require("./cubrid/dbconnect");
const slackBot = require("./utils/slack_bot");

app.use('/service', mRouter);
app.use(cookieParser());
app.use(bodyParser.json());
app.listen(3000, '0.0.0.0', ()=>{
  console.log("\n" +
      " ██████   ██████ ████████  ██████  ██████  ███████ ██████  \n" +
      "██    ██ ██         ██    ██    ██ ██   ██ ██      ██   ██ \n" +
      "██    ██ ██         ██    ██    ██ ██████  █████   ██████  \n" +
      "██    ██ ██         ██    ██    ██ ██   ██ ██      ██   ██ \n" +
      " ██████   ██████    ██     ██████  ██████  ███████ ██   ██ \n" +
      "                                                           \n" +
      "                     < SERVER START >                      \n");
  console.log(process.env.NODE_ENV);
  console.log(new Date()+ "");
  console.log("localhost:3000...");
});


db.initTable();

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;

});

if(process.env.NODE_ENV !== 'test'){
  const slackBot = require('./utils/slack_bot.js');
  slackBot.send("October 서버를 구동합니다.  ENV : "+ process.env.NODE_ENV).then(r => {});
}
module.exports = app;


