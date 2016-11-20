var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var Game = require('./controller/game');
var app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.set('port', (process.env.PORT || 5000));
var server = http.Server(app);
var socket = socketio(server);
var game = new Game();

app.get('/', function(request, response) {
  response.render('pages/index');
});

server.listen(app.get('port'), function(){
  console.log('Node app running on port ', app.get('port'));
});

setInterval(function() {
  game.tick();
}, 1000/160);

setInterval(function() {
  socket.volatile.emit('state', game.state());
}, 1000/60);

socket.on('connection', function(socket){ // Listen for connections
  console.log('Connection ', socket.id);
  socket.emit('initialize', {
    bounds: {x: game.bounds.x, y: game.bounds.y}
  });

  socket.on('disconnect', function(){ // Listen for disconnections
    console.log('Disconnection ', socket.id);
    game.removePlayer(socket.id);
  });

  socket.on('addPlayer', function(avatar){
    game.addPlayer(socket.id, avatar);
    socket.emit('avatarChosen', avatar);
  });

  socket.on('updatePlayerAcceleration', function(x, y){
    game.acceleratePlayer(socket.id, x, y);
  });

  socket.on('addProjectile', function(x, y){
    game.addProjectile(socket.id, x, y);
  });
});
