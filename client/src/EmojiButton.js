import React from "react";
import EmojiSelect from "./EmojiSelect";

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
        <div id="emoji-div">
          <EmojiSelect
            /*passThrough={this.props.passThrough}*/ setMessage={
              this.props.setMessage
            }
          />
          <button
            id="emoji-button-pressed"
            type="button"
            onClick={this.handleClick}
            className="ui button"
          />
        </div>
      );
    } else {
      button = (
        <div id="emoji-div">
          <button
            id="emoji-button"
            type="button"
            onClick={this.handleClick}
            className="ui button"
          />
        </div>
      );
    }
    return <div>{button}</div>;
  }
}
