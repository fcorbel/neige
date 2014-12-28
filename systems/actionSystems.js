var Game = Game || {};
Game.e = Game.e || {};
Game.e.s = Game.e.s || {};
// Game.e.s.dance = {
//   dependency: [],
//   callbacks: {},
//   entityCallbacks: {},
//   init: function() {
//   },
//   clean: function() {
//   }
// };

Game.e.s.dance = {
  type: "action",
  dependency: [],
  callbacks: {},
  entityCallbacks: {},
  init: function() {
  },
  execute: function(cbk) {
    console.info(this.name+" is dancing");
    var mesh = this.get("appearance", "mesh");
    var xOri = mesh.position.x;
    var zOri = mesh.position.z;
    var pathX = [xOri-8, xOri, xOri+8, xOri, xOri];
    var pathZ = [zOri, zOri-8, zOri, zOri+8, zOri];
    new TWEEN.Tween({x: xOri, z: zOri})
      .to({x: pathX, z: pathZ}, 300)
      .onUpdate(function() {
            mesh.position.x = this.x;
            mesh.position.z = this.z;
          })
      .onComplete(cbk)
      .repeat(4)
      .start();
  },
  clean: function() {
  }
};

Game.e.s.attack = {
  type: "action",
  dependency: [],
  callbacks: {},
  entityCallbacks: {},
  init: function() {
  },
  execute: function() {
  },
  getTargetable: function() {
    // var targetable = Game.Movement.getMovableNeighbours(this, this.get("position"), "walk", this.get("associatedZone", "value"), this.get("associatedZone", "value").get("associatedContainer", "value"));
    var zone = this.get("associatedZone", "value");
    var pos = this.get("position");
    var pattern = [[pos.x-1, pos.y, pos.z], [pos.x, pos.y, pos.z-1], [pos.x+1, pos.y, pos.z], [pos.x, pos.y, pos.z+1]];
    var targetable = [];
    for (var i=0; i<pattern.length; i++) { //TODO plutot: getTargetable= (in pattern +- height) - hidden
      var res = Game.Movement.walk.canMoveFromTo(this, pos, pattern[i][0], pattern[i][2], zone, zone.get("associatedContainer", "value"));
      if (res !== null) {
        targetable.push([pattern[i][0], res, pattern[i][2]]);
      }
    }
    return targetable;
  },
  clean: function() {
  }
};
