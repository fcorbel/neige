if (!Game) {
  var Game = {};
}
if (!Game.Movement) {
  Game.Movement = {};
}

Game.Movement.goToNoCheck = function(ent, pos, speed, cbk) {
  // console.log("start go from " + ent.get("position").y + " to " +  pos.y);
  ent.em.send("moved", ent, ent.get("position"), pos); //updates stored in zone
  ent.send("moved", ent.get("position"), pos); //updates topMoveToo
  var currPos = ent.get("position");
  ent.set("movement", "moving", true);
  var mvtPts = ent.get("movement", "points");
  ent.set("movement", "points", mvtPts - 1);
  new TWEEN.Tween(ent.get("position"))
    .to(pos, 10000 / speed) 
    .onUpdate(function() {
      ent.set("position", {"x": this.x, "y": this.y, "z": this.z});
    })
    .onComplete(function() {
      ent.set("movement", "moving", false);
      ent.set("position", "coordString", this.x+"-"+this.y+"-"+this.z);
      if (cbk) {
        cbk();
      }
    })
    .start();
  // console.log("end go from " + ent.get("position").y + " to " +  pos.y);
};

Game.Movement.getCanGoCoords = function(ent) {
  console.groupCollapsed("calculate canGoCoords");
  var zone = ent.get("associatedZone", "value");
  var map = zone.get("associatedContainer", "value");
  var mvtType = ent.get("movement", "type");
  var mvtPoints = ent.get("movement", "points");
  
  //Dijkstra (without the priority queue)
  var first = {"x": ent.get("position").x, "y": ent.get("position").y, "z": ent.get("position").z};
  console.log("For ent at: "+first.x+"-"+first.y+"-"+first.z);
  var frontier = [first];
  var cameFrom = {};
  var costSoFar = {};
  cameFrom[first.x+"-"+first.y+"-"+first.z] = "none";
  costSoFar[first.x+"-"+first.y+"-"+first.z] = 0;
  while (frontier.length>0) {
    var current = frontier.shift();
    var currentS = current.x+"-"+current.y+"-"+current.z;
    if (costSoFar[currentS] >= mvtPoints){
      continue;
    }
    var neighbours = Game.Movement.getMovableNeighbours(ent, current, mvtType, zone, map);
    for (var i=0; i<neighbours.length; i++) {
      var s = neighbours[i].x+"-"+neighbours[i].y+"-"+neighbours[i].z;
      var newCost = costSoFar[currentS] + 1; //mvt cost is always 1
      if (!costSoFar[s] || newCost < costSoFar[s]) {
        costSoFar[s] = newCost;
        frontier.push(neighbours[i]);
        cameFrom[s] = currentS;
      }
    }
  }
  console.log(cameFrom);
  console.groupEnd("calculate canGoCoords");
  return cameFrom;
};

Game.Movement.getMovableNeighbours = function(ent, pos, mvtType, zone, map) {
  result = [];
  //right
  var res = Game.Movement[mvtType].canMoveFromTo(ent, pos, pos.x+1, pos.z, zone, map);
  if (res !== null) {
    result.push({"x": pos.x+1, "y": res, "z": pos.z});
  }
  //left
  res = Game.Movement[mvtType].canMoveFromTo(ent, pos, pos.x-1, pos.z, zone, map);
  if (res !== null) {
    result.push({"x": pos.x-1, "y": res, "z": pos.z});
  }
  //up
  res = Game.Movement[mvtType].canMoveFromTo(ent, pos, pos.x, pos.z-1, zone, map);
  if (res !== null) {
    result.push({"x": pos.x, "y": res, "z": pos.z-1});
  }
  //down
  res = Game.Movement[mvtType].canMoveFromTo(ent, pos, pos.x, pos.z+1, zone, map);
  if (res !== null) {
    result.push({"x": pos.x, "y": res, "z": pos.z+1});
  }
  return result;
};

Game.Movement.walk = {
  up: function(ent) {
    var zone = ent.get("associatedZone", "value");
    var map = zone.get("associatedContainer", "value");
    var pos = ent.get("position");
    var x = pos.x;
    var z = pos.z - 1;
    if (x >= zone.get("associatedContainer", "value").sizeX) { return false; }
    var res = Game.Movement.walk.canMoveFromTo(ent, pos, x, z, zone, map);
    if (res !== null) {
      pos.y = res;
      pos.z = z;
      Game.Movement.goToNoCheck(ent, pos, 50);
      return true;
    } else {
      return false;
    }
  },
  down: function(ent) {
    var zone = ent.get("associatedZone", "value");
    var map = zone.get("associatedContainer", "value");
    var pos = ent.get("position");
    var x = pos.x;
    var z = pos.z + 1;
    if (x >= zone.get("associatedContainer", "value").sizeX) { return false; }
    var res = Game.Movement.walk.canMoveFromTo(ent, pos, x, z, zone, map);
    if (res !== null) {
      pos.y = res;
      pos.z = z;
      Game.Movement.goToNoCheck(ent, pos, 50);
      return true;
    } else {
      return false;
    }
  },
  left: function(ent) {
    var zone = ent.get("associatedZone", "value");
    var map = zone.get("associatedContainer", "value");
    var pos = ent.get("position");
    var x = pos.x - 1;
    var z = pos.z;
    if (x >= zone.get("associatedContainer", "value").sizeX) { return false; }
    var res = Game.Movement.walk.canMoveFromTo(ent, pos, x, z, zone, map);
    if (res !== null) {
      pos.y = res;
      pos.x = x;
      Game.Movement.goToNoCheck(ent, pos, 50);
      return true;
    } else {
      return false;
    }
  },
  right: function(ent) {
    var zone = ent.get("associatedZone", "value");
    var map = zone.get("associatedContainer", "value");
    var pos = ent.get("position");
    var x = pos.x + 1;
    var z = pos.z;
    if (x >= zone.get("associatedContainer", "value").sizeX) { return false; }
    var res = Game.Movement.walk.canMoveFromTo(ent, pos, x, z, zone, map);
    if (res !== null) {
      pos.y = res;
      pos.x = x;
      Game.Movement.goToNoCheck(ent, pos, 50);
      return true;
    } else {
      return false;
    }
  },

  canMoveFromTo: function(ent, pos, x, z, zone, map) {
    //check same level
    if (Game.Movement.walk.canStandAt(ent, x, pos.y, z, zone, map)) {
      return pos.y;
    }
    //check other levels
    var lvl = Math.floor((ent.get("size", "value")[1]/2) - 0.1);
    for (var i=1; i<=lvl; i++) {
      //check up
      if (Game.Movement.walk.canStandAt(ent, x, pos.y+i, z, zone, map)) {
        return pos.y+i;
      }
      //check down
      if (Game.Movement.walk.canStandAt(ent, x, pos.y-i, z, zone, map)) {
        return pos.y-i;
      }
    }
    console.log("Nope, can't go there or climb");
    return null;
  },

  canStandAt: function(ent, x, y, z, zone, map) {
    if (x<0 || y-1<0 || z<0 || x>=map.sizeX || y>=map.sizeY || z>=map.sizeZ) {
      return false;
    }
    var ground = map.get(x, y-1, z);
    var canBeAt = zone.s.physicsRules.canBeAt;
    for (var i=0; i<ground.length; i++) {
      var groundEnt = Game.e.entities[ground[i]];
      if (groundEnt.get("consistence", "value") === 1) {
        if (canBeAt(ent, {"x":x, "y":y, "z":z})) {
          return true;
        }
      }
    }
    return false;
  }
};

