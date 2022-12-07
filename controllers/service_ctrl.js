const MainService = require('../services/main_service.js');
const { requestAsync } = require('../http/http_request.js');
const ServiceInstall = require("../models/service_install");
const { logger } = require("../logger");
const ServiceInstallOption = require("../models/service_install_option");
const ServiceInstalluserData = require("../models/service_install_user_data");
const DomainService = require("../services/domain_service");
const RegisterDomain = require("../models/register_domain");
const URLS = require("../common/urls");
const ServiceUpdate = require("../models/service_update");
const resMsg = require("../utils/message");
const ServiceDelete = require("../models/service_delete");

const msg_bad_request = resMsg.errMsg(400, "bad request.");

const serviceCtrl = {
    create : async (req, res) => {
        if(req.method != 'POST') return res.send(msg_bad_request);

        const serviceInstall = new ServiceInstall(req.body);
        await requestAsync(URLS.ACCOUNT_CREATE, req, res, 'CREATE', MainService, serviceInstall, async ()=>{
            if(serviceInstall.options != null && serviceInstall.options != undefined){
                logger.info("< add serviceInstall.options >")
                // todo : 옵션 신청, 데이터 형태 = 배열
                let svcInstallOptions = [];
                for (const opt of serviceInstall.options) {
                    opt.member_no = serviceInstall.member_no;
                    opt.contract_no = serviceInstall.contract_no;
                    opt.job_id = serviceInstall.job_id;
                    const data = new ServiceInstallOption(opt);
                    svcInstallOptions.push(data);
                }
                await MainService.createOption(svcInstallOptions,(err)=>{
                    logger.info(("createOption result : "+ JSON.stringify(err)));
                });
            }
            if(serviceInstall.userdata != null && serviceInstall.userdata != undefined){
                logger.info("< add serviceInstall.userdata >")
                // todo : 사용자 정보 입력, 데이터 형태 = 배열
                let svcInstallUserDatas = [];
                for (const userData of serviceInstall.userdata) {
                    userData.member_no = serviceInstall.member_no;
                    userData.contract_no = serviceInstall.contract_no;
                    userData.job_id = serviceInstall.job_id;
                    const data = new ServiceInstalluserData(userData);
                    svcInstallUserDatas.push(data);
                }
                await MainService.createUserData(svcInstallUserDatas,async ()=>{
                    // todo : userdata 의 value 로 사용자 Domain 을 전달받습니다.
                    const jsonData = {
                        'member_no' : serviceInstall.member_no,
                        'contract_no' :serviceInstall.contract_no,
                        'domain_name' : serviceInstall.userdata[0].value
                    };
                    await DomainService.create(new RegisterDomain(jsonData), (err)=>{
                        logger.info("Domain register by Userdata value. : "+ JSON.stringify(err));
                    });
                });
            }
        });
    },
    update :  async (req, res) =>{
        if(req.method != 'POST') return res.send(msg_bad_request);
        await requestAsync(URLS.ACCOUNT_UPDATE, req, res, 'UPDATE', MainService, new ServiceUpdate(req.body), ()=>{

        });
    },
    delete :  async (req, res) =>{
        if(req.method != 'POST') return res.send(msg_bad_request);
        const serviceDelete = new ServiceDelete(req.body);
        await requestAsync(URLS.ACCOUNT_DELETE, req, res, 'DELETE', serviceCtrl, serviceDelete, async ()=>{
            // todo : 계정의 상태가 terminate 로 변경되면 DNS 에서 도메인을 삭제합니다.
            await DomainService.delete(serviceDelete.contract_no, (err)=>{
                logger.info("Domain deleted : "+ JSON.stringify(err));
            });
        });
    },
    billPlanUpdate :  async (req, res) =>{
        if(req.method != 'POST') return res.send(msg_bad_request);
        await MainService.billPlanUpdate(URLS.PAYMENT_UPDATE, req, res);
    },
    getFee :  async (req, res) =>{
        if(req.method != 'POST') return res.send(msg_bad_request);
        await MainService.getFee(URLS.PAYMENT_GETFEE, req, res);
    }
}

module.exports = serviceCtrl;
