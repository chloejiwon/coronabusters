import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { withRouter } from "next/router";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

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
  const { dispatch, pokeNo, pokeData, router } = props;
  const { query } = router;
  const { roomId } = query;

  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);

  const canvasRef = useRef();

  useEffect(() => {
    socketRef.current = io.connect("localhost:8000");
    navigator.mediaDevices.getUserMedia(streamConstraints).then(stream => {
      userVideo.current.srcObject = stream;
      socketRef.current.emit("tester join room", roomId);
      socketRef.current.on("all users", users => {
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

  return (
    <Container>
      <StyledVideo muted ref={userVideo} autoPlay playsInline />
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
