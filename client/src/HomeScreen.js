import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function HomeScreen() {
  const [name, setName] = useState("");

  return (
    <div id="main">
      <header>
        <h1>randomchat</h1>
      </header>
      <div id="bigscreen">
        <div>
          <input
            placeholder="Name"
            type="text"
            onChange={event => setName(event.target.value)}
          />
          <Link
            onClick={event => (!name ? event.preventDefault() : null)}
            to={`/chat?name=${name}`}
          >
            <button type="submit">Start!</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
