var express = require("express");

var app = express();

// Serve the static files from the build folder
app.use(express.static(__dirname + "/build"));
//app.use('/material-dashboard-react', express.static(__dirname + "/build"));
// Redirect all traffic to the index
app.get("*", function(req, res) {
  res.sendFile(__dirname + "/build/index.html");
});
// Listen to port 3000
app.listen(process.env.PORT || 3000);
