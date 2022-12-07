class RegisterDomain {
    constructor(json) {
        this.memberNo = json.member_no;
        this.domainName = json.domain_name;
        this.contract_no = json.contract_no;
    }

    getPostQuery(){
        return "UPDATE tn_aply_dc SET(" +
            "user_domain," +
            "updt_dttm,"+
            "conn_no"+
            ") = (?,?,?) WHERE member_no = ? AND contract_no = ?;";
    }

    getParams(){
        const dateTimeNow = new Date();
        return [
            this.domainName,
            dateTimeNow,
            this.memberNo,
            this.contract_no
        ];
    }
}

module.exports = RegisterDomain;