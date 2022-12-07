/**
 * K8S 에 SSL 용 secret 을 생성하고 Ingress 에 등록
 * secret 생성 :  k8s.CoreV1Api - createNamespacedSecret
 * ingress 수정 : k8s.NetworkingV1Api - patchNamespacedIngress
 * */

const k8s = require('@kubernetes/client-node');
const kc = new k8s.KubeConfig();
// kc.loadFromDefault();
kc.loadFromFile("./yaml/kubeconfig_dev.yaml");

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sNetworkApi = kc.makeApiClient(k8s.NetworkingV1Api);
const metricsClient = new k8s.Metrics(kc);
const fs = require('fs')
const {V1Secret, V1ObjectMeta, V1IngressTLS, V1Ingress} = require("@kubernetes/client-node");
const {logger} = require("../logger");
const ingressInfo = {
    name :      (process.env.NODE_ENV === 'production')? 'live-nginx-ingress' : 'dev-nginx-ingress',
    namespace : (process.env.NODE_ENV === 'production')? 'live' : 'develop',
    jsonfile :  (process.env.NODE_ENV === 'production')? './yaml/ingress_live.json' : './yaml/ingress_dev.json'
}

const K8sService = {
    createSecret : async  (_host, _key, _crt, callback)=>{
        /**
         * key 와 crt 를 이용해 secret 생성
         * apiVersion: v1
         * data:
         *   tls.crt: {your crt}
         *   tls.key: {your key}
         * kind: Secret
         * metadata:
         *   name: {secret name}
         *   namespace: {namespace}
         * type: kubernetes.io/tls
         */
        const secret = new V1Secret();
        secret.apiVersion = 'v1';
        secret.data = {
            'tls.crt' : btoa(_crt),
            'tls.key' : btoa(_key)
        };
        secret.metadata = new V1ObjectMeta();
        secret.metadata.name = _host+"-tls";
        secret.metadata.namespace =  ingressInfo.namespace;
        secret.type = 'kubernetes.io/tls';
        // k8sApi.readNamespacedSecret("hongik-tls", ingressInfo.namespace ).then((result=>{
        //     console.log(result);
        // }))
        try {
            await k8sApi.createNamespacedSecret(ingressInfo.namespace, secret).then((result)=>{
                console.log(result);
                if(result.response.statusCode === 201){ // 201 : created
                    console.log("[K8S] Create secret complete : " + _host);
                    callback(result.response.statusCode);
                }
            }).catch((err)=>{
                logger.error("[createSecret] reject : " + JSON.stringify(err));
            });
        }
        catch (e) {
            logger.error("[createSecret] exception : " + JSON.stringify(e));
        }

    },
    patchIngressTls : async (_host, _secretName, callback)=>{
        /**
         * body.spec.tls, tls 는  Array.  [{ hosts:[ "mydomain.com" ], secretName:"secret name" }]
         * 1. 클러스터에서 읽어온 tls 배열에 새로운 tls 정보를 추가
         * 2. ingress_dev.json 을 jsonOject로 변환         *
         * 3. 2번 객체에 tls 데이터 갱신
         * 4. k8s 에 patch
         */
        k8sNetworkApi.readNamespacedIngress(ingressInfo.name, ingressInfo.namespace).then((result)=>{
            // console.log(result);
            const ingressTls = result.body.spec.tls;
            const mTls = new V1IngressTLS();
            mTls.hosts = [ _host ];
            mTls.secretName = _secretName;
            ingressTls.push(mTls); //1. 클러스터에서 읽어온 tls 배열에 새로운 tls 정보를 추가
            fs.readFile(ingressInfo.jsonfile, (err, data)=>{ // 2. ingress_dev.json 을 jsonOject로 변환
                if(err) throw err;

                const ingressJson = JSON.parse(data);
                ingressJson.spec.tls = ingressTls; //3. 2번 객체에 tls 데이터 갱신
                const ingress = Object.assign(new V1Ingress(), ingressJson);
                try {
                    // 4. k8s 에 patch
                    // 415 에러 해결 : 'content-type': 'application/merge-patch+json' 추가
                    k8sNetworkApi.patchNamespacedIngress(ingressInfo.name, ingressInfo.namespace, ingressJson,  undefined, undefined, undefined, undefined,
                        undefined, { headers: { 'content-type': 'application/merge-patch+json' } }).then((result)=>{
                        // console.log(result.response);
                        callback(result.response.statusCode);
                    }).catch((err)=>{
                        logger.error("[patchIngressTls] reject : " + JSON.stringify(err));
                    });
                }
                catch (e) {
                    logger.error("[patchIngressTls] exception : " + JSON.stringify(e));
                }
            });
        });
    },
};

module.exports = K8sService;