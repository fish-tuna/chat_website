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
let currentFalse;
let keyStore = new Map();

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
      keyStore.set(roomid, roomid);
      socket.join(roomid);
      //start peer connection process on first user joining
      //i get an error on the below line if roomid is in parentheses
      io.to(socket.id).emit("triggerInit");
      io.to(roomid).emit("message", {
        text: `Welcome, ${name}! Waiting for another user!`
      });
      /*io.to(socket.id).emit("message", {
        text: `Welcome, ${name}! Waiting for another user!`
      });*/
      tfswitch = false;
      prevName = name;
    } else {
      currentFalse = socket.id;
      keyStore.set(socket.id, roomid);
      io.to(roomid).emit("message", { text: `${name} has joined!` });
      io.to(socket.id).emit("message", {
        text: `Welcome, ${name}! You have joined ${prevName}!`
      });

      socket.join(roomid);
      //this message below excludes the second joiner
      //socket.broadcast.to(roomid).emit("message", { text: "success" });
      tfswitch = true;
    }
    console.log(socket.room);
  });
  //wait for second user to join before emitting receiveInit event
  //consider optimization, also this async solution might not even work
  //parentheses around async data parameter might not be neeeded
  socket.on("triggerInitSuccess", async data => {
    console.log("one");
    while (true) {
      if (!tfswitch) {
        io.to(currentFalse).emit("receiveInit", data);
        console.log("two");
        return;
      }
      await null;
    }
  });
  //this might only work for 2 people, for more people using website there might be issue
  socket.on("receiveInitSuccess", data => {
    socket.broadcast.to(roomid).emit("receiveResponse", data);
  });
  //don't need this callback parameter? i removed it and nothing seemed to happen
  socket.on("sendMessage", (message, callback) => {
    //const user = getUser(socket.id);
    io.to(keyStore.get(socket.id)).emit("message", { text: message });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected!");
    io.to(socket.id).emit("message", {
      text:
        "your chat partner has disconnected. Return to the homepage. Philip needs to implement something more streamlined here."
    });
    keyStore.delete(socket.id);
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
