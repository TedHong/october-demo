const resMsg = require("../utils/message");
const URLS = require("../common/urls");
const {requestAsync} = require("../http/http_request.js");
const DomainService = require('../services/domain_service.js');
const RegisterDomain = require("../models/register_domain");
const msg_bad_request = resMsg.errMsg(400, "bad request.");

const domainCtrl = {
    create :  async (req, res) =>{
        if(req.method != 'POST') return res.send(msg_bad_request);
        await requestAsync(URLS.DOMAIN_REGISTER, req, res, 'CREATE', DomainService, new RegisterDomain(req.body), ()=>{

        });
    },
    update : (serviceUpdate, callback)=>{
        // todo...
        // const query = serviceUpdate.getPostQuery();
        // const params = serviceUpdate.getParams();
        // cubrid.queryDB('POST', query, params,(result)=>{
        //     callback(result);
        // });
    },
    delete : ()=>{

    }
}

module.exports = domainCtrl;