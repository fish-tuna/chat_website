import React, { Component } from "react";
import { RTCRTCPeerConnection, RTCSessionDescription } from "webrtc";
import io from "socket.io-client";

let socket;
const ENDPOINT = "localhost:5000";

export default class VideoScreen extends React.Component {
  /* constructor(props) {
    super(props);

     this.localVideo = React.createRef(); 
  } 
  */

  //function for calling user involved in big connection loop
  callUser = async socketId => {
    const offer = await RTCPeerConnection.createOffer();
    await RTCPeerConnection.setLocalDescription(
      new RTCSessionDescription(offer)
    );

    socket.emit("call-user", {
      offer,
      to: socketId
    });
  };

  componentDidMount() {
    //what is this "endpoint" for?
    socket = io(this.ENDPOINT);
    socket.on("call-made", async data => {
      await RTCPeerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );
      const answer = await RTCPeerConnection.createAnswer();
      await RTCPeerConnection.setLocalDescription(
        new RTCSessionDescription(answer)
      );

      socket.emit("make-answer", {
        answer,
        to: data.socket
      });
    });

    socket.on("answer-made", async data => {
      await RTCPeerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );

      // if (!isAlreadyCalling) {
      //   callUser(data.socket);
      //   isAlreadyCalling = true;
      // }
      this.callUser(data.socket);
    });
    /*
    this.pc = new RTCPeerConnection(null)
    this.pc.onicecandidate = () =>{
      if (e.candidate) console.log(JSON.stringify(e.candidate))
    }
    this.pc.oniceconnectionstatechange = (e) => {
      console.log(e)
    }
    this.pc.onaddstream = (e) => {
      this.remoteVideo.current.srcObject = e.stream
    }

    const constraints = { video: true, audio: true };
    const success = stream => {
      this.localVideo.current.srcObject = stream;
      this.pc.addStream(stream)
    };
    const failure = e => {
      console.log("getUserMedia Error: ", e);
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(success)
      .catch(failure);
  */

    navigator.getUserMedia(
      { video: true, audio: true },
      stream => {
        const localVideo = document.getElementById("local-video");
        if (localVideo) {
          localVideo.srcObject = stream;
        }

        stream
          .getTracks()
          .forEach(track => RTCPeerConnection.addTrack(track, stream));
      },
      error => {
        console.warn(error.message);
      }
    );

    RTCPeerConnection.ontrack = function({ streams: [stream] }) {
      const remoteVideo = document.getElementById("remote-video");
      if (remoteVideo) {
        remoteVideo.srcObject = stream;
      }
    };
  }

  render() {
    return (
      <div>
        <video
          style={{
            width: 240,
            height: 240,
            margin: 5,
            backgroundColor: "black"
          }}
          //ref={this.localVideo}
          id="local-video"
          autoplay
        ></video>
        <video
          style={{
            width: 240,
            height: 240,
            margin: 5,
            backgroundColor: "black"
          }}
          //ref={this.remoteVideo}
          id="remote-video"
          autoplay
        ></video>
      </div>
    );
  }
}
