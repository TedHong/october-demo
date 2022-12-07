const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const {logger, stream} = require('../logger.js');
const NodeCache = require( "node-cache" );
const CONSTANTS = require("../common/constants");
const requestIp = require("request-ip");
const URLS = require("../common/urls");
const myCache = new NodeCache();
const cubrid = require("../cubrid/dbconnect");

const tokenInfo =
    {
       access_key:String,
       secret_key:String,
       access_token:String
    };

const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;

function getErrorMsg(code, msg){
    return {
        "message" : msg,
        "status_code" : code
    };
}

const tokenManager = {
    createToken: async (req, res) => {
        const clientIp = requestIp.getClientIp(req);
        logger.info("["+URLS.GET_TOKEN+"] "+clientIp + " | "+JSON.stringify(req.body));

        try {
            const accessKey = req.body["access_key"];
            const secretKey = req.body["secret_key"];
            // console.log("accessKey = "+accessKey);
            // console.log("secretKey = "+secretKey);

            const connKeyQuery = "SELECT * FROM tn_common_data WHERE data_key = ? OR data_key = ?;";

            await cubrid.queryForObject('GET', connKeyQuery, ['ncp_access_key', 'ncp_secret_key'], (dbResult) => {
                const mAccessKey = dbResult.message[0].data_value;
                const mSecretKey = dbResult.message[1].data_value;

                if(mAccessKey !== accessKey || mSecretKey !== secretKey){
                    res.send(getErrorMsg(CONSTANTS.INVALID_KEY, "it's wrong key."));
                    return;
                }

                const payload = { access_key: accessKey};
                const options = {
                    algorithm: "HS256",
                    expiresIn : "30m",
                    issuer: "yooncoms"
                };
                const result = {
                    token : jwt.sign(payload, secretKey, options)
                }

                tokenInfo.access_key = accessKey;
                tokenInfo.secret_key = secretKey;
                tokenInfo.access_token = result.token;

                myCache.set("lastToken", tokenInfo);
                // console.log(tokenInfo);
                res.send(result);

            });
        }catch (err){
            res.send(err.message);
        }

    },
    verifyToken: async (token) => {
        const lastToken =  myCache.get("lastToken");
        const secretKey = lastToken["secret_key"];

        return jwt.verify(token, secretKey, (err, decoded) => {
            if(err) {
                if (err.message === 'jwt expired') {
                    logger.error('expired token');
                    err.errorCode = CONSTANTS.EXPIRED_TOKEN;
                } else if (err.message === 'invalid token') {
                    logger.error('invalid token');
                    err.errorCode = CONSTANTS.INVALID_TOKEN;
                } else {
                    logger.error("unknown error");
                    err.errorCode = CONSTANTS.INTERNAL_SERVER_ERROR;
                }
                return err;
            }else{
                logger.info("[verifyToken] : "+ JSON.stringify(decoded));
                decoded.errorCode = CONSTANTS.SUCCESS;
                return  decoded;
            }
        });
    },
    checkToken: async (req, callback) => {
        let resultMsg;
        const token  = req.header("Authorization");
        if(token === undefined || token === null){
            resultMsg =  getErrorMsg(CONSTANTS.BAD_REQUEST, "bad request. empty access token.");
            callback(resultMsg);
            return;
        }

        const verifyResult = await tokenManager.verifyToken(token);
        if(verifyResult.errorCode !== CONSTANTS.SUCCESS){
            if(verifyResult.errorCode === CONSTANTS.EXPIRED_TOKEN)
                resultMsg = getErrorMsg(CONSTANTS.EXPIRED_TOKEN, "token expired.");
            else if(verifyResult.errorCode === CONSTANTS.INVALID_TOKEN)
                resultMsg =  getErrorMsg(CONSTANTS.INVALID_TOKEN, "token invalid.");
            else
                resultMsg =  getErrorMsg(verifyResult.errorCode, verifyResult.message);
        }
        else{
            resultMsg =  getErrorMsg( CONSTANTS.SUCCESS, verifyResult);
        }
        callback(resultMsg);
    },
    createSignature: (_timestamp, _accessKey, _secretKey, _method, _url)=>{
        const space = " ";				// one space
        const newLine = "\n";				// new line
        const method = _method; //"POST";				// method
        const url = _url;  //"/api/v1/mails";	// url (include query string)
        const timestamp = _timestamp;			// current timestamp (epoch)
        const accessKey = _accessKey;			// access key id (from portal or Sub Account)
        const secretKey = _secretKey;			// secret key (from portal or Sub Account)
        const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
        hmac.update(method);
        hmac.update(space);
        hmac.update(url);
        hmac.update(newLine);
        hmac.update(timestamp.toString());
        hmac.update(newLine);
        hmac.update(accessKey);

        const hash = hmac.finalize();
        const result = hash.toString(CryptoJS.enc.Base64);
        console.log("createSignature : "+result);
        return result;
    }
}

module.exports = tokenManager;
