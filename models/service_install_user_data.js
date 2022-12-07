const otbUtil = require('../utils/otb_util.js');
class ServiceInstallUserData{
    constructor(json) {
        this.job_id = json.job_id;
        this.member_no = json.member_no;
        this.contract_no = otbUtil.GetDefaultValue(json.contract_no,"");
        this.key = otbUtil.GetDefaultValue(json.key,"");
        this.name = otbUtil.GetDefaultValue(json.name,"");
        this.value = otbUtil.GetDefaultValue(json.value,"");
    }

    getPostQuery(){
        return "INSERT INTO tn_aply_dc_opt2(" +
        "job_id," +
        "member_no," +
        "contract_no," +
        "user_key," +
        "name," +
        "[value]) VALUES(?, ?, ?, ?, ?, ?);";
    }
    getParams(){
        return [
            this.job_id,
            this.member_no,
            this.contract_no,
            this.key,
            this.name,
            this.value
        ];
    }
}

module.exports = ServiceInstallUserData;