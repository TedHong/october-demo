FROM node:16.17.1
MAINTAINER swhong <swhong@yooncoms.com>
# /app 디렉토리 생성
RUN mkdir -p /app
# /app 디렉토리를 WORKDIR 로 설정
WORKDIR /app
# 현재 Dockerfile 있는 경로의 모든 파일을 /app 에 복사
ADD . /app
# npm install 을 실행
RUN npm install

#환경변수 NODE_ENV 의 값을 development 로 설정. development, production, local
#deploy_*.yaml의 환경변수 설정에서 지정하도록 합니다.
#ENV NODE_ENV development

#가상 머신에 오픈할 포트
EXPOSE 3000 80

#컨테이너에서 실행될 명령을 지정
CMD ["npm", "start"]
