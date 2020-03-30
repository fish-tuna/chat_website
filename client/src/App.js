import React from "react";
import ChatScreen from "./ChatScreen";
import HomeScreen from "./HomeScreen";
import { BrowserRouter as Router, Route } from "react-router-dom";

//Project uses semantic-ui CDN

const App = () => (
  <Router>
    <Route path="/" exact component={HomeScreen} />
    <Route path="/chat" component={ChatScreen} />
  </Router>
);

export default App;
