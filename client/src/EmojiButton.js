import React, { useState } from "react";
import Picker from "emoji-picker-react";
import EmojiSelect from "./EmojiSelect";
import smileylogo from "./smileylogo.png";

export default class EmojiButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { clickStatus: false };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(prevState => ({
      clickStatus: !prevState.clickStatus
    }));
  }

  render() {
    let button;
    if (this.state.clickStatus) {
      button = (
        <div id="emojib">
          <EmojiSelect
            /*passThrough={this.props.passThrough}*/ setMessage={
              this.props.setMessage
            }
          />
          <button
            id="emojibuttonpressed"
            type="button"
            onClick={this.handleClick}
          />
        </div>
      );
    } else {
      button = (
        <div id="emojib">
          <button id="emojibutton" type="button" onClick={this.handleClick} />
        </div>
      );
    }
    return <div>{button}</div>;
  }
}
