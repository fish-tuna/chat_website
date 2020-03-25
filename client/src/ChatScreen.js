import React, { useState, useEffect, useRef } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import EmojiButton from "./EmojiButton";
import Messages from "./Messages";
import Peer from "simple-peer";

let socket;

export default function ChatScreen({ location }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const ENDPOINT = "localhost:5000";
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerStorage = useRef(null);
  useEffect(() => {
    //get user-input name from URL
    const { name } = queryString.parse(location.search);
    socket = io(ENDPOINT);
    setName(name);
    socket.emit("join", { name }, error => {
      if (error) {
        alert(error);
      }
    });

    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, [ENDPOINT, location.search]);
  //use hooks to handle socket listener
  useEffect(() => {
    socket.on("message", message => {
      setMessages([...messages, message]);
    });
  }, [messages]);
  //use hooks to handle socket listeners
  useEffect(() => {
    /*On first client connection, server sends "triggerInit" socket event to the first client, 
initiating local video/audio stream and starting the peer signaling process.*/
    socket.on("triggerInit", data => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then(stream => {
          console.log("init triggered");
          localVideo.current.srcObject = stream;
          const peer = new Peer({ initiator: true, stream: stream });

          peerStorage.current = peer;

          peer.on("signal", data => {
            console.log("sent triggerinitsuccess event");
            socket.emit("triggerInitSuccess", data);
          });
          peer.on("stream", stream => {
            // got remote video stream, now let's show it in a video tag
            remoteVideo.current.srcObject = stream;
          });
          console.log("init triggered.");
        })
        .catch(error => {
          console.warn(error.message);
        });
    });
    /*Once second client is connected, server sends "receiveInit" socket event to the second client,
initiating local video/audio stream, receiving SDP signaling data from the first client via server, 
and continuing the peer signaling process.*/
    socket.on("receiveInit", initiatorSDP => {
      console.log("init received!!");
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then(stream => {
          console.log("init received");
          console.log(initiatorSDP);
          localVideo.current.srcObject = stream;
          const peer = new Peer({ stream: stream });
          peerStorage.current = peer;
          peer.on("signal", data => {
            console.log("receiveinitsuccess sent");
            socket.emit("receiveInitSuccess", data);
          });
          peer.signal(initiatorSDP);
          peer.on("stream", stream => {
            // got remote video stream, now let's show it in a video tag
            remoteVideo.current.srcObject = stream;
          });
        })
        .catch(error => {
          console.warn(error.message);
        });
    });
    /*first client receives SDP signaling data from the second client via server. The two peers are 
now connected, and are transmitting video/audio streams.*/
    socket.on("receiveResponse", responderSDP => {
      console.log("response received");
      //this line below maybe not needed
      const peer = peerStorage.current;
      peer.signal(responderSDP);
      peer.on("stream", stream => {
        // got remote video stream, now let's show it in a video tag
        remoteVideo.current.srcObject = stream;
      });
    });
  }, []);

  const sendMessage = event => {
    event.preventDefault();
    if (message) {
      socket.emit("sendMessage", name + " says: " + message, () =>
        setMessage("")
      );
    }
    console.log({ name });
  };

  const onEnter = event => {
    if (event.key === "Enter") {
      sendMessage(event);
      setMessage("");
    }
  };
  const onClicking = event => {
    sendMessage(event);
    setMessage("");
  };

  /*const updateInputWithEmoji = (event, emojiObject) => {
    document.getElementById("text-entry").value += emojiObject.emoji;
    setMessage(message + emojiObject.emoji);
    console.log(event.target.value);
    console.log("change triggered with emoji picker!");
    console.log("" + emojiObject.emoji);
  };*/

  const testing = event => {
    setMessage(event.target.value);
    console.log(event.target.value);
    console.log("onchange triggered!");
  };

  //console.log(message);

  return (
    <div id="main">
      <header>
        <h1>
          <a href="localhost:3000">randomchat</a>
        </h1>
      </header>
      <div id="videobox">
        <video
          style={{
            width: 240,
            height: 240,
            margin: 5,
            backgroundColor: "black"
          }}
          ref={localVideo}
          autoPlay
        ></video>
        <video
          style={{
            width: 240,
            height: 240,
            margin: 5,
            backgroundColor: "black"
          }}
          ref={remoteVideo}
          autoPlay
        ></video>
      </div>
      <div id="chatdisplaybox">
        <Messages messages={messages} name={name} />
      </div>
      <div id="chatbox">
        <EmojiButton
          /*passThrough={updateInputWithEmoji}*/ setMessage={setMessage}
        />
        <form id="form-send">
          <input
            value={message}
            onChange={/*event => setMessage(event.target.value)*/ testing}
            onKeyPress={onEnter}
            id="text-entry"
            type="text"
            placeholder="type a message"
          />
          <button type="submit" id="send-button" onClick={onClicking} />
        </form>
      </div>
    </div>
  );
}
