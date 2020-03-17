import React, { Component } from "react";
import Peer from "simple-peer";
import { RTCRTCPeerConnection, RTCSessionDescription } from "webrtc";
import io from "socket.io-client";

let socket;
const ENDPOINT = "localhost:5000";

export default class VideoScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { localVideo: null };
    //this.localVideo = React.createRef();
    //store peer object in global space for receiveResponse() to access
    this.peerStorage = {};
    //try to convert peerStorage to normal variable instead of object
  }
  /*
  //if client is first connected, run this
  triggerInit = () => {
    const peer = new Peer({ initiator: true, stream: stream });
    this.peerStorage.client = peer;
    peer.on("signal", data => {
      socket.emit("triggerInitSuccess", data);
    });
  };
  //if client is second connected, run this
  receiveInit = initiatorSDP => {
    const peer = new Peer({ stream: stream });
    this.peerStorage.client = peer;
    peer.on("signal", data => {
      socket.emit("receiveInitSuccess", data);
    });
    peer.signal(initiatorSDP);
  };
  //only first client runs this (as a final response to second client to establish peer connection)
  receiveResponse = responderSDP => {
    peer = this.peerStorage.client;
    peer.signal(responderSDP);
    //see if this works instead of the above (more concise)
    //peerStorage.client.signal(responderSDP)
  };
*/
  componentDidMount() {
    navigator.getUserMedia(
      { video: true, audio: true },
      stream => {
        //attempt at browser compatibility. might not work.
        /*const video = document.querySelector('video1')
        if ('srcObject' in video) {
          video.srcObject = stream
        } else {
          video.src = window.URL.createObjectURL(stream) // for older browsers
        } */
        this.setState({ localVideo: window.URL.createObjectURL(stream) });
        //put socket listeners in here? or no
        //if client is first connected, run this
        const triggerInit = () => {
          const peer = new Peer({ initiator: true, stream: stream });
          this.peerStorage.client = peer;
          peer.on("signal", data => {
            socket.emit("triggerInitSuccess", data);
          });
        };
        //if client is second connected, run this
        const receiveInit = initiatorSDP => {
          const peer = new Peer({ stream: stream });
          this.peerStorage.client = peer;
          peer.on("signal", data => {
            socket.emit("receiveInitSuccess", data);
          });
          peer.signal(initiatorSDP);
        };
        //only first client runs this (as a final response to second client to establish peer connection)
        const receiveResponse = responderSDP => {
          const peer = this.peerStorage.client;
          peer.signal(responderSDP);
          //see if this works instead of the above (more concise)
          //peerStorage.client.signal(responderSDP)
        };
        socket.on("triggerInit", this.triggerInit);
        socket.on("receiveInit", this.receiveInit);
        socket.on("receiveResponse", this.receiveResponse);
      },
      error => {
        console.warn(error.message);
      }
    );
    //put socket.io listeners inside componentDidMount (or in above?)
    //socket.on("triggerInit", this.triggerInit);
    //socket.on("receiveInit", this.receiveInit);
    //socket.on("receiveResponse", this.receiveResponse);
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
          ref={this.state.localVideo}
          id="video1"
          autoplay
        ></video>
        <video
          style={{
            width: 240,
            height: 240,
            margin: 5,
            backgroundColor: "black"
          }}
          //ref={this.state.remoteVideo}
          autoplay
        ></video>
      </div>
    );
  }
}
