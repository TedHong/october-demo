const express = require("express");
const mRouter = express.Router();
const tokenManager = require('./oauth/token_manager');
const URLS = require('./common/urls.js');

// controllers
const serviceCtrl = require('./controllers/service_ctrl.js');
const serviceOptionCtrl = require('./controllers/service_option_ctrl.js');
const checkStatusCtrl = require('./controllers/check_status_ctrl.js');
const domainCtrl = require('./controllers/domain_ctrl.js');
const k8sCtrl = require('./controllers/k8s_ctrl.js');



// 서비스 설치
mRouter.post(URLS.ACCOUNT_CREATE, serviceCtrl.create);

// 서비스 변경
mRouter.post(URLS.ACCOUNT_UPDATE, serviceCtrl.update);

// 서비스 해지
mRouter.post(URLS.ACCOUNT_DELETE, serviceCtrl.delete);

// 서비스 옵션 신청
mRouter.post(URLS.OPTION_CREATE, serviceOptionCtrl.create);

// 서비스 옵션 변경
mRouter.post(URLS.OPTION_UPDATE, serviceOptionCtrl.update);

// 서비스 옵션 해지
mRouter.post(URLS.OPTION_DELETE, serviceOptionCtrl.delete);

// 도메인 등록
mRouter.post(URLS.DOMAIN_REGISTER, domainCtrl.create);

// 요금제 변경, 동기 처리
mRouter.post(URLS.PAYMENT_UPDATE, serviceCtrl.billPlanUpdate);

// 요금 데이터 수집 - 도메인 별 사용량을 측정하고 사용량에 맞는 요금을 리턴합니다.
mRouter.post(URLS.PAYMENT_GETFEE, serviceCtrl.getFee);

// 비동기 상태 조회, 동기 처리
mRouter.post(URLS.CHECK_STATUS, checkStatusCtrl.check);

// Access Token 발급
mRouter.post(URLS.GET_TOKEN, tokenManager.createToken);

/**
 * K8S 에 Secret 생성 후 Ingress 업데이트
 * params : host, tlsKey, tlsCrt
 */
mRouter.post(URLS.CREATE_SSL, k8sCtrl.createSecret);

// 테스트용 : 토큰 체크
// mRouter.post("/oauth/checkToken",async (req, res)=>{
//     if(req.method != 'POST') return res.send(msg_bad_request);
//
//     logger.info(req.originalUrl);
//     var resultMsg = await tokenManager.checkToken(req, ()=>{
//
//     });
//     logger.info(resultMsg);
//     return res.send(resultMsg);
// });

module.exports = mRouter;