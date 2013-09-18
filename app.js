    var fs = require('fs'),
    url = require('url'),
    http = require('http'),
    path = require('path'),
    mime = require('mime'),
    socketio = require('socket.io'),
    connectedUsers = {};

var maxEmitTime = 5000;
var minEmitTime = 2000;

httpServer = http.createServer(function (request, response) {
  var pathname = url.parse(request.url).pathname;
  if(pathname =="/") pathname = "index.html";
  var filename = path.join(process.cwd(), 'public', pathname);

  path.exists(filename, function(exists){
    if(!exists){
      response.writeHead(404, {"Content-Type": "text/plain" });
      response.write("404 Not Found");
      response.end();
      return;
    }

    response.writeHead(200, {"Content-Type": mime.lookup(filename) });
    fs.createReadStream(filename, {
      'flags': 'r',
      'encoding': 'binary',
      'mode': 0666,
      'bufferSize': 4 * 1024
    }).addListener("data", function(chunk){
      response.write(chunk, 'binary');
    }).addListener("close", function() {
      response.end();
    });
  });

});

function createNewOutbound(){
  return Math.random().toString(36).substr(2, 7)
}

function createDelay(){
return test = Math.floor(Math.random() * (maxEmitTime - minEmitTime + 1)) + minEmitTime;
}

httpServer.listen(process.env.PORT || 3000, "33.33.33.10");

function Client(socket){
this.socket = socket;
this.socket.emit('app-settings', {'minEmitTime':minEmitTime, 'maxEmitTime': maxEmitTime})
this.socket.emit('server message', {'type': 'server reply','data':'welcome!'});
this.socket.on('client message', function(data) {
  console.log(socket.id + " says: " + data.data);
  if(data.type == "client message"){
    var reply = 'confirmed: ' + data.data;
    socket.emit('server message', {'type':'server reply','data':reply});
    console.log("I say: " + reply);
  } else if(data.type =="client reply"){
    var reply = createNewOutbound();
    setTimeout(function(){
      socket.emit('server message', {'type':'server message', 'data': reply});
      console.log("I say: " + reply);
    }, createDelay());
  }
  });

// Start server initiated conversation 
setTimeout(function(){
  var newMessage = createNewOutbound();
  socket.emit('server message', {'type':'server message', 'data': newMessage})
  console.log("I say: " + newMessage);
}, createDelay());

}

//Client.prototype.sendMessage = function (message) {
//  if(message.type == "server message"){
//    
//  } else if(message.type == "server reply"){
//
//  }
//}

var io = socketio.listen(httpServer, {log:false});
io.sockets.on('connection', function(socket){
var client = new Client(socket);
});
console.log('setup done');


