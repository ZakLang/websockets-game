var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var Game = require('./controller/game');
var constants = require('./data/constants');
var app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.set('port', (process.env.PORT || 5000));
var server = http.Server(app);
var socket = socketio(server);
var game = new Game();

game.addObstacles(constants.obstacleCount);
game.addTeams(constants.teamNames.length);

app.get('/', function(request, response) {
  response.render('pages/index');
});

server.listen(app.get('port'), function(){
  console.log('Node app running on port ', app.get('port'));
});

setInterval(function() { // Progress game, emit state
  game.tick();
  socket.emit('state', game.state());
}, 1000/60);

socket.on('connection', function(socket){ // Listen for connections
  console.log('Connection ', socket.id);
  socket.emit('initialize', constants);
  game.addPlayer(socket.id);

  socket.on('disconnect', function(){ // Listen for disconnections
    console.log('Disconnection ', socket.id);
    game.removePlayer(socket.id);
  });

  socket.on('addPlayer', function(){
    game.addPlayer(socket.id);
  });

  socket.on('updatePlayerAcceleration', function(x, y){
    game.acceleratePlayer(socket.id, x, y);
  });

  socket.on('addProjectile', function(x, y){
    game.addProjectile(socket.id, x, y);
  });
});
