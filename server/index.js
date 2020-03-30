/* Please read the brief README.md before looking through this code. Video chat is handled 
with peer connection, while text chat is handled through the server. Converting text chat to 
peer connection could likely improve scalability.*/

const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const router = require("./router");

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

let boolSwitch = true;
let firstID;
let firstClientName;
let keyStore = new Map();

io.on("connection", socket => {
  console.log("New connection!");

  socket.on("join", ({ name }) => {
    console.log(name + " has connected.");
    /*boolSwitch stores a boolean that determines what to do when a new client connects, 
    depending on whether the client is first or second. If boolSwitch is true, the code 
    block for handling the first client runs. If boolSwitch is false, the code block
    for handling the second client runs instead. (boolSwitch is set to true
    on server initialization)*/
    if (boolSwitch) {
      console.log("First client handler triggered.");
      //store the current socket.id in global variable "firstID" so that the else block has access to it.
      firstID = socket.id;
      /*emit "triggerInit" event to the first client, instructing client to initiate local 
      video/audio stream and send its SDP data to the server.*/
      io.to(socket.id).emit("triggerInit");
      //emit welcome message to first client's text chat
      io.to(socket.id).emit("message", {
        text: `Welcome, ${name}! Waiting for another user!`
      });
      //set boolSwitch to false for the second client
      boolSwitch = false;
      /*store the first client's name in global variable "firstClientName" so that the 
      else block has access to it.*/
      firstClientName = name;
    } else {
      console.log("Second client handler triggered.");
      /*Store first and second client socket.id strings as keys in the Map "keyStore" such that 
      their values are the socket.id of their paired client, enabling easy access to any client's 
      partner's socket.id for server-mediated communication.*/
      keyStore.set(socket.id, firstID);
      keyStore.set(firstID, socket.id);
      //emit a message to the first client on second client connection containing second client's name
      io.to(keyStore.get(socket.id)).emit("message", {
        text: `${name} has joined!`
      });
      //emit a message to the second client on its connection containing the first client's name
      io.to(socket.id).emit("message", {
        text: `Welcome, ${name}! You have joined ${firstClientName}!`
      });
      //set boolSwitch back to true for the next first client
      boolSwitch = true;
    }
  });
  /*Once the first client has its SDP data, it emits a "triggerInitSuccess" event. 
  The server checks for the second client's connection every 500ms by checking the 
  keyStore Map. Once it sees that the second client is connected, the first client's SDP
  data is sent to the second client via an emit event. This emit event also tells the 
  second client to start local video/audio streaming, get its SDP data, and emit its SDP
  data to the server.*/
  socket.on("triggerInitSuccess", data => {
    (function waitForSecond() {
      if (keyStore.get(socket.id)) {
        io.to(keyStore.get(socket.id)).emit("receiveInit", data);
      } else {
        setTimeout(waitForSecond, 500);
      }
    })();
  });
  /*Second client sends "receiveInitSuccess" event with its SDP data after receiving 
  "receiveInit" event. On receiveInitSuccess, second client's SDP data is sent to
  the first client/ */
  socket.on("receiveInitSuccess", data => {
    socket.broadcast.to(keyStore.get(socket.id)).emit("receiveResponse", data);
  });
  //handle text chats sent by clients by emitting the received message to first and second clients
  socket.on("sendMessage", (message, callback) => {
    io.to(socket.id).emit("message", { text: message });
    io.to(keyStore.get(socket.id)).emit("message", { text: message });
  });
  /*On disconnect, send a message to disconnected client's partner indicating that the chat has ended.
  Set boolSwitch to true if the disconnecting client is an unpaired first client; otherwise delete the client's
  key-value pair from the keyStore map.*/
  socket.on("disconnect", () => {
    console.log("User disconnected!");
    io.to(keyStore.get(socket.id)).emit("message", {
      text:
        "Your chat partner has disconnected. Return to the homepage or refresh your browser to start a new session."
    });
    if (!keyStore.get(socket.id)) {
      boolSwitch = true;
    } else {
      keyStore.delete(socket.id);
    }
  });
});

//log number of online users every 5 minutes

function logUsers() {
  console.log(keyStore.size + " users currently connected to a chat partner.");
  setTimeout(logUsers, 300000);
}

setTimeout(logUsers, 300000);

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
