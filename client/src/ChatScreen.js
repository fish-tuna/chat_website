import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import EmojiButton from "./EmojiButton";
import TextContainer from "./TextContainer";
import Messages from "./Messages";
import Picker from "emoji-picker-react";
import VideoScreen from "./VideoScreen";

let socket;

export default function ChatScreen({ location }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const ENDPOINT = "localhost:5000";
  useEffect(() => {
    const { name } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    setName(name);

    socket.emit("join", { name }, error => {
      if (error) {
        alert(error);
      }
      console.log(socket);
    });

    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on("message", message => {
      setMessages([...messages, message]);
    });
  }, [messages]);

  const sendMessage = event => {
    event.preventDefault();
    if (message) {
      socket.emit("sendMessage", message, () => setMessage(""));
    }
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

  navigator.getUserMedia(
    { video: true, audio: true },
    stream => {
      const localVideo = document.getElementById("local-video");
      if (localVideo) {
        localVideo.srcObject = stream;
      }
    },
    error => {
      console.warn(error.message);
    }
  );

  return (
    <div id="main">
      <header>
        <h1>
          <a href="localhost:3000">randomchat</a>
        </h1>
      </header>
      <div id="videobox">
        <VideoScreen />
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
