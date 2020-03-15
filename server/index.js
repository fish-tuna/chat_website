const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const { addUser, removeUser, getUser } = require("./users");

const PORT = process.env.PORT || 5000;

const router = require("./router");

//webrtc setup start
var mediaConstraints = {
  audio: true, // We want an audio track
  video: {
    aspectRatio: {
      ideal: 1.333333 // 3:2 aspect is preferred
    }
  }
};

var myUsername = null;
var targetUsername = null; // To store username of other peer
var myPeerConnection = null; // RTCPeerConnection
var transceiver = null; // RTCRtpTransceiver
var webcamStream = null; // MediaStream from webcam
//webrtc setup end

const app = express();
const server = http.createServer(app);
const io = socketio(server);
let tfswitch = true;
let roomid;
let prevName;

io.on("connection", socket => {
  console.log("New connection!");

  socket.on("join", ({ name }, callback) => {
    console.log(name);
    console.log(socket.id);
    /* const { error, user } = addUser({ id: socket.id });

    if (error) return callback(error);

    if (tfswitch) {socket.join }

   */

    if (tfswitch) {
      console.log(tfswitch);
      roomid = socket.id;
      console.log(roomid);
      socket.join(roomid);
      socket.to(roomid).emit("message", {
        text: `Welcome, ${name}! Waiting for another user!`
      });
      /*io.to(socket.id).emit("message", {
        text: `Welcome, ${name}! Waiting for another user!`
      });*/
      tfswitch = false;
      prevName = name;
    } else {
      socket.broadcast
        .to(roomid)
        .emit("message", { text: `${name} has joined!` });
      socket.join(roomid);
      socket.broadcast.to(socket.id).emit("message", {
        text: `Welcome, ${name}! You have joined ${prevName}!`
      });

      tfswitch = true;
    }
    console.log(socket.room);
  });

  socket.on("call-user", data => {
    socket.to(data.to).emit("call-made", {
      offer: data.offer,
      socket: socket.id
    });
  });

  socket.on("make-answer", data => {
    socket.to(data.to).emit("answer-made", {
      socket: socket.id,
      answer: data.answer
    });
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(socket.id).emit("message", { text: message });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected!");
    socket.to(roomid).emit("message", {
      text: "a user has disconnected."
    });
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
