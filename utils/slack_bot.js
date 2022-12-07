/**
 * 슬랙 알람을 보냅니다.
 */
const { IncomingWebhook } = require('@slack/webhook');
const WEB_HOOK_URL = '';
const webhook = new IncomingWebhook(WEB_HOOK_URL);
const timeUtil = require('./time_util.js');
const SlackBot = {
    send : async (msg)=>{
        try {
            if(process.env.NODE_ENV === 'local') return;

            const today = timeUtil.getToday();
            const sendMsg = "----- "+today+" ----------------------- \n" + msg;
            await webhook.send({
                text: sendMsg,
            });
        }catch (e){
            console.log("SlackBot send Exception : "+e.toString());
        }

    }
}

module.exports = SlackBot;