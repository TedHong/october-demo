//서비스 옵션 변경
const otbUtil = require('../utils/otb_util.js');
class ServiceOptionUpdate {
    constructor(json) {
        this.job_id             = json.job_id;
        this.app_key            = json.app_key;
        this.member_no          = json.member_no;
        this.contract_no        = otbUtil.GetDefaultValue(json.contract_no,"");
        this.service_key        = otbUtil.GetDefaultValue(json.service_key,"");
        this.option_key         = otbUtil.GetDefaultValue(json.option_key,"");
        this.option_name        = otbUtil.GetDefaultValue(json.option_name,"");
        this.old_free_count     = otbUtil.GetDefaultValue(json.old_free_count,0);
        this.new_free_count     = otbUtil.GetDefaultValue(json.new_free_count,0);
        this.old_count          = otbUtil.GetDefaultValue(json.old_count,0);
        this.new_count          = otbUtil.GetDefaultValue(json.new_count,0);
        this.old_svc_count      = otbUtil.GetDefaultValue(json.old_svc_count,0);
        this.new_svc_count      = otbUtil.GetDefaultValue(json.new_svc_count,0);
        this.old_price          = otbUtil.GetDefaultValue(json.old_price,0);
        this.new_price          = otbUtil.GetDefaultValue(json.new_price,0);
    }

    getPostQuery(){
        return "UPDATE tn_aply_dc_opt SET(" +
            "name," +
            "[count]," +
            "free_count," +
            "svc_count," +
            "price" +
            ") = (?,?,?,?,?)" +
            " WHERE member_no = ? AND contract_no = ? AND opt_key = ?;";
    }
    getParams(){
        return [
            this.option_name,
            this.new_count,
            this.new_free_count,
            this.new_svc_count,
            this.new_price,
            this.member_no,
            this.contract_no,
            this.option_key
        ];
    }
}

module.exports = ServiceOptionUpdate;
