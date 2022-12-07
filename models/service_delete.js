//서비스 해지
const ServiceInstallOption = require('./service_install_option.js');
const ServiceInstallUserData = require('./service_install_user_data.js');
const otbUtil = require('../utils/otb_util.js');

class ServiceDelete {
    constructor(json) {
        this.job_id             = otbUtil.GetDefaultValue(json.job_id,"");
        this.app_key            = otbUtil.GetDefaultValue(json.app_key,"");
        this.member_no          = otbUtil.GetDefaultValue(json.member_no,"");
        this.contract_no        = otbUtil.GetDefaultValue(json.contract_no,"");
        this.svc_name           = otbUtil.GetDefaultValue(json.svc_name,"");
        this.display_name       = otbUtil.GetDefaultValue(json.display_name,"");
        this.bill_plan          = otbUtil.GetDefaultValue(json.bill_plan,"");
        this.month_price        = otbUtil.GetDefaultValue(json.month_price,0);
        this.year_month_price   = otbUtil.GetDefaultValue(json.year_month_price,0);
        this.year_penalty_rate  = otbUtil.GetDefaultValue(json.year_penalty_rate,0);
        this.service_key        = otbUtil.GetDefaultValue(json.service_key,"");

        if(json.options != undefined && json.options != null){
            var list = [];
            for (const item in json.options) {
                list.push(new ServiceInstallOption(item));
            }
            this.options = list;
        }

        if(json.userdata != undefined && json.userdata != null){
            var list = [];
            for (const item in json.userdata) {
                list.push(new ServiceInstallUserData(item));
            }
            this.userdata = list;
        }
    }

    getPostQuery(){
        // todo : UPDATE 로 service_status 와 updt_dttm만 바꾸면 될 듯?
        return "UPDATE tn_aply_dc SET " +
            "service_status = ?," +
            "updt_dttm = ? " +
            "WHERE member_no = ? AND contract_no = ?;";
    }
    getParams(){
        const dateTimeNow = new Date();
        return [
            'terminate',
            dateTimeNow,
            this.member_no,
            this.contract_no
        ];
    }
}

module.exports = ServiceDelete;