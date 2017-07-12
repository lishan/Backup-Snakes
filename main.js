var w = 50, h = 50;
var c = document.getElementById('c'),
  ctx = c.getContext('2d'),
  pw = c.width / w,
  ph = c.height / h;

ctx.mdo = function (f, a) {
  ctx[f].apply(ctx, a);
  return ctx;
};
ctx.mset = function (f, v) {
  ctx[f] = v;
  return ctx;
};

Array.prototype.draw = function (type, color) {
  if (type == 'snake') {
    ctx.mset('strokeStyle', '#fff').mdo('strokeRect', [this[0].x * pw, this[0].y * ph, pw, ph]).mset('fillStyle', color).mdo('fillRect', [this[0].x * pw, this[0].y * ph, pw, ph]);
    for (var i = this.length - 1; i >= 1; i--) {
      ctx.mset('strokeStyle', '#fff').mdo('strokeRect', [this[i].x * pw, this[i].y * ph, pw, ph]).mset('fillStyle', '#aaa').mdo('fillRect', [this[i].x * pw, this[i].y * ph, pw, ph]);
    }
  } else {
    for (var i = this.length - 1; i >= 0; i--) {
      ctx.mset('strokeStyle', '#fff').mdo('strokeRect', [this[i].x * pw, this[i].y * ph, pw, ph]).mset('fillStyle', '#e96900').mdo('fillRect', [this[i].x * pw, this[i].y * ph, pw, ph]);
    }
  }
};

function drawGover() {
  ctx.mset('fillStyle', '#e96900').mset('font', 'bold 24px 宋体').mdo('fillText', ['游戏结束', (c.width - 24 * 4) / 2, (c.height - 24) / 2]);
}

function drawSnakeAndFood(data) {
  var snakes = data.snakes;
  var foods = data.foods;
  ctx.mset('fillStyle', '#f1fedd').mdo('fillRect', [0, 0, c.width, c.height]);
  foods.draw('foods');
  for(var i = 0 ; i < snakes.length; i++){
    snakes[i].body.draw('snake', 'green');
  }
}

var socket = io();

var D = {97: 3, 115: 2, 100: 4, 119: 1};
window.addEventListener('keypress', function (e) {
  if (D[e.which]) {
    socket.emit('dir', {dir: D[e.which]});
  }
});

socket.on('data', function(data){
  drawSnakeAndFood(data);
});

socket.on('over', function(){
  drawGover();
});
