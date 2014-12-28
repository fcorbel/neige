Game.e.s.physicsRules = {
  dependency: ["associatedContainer"],
  callbacks: {"moved": "topMoveToo"},
  entityCallbacks: {},
  init: function() {
  },
  canBeAt: function(el, pos) {
    // console.log("check:"+pos.x+","+pos.y+","+pos.z);
    var elSize = el.get("size", "value");
    var data = this.get("associatedContainer", "value");
    for (var x=0; x<elSize[0]; x++) {
      for (var y=0; y<elSize[1]; y++) {
        for (var z=0; z<elSize[2]; z++) {
          //check for impossible to be voxel (ex:solid, null...)
          var voxPos = [pos.x + x, pos.y + y, pos.z + z];
          //out of the zone
          if (voxPos[0]<0 || voxPos[1]<0 || voxPos[2]<0 || voxPos[0]>=data.sizeX || voxPos[1]>=data.sizeY || voxPos[2]>=data.sizeZ) {
            console.debug("Can't go there, out of zone: "+ voxPos);
            return false;
          }
          var targetsUID = data.get(voxPos[0], voxPos[1], voxPos[2]);
          for (var i=0; i<targetsUID.length; i++) {
            var target = Game.e.entities[targetsUID[i]];
            //empty voxel
            if (el.get("consistence", "value") > 0) {
              if (target.get("consistence", "value") === 1) {
                // console.debug("Can't go there: solid against solid: "+ voxPos + " = "+target.type);
                return false;
              }
            }
          }
        }
      }
    }
    return true;
  },
  resolveGravity: function(el) {
    //make it fall down if nothing under it
    var speed = 100;
    var pos = el.get("position");
    pos.y -= 1;
    if (this.s.physicsRules.canBeAt(el, pos)) {
      var gravCheck = this.s.physicsRules.resolveGravity;
      Game.Movement.goToNoCheck(el, pos, speed, function() {
        gravCheck(el);
      });
    } else {
      return null;
    }
  },
  topMoveToo: function(ent, from, to) {
    //move props/living if it's on top of it's head
    var map = this.get("associatedContainer", "value");
    var fx = from.x;
    var fy = from.y + ent.get("size", "value")[1];
    var fz = from.z;

    if (fy >= map.sizeY) {
      console.debug("Top is out of map");
      return false;
    }
    var topEnts = map.get(fx, fy, fz);
    if (topEnts.length > 0) {
      var toTop = {};
      toTop.x = to.x;
      toTop.y = to.y + ent.get("size", "value")[1];
      toTop.z = to.z;
      for (var i=0; i<topEnts.length; i++) {
        var topEnt = Game.e.entities[topEnts[i]];
        if (topEnt.type === "living") {
          if (this.s.physicsRules.canBeAt(topEnt, toTop)) {
            Game.Movement.goToNoCheck(topEnt, toTop); //TODO add speed/cbk
          } else {
            zone.s.physicsRules.resolveGravity(topEnt);
          }
        }
      }
    } else {
      return false;
    }
  },
  clean: function() {

  }
};

