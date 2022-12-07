const CUBRID = require('node-cubrid');
const genericPool = require('generic-pool');
const UTILS = require('../utils/message.js');
const tableQuery = require('./create_table_querys.js');
const {logger} = require("../logger");
const slackBot = require('../utils/slack_bot.js');
let conn;
const dbConf = {
    host: (process.env.NODE_ENV === 'development') ? '' : '',
    port: 33000,
    user: 'dbuser',
    password: 'pw',
    database: 'dbname'
};
const factory = {
    name: 'CUBRID',
    create: function () {
        var client = CUBRID.createConnection(dbConf);
        client.query('select 1');
        return client;
    },
    destroy: function (client) {
        client.disconnect();
    }
};

const opts = {
    max: 15, // maximum size of the pool
    min: 3 // minimum size of the pool
};

const myPool = genericPool.createPool(factory, opts);

const cubrid = {
    DBConnect: async (callback) => {
        console.log('DBConnect : url = ' + dbConf.host);
        conn = CUBRID.createConnection(dbConf);
        return await conn.connect((err) => {
            if (err) {
                console.error(err);
                // throw err.message;
            } else {
                console.log('connection is established');
                callback();
            }
        });
    },
    initTable: async () => {
        await myPool.acquire().then((client)=>{
            console.log('init db tables.');
            client.query(tableQuery.create_tables_query);
        });
    },
    queryForObject: async (queryType, queryStr, params, callback)=>{
        logger.info('    [queryForObject] start : ' + queryStr);
        await myPool.acquire()
            .then((client)=>{
                try {
                    client.queryAsObjects(queryStr, params, (err, rows) => {  // queryAllAsObjects 함수는 query가 끝나면 자동으로 연결을 끊는다.
                        console.log('ㄴ params[0] : ' + params[0]);
                        if (err) {
                            console.log('ㄴ query : ' + params[0] + ' / error : ' + err);
                            if (callback != undefined && callback != null) {
                                callback(err);
                            }
                            throw err;
                        } else {
                            // `rows` is now an array of row objects.
                            //const rowsCount = rows.length;  // 가져온 결과 개수를 체크할 수 있다.
                            if (rows.length < 1) {
                                callback(UTILS.errMsg(404, 'not found'));
                                return;
                            }
                            if (callback != undefined && callback != null) {
                                console.log('ㄴ query success.');
                                callback(UTILS.sucessResult(rows));
                            }
                        }

                    });
                }catch (err) {
                    logger.error("    [queryDB]  catch err : "+err);
                    slackBot.send("[queryDB]  catch err : "+err);
                }finally {
                    myPool.release(client);
                }
            });
    },

    /*
    queryType : GET, POST, PATCH, DELETE
     */
    queryDB: async (queryType, queryStr, params, callback) => {
        logger.info('    [queryDB] start : ' + queryStr);
        await myPool.acquire()
            .then((client)=>{
                try {
                    if(queryType === 'GET'){

                    }else if(queryType === 'POST'){
                        // console.log('POST: ' + queryStr);
                        client.execute(queryStr, params, (err)=>{
                            // Handle the error;
                            if(err){
                                logger.error('    [queryDB] execute error! : '+ err);
                                slackBot.send("[queryDB]  execute error! : "+err);
                            }else{
                                logger.info('    [queryDB] execute success. : ('+ queryStr+")");
                                if (callback != undefined && callback != null) {
                                    callback(UTILS.sucessResult({}));
                                }
                            }
                            // return client;
                        });
                    }
                }catch (err) {
                    logger.error("    [queryDB]  catch err : "+err);
                    slackBot.send("[queryDB]  catch err : "+err);
                }finally {
                    myPool.release(client);
                }
        });
    }
}

module.exports = cubrid;
