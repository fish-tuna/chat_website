import React from "react";
import Picker from "emoji-picker-react";
//getelementbyid code needs refactor (not react convention)
export default function EmojiSelect(props) {
  const onEmojiClick = (event, emojiObject) => {
    document.getElementById("text-entry").value += emojiObject.emoji;
    console.log(props.setName);
    props.setMessage(document.getElementById("text-entry").value);
  };
  return (
    <div id="emoji-select">
      <Picker onEmojiClick={/*props.passThrough*/ onEmojiClick} />
    </div>
  );
}
