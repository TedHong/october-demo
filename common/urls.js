module.exports = Object.freeze({
   GET_TOKEN : "/oauth/getToken",
   ACCOUNT_CREATE : "/account/create",
   ACCOUNT_UPDATE : "/account/update",
   ACCOUNT_DELETE : "/account/delete",
   PAYMENT_UPDATE : "/account/payment/update",
   PAYMENT_GETFEE : "/account/payment/getFee",
   OPTION_CREATE : "/account/option/create",
   OPTION_UPDATE : "/account/option/update",
   OPTION_DELETE : "/account/option/delete",
   CHECK_STATUS : "/account/status",
   DOMAIN_REGISTER : "/domain/register",
   DOMAIN_UPDATE : "/domain/update",
   DOMAIN_DELETE : "/domain/delete",
   CREATE_SSL : "/account/createSSL",

   DNS_BASE : "",
   DNS_PATH_DOMAIN : "/dns/v1/ncpdns/domain",
   DNS_ADD_RECORD : "/dns/v1/ncpdns/record",
   DNS_DELETE_DOMAIN : "/dns/v1/ncpdns/domain",

   LB_INGRESS_DEV : "",
   LB_INGRESS_LIVE : ""
});