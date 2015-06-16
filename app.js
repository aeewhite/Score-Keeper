var express = require('express'),
	http = require('http'),
	path = require('path'),
	fs = require('fs');

var app = express();
var port = 3000;

// To specify port as first argument set port to process.argv[2]

var server = http.createServer(app);

server.listen(port);

var io = require('socket.io').listen(server);

var log = fs.createWriteStream('log.txt', {'flags': 'a'});

var startupTime = new Date(Date.now());

function getNiceTime(){
	return new Date(Date.now()).toLocaleString();
}

function combinedLog (input) {
	console.log(input);
	log.write(input);
}

combinedLog("\n \nServer Started at "+getNiceTime()+" on port "+port+"\n\n");

io.set('log level', 1);

app.configure(function() {
	app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res){
	res.sendFile( __dirname+'/public/index.html' );
});

var currentGames = [];

io.sockets.on('connection', function (socket) {
	socket.on('connect',function(){
		socket.emit('sendAllGames',currentGames);
	});
	socket.on('addGame',function(data){
		currentGames.push(data);
		console.log("Game Added");
		console.log(currentGames);
		socket.broadcast.emit('newGame',data);
	});
	socket.on('changeScore',function(data){
		var gameID = data[0];
		var team = data[1];
		var newScore = data[2];
		socket.broadcast.emit('changeScore',data);
		for (var i = 0; i < currentGames.length; i++) {
			if(currentGames[i].gameID==gameID){
				if(team=="ours"){
					currentGames[i].ourScore = newScore;
				}
				if(team=="theirs"){
					currentGames[i].theirScore = newScore;
				}
				break;
			}
		}
		console.log("Score Changed");
		console.log(currentGames);
	});
	socket.on('deleteGame',function(ID){
		socket.broadcast.emit('deleteGame',ID);
		for (var i = 0; i < currentGames.length; i++) {
			if(currentGames[i].gameID==ID){
				currentGames.splice(i,1);
				break;
			}
		}
	});
	socket.on('changeGame',function(data){
		var gameID = data[0];
		var newGame = data[1];
		for (var i = 0; i < currentGames.length; i++) {
			if(currentGames[i].gameID==gameID){
				currentGames[i].currentGame = newGame;
				break;
			}
		}
		socket.broadcast.emit('changeGame',data);
	});
});
