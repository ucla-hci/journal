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
app.use('/src', express.static('src'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/ot.js', express.static('ot.js'));
app.use('/contextMenu', express.static('contextMenu'));
app.use('/node_modules', express.static('node_modules'));

http.listen(3000, function(){
  console.log('Server listening on http://localhost:80');
  console.log('Access Patient Page on http://localhost:80');
  console.log('Access Expert Page on http://localhost:80/exp');
});

var EditorSocketIOServer = require('./ot.js/editor-socketio-server.js');
var server = new EditorSocketIOServer("", [], 1);

io.on('connection', function(socket) {
  server.addClient(socket);
  // Handle commands from expert, send them to all clients
  socket.on("sentToServer", command => {
    console.log("Command Receive:", command);
    io.emit("sendToClient", {command});
  });
});
