const {logger} = require('../logger.js');
const requestIp = require("request-ip");
const URLS = require("../common/urls");
const resMsg = require("../utils/message");
const CheckStatusService = require('../services/check_status_service.js');
const msg_bad_request = resMsg.errMsg(400, "bad request.");

const checkStatusCtrl = {
    check: async (req, res) => {
        if(req.method != 'POST') return res.send(msg_bad_request);

        const clientIp = requestIp.getClientIp(req);
        logger.info("["+URLS.CHECK_STATUS+"] "+clientIp + " | "+req.originalUrl);
        await CheckStatusService.check(URLS.CHECK_STATUS, req, res);
    },
    insert: async (job_id) => {
        await CheckStatusService.insert(job_id);
    },
    update: async (job_id, status) => {
        await CheckStatusService.update(job_id, status);
    }
}

module.exports = checkStatusCtrl;
