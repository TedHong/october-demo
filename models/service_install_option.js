const otbUtil = require('../utils/otb_util.js');

class ServiceInstallOption{
    constructor(json) {
        this.member_no = otbUtil.GetDefaultValue(json.member_no, "");
        this.contract_no = otbUtil.GetDefaultValue(json.contract_no,"");
        this.key = otbUtil.GetDefaultValue(json.key, ""); // option key
        this.name = otbUtil.GetDefaultValue(json.name, "");
        this.count = otbUtil.GetDefaultValue(json.count, 0);
        this.free_count = otbUtil.GetDefaultValue(json.free_count, 0);
        this.svc_count = otbUtil.GetDefaultValue(json.svc_count, 0);
        this.price = otbUtil.GetDefaultValue(json.price, 0);
        this.job_id = json.job_id;
    }

    getPostQuery(){
        return "INSERT INTO tn_aply_dc_opt(" +
            "member_no," +
            "contract_no,"+
            "opt_key," + //option_key
            "name," +
            "[count]," +
            "free_count," +
            "svc_count," +
            "price,"+
            "job_id"+
            ") VALUES(?,?,?,?,?,?,?,?,?)";
    }
    getParams(){
        return [
            this.member_no,
            this.contract_no,
            this.key,
            this.name,
            this.count,
            this.free_count,
            this.svc_count,
            this.price,
            this.job_id
        ];
    }
}

module.exports = ServiceInstallOption;