/*
GET / POST / PUT / DELETE
- Header -
x-ncp-apigw-timestamp	1970 년 1 월 1 일 00:00:00 협정 세계시(UTC)부터의 경과 시간을 밀리초(Millisecond)로 나타낸 것
API Gateway 서버와 시간 차가 5 분 이상 나는 경우 유효하지 않은 요청으로 간주
x-ncp-iam-access-key	네이버 클라우드 플랫폼에서 발급받은 API Key 또는 IAM에서 발급받은 AccessKey
x-ncp-apigw-signature-v2	위 예제의 Body를 AccessKey와 맵핑되는 SecretKey로 암호화한 서명
HMAC 암호화 알고리즘은 HmacSHA256 사용
 */
const httpRequest = require('../http/http_request.js');
const tokenManager = require('../oauth/token_manager.js');
const TimeUtil = require("../utils/time_util");
const slackBot = require('../utils/slack_bot.js');
const urls = require("../common/urls.js");
const {logger} = require('../logger.js');
const _accessKey = 'AB3D572C4FBAB789A1CA'; // sub account : API
const _secretKey = '7F85C3462490B5014F8816453D9ED3EB3A28482D'; // sub account : API

class DnsCtrl {

    // request 용 헤더 생성
    getHeaders(_method, _url) {
        const _timeStamp = TimeUtil.getUtcNowMille();
        return {
            'x-ncp-apigw-timestamp': _timeStamp,
            'x-ncp-iam-access-key': _accessKey,
            'x-ncp-apigw-signature-v2': tokenManager.createSignature(_timeStamp, _accessKey, _secretKey, _method, _url)
        };
    }

    // 도메인 등록 Request
    async addDomain(_domain, _comment, callback) {
        const _url = urls.DNS_BASE + urls.DNS_PATH_DOMAIN;
        const _headers = this.getHeaders('POST', urls.DNS_PATH_DOMAIN);
        const _config = {
            url: _url,
            method: 'POST',
            body: {
                'name': _domain,
                'comment': _comment
            },
            json: true,
            headers: _headers
        }
        await httpRequest.handleRequest(_config, async (res, err) => {
            logger.info("addDomain result : " + JSON.stringify(res));
            if (err) {
                logger.error("[addDomain] err : " + JSON.stringify(err))
                slackBot.send("[addDomain] err : " + JSON.stringify(err));
                if (callback != undefined) callback(err);

                return err;
            }
            if (callback != undefined) callback(res);

            return res;
        })
    }

    // 도메인 삭제 Request
    async deleteDomain(_domainId, callback) {
        const _url = urls.DNS_BASE + urls.DNS_DELETE_DOMAIN+"/"+_domainId;
        const _headers = this.getHeaders('DELETE', urls.DNS_DELETE_DOMAIN+"/"+_domainId);
        const _config = {
            url: _url,
            method: 'DELETE',
            json: true,
            headers: _headers
        }
        await httpRequest.handleRequest(_config, async (res, err) => {
            logger.info("deleteDomain result : " + JSON.stringify(res));
            if (err) {
                logger.error("[deleteDomain] err : " + JSON.stringify(err))
                slackBot.send("[deleteDomain] err : " + JSON.stringify(err));
                if (callback != undefined) callback(err);

                return err;
            }
            if (callback != undefined) callback(res);

            return res;
        })
    }

    // 도메인 URL 으로 DNS 에서 도메인 ID 조회
    async getDomainId(_domainName, callback) {
        const _query = "?page=0&size=20&domainName=" + _domainName
        const _url = urls.DNS_BASE + urls.DNS_PATH_DOMAIN + _query;
        const _headers = this.getHeaders('GET', urls.DNS_PATH_DOMAIN + _query);//"?page=0&size=20");
        const _config = {
            url: _url,
            method: 'GET',
            json: true,
            headers: _headers
        }
        await httpRequest.handleRequest(_config, (res, err) => {
            logger.info("getDomainInfo result : " + JSON.stringify(res));
            if (err) {
                logger.error("[getDomainId] err : " + JSON.stringify(err))
                slackBot.send("[getDomainId] err : " + JSON.stringify(err));
                if (callback != undefined) callback(-1);

                return -1;
            }
            if (res.statusCode != 200) {
                if (callback != undefined) callback(res);

                return res;
            }
            console.log("domain id  : " + res.body.content[0].id);

            if (callback != undefined) callback(res.body.content[0].id);

            return res.body.content[0].id;
        })
    }

