# Antwerp Tutorial

Antwerp Tutorial - Boilerplate for React Frontend

**앤트워프 튜토리얼**은 React 프론트엔드의 보일러플레이트입니다.

# 구성 패키지

- [**Node.js**](https://nodejs.org/ko/): `v10.19.0`
- [**Express**](https://expressjs.com/ko/): `^4.16.4`
- [**React**](https://ko.reactjs.org/): `16.12.0`
- [**Redux**](https://redux.js.org/): `7.1.3`
- [**Redux Saga**](https://redux-saga.js.org/): `1.1.3`
- [**Next.js**](https://nextjs.org/): `9.2.1`
- [**Axios**](https://github.com/axios/axios): `^0.18.0`
- [**Ant Design**](https://3x.ant.design/): `3.26.8`

기타 구성 패키지는 `package.json`을 참조하세요.

# 프로젝트 실행

```
$ npm install
$ npm run dev
```

**Next.js**를 사용하는 경우는 아래와 같습니다.

```
$ npm install
$ npm run build
$ npm run start
```

# Webrtc 테스트

```
$ npm install
$ node signaling_server.js
$ npm run dev
```

동일한 room Id를 가지도록 하여 두 브라우저에서 접속해보세요.

`예시) localhost:3000/room/0, localhost:3000/room/0`

signaling_server.js 는 webrtc peer to peer 연결을 가능하게 해주는 시그널링 서버입니다.

대략 다음과 같은 단계로 동작합니다.

- signaling server 는 8000 port로 동작합니다.

- user 가 해당 페이지 접속 시 local Video stream을 얻고 roomId에 해당하는 방에 socket 을 connection하고 join합니다.

- signaling server는 roomId에 등록된 모든 user의 정보를, caller 본인 id 를 제외하고 return 해줍니다.

- client는 서버로부터 받은 모든 user와 1:1 통신을 맺습니다.

# Tensorflow.js predict 테스트

`localhost:3000/room/0`에 접속하여 webcam의 video stream이 보여지면 console에 각 비디오 프레임마다 detect된 사물을 로그로 찍습니다.

안되면 아래 명령어를 입력하고 다시 시작해보세요.

```
$ npm install @tensorflow-models/coco-ssd
$ npm install @tensorflow/tfjs
```
