/**
 * Global DNS에 도메인을 등록 / 삭제합니다.
 * @type {{queryForObject: function(*, *, *, *): Promise<void>, DBConnect: function(*): Promise<*>, queryDB: function(*, *, *, *): Promise<void>, initTable: function(): Promise<void>}}
 */
const cubrid = require('../cubrid/dbconnect.js');
const {logger} = require('../logger.js');
const DnsCtrl = require('../controllers/dns_ctrl.js');
const dnsCtrl = new DnsCtrl();
const DomainService = {
    create : async (_registerDomain, _callback)=>{
        // todo : tn_aply_dc 테이블에 도메인 및 DB connect 번호 갱신 -> Global DNS 에 도메인과 레코드 등록
        const query = _registerDomain.getPostQuery();
        const params = _registerDomain.getParams();
        const connCountQuery = "SELECT data_value FROM tn_common_data WHERE data_key = ?;";

        await cubrid.queryForObject('GET', connCountQuery, ['conn_no'], (result) => {
            const lastCnt = result.message[0].data_value; // 마지막 db conn_no 조회
            const newCnt = (lastCnt !== undefined) ? parseInt(lastCnt) + 1 : 1;
            console.log("lastCount = " + newCnt);
            params.splice(2, 0, newCnt);
            cubrid.queryDB('POST', query, params, async (result) => {
                const updateConnCountQuery = (lastCnt !== undefined) ?
                    "UPDATE tn_common_data SET data_value = ? WHERE data_key = ?;" :
                    "INSERT INTO tn_common_data(data_key, data_value) VALUES(?,?);";
                const upParam = (lastCnt !== undefined) ? [newCnt + "", 'conn_no'] : ['conn_no', newCnt + ""];
                await cubrid.queryDB('POST', updateConnCountQuery, upParam, async (result) => {
                    logger.info(result);
                    // todo : Global DNS 에 도메인 등록
                    const comment = "memberNo : " + _registerDomain.memberNo + ", contractNo : " + _registerDomain.contract_no;
                    await dnsCtrl.runCreateDomain(_registerDomain.domainName, comment, (err) => {
                        try {
                            if (err.errorCode !== undefined && err.errorCode != 200) {
                                // DNS 등록 실패
                                _callback(err);
                            }
                        } catch (e) {
                            _callback(e);
                        } finally {
                            _callback(result);
                        }
                    });

                });

            });

        });


    },
    testDomain : ()=>{

    },
    update : (serviceUpdate, callback)=>{
        // todo...
        // const query = serviceUpdate.getPostQuery();
        // const params = serviceUpdate.getParams();
        // cubrid.queryDB('POST', query, params,(result)=>{
        //     callback(result);
        // });
    },
    delete : async (_contract_no, _callback)=>{
        const queryGetDomain  = "SELECT user_domain FROM tn_aply_dc WHERE contract_no = ?;";
        await cubrid.queryForObject('GET', queryGetDomain, [_contract_no], async (result) => {
            const _domain = result.message[0].user_domain; //
            await dnsCtrl.runDeleteDomain(_domain, (err) => {
                try {
                    if (err.errorCode !== undefined && err.errorCode != 200) {
                        // 도메인 삭제 실패
                        _callback(err);
                    }
                } catch (e) {
                    _callback(e);
                } finally {
                    _callback(result);
                }
            });

        });
    }
}

module.exports = DomainService;