    // 도메인에 cname 레코드 추가
    async addRecord(_domainId, callback) {
        const _url = urls.DNS_BASE + urls.DNS_ADD_RECORD + "/" + _domainId;
        const _headers = this.getHeaders('POST', urls.DNS_ADD_RECORD + "/" + _domainId);
        const _record_url = (process.env.NODE_ENV !== 'production')? urls.LB_INGRESS_DEV : urls.LB_INGRESS_LIVE;
        const _config = {
            url: _url,
            method: 'POST',
            body: [
                {
                    "host": "www",
                    "type": "CNAME",
                    "content": _record_url+".",
                    "ttl": 300,
                    "aliasId": null,
                    "lbId": null
                }
            ],
            json: true,
            headers: _headers
        }
        await httpRequest.handleRequest(_config, async (res, err) => {
            logger.info("addRecord result : " + JSON.stringify(res));
            if (err) {
                logger.error("[addRecord] err : " + JSON.stringify(err))
                slackBot.send("[addRecord] err : " + JSON.stringify(err));
                if (callback != undefined) callback(err);

                return err;
            }

            if (callback != undefined) callback(res);

            return res;
        })
    }

    // 도메인 등록 -> 도메인 아이디 조회 -> 레코드 생성 프로세스
    async runCreateDomain(_domain, _comment, callback) {
        await this.addDomain(_domain, _comment, async (addResult) => {
            if (addResult.statusCode != 200) {
                const err = addResult.body.error;
                logger.error("[addDomain] err : " + JSON.stringify(err));
                slackBot.send("[addDomain] err : " + JSON.stringify(err));
                if (callback != undefined) callback(err);

                return err;
            }

            // domain id 조회
            await this.getDomainId(_domain, async (_domainId) => {
                if (_domainId < 0) {
                    const errorMsg = {
                        "result": "FAIL",
                        "error": {
                            "errorCode": "520",
                            "message": "도메인 정보 조회 실패",
                            "devMessage": "도메인 정보 조회 실패"
                        }
                    };
                    logger.error("[getDomainId] err : " + JSON.stringify(errorMsg))
                    slackBot.send("[getDomainId] err : " + JSON.stringify(errorMsg));
                    return errorMsg;
                }

                // record 생성
                await this.addRecord(_domainId, (recordResult) => {
                    if (recordResult.statusCode != 200) {
                        const err = recordResult.body.error;
                        logger.error("[addRecord] err : " + JSON.stringify(err))
                        slackBot.send("[addRecord] err : " + JSON.stringify(err));
                        if (callback != undefined) callback(err);

                        return err;
                    }
                    const result_success = {statusCode: 200, message: 'success'};
                    logger.info("[CreateDomain] Result : " + JSON.stringify(result_success))

                    if (callback != undefined) callback(result_success);

                    return result_success;
                });
            });

        })
    }

    // 도메인 삭제 프로세스
    async runDeleteDomain(_domain, callback){
        // domain id 조회
        await this.getDomainId(_domain, async (_domainId) => {
            if (_domainId < 0) {
                const errorMsg = {
                    "result": "FAIL",
                    "error": {
                        "errorCode": "520",
                        "message": "도메인 정보 조회 실패",
                        "devMessage": "도메인 정보 조회 실패"
                    }
                };
                logger.error("[getDomainId] err : " + JSON.stringify(errorMsg))
                slackBot.send("[getDomainId] err : " + JSON.stringify(errorMsg));
                return errorMsg;
            }

            // 도메인 삭제
            await this.deleteDomain(_domainId, (deleteResult) => {
                if (deleteResult.statusCode != 200) {
                    const err = deleteResult.body.error;
                    logger.error("[deleteResult] err : " + JSON.stringify(err))
                    slackBot.send("[deleteResult] err : " + JSON.stringify(err));
                    if (callback != undefined) callback(err);

                    return err;
                }
                const result_success = {statusCode: 200, message: 'success'};
                logger.info("[deleteResult] Result : " + JSON.stringify(result_success))

                if (callback != undefined) callback(result_success);

                return result_success;
            });
        });
    }

}

module.exports = DnsCtrl;
