//요금 데이터 수집 연동
const otbUtil = require('../utils/otb_util.js');
class ServiceBillplandGetPee {
    //필수	month	string	기준 년월 (형식: YYYYMM)
    // 옵션	member_no	string	회원 가입 시 부여되는 회원 고유 번호 (필수 값은 아니며 값을 넘기는 경우 해당 회원의 정보만 반환하고 값을 넘기지 않는 경우 전체 회원을 반환함)
    constructor(json) {
        this.member_no = otbUtil.GetDefaultValue(json.member_no, "");
        this.yyyy = otbUtil.GetDefaultValue(json.month.substring(0, 4), "");
        this.mm = otbUtil.GetDefaultValue(json.month.substring(4, 6), "");
    }

    getPostQuery(){
        return "SELECT * FROM (SELECT member_no, contract_no, user_domain, service_key FROM tn_aply_dc WHERE member_no = ?) AS dc, \n" +
            " (SELECT contract_no, opt_key, free_count FROM tn_aply_dc_opt WHERE contract_no = dc.contract_no)  AS opt,\n" +
            " (SELECT SUM(pv) AS used_cnt FROM tn_stats_site WHERE yyyy = ? AND mm = ? AND host = dc.user_domain) AS st \n" +
            "WHERE opt.contract_no = dc.contract_no;";
    }
    getPostQueryTotal(){
        return "SELECT * FROM (SELECT member_no, contract_no, user_domain, service_key FROM tn_aply_dc) AS dc, \n" +
            " (SELECT contract_no, opt_key, free_count FROM tn_aply_dc_opt WHERE contract_no = dc.contract_no)  AS opt,\n" +
            " (SELECT SUM(pv) AS used_cnts FROM tn_stats_site WHERE yyyy = ? AND mm = ? AND host = dc.user_domain) AS st \n" +
            "WHERE opt.contract_no = dc.contract_no;";
    }

    getParams(){
        return [
            this.member_no,
            this.yyyy,
            this.mm
        ];
    }
}

module.exports = ServiceBillplandGetPee;