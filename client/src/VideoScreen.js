import React, { Component } from "react";
import Peer from "simple-peer";
import { RTCRTCPeerConnection, RTCSessionDescription } from "webrtc";
import io from "socket.io-client";

//let socket;
//const ENDPOINT = "localhost:5000";

export default class VideoScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { localVideo: null };
    //this.localVideo = React.createRef();
    //store peer object in global space for receiveResponse() to access
    this.peerStorage = {};
    this.localVideo = React.createRef();
    this.remoteVideo = React.createRef();
    this.socket = null;
    //try to convert peerStorage to normal variable instead of object
    this.triggerInit = null;
    this.receiveInit = null;
    this.receiveResponse = null;
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
    const ENDPOINT = "localhost:5000";
    this.socket = io(ENDPOINT);
    /*navigator.getUserMedia(
      { video: true, audio: true },
      stream => {
        //const ENDPOINT = "localhost:5000";
        //let socket = io(ENDPOINT);
        //attempt at browser compatibility. might not work.
        /*const video = document.querySelector('video1')
        if ('srcObject' in video) {
          video.srcObject = stream
        } else {
          video.src = window.URL.createObjectURL(stream) // for older browsers
        } */
    //below returns error, dont need it anymore though, dont need to use setstate.
    //this.setState({ localVideo: window.URL.createObjectURL(stream) });
    //this.setState({ localVideo: stream });
    /*
        //put socket listeners in here? or no
        //if client is first connected, run this
        console.log("client started.");
        //this.localVideo.current.srcObject = stream;
        this.triggerInit = () => {
          console.log("init triggered");
          this.localVideo.current.srcObject = stream;
          const peer = new Peer({ initiator: true, stream: stream });
          this.peerStorage.client = peer;
          peer.on("signal", data => {
            this.socket.emit("triggerInitSuccess", data);
          });
          peer.on("stream", stream => {
            // got remote video stream, now let's show it in a video tag
            this.remoteVideo.current.srcObject = stream;
          });
          // console.log("init triggered.");
        };
        //if client is second connected, run this
        this.receiveInit = initiatorSDP => {
          const peer = new Peer({ stream: stream });
          this.peerStorage.client = peer;
          peer.on("signal", data => {
            this.socket.emit("receiveInitSuccess", data);
          });
          peer.signal(initiatorSDP);
          peer.on("stream", stream => {
            // got remote video stream, now let's show it in a video tag
            this.remoteVideo.current.srcObject = stream;
          });
        };
        //only first client runs this (as a final response to second client to establish peer connection)
        this.receiveResponse = responderSDP => {
          const peer = this.peerStorage.client;
          peer.signal(responderSDP);
          //see if this works instead of the above (more concise)
          //peerStorage.client.signal(responderSDP)
        };
        //const peer = this.peerStorage.client;
        //peer.on("stream", stream => {
        //  // got remote video stream, now let's show it in a video tag
        //  this.remoteVideo.current.srcObject = stream;
        //});
        //these aren't doing anything.
        this.socket.on("triggerInit", this.triggerInit);
        this.socket.on("receiveInit", this.receiveInit);
        this.socket.on("receiveResponse", this.receiveResponse);
      },
      error => {
        console.warn(error.message);
      }
    ); */
    //put socket.io listeners inside componentDidMount (or in above?)
    //socket.on("triggerInit", this.triggerInit);
    //socket.on("receiveInit", this.receiveInit);
    //socket.on("receiveResponse", this.receiveResponse);
    //this works, the socket things inside that function don't work
    //this.socket.on("triggerInit", console.log("refactoring time"));
    this.socket.on(
      "triggerInit",
      navigator.getUserMedia(
        { video: true, audio: true },
        stream => {
          console.log("client started.");
          //this.localVideo.current.srcObject = stream;

          console.log("init triggered");
          this.localVideo.current.srcObject = stream;
          const peer = new Peer({ initiator: true, stream: stream });
          this.peerStorage.client = peer;
          peer.on("signal", data => {
            this.socket.emit("triggerInitSuccess", data);
          });
          peer.on("stream", stream => {
            // got remote video stream, now let's show it in a video tag
            this.remoteVideo.current.srcObject = stream;
          });
          // console.log("init triggered.");

          //if client is second connected, run this
          this.receiveInit = initiatorSDP => {
            console.log("init received");
            const peer = new Peer({ stream: stream });
            this.peerStorage.client = peer;
            peer.on("signal", data => {
              this.socket.emit("receiveInitSuccess", data);
            });
            peer.signal(initiatorSDP);
            peer.on("stream", stream => {
              // got remote video stream, now let's show it in a video tag
              this.remoteVideo.current.srcObject = stream;
            });
          };
        },
        error => {
          console.warn(error.message);
        }
      )
    );

    this.socket.on("receiveInit", initiatorSDP => {
      navigator.getUserMedia(
        { video: true, audio: true },
        (stream, initiatorSDP) => {
          console.log("init received");
          const peer = new Peer({ stream: stream });
          this.peerStorage.client = peer;
          peer.on("signal", data => {
            this.socket.emit("receiveInitSuccess", data);
          });
          peer.signal(initiatorSDP);
          peer.on("stream", stream => {
            // got remote video stream, now let's show it in a video tag
            this.remoteVideo.current.srcObject = stream;
          });
        },
        error => {
          console.warn(error.message);
        }
      );
    });

    this.socket.on("receiveResponse", responderSDP => {
      console.log("response received");
      const peer = this.peerStorage.client;
      peer.signal(responderSDP);
    });
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
          //ref={this.state.localVideo}
          ref={this.localVideo}
          autoPlay
        ></video>
        <video
          style={{
            width: 240,
            height: 240,
            margin: 5,
            backgroundColor: "black"
          }}
          ref={this.remoteVideo}
          autoPlay
        ></video>
      </div>
    );
  }
}
