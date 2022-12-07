/**
 * October 서버에서 사용할 공통 유틸
 * @type {{GetDefaultValue: (function(*, *): *)}}
 */
const OTBUtil = {
    GetDefaultValue : (value, defValue)=>{
        return (value != null && value != undefined)? value : defValue;
    }
}

module.exports = OTBUtil;