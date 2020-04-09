var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// The page for User
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
// The page for Expert
app.get('/exp', function(req, res){
  res.sendFile(__dirname + '/expert.html');
});

app.use('/python', express.static('python'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/lib/ot.js', express.static('lib/ot.js'));
app.use('/lib', express.static('lib'));
app.use('/src', express.static('src'));
app.use('/lib/contextMenu', express.static('lib/contextMenu'));
app.use('/node_modules', express.static('node_modules'));

http.listen(3000, '127.0.0.1');
//function(){
//  console.log('Server listening on http://localhost:80');
//  console.log('Access Patient Page on http://localhost:80');
//  console.log('Access Expert Page on http://localhost:80/exp');
//});

var EditorSocketIOServer = require('./lib/ot.js/editor-socketio-server.js');
var server = new EditorSocketIOServer("", [], 1);

io.on('connection', function(socket) {
  server.addClient(socket);
  // Handle commands from expert, send them to all clients
  socket.on("sentToServer", command => {  // Demo
    console.log("Command Receive:", command);
    io.emit("sendToClient", {command});
  });

  socket.on("prompt1", (start, end, length) => {
    console.log("Prompt-Insert:", start, end, length);
    io.emit("prompt1", start, end, length);
  });

  socket.on("prompt2", (sel_start, sel_end, start, end, length) => {
    console.log("Prompt-Select:", sel_start, sel_end, start, end, length);
    io.emit("prompt2", sel_start, sel_end, start, end, length);
  });

  socket.on("replace", (start, end, length, sentence) => {
    console.log("Replace:", start, end, length, sentence);
    io.emit("replace", start, end, length, sentence);
  });

  socket.on("highlight", (start, end) => {
    console.log("Highlight:", start, end);
    io.emit("highlight", start, end);
  });

  socket.on("cd", (start, end, id) => {
    console.log("CD:", start, end, id);
    io.emit("cd", start, end, id);
  });

  socket.on("feedback", (start, end, sentence) => {
    console.log("Feedback:", start, end, sentence);
    io.emit("feedback", start, end, sentence);
  });

  socket.on("utility", command => {
    console.log("utility:", command);
    io.emit("utility", command);
  });
});
