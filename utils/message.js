/**
 * Response 에 사용할 메세지를 만듭니다.
 * @type {{sucessResult: (function(*): {status_code: number, message: *}), sucess: (function(): {status_code: number, message: string}), errMsg: (function(*, *): {status_code: *, message: *})}}
 */
const RESPONSE_MSG = {
    sucess : ()=>{
        return {"status_code" : 200, "message": "sucess"};
    },
    sucessResult: (obj)=>{
      return { "status_code" : 200, "message": obj };
    },
    errMsg : (code, msg) =>{
        return {"status_code" : code, "message": msg};
    }
}

module.exports = RESPONSE_MSG;