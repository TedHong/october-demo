const { requestAsync } = require('../http/http_request.js');
const resMsg = require("../utils/message");
const URLS = require("../common/urls");
const MainOptionService = require('../services/main_option_service.js');
const ServiceOptionCreate = require("../models/service_option_create");
const ServiceOptionUpdate = require("../models/service_option_update");
const ServiceOptionDelete = require("../models/service_option_delete");

const serviceOptionCtrl = {
    create :  async (req, res) =>{
        if(req.method != 'POST') return res.send(resMsg.errMsg(400, "bad request."));
        await requestAsync(URLS.OPTION_CREATE, req, res, 'CREATE', MainOptionService, new ServiceOptionCreate(req.body), ()=>{

        });
    },
    update :  async (req, res) =>{
        if(req.method != 'POST') return res.send(resMsg.errMsg(400, "bad request."));
        await requestAsync(URLS.OPTION_UPDATE, req, res, 'UPDATE', MainOptionService, new ServiceOptionUpdate(req.body), ()=>{

        });
    },
    delete :  async (req, res) =>{
        if(req.method != 'POST') return res.send(resMsg.errMsg(400, "bad request."));
        await requestAsync(URLS.OPTION_DELETE, req, res, 'DELETE', MainOptionService, new ServiceOptionDelete(req.body), ()=>{

        });
    }
}

module.exports = serviceOptionCtrl;
