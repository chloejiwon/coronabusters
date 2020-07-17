const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const testees = {};
const testers = {};
const users = {};
const socketToRoom = {};

io.on("connection", socket => {
  console.log("connection occured");
  // tester has joined the room
  // make p2p connection with everybody in the room
  socket.on("tester join room", roomID => {
    console.log("Tester has joined the room!", roomID);
    if (testers[roomID]) {
      const length = testers[roomID].length;
      if (length === 4) {
        socket.emit("room full");
        return;
      }
      testers[roomID].push(socket.id);
      users[roomID].push(socket.id);
    } else {
      testers[roomID] = [socket.id];
      users[roomID] = [socket.id];
    }
    socketToRoom[socket.id] = roomID;
    const usersInThisRoom = users[roomID].filter(id => id !== socket.id);

    socket.emit("all users", usersInThisRoom);
  });
  // testee has joined the room
  // only make p2p connection with testers
  socket.on("join room", roomID => {
    console.log("User has joined the room!", roomID);
    if (testees[roomID]) {
      const length = testees[roomID].length;
      if (length === 4) {
        socket.emit("room full");
        return;
      }
      testees[roomID].push(socket.id);
      users[roomID].push(socket.id);
    } else {
      testees[roomID] = [socket.id];
      users[roomID] = [socket.id];
    }
    socketToRoom[socket.id] = roomID;
    const testersInThisRoom = testers[roomID].filter(id => id !== socket.id);

    socket.emit("all testers", testersInThisRoom);
  });

  socket.on("sending signal", payload => {
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID
    });
  });

  socket.on("returning signal", payload => {
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id
    });
  });

  socket.on("disconnect", () => {
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
      room = room.filter(id => id !== socket.id);
      users[roomID] = room;
    }
  });
});

server.listen(process.env.PORT || 8000, () =>
  console.log("server is running on port 8000")
);
