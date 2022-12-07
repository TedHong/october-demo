/**
 * 서비스 신청, 수정, 삭제, 요금제 업데이트, 사용량 조회
 * @type {{queryForObject: function(*, *, *, *): Promise<void>, DBConnect: function(*): Promise<*>, queryDB: function(*, *, *, *): Promise<void>, initTable: function(): Promise<void>}}
 */
const cubrid = require('../cubrid/dbconnect.js');
const CONSTANTS = require('../common/constants');
const otbUtil = require('../utils/otb_util.js');
const requestIp = require("request-ip");
const {logger} = require("../logger");
const tokenManager = require("../oauth/token_manager");
const slackBot = require("../utils/slack_bot");
const ServiceBillPlanUpdate = require("../models/service_billplan_update");
const resMsg = require("../utils/message");
const ServiceBillPlanFee = require("../models/service_billplan_fee");

const MainService = {
    create : (serviceInstall, callback)=>{
        // todo...
        const query = serviceInstall.getPostQuery();
        const params = serviceInstall.getParams();
        cubrid.queryDB('POST', query, params,(result)=>{
            callback(result);
        });
    },
    update : (serviceUpdate, callback)=>{
        // todo...
        const query = serviceUpdate.getPostQuery();
        const params = serviceUpdate.getParams();
        cubrid.queryDB('POST', query, params,(result)=>{
            callback(result);
        });
    },
    delete : (serviceDelete, callback)=>{
        // todo...
        const query = serviceDelete.getPostQuery();
        const params = serviceDelete.getParams();
        cubrid.queryDB('POST', query, params,(result)=>{
            callback(result);
        });
    },
    // serviceInstallOption 의 형태는 배열입니다.
    createOption : async (serviceInstallOptions, callback)=>{
        // todo...
        for (const opt of serviceInstallOptions) {
            const query = opt.getPostQuery();
            const params = opt.getParams();
            await cubrid.queryDB('POST', query, params,(result)=>{
                callback(result);
            });
        }
    },
    // serviceInstallUserDats 의 형태는 배열입니다.
    createUserData : async (serviceInstallUserDatas, callback)=>{
        // todo...
        for (const ud of serviceInstallUserDatas) {
            const query =ud.getPostQuery();
            const params = ud.getParams();
            await cubrid.queryDB('POST', query, params,(result)=>{
                callback(result);
            });
        }
    },
    billPlanUpdate : async (_path, req, res)=>{
        const clientIp = requestIp.getClientIp(req);
        logger.info("["+_path+"] "+clientIp + " | "+req.originalUrl);

        await tokenManager.checkToken(req, async (result) => {
            if(result.status_code !== CONSTANTS.SUCCESS){
                logger.error("["+_path+"] "+clientIp + " | check token error : " + result);
                await slackBot.send("["+_path+"] "+clientIp + " | check token error : " + result);
                return res.send(result);
            }

            try {
                const billPlan = new ServiceBillPlanUpdate(req.body);
                const query = billPlan.getPostQuery();
                const params = billPlan.getParams();
                await cubrid.queryDB('POST', query, params,(result)=>{
                    logger.info("["+_path+"] "+clientIp + " | result : "+JSON.stringify(err));
                    if (result.status_code !== 200) {
                        return res.send(resMsg.errMsg(result.errorCode, result.message));
                    }
                    else{
                        return  res.send("");
                    }
                });                
            } catch (e) {
                logger.error("["+_path+"] "+clientIp + " | exception : "+e.toString());
                await slackBot.send("["+_path+"] "+clientIp + " | exception : "+e.toString());
                return res.send({
                    "message": "Internal Server Error",
                    "status_code": 500
                });
            }
        });
    },
    getFee: async (_path, req, res)=>{
        const clientIp = requestIp.getClientIp(req);
        logger.info("["+_path+"] "+clientIp + " | "+req.originalUrl);

        await tokenManager.checkToken(req, async (result) => {
            if(result.status_code !== CONSTANTS.SUCCESS){
                logger.error("["+_path+"] "+clientIp + " | check token error : " + JSON.stringify(result));
                await slackBot.send("[" + _path + "] " + clientIp + " | check token error : " + JSON.stringify(result));
                return res.send(result);
            }

            try {
                const billPlanFee = new ServiceBillPlanFee(req.body);
                // member_no 가 있으면 해당 회원만 조회
                if(billPlanFee.member_no != ""){
                    await MainService.getUserViewCount(billPlanFee, (result) => {
                        logger.info("["+_path+"] "+clientIp + " | getUserViewCount - result : "+JSON.stringify(result));
                        if (result != undefined && result.status_code != 200) {
                            return res.send(resMsg.errMsg(result.errorCode, result.message));
                        }
                        else{
                            return res.send(result.body);
                        }
                    });
                }
                // member_no 가 없으면 전체 회원 조회
                else{
                    await MainService.getUserViewCountTotal(billPlanFee, (result) => {
                        logger.info("["+_path+"] "+clientIp + " | getUserViewCountTotal - result : "+JSON.stringify(result));
                        if (result != undefined && result.status_code != 200) {
                            return res.send(resMsg.errMsg(result.errorCode, result.message));
                        }
                        else{
                            return res.send(result.body);
                        }
                    });
                }


            } catch (e) {
                logger.error("["+_path+"] "+clientIp + " | exception : "+e.toString());
                await slackBot.send("[" + _path + "] " + clientIp + " | exception : " + e.toString());
                return res.send({
                    "message": "Internal Server Error",
                    "status_code": 500
                });
            }
        });

    },
    getUserViewCount: async (billPlanFee, callback) => {
        // todo : member_no 가 있을 땐 해당 유저만 조회
        const query = billPlanFee.getPostQuery();
        const params = billPlanFee.getParams();
        return await cubrid.queryForObject('POST', query, params, (result) => {

            // 데이터 조회 실패 시 status code 와 빈 오브젝트를 body 에 넣어 보냅니다.
            if(result != undefined && result.status_code != 200){
                callback({
                    "status_code" : result.status_code,
                    "body": {
                        "member_no" : billPlanFee.member_no,
                        "contracts" : []
                    }
                });
                return;
            }

            const feeData = [
                {
                    "member_no" : billPlanFee.member_no,
                    "contracts" : []
                }
            ];
            const list = [];

            for (const _item of result.message) {
                // pv_fee 옵션으로 pv 사용량 리턴
                if(_item.opt_key === CONSTANTS.OPT_KEY_PV_FEE){
                    const mItem = {
                        "contract_no" : _item.contract_no,
                        "service_key" : _item.service_key,
                        "options" :[
                            {
                                "key" : CONSTANTS.OPT_KEY_PV_FEE,
                                "used_count" : otbUtil.GetDefaultValue(_item.used_cnt , 0)
                            }
                        ]
                    }
                    list.push(mItem);
                }
            }
            feeData[0].contracts = list;
            callback({
                "status_code" : 200,
                "body": feeData
            });
        });
    },
    getUserViewCountTotal: async (billPlanFee, callback) => {
        // todo : member_no 가 없으면 전체 유저 조회
        const query = billPlanFee.getPostQueryTotal();
        const params = [
            billPlanFee.yyyy,
            billPlanFee.mm
        ];
        return await cubrid.queryForObject('POST', query, params, (result) => {

            if(result != undefined && result.status_code != 200){
                callback(result);
                return;
            }
            const resultMap = new Map();
            for(const _item  of result.message){
                let t = resultMap.get(_item.member_no);
                if(t === null || t === undefined){
                    resultMap.set(_item.member_no, {
                        "member_no" : _item.member_no,
                        "contracts" : []
                    });
                    t = resultMap.get(_item.member_no);
                }

                // pv_fee 옵션으로 pv 사용량 리턴
                if(_item.opt_key === CONSTANTS.OPT_KEY_PV_FEE){
                    const mItem = {
                        "contract_no" : _item.contract_no,
                        "service_key" : _item.service_key,
                        "options" :[
                            {
                                "key" : CONSTANTS.OPT_KEY_PV_FEE,
                                "used_count" : otbUtil.GetDefaultValue(_item.used_cnt, 0)
                            }
                        ]
                    }
                    t.contracts.push(mItem);
                }
            }

            callback({
                "status_code" : 200,
                "body": Array.from(resultMap.values())
            });
        });
    }
}

module.exports = MainService;
