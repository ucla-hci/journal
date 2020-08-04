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

http.listen(80, function(){
  console.log('Server listening on http://localhost:80');
  console.log('Access Patient Page on http://localhost:80');
  console.log('Access Expert Page on http://localhost:80/exp');
});

var EditorSocketIOServer = require('./lib/ot.js/editor-socketio-server.js');
var server = new EditorSocketIOServer("", [], 1);

var fs = require("fs")

function record(fn, content) {
    let text = JSON.stringify(content);
    let filename = './logdata/' + fn + '.txt';
    console.log(filename, text);
    fs.writeFile(filename, text, function(err) {
        if (err) {
            return console.error(err);
        }
        fs.readFile(filename, function (err, data) {
            if (err) {
                return console.error(err);
            }
            console.log("Written Data: " + data.toString());
        });
    });
}

io.on('connection', function(socket) {

  server.addClient(socket);
  socket.on("sentToServer", command => {  // Demo
    console.log("Command Receive:", command);
    io.emit("sendToClient", {command});
  });

  // Handle commands from user, send them to expert
  socket.on("title", (title) => {  
    console.log("Title Receive:", title);
    io.emit("title", title);
  });

  socket.on("Log", (type, array) => {
    console.log("Log:", type);
    io.emit("Log", type, array);
  });

  // Handle commands from expert, send them to all clients
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

  socket.on("highlight", (start, end, type) => {
    console.log("Highlight:", start, end, type);
    io.emit("highlight", start, end, type);
  });

  socket.on("cd", (start, end, id) => {
    console.log("CD:", start, end, id);
    io.emit("cd", start, end, id);
  });

  socket.on("feedback", (start, end, sentence) => {
    console.log("Feedback:", start, end, sentence);
    io.emit("feedback", start, end, sentence);
  });

  socket.on("utility", (command, cursor) => {
    console.log("utility:", command, cursor);
    io.emit("utility", command, cursor);
  });

  socket.on("display", functions => {
    console.log("display:", functions);
    io.emit("display", functions);
  });

  socket.on("download", functions => {
    console.log("download:", functions);
    io.emit("download", functions);
  });

  socket.on("get", functions => {
    console.log("get:", functions);
    io.emit("get", functions);
  });

  socket.on("get", functions => {
    console.log("get:", functions);
    io.emit("get", functions);
  });

  socket.on("file", (filename, package) => {
    record(filename, package);
  });

  socket.on("entry", (title, text, marks, id) => {
    io.emit("entry", title, text, marks, id);
  });
});
