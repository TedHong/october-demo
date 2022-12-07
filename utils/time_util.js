/**
 * 시간 유틸
 * @type {moment | ((inp?: moment.MomentInput, format?: moment.MomentFormatSpecification, language?: string, strict?: boolean) => moment.Moment) | ((inp?: moment.MomentInput, format?: moment.MomentFormatSpecification, strict?: boolean) => moment.Moment) | ((inp?: moment.MomentInput, strict?: boolean) => moment.Moment)}
 */
const moment = require('moment');

const TimeUtil = {
    getUtcNowMille : ()=>{
        return moment.utc().valueOf();
    },
    getUtcNowSeconds : ()=>{
        return moment.utc().unix();
    },
    getToday: ()=>{
        return moment().format('YYYY-MM-DD hh:mm:ss.ms');
    }
}

module .exports = TimeUtil;