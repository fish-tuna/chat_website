import React from "react";
import Picker from "emoji-picker-react";

export default function EmojiSelect(props) {
  const onEmojiClick = (event, emojiObject) => {
    document.getElementById("text-entry").value += emojiObject.emoji;
    console.log(props.setName);
    props.setMessage(document.getElementById("text-entry").value);
  };
  return (
    <div id="emojis">
      <Picker onEmojiClick={/*props.passThrough*/ onEmojiClick} />
    </div>
  );
}
