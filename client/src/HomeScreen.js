import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import bimage from "./bimage.jpg";

export default function HomeScreen() {
  const [name, setName] = useState("loading");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [btn, setBtn] = useState(null);

  //programmatically click button when user types "enter" in input field
  const enterStart = event => {
    if (event.key === "Enter") {
      btn.click();
    }
  };
  //style={imageLoaded ? {} : { display: "none", zIndex: -15 }}
  return (
    <div id="main">
      <header>
        <h1>
          <a href="http://localhost:3000">randomchat</a>
        </h1>
      </header>
      <div id={imageLoaded ? "clear-background" : "hidden-clear-background"}>
        <img onLoad={() => setImageLoaded(true)} src={bimage}></img>
      </div>
      <div id="blurred-background"></div>
      <div id="everything-under-header">
        <div id="home-text">
          <h2>Video and/or text chat with a random person!</h2>
        </div>
        <div className="ui input" id="home-input">
          <input
            placeholder="Enter a name..."
            type="text"
            onChange={event => setName(event.target.value)}
            onKeyPress={enterStart}
          />

          <Link
            id="home-link"
            onClick={event => (!name ? event.preventDefault() : null)}
            to={`/chat?name=${name}`}
          >
            <button
              className="ui secondary button"
              id="start-button"
              type="submit"
              ref={button => {
                setBtn(button);
              }}
            >
              Start!
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
