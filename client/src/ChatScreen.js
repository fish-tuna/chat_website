//Read README.md and ../../server/index.js first to understand this code better

//"getelementbyid" refs in this code need refactored to hooks

import React, { useState, useEffect, useRef } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import EmojiButton from "./EmojiButton";
import Peer from "simple-peer";

//import { Input } from "semantic-ui-react";
//import "./index.css";

let socket;

export default function ChatScreen({ location }) {
  const [messages, setMessages] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  //server connection for socket
  const ENDPOINT = "ec2-18-223-135-94.us-east-2.compute.amazonaws.com:5000";
  //use hooks for video source
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

    //emit socket disconnect event on component unmount
    return () => {
      socket.emit("disconnect");
      socket.close();
    };
  }, [ENDPOINT, location.search]);
  /*use hooks to handle socket message listener, display received messages (which are all 
  concatenated together into one big string) in div "chatdisplaybox".*/
  //NEEDS REFACTOR AND COMMENT
  useEffect(() => {
    //const messageHandler = message => {
    //  if (messages) {
    //    setMessages(messages + "\n" + message.text);
    //  } else {
    //    setMessages(message.text);
    //  }
    //
    //};

    const chatBottomElement = document.getElementById("chat-bottom-anchor");
    const chatBoxElement = document.getElementById("chat-display-box");
    //automatically scroll to bottom on new message
    const scrollWhenSpam = () => {
      chatBottomElement.scrollIntoView({ behavior: "smooth" });
      if (
        !(
          chatBoxElement.scrollHeight - chatBoxElement.scrollTop ===
          chatBoxElement.clientHeight
        )
      ) {
        chatBottomElement.scrollIntoView({ behavior: "smooth" });
        setTimeout(scrollWhenSpam, 100);
      }
    };
    //socket.on "message" callback function, handle received message
    const messageHandler = message => {
      if (
        chatBoxElement.scrollHeight - chatBoxElement.scrollTop ===
        chatBoxElement.clientHeight
      ) {
        if (messages) {
          setMessages(messages + "\n" + message.text);
        } else {
          setMessages(message.text);
        }
        scrollWhenSpam();
      } else {
        if (messages) {
          setMessages(messages + "\n" + message.text);
        } else {
          setMessages(message.text);
        }
      }
    };

    socket.on("message", messageHandler);

    //prevent multiplication of message listener instances
    return () => {
      socket.off("message", messageHandler);
    };
  }, [messages]);
  //use hooks to handle socket listeners for peer connection
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
      peerStorage.current.signal(responderSDP);
      peerStorage.current.on("stream", stream => {
        remoteVideo.current.srcObject = stream;
      });
    });
  }, []);
  //function handles message sending event
  const sendMessage = event => {
    event.preventDefault();
    if (message) {
      socket.emit("sendMessage", name + " says: " + message, () =>
        setMessage("")
      );
    }
  };
  //function is used to send message from input field when user inputs "enter"
  const onEnter = event => {
    if (event.key === "Enter") {
      sendMessage(event);
      setMessage("");
    }
  };
  //function is used to send message from input field when button adjacent to input field is clicked
  const onClicking = event => {
    sendMessage(event);
    setMessage("");
  };
  //handle message change in text input, prep for sending
  const handleMessageChange = event => {
    setMessage(event.target.value);
  };

  return (
    <div id="main">
      <header>
        <h1>
          <a href="http://localhost:3000">randomchat</a>
        </h1>
      </header>
      <div id="video-box">
        {/*mute audio from local stream*/}
        <video ref={localVideo} autoPlay muted></video>
        <video ref={remoteVideo} autoPlay></video>
      </div>

      <div id="chat-display-box">
        <div id="message-box">{messages}</div>
        <div
          style={{ float: "left", clear: "both" }}
          id="chat-bottom-anchor"
        ></div>
      </div>

      <div id="chat-input-box">
        <EmojiButton setMessage={setMessage} />
        <form id="form-send" className="ui action input">
          <input
            value={message}
            onChange={handleMessageChange}
            onKeyPress={onEnter}
            id="message-input"
            type="text"
            placeholder="type a message..."
          />
          <button
            id="chat-input-box-button"
            type="submit"
            className="ui button"
            onClick={onClicking}
          >
            <div id="test">Send</div>
          </button>
        </form>
      </div>
    </div>
  );
}
