/**
 * 서비스 옵션을 생성, 수정, 삭제합니다.
 * @type {{queryForObject: function(*, *, *, *): Promise<void>, DBConnect: function(*): Promise<*>, queryDB: function(*, *, *, *): Promise<void>, initTable: function(): Promise<void>}}
 */
const cubrid = require('../cubrid/dbconnect.js');
const MainOptionService = {
    create : (optionInstall, callback)=>{
        // todo...
        const query = optionInstall.getPostQuery();
        const params = optionInstall.getParams();
        cubrid.queryDB('POST', query, params,(result)=>{
            callback(result);
        });
    },
    update : (optionUpdate, callback)=>{
        // todo...
        const query = optionUpdate.getPostQuery();
        const params = optionUpdate.getParams();
        cubrid.queryDB('POST', query, params,(result)=>{
            callback(result);
        });
    },
    delete : (optionDelete, callback)=>{
        // todo...
        const query = optionDelete.getPostQuery();
        const params = optionDelete.getParams();
        cubrid.queryDB('POST', query, params,(result)=>{
            callback(result);
        });
    },
}

module.exports = MainOptionService;
