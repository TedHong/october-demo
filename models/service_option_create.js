//서비스 옵션 신청
const otbUtil = require('../utils/otb_util.js');
class ServiceOptionCreate {
    constructor(json) {
        this.job_id         = json.job_id;
        this.app_key        = json.app_key;
        this.member_no      = json.member_no;
        this.contract_no    = otbUtil.GetDefaultValue(json.contract_no,"");
        this.service_key    = otbUtil.GetDefaultValue(json.service_key,"");
        this.option_key     = otbUtil.GetDefaultValue(json.option_key,"");
        this.option_name    = otbUtil.GetDefaultValue(json.option_name,"");
        this.count          = otbUtil.GetDefaultValue(json.count,0);
        this.svc_count      = otbUtil.GetDefaultValue(json.svc_count,0);
        this.price          = otbUtil.GetDefaultValue(json.price,0);
    }

    getPostQuery(){
        return "INSERT INTO tn_aply_dc_opt(" +
            "job_id," +
            "member_no," +
            "contract_no,"+
            "opt_key," + //option_key
            "name," +
            "[count]," +
            "free_count," +
            "svc_count," +
            "price" +
            ") VALUES(?,?,?,?,?,?,?,?,?)";
    }
    getParams(){
        return [
            this.job_id,
            this.member_no,
            this.contract_no,
            this.option_key,
            this.option_name,
            this.count,
            0,
            this.svc_count,
            this.price
        ];
    }
}

module.exports = ServiceOptionCreate;
