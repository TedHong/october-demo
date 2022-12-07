const request = require('request');
const requestIp = require("request-ip");
const {logger} = require("../logger");
const tokenManager = require("../oauth/token_manager");
const CONSTANTS = require("../common/constants");
const slackBot = require("../utils/slack_bot");
const checkStatusCtrl = require("../controllers/check_status_ctrl");

const httpRequest = {
    handleRequest : async (config, handleResponse)=>{
        if(config.method === 'GET'){
            await request.get(config, (err, httpResponse, body)=>{
                handleResponse(httpResponse, err);
            })
        }else if(config.method === 'POST'){
            await request.post(config, (err, httpResponse, body)=>{
                handleResponse(httpResponse, err);
            })
        }else if(config.method === 'DELETE'){
            await request.delete(config, (err, httpResponse, body)=>{
                handleResponse(httpResponse, err);
            })
        }
    },
    requestAsync : async (url_name, req, res, methodType, reqCtrl, jsonData, callback)=>{
        const clientIp = requestIp.getClientIp(req);
        logger.info("[requestAsync] "+clientIp + " | "+url_name+" request url = "+req.originalUrl);
        logger.info("[requestAsync] "+clientIp + " | "+url_name+" "+JSON.stringify(req.body));
        await tokenManager.checkToken(req, async (result) => {
            if(result.status_code !== CONSTANTS.SUCCESS){
                logger.error("[requestAsync] error "+clientIp + " | "+url_name+" check token error : " + result);
                await slackBot.send("[requestAsync] error "+clientIp + " | "+url_name+" check token error : " + result);
                return res.send(result);
            }

            try {
                if(jsonData.job_id !== undefined) {
                    await checkStatusCtrl.insert(jsonData.job_id);
                }
                // request 에 대한 결과를 처리합니다.
                const resultProcess = async (err)=>{
                    logger.info("[requestAsync] "+clientIp + " | "+url_name+" "+req.originalUrl+" result = "+JSON.stringify(err));
                    if (jsonData.job_id != undefined && err.status_code != 200) {
                        await checkStatusCtrl.update(jsonData.job_id, CONSTANTS.STATUS_ERROR.toString());
                    } else {
                        if(url_name !== "/account/create"){
                            await checkStatusCtrl.update(jsonData.job_id, CONSTANTS.STATUS_COMPLETE.toString());
                        }
                    }
                }
                if(methodType === 'CREATE') {
                    await reqCtrl.create(jsonData, resultProcess);
                }else if(methodType === 'UPDATE'){
                    await reqCtrl.update(jsonData, resultProcess);
                }else if(methodType === 'DELETE'){
                    await reqCtrl.delete(jsonData, resultProcess);
                }

            } catch (e) {
                logger.error("[requestAsync] "+clientIp + " | "+url_name+" exception : " + e.toString());
                await slackBot.send("[requestAsync] "+clientIp + " | "+url_name+" exception : " + e.toString());
                return res.send({
                    "message": "Internal Server Error",
                    "status_code": 500
                });
            } finally {
                if(callback != null && callback != undefined) callback();
                return res.send("");
            }
        });
    }
}


module.exports = httpRequest;