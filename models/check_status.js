//비동기 상태 조회
class CheckStatus {
    constructor(json) {
        this.job_id = json.job_id;
    }

    getPostQuery(){
        return "SELECT * FROM tn_job_status WHERE job_id = ?;";
    }
    getParams(){
        return [
            this.job_id
        ];
    }
}

module.exports = CheckStatus;