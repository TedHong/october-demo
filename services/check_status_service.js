/**
 * Job 의 상태 확인 조회
 * @type {{queryForObject: function(*, *, *, *): Promise<void>, DBConnect: function(*): Promise<*>, queryDB: function(*, *, *, *): Promise<void>, initTable: function(): Promise<void>}}
 */
const cubrid = require('../cubrid/dbconnect.js');
const {logger} = require('../logger.js');
const tokenManager = require("../oauth/token_manager");
const CONSTANTS = require("../common/constants");
const slackBot = require("../utils/slack_bot");
const CheckJobStatus = require("../models/check_status");
const requestIp = require("request-ip");
const CheckStatusService = {
    check: async (_path, req, res) => {
        const clientIp = requestIp.getClientIp(req);
        logger.info("["+_path+"] "+clientIp + " | "+req.originalUrl);
        await tokenManager.checkToken(req, async (tokenResult) => {
            if(tokenResult.status_code !== CONSTANTS.SUCCESS){
                logger.error("["+_path+"] "+clientIp + " | check token error : " + tokenResult);
                await slackBot.send("["+_path+"] "+clientIp + " | check token error : " + tokenResult);
                return res.send(tokenResult);
            }

            try {
                const checkStatus = new CheckJobStatus(req.body);
                const query = checkStatus.getPostQuery();
                const params = checkStatus.getParams();
                return await cubrid.queryForObject('POST', query, params, (result) => {
                    logger.info("["+_path+"] "+clientIp + " | result : "+JSON.stringify(result));
                    if (result.status_code != 200) {
                        return res.send(result);
                    } else {
                        const obj = result.message[0];
                        return res.send({
                            "job_id": obj.job_id,
                            "job_status": obj.job_status,
                            "error": ""
                        });
                    }
                });

            } catch (e) {
                logger.error("["+_path+"] "+clientIp + " | exception : "+e);
                await slackBot.send("["+_path+"] "+clientIp + " | exception : "+e);
                return res.send({
                    "message": "Internal Server Error",
                    "status_code": 500
                });
            }
        });
    },
    insert: async (job_id) => {
        const query = "INSERT INTO tn_job_status(" +
            "job_id," +
            "job_status, " +
            "create_dttm)" +
            " VALUES(?,?,?);";
        const params = [job_id, 'RUNNING', new Date()];
        return await cubrid.queryDB('POST', query, params, (result) => {
            logger.info("[JOB] INSERT : result = " + JSON.stringify(result));
        });
    },
    update: async (job_id, status) => {
        // todo...
        const query = "UPDATE tn_job_status SET job_status = ? WHERE job_id = ?;";
        // console.log(job_id + " / "+ status);
        return await cubrid.queryDB('POST', query, [status, job_id], (result) => {
            logger.info("[JOB] UPDATE : result = " + JSON.stringify(result));
        });
    }
}

module.exports = CheckStatusService;
