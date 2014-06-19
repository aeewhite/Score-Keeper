var socket = io.connect();

var source   = $("#entry-template").html();
var gametemplate = Handlebars.compile(source);

var exampleGame = {
	title:"Union 14 Flood",
	ourScore:"14",
	currentGame:"1",
	theirScore:"12",
	gameID:"1234"
}
function addTestGame(id){
	addGame({
		title:"Union 14 Flood",
		ourScore:"14",
		currentGame:"1",
		theirScore:"12",
		gameID:id
	});
}

function addGame(gameObject){
	if(gameObject.gameID==null){
		return;
	}
	socket.emit('addGame',gameObject);
	displayGame(gameObject);
}
function displayGame(gameObject){
	$('body').append(gametemplate(gameObject));
}
function changeScore(gameID, team, change){
	if(team == "ours"){
		var currentScore = $("."+gameID+"").children('.scoreWrapper').children('.ourScoreWrapper').children('.ourScore').text();
		currentScore = Number(currentScore) + Number(change);
		$("."+gameID+"").children('.scoreWrapper').children('.ourScoreWrapper').children('.ourScore').text(currentScore);
	}
	if(team == "theirs"){
		var currentScore = $("."+gameID+"").children('.scoreWrapper').children('.theirScoreWrapper').children('.theirScore').text();
		currentScore = Number(currentScore) + Number(change);
		$("."+gameID+"").children('.scoreWrapper').children('.theirScoreWrapper').children('.theirScore').text(currentScore);
	}
	socket.emit('changeScore',[gameID,team,currentScore]);
}
function increaseOurScore(gameID){
	changeScore(gameID, "ours", 1);
}
function increaseTheirScore(gameID){
	changeScore(gameID, "theirs", 1);
}
function decreaseOurScore(gameID){
	changeScore(gameID, "ours", -1);
}
function decreaseTheirScore(gameID){
	changeScore(gameID, "theirs", -1);
}

$(document).ready(function () {
	socket.emit('connect');
});

function setScore(gameID, team, newScore){
	if(team == "ours"){
		$("."+gameID+"").children('.scoreWrapper').children('.ourScoreWrapper').children('.ourScore').text(newScore);
	}
	if(team == "theirs"){
		$("."+gameID+"").children('.scoreWrapper').children('.theirScoreWrapper').children('.theirScore').text(newScore);
	}
}
function createNewGame(){
	var game = {
		title:"",
		ourScore:"",
		currentGame:"",
		theirScore:"",
		gameID:""
	}
	game.title = $('#newGameTitle').val();
	game.ourScore = $('#newGameOurScore').val();
	game.currentGame = $('#newGameCurrentGame').val();
	game.theirScore = $('#newGameTheirScore').val();
	game.gameID = Math.floor(Math.random()*90000) + 10000;
	addGame(game);
	$('.gameMaker').hide();
	$('#newGame').show();
}
$('#newGame').click(function(){
	$('.gameMaker').show();
	$('#newGame').hide();
});
function cancelAddGame(){
	$('.gameMaker').hide();
	$('#newGame').show();
}
function deleteGame(gameID){
	if (confirm("Are you sure you want to delete this game?") == true) {
    	removeGame(gameID);
   		socket.emit('deleteGame',gameID);    
    }
}
function removeGame(gameID){
	$("."+gameID+"").remove();
}


function increaseGame(gameID){
	var currentGame = $("."+gameID+"").children('.scoreWrapper').children('.currentGameWrapper').children('.currentGame').text();
	currentGame++;
	$("."+gameID+"").children('.scoreWrapper').children('.currentGameWrapper').children('.currentGame').text(currentGame);
	socket.emit('changeGame',[gameID, currentGame]);
}
function decreaseGame(gameID){
	var currentGame = $("."+gameID+"").children('.scoreWrapper').children('.currentGameWrapper').children('.currentGame').text();
	if(currentGame==1){
		return;
	}
	currentGame--;
	$("."+gameID+"").children('.scoreWrapper').children('.currentGameWrapper').children('.currentGame').text(currentGame);
	socket.emit('changeGame',[gameID, currentGame]);
}
function setGame(gameID,gameNumber){
	$("."+gameID+"").children('.scoreWrapper').children('.currentGameWrapper').children('.currentGame').text(gameNumber);
}


socket.on('sendAllGames',function(games){
	for(var i = 0; i<games.length;i++){
		displayGame(games[i]);
	}
});
socket.on('newGame',function(newGame){
	displayGame(newGame);
});
socket.on('changeScore',function(data){
	var gameID = data[0];
	var team = data[1];
	var newScore = data[2];
	setScore(gameID,team,newScore);
});
socket.on('deleteGame',function(ID){
	removeGame(ID);
});
socket.on('changeGame',function(data){
		var gameID = data[0];
		var newGame = data[1];
		setGame(gameID,newGame);
});