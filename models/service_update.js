//서비스 변경
const ServiceInstallOption = require('./service_install_option.js');
const ServiceInstallUserData = require('./service_install_user_data.js');
const otbUtil = require('../utils/otb_util.js');

class ServiceUpdate {
    constructor(json) {
        this.job_id = json.job_id;
        this.app_key = json.app_key;
        this.member_no = json.member_no;

        this.old_contract_no        = otbUtil.GetDefaultValue(json.old_contract_no,"");
        this.old_svc_name           = otbUtil.GetDefaultValue(json.old_svc_name,"");
        this.old_display_name       = otbUtil.GetDefaultValue(json.old_display_name,"");
        this.old_bill_plan          = otbUtil.GetDefaultValue(json.old_bill_plan,"");
        this.old_total_price        = otbUtil.GetDefaultValue(json.old_total_price,0);
        this.old_month_price        = otbUtil.GetDefaultValue(json.old_month_price,0);
        this.old_year_month_price   = otbUtil.GetDefaultValue(json.old_year_month_price,0);
        this.old_year_penalty_rate  = otbUtil.GetDefaultValue(json.old_year_penalty_rate,0);
        this.old_service_key        = otbUtil.GetDefaultValue(json.old_service_key,"");

        this.new_contract_no        = otbUtil.GetDefaultValue(json.new_contract_no,"");
        this.new_svc_name           = otbUtil.GetDefaultValue(json.new_svc_name,"");
        this.new_display_name       = otbUtil.GetDefaultValue(json.new_display_name,"");
        this.new_bill_plan          = otbUtil.GetDefaultValue(json.new_bill_plan,"");
        this.new_total_price        = otbUtil.GetDefaultValue(json.new_total_price,0);
        this.new_month_price        = otbUtil.GetDefaultValue(json.new_month_price,0);
        this.new_year_month_price   = otbUtil.GetDefaultValue(json.new_year_month_price,0);
        this.new_year_penalty_rate  = otbUtil.GetDefaultValue(json.new_year_penalty_rate,0);
        this.new_service_key        = otbUtil.GetDefaultValue(json.new_service_key,"");

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
        // todo : UPDATE [table_name] SET(aaa,bbb) = (?,?) WHERE member_no = [member_no]
        return "UPDATE tn_aply_dc SET(" +
            "app_key," +
            "member_no," +
            "contract_no," +
            "svc_name," +
            "display_name," +
            "bill_plan," +
            "total_price," +
            "month_price," +
            "year_month_price," +
            "year_penalty_rate," +
            "service_key," +
            "updt_dttm"+
            ") = (?,?,?,?,?,?,?,?,?,?,?,?) WHERE member_no = ? AND contract_no = ?;";
    }
    getParams(){
        const dateTimeNow = new Date();
        return [
            this.app_key,
            this.member_no,
            this.new_contract_no,
            this.new_svc_name,
            this.new_display_name,
            this.new_bill_plan,
            this.new_total_price,
            this.new_month_price,
            this.new_year_month_price,
            this.new_year_penalty_rate,
            this.new_service_key,
            dateTimeNow,
            this.member_no,
            this.old_contract_no
        ];
    }
}

module.exports = ServiceUpdate;
