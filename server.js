var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var favicon = require("serve-favicon");

// The page for User
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});
// The page for Expert
app.get("/exp", function (req, res) {
  res.sendFile(__dirname + "/expert.html");
});
// The page for Rephrase
app.get("/rephrase", function (req, res) {
  res.sendFile(__dirname + "/rephrase.html");
});
// The page for Control Panel
app.get("/__classified__", function (req, res) {
  res.sendFile(__dirname + "/replay.html");
});

app.use("/python", express.static("python"));
app.use("/css", express.static("css"));
app.use("/js", express.static("js"));

app.use("/lib/ot.js", express.static("lib/ot.js")); //可以注视掉，这个分支完全没有用到ot.js的代码
app.use("/lib", express.static("lib"));

app.use("/src", express.static("src"));
app.use("/lib/contextMenu", express.static("lib/contextMenu"));
app.use("/node_modules", express.static("node_modules"));

app.use(favicon(__dirname + "/public/favicon.png"));

http.listen(3000, function () {
  console.log("Server listening on http://localhost:3000");
  console.log("Access Patient Page on http://localhost:3000");
  console.log("Access Expert Page on http://localhost:3000/exp");
});
