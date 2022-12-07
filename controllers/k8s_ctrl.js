const K8sService = require('../services/k8s_service.js');
const resMsg = require("../utils/message");
const requestIp = require("request-ip");
const {logger} = require("../logger");
const tokenManager = require("../oauth/token_manager");
const CONSTANTS = require("../common/constants");
const slackBot = require("../utils/slack_bot");

const k8sCtrl = {
    createSecret: async (req, res) => {
        const _path = req.path;
        const clientIp = requestIp.getClientIp(req);
        logger.info("[" + _path + "] " + clientIp + " | " + req.originalUrl);
        await tokenManager.checkToken(req, async (tokenResult) => {
            if (tokenResult.status_code !== CONSTANTS.SUCCESS) {
                logger.error("[" + _path + "] " + clientIp + " | check token error : " + tokenResult);
                await slackBot.send("[" + _path + "] " + clientIp + " | check token error : " + tokenResult);
                return res.send(tokenResult);
            }

            const param = req.body;
            await K8sService.createSecret(param.host, param.tlsKey, param.tlsCrt, (result) => {
                if (result === 201) {
                    K8sService.patchIngressTls(param.host, param.host + "-tls", (result) => {
                        return res.send(resMsg.errMsg(result,));
                    });
                }
            });
        });
    },
    patchIngressTls: async (req, res) => {
        const _path = req.path;
        const clientIp = requestIp.getClientIp(req);
        logger.info("[" + _path + "] " + clientIp + " | " + req.originalUrl);
        await tokenManager.checkToken(req, async (tokenResult) => {
            if (tokenResult.status_code !== CONSTANTS.SUCCESS) {
                logger.error("[" + _path + "] " + clientIp + " | check token error : " + tokenResult);
                await slackBot.send("[" + _path + "] " + clientIp + " | check token error : " + tokenResult);
                return res.send(tokenResult);
            }

            const param = req.body;
            await K8sService.patchIngressTls(param.host, param.host + "_tls", (result) => {

            })
        });
    },
};

module.exports = k8sCtrl;