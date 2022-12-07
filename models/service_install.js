//서비스 설치
const ServiceInstallOption = require('./service_install_option.js');
const ServiceInstallUserData = require('./service_install_user_data.js');
const otbUtil = require('../utils/otb_util.js');
class ServiceInstall {
    constructor(json) {
        console.log(JSON.stringify(json));
        this.job_id = otbUtil.GetDefaultValue(json.job_id, "");
        this.app_key = otbUtil.GetDefaultValue(json.app_key, "");
        this.member_no = otbUtil.GetDefaultValue(json.member_no, "");
        this.contract_no = otbUtil.GetDefaultValue(json.contract_no, "");
        this.svc_name = otbUtil.GetDefaultValue(json.svc_name, "");
        this.display_name = otbUtil.GetDefaultValue(json.display_name, "");
        this.bill_plan = otbUtil.GetDefaultValue(json.bill_plan, "");
        this.total_price = otbUtil.GetDefaultValue(json.total_price, 0);
        this.month_price = otbUtil.GetDefaultValue(json.month_price, 0);
        this.year_month_price = otbUtil.GetDefaultValue(json.year_month_price, 0);
        this.year_penalty_rate = otbUtil.GetDefaultValue(json.year_penalty_rate, 0);
        this.service_key = otbUtil.GetDefaultValue(json.service_key, "");

        if(json.options != undefined && json.options != null){
            // var list = [];
            // for (const item in json.options) {
            //     list.push(new ServiceInstallOption(item));
            // }
            this.options = json.options;
        }

        if(json.userdata != undefined && json.userdata != null){
            console.log(JSON.stringify(json.userdata));
            var list = [];
            for (const item of json.userdata) {
                list.push(new ServiceInstallUserData(item));
            }
            this.userdata = list;
        }
    }

    getPostQuery(){
        return "INSERT INTO tn_aply_dc(" +
            "job_id," +
            "service_status,"+
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
            "create_dttm," +
            "updt_dttm)" +
            " VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
    }

    getParams(){
        const dateTimeNow = new Date();
        return [
            this.job_id,
            'running', // 정상 RUNNING, 중지 PAUSE, 해지 TERMINATE
            this.app_key,
            this.member_no,
            this.contract_no,
            this.svc_name,
            this.display_name,
            this.bill_plan,
            this.total_price,
            this.month_price,
            this.year_month_price,
            this.year_penalty_rate,
            this.service_key,
            dateTimeNow,
            dateTimeNow
        ];
    }

}

module.exports = ServiceInstall;