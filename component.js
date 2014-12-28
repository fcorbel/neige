////////////////////
// Components
////////////////////
var Game = Game || {};
Game.e = Game.e || {};
Game.e.c = Game.e.c || {};

//To use with orientation TODO: make it rotation matrix?
Game.e.c.UP = 1;
Game.e.c.RIGHT = 2;
Game.e.c.DOWN = 3;
Game.e.c.LEFT = 4;
Game.e.c.position = function(x, y, z) {
  var co = {};
  co.x = x || 0;
  co.y = y || 0;
  co.z = z || 0;
  co.coordString = "";
  co.orientation = null;
  return co;
};

Game.e.c.movement = function() {
  var co = {};
  co.type = "walk";
  co.maxPoints = 5;
  co.points = 5;
  co.targetable = null;
  co.targetableMesh = null;
  co.moving = false;
  return co;
};

Game.e.c.size = function() {
  var co = {};
  co.value = [1,1,1];
  return co;
};

Game.e.c.associatedContainer = function() {
  var co = {};
  co.value = null;
  return co;
};

Game.e.c.associatedZone = function() {
  var co = {};
  co.value = null;
  return co;
};

Game.e.c.entitiesList = function() {
  var co = {};
  co.value = [];
  return co;
};

Game.e.c.gravity = function() {
  var co = {};
  co.value = 1;
  return co;
};

Game.e.c.temperature = function() {
  var co = {};
  co.value = 20;
  return co;
};

Game.e.c.weight = function() {
  var co = {};
  co.value = 0;
  return co;
};

Game.e.c.consistence = function() {
  var co = {};
  co.value = 1;
  return co;
};

Game.e.c.appearance = function() {
  var co = {};
  co.scene = null;
  co.meshName = null;
  co.mesh = null;
  co.oppacity = 1;
  co.selectable = false;
  return co;
};

Game.e.c.action = function() {
  var co = {};
  co.actionsPoints = 1;
  return co;
};

Game.e.c.effects = function() {
  var co = {};
  co.hover = [];
  co.click = [];
  co.selection = [];
  co.highlight = [];
  co.hovered = false;
  co.clicked = false;
  co.selected = false;
  co.highlighted = false;
  return co;
};

Game.e.c.actions = function() {
  var co = {};
  co.value = [];
  return co;
};
