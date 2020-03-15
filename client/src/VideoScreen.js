import React, { Component } from "react";

export default class VideoScreen extends React.Component {
  constructor(props) {
    super(props);

    this.localVideo = React.createRef();
  }
  render() {
    const constraints = { video: true };
    const success = stream => {
      this.localVideo.current.srcObject = stream;
    };
    const failure = e => {
      console.log("getUserMedia Error: ", e);
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(success)
      .catch(failure);
    return (
      <div>
        <video ref={this.localVideo} autoplay></video>
      </div>
    );
  }
}
