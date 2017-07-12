var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(process.env.PORT || 3000, process.env.IP || "127.0.0.1", function () {
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/online_snake_battle.html');
});

app.get('/main.js', function (req, res) {
  res.sendfile(__dirname + '/main.js');
});

app.get('/style.css', function (req, res) {
  res.sendfile(__dirname + '/style.css');
});

var w = 50, h = 50;
var snakes = [];
var foods = [];

var generateSnake = function(id){
  var x = parseInt(Math.random() * w-3, 10);
  var y = parseInt(Math.random() * h, 10);
  var result = [];
  result.push({x: x, y: y});
  result.push({x: x+1, y: y});
  var snake = {
    id: id,
    dir: 3,
    body: result
  };
  snakes.push(snake);
  return snakes[snakes.length - 1];
};

var generateFood = function(){
  foods.push({
    x: parseInt(Math.random() * w, 10), y: parseInt(Math.random() * h, 10)
  });
};

var nextStep = function (snake) {
  if (snake.body[0]) {
    switch (snake.dir) {
      case 1:
        return {x: snake.body[0].x, y: (snake.body[0].y - 1 >= 0) ? (snake.body[0].y - 1) : (h - 1)};
        break;
      case 2:
        return {x: snake.body[0].x, y: (snake.body[0].y + 1 < h) ? (snake.body[0].y + 1) : (0)};
        break;
      case 3:
        return {x: (snake.body[0].x - 1 >= 0) ? (snake.body[0].x - 1) : (w - 1), y: snake.body[0].y};
        break;
      case 4:
        return {x: (snake.body[0].x + 1 < w) ? (snake.body[0].x + 1) : (0), y: snake.body[0].y};
        break;
    }
  }
  else {
    return false;
  }
};

var find = function (point) {
  for (var i = 0; i < foods.length; i++) {
    if (point.x === foods[i].x && point.y === foods[i].y)
      return i;
  }
  return -1;
};

var eat = function(i, next){
  snakes[i].body.unshift(next);
  var j = find(next);
  if (j !== -1) {
    foods.splice(j, 1);
    generateFood();
  } else {
    snakes[i].body.pop();
  }
};

var conflict = function(next){
  for(var i = 0 ; i < snakes.length; i++){
    if(snakes[i]) {
      for (var j = 0; j < snakes[i].body.length; j++){
        if(snakes[i].body[j].x === next.x && snakes[i].body[j].y === next.y){
          return true;
        }
      }
    }
  }
  return false;
};

var running = false;
var interval;

generateFood();
io.on('connection', function (socket) {
  var snake = generateSnake(socket.id);
  if(!running) {
    running = true;
    interval = setInterval(function () {
      io.sockets.emit('data', {
        snakes: snakes,
        foods: foods
      });

      for (var i = 0; i < snakes.length; i++) {
        var next = nextStep(snakes[i]);
        if (next) {
          if (conflict(next)) {
            io.sockets.emit('over');
            if(interval) {
              clearInterval(interval);
            }
          }
          eat(i, next);
        }
      }
    }, 100);
  }

  socket.on('dir', function (data) {
    if(data.dir + snake.dir !== 3 && data.dir + snake.dir !== 7){//不能反向移动
      snake.dir = data.dir;
    }
  });

  socket.on('disconnect', function(){
    for(var i = 0; i < snakes.length ; i++){
      if(snakes[i].id = socket.id){
        snakes.splice(i, 1);
        break;
      }
    }
  })
});
