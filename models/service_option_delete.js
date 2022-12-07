//서비스 옵션 해지
const otbUtil = require('../utils/otb_util.js');
class ServiceOptionDelete {
    constructor(json) {
        this.job_id         = json.job_id;
        this.app_key        = json.app_key;
        this.member_no      = json.member_no;
        this.contract_no    = otbUtil.GetDefaultValue(json.contract_no,"");
        this.service_key    = otbUtil.GetDefaultValue(json.service_key,"");
        this.option_key     = otbUtil.GetDefaultValue(json.option_key,"");
        this.option_name    = otbUtil.GetDefaultValue(json.option_name,"");
        this.count          = otbUtil.GetDefaultValue(json.count,0);
    }

    // member_no, option_key 로 조회해서 삭제 처리
    getPostQuery(){
        return "DELETE tn_aply_dc_opt " +
            "WHERE member_no = ? AND contract_no = ? AND opt_key = ?;";
    }
    getParams(){
        return [
            this.member_no,
            this.contract_no,
            this.option_key
        ];
    }
}

module.exports = ServiceOptionDelete;
