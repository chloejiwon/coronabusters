import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { withRouter } from "next/router";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const Container = styled.div`
  padding: 20px;
  display: flex;
  height: 100vh;
  width: 90%;
  margin: auto;
  flex-wrap: wrap;
`;

const StyledVideo = styled.video`
  height: 500px;
  width: 600px;
`;

const StyledCanvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  height: 500px;
  width: 600px;
`;

const Video = props => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", stream => {
      ref.current.srcObject = stream;
    });
  }, []);

  return <StyledVideo playsInline autoPlay ref={ref} />;
};

var streamConstraints = { audio: true, video: true };

const Room = props => {
  let count = 0;
  const { dispatch, pokeNo, pokeData, router } = props;
  const { query } = router;
  const { roomId } = query;

  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);

  const canvasRef = useRef();

  useEffect(() => {
    socketRef.current = io.connect("http://localhost:8000");
    const webCamPromise = navigator.mediaDevices
      .getUserMedia(streamConstraints)
      .then(stream => {
        userVideo.current.srcObject = stream;
        console.log("Got local user video");

        socketRef.current.emit("join room", roomId);
        socketRef.current.on("all testers", users => {
          const peers = [];
          users.forEach(userID => {
            const peer = createPeer(userID, socketRef.current.id, stream);
            peersRef.current.push({
              peerID: userID,
              peer
            });
            peers.push(peer);
          });
          setPeers(peers);
        });

        socketRef.current.on("user joined", payload => {
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({
            peerID: payload.callerID,
            peer
          });

          setPeers(users => [...users, peer]);
        });

        socketRef.current.on("receiving returned signal", payload => {
          const item = peersRef.current.find(p => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });

        return new Promise((resolve, reject) => {
          userVideo.current.onloadedmetadata = () => {
            resolve();
          };
        });
      });

    const modelPromise = cocoSsd.load();
    Promise.all([modelPromise, webCamPromise])
      .then(values => {
        console.log(values);
        detectFrame(userVideo.current, values[0], canvasRef.current);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream
    });

    peer.on("signal", signal => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream
    });

    peer.on("signal", signal => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  function detectFrame(video, model, canvas) {
    count = (count + 1) % 120;
    console.log("count is being countee!", count);

    if (count % 120 == 0) {
      console.log("Detect Frame ");
      model.detect(video).then(predictions => {
        console.log(predictions);
        renderPredictions(predictions, canvas);
      });
    }
    requestAnimationFrame(() => {
      detectFrame(video, model);
    });
  }

  function renderPredictions(predictions, canvas) {
    console.log(predictions);
    /*   const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      // Draw the bounding box.
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      // Draw the label background.
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      // Draw the text last to ensure it's on top.
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
    });*/
  }

  return (
    <Container>
      <StyledVideo
        muted
        ref={userVideo}
        autoPlay
        playsInline
        width="600"
        height="500"
      />
      <StyledCanvas className="size" ref={canvasRef} width="600" height="500" />
      {peers.map((peer, index) => {
        return <Video key={index} peer={peer} />;
      })}
    </Container>
  );
};

export default connect(({ pokeReducer }) => ({
  pokeNo: pokeReducer.get("pokeNo"),
  pokeData: pokeReducer.get("pokeData")
}))(withRouter(Room));
