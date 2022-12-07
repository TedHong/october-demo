//서비스 요금제 변경
const otbUtil = require('../utils/otb_util.js');
class ServiceBillPlanUpdate {
    constructor(json) {
        this.app_key                = json.app_key;
        this.member_no              = json.member_no;

        this.old_contract_no        = otbUtil.GetDefaultValue(json.old_contract_no,"");
        this.old_bill_plan          = otbUtil.GetDefaultValue(json.old_bill_plan,"");
        this.old_month_price        = otbUtil.GetDefaultValue(json.old_month_price,0);
        this.old_year_month_price   = otbUtil.GetDefaultValue(json.old_year_month_price,0);
        this.old_year_penalty_rate  = otbUtil.GetDefaultValue(json.old_year_penalty_rate,0);

        this.new_contract_no        = otbUtil.GetDefaultValue(json.new_contract_no,"");
        this.new_bill_plan          = otbUtil.GetDefaultValue(json.new_bill_plan,"");
        this.new_month_price        = otbUtil.GetDefaultValue(json.new_month_price,0);
        this.new_year_month_price   = otbUtil.GetDefaultValue(json.new_year_month_price,0);
        this.new_year_penalty_rate  = otbUtil.GetDefaultValue(json.new_year_penalty_rate,0);
    }

    getPostQuery(){
        // todo : UPDATE [table_name] SET(aaa,bbb) = (?,?) WHERE member_no = [member_no]
        return "UPDATE tn_aply_dc SET(" +
            "contract_no," +
            "bill_plan," +
            "month_price," +
            "year_month_price," +
            "year_penalty_rate," +
            "updt_dttm" +
            ") = (?,?,?,?,?,?) WHERE member_no = ? AND contract_no = ?;";
    }
    getParams(){
        const dateTimeNow = new Date();
        return [
            this.new_contract_no,
            this.new_bill_plan,
            this.new_month_price,
            this.new_year_month_price,
            this.new_year_penalty_rate,
            dateTimeNow,
            this.member_no,
            this.old_contract_no
        ];
    }
}

module.exports = ServiceBillPlanUpdate;
