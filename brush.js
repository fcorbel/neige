if (!Game) {
  var Game = {};
}

Game.createBrush = function(zone, em) {
  var b = {};
  var _zone = zone;
  b.name = "clear";
  b.size = 1;
  b.toApply = false;
  b.prevApplied = null;

  b.startApply = function(x, y, z) {
    b.toApply = true;
    b.apply(x, y, z);
  };

  b.endApply = function() {
    b.toApply = false;
    b.prevApplied = null;
  };

  b.apply = function(x, y, z) {
    if (b.prevApplied !== null) {
      if (x === b.prevApplied[0] && y === b.prevApplied[1] && z === b.prevApplied[2]) {
        return;
      }
    }
    var el;
    function clearVoxel(uid) {
      if (!uid) {
        console.error("trying to clear a voxel without uid.");
      }
      console.debug("Clear some voxels, uid="+uid);
      var el = Game.e.entities[uid];
      Game.e.destroyEntity(el);
    }
    var pattern = [];
    switch (this.size) {
      case 1:
        pattern = [[0,0,0]];
        break;
      case 2:
        pattern = [[0,0,0], [-1,0,0], [0,0,-1], [1,0,0], [0,0,1]];
        break;
      case 3:
        pattern = [[-2,0,0],[-1,0,-1],[-1,0,0],[-1,0,1],[0,0,-2],[0,0,-1],[0,0,0],[0,0,1],[0,0,2],[1,0,-1],[1,0,0],[1,0,1],[2,0,0]];
        break;
      default:
        break;
    }
    for (var i=0; i<pattern.length; i++) {
      var pat = pattern[i];
      pat[0] += x;
      pat[1] += y;
      pat[2] += z;
      var data = _zone.get("container", "containers").zoneData;
      if (pat[0]<0 || pat[1]<0 || pat[2]<0 || pat[0]>=data.sizeX || pat[1]>=data.sizeY || pat[2]>=data.sizeZ) {
        continue;
      }
      var uid = _zone.get("container", "containers").zoneData.get(pat[0], pat[1], pat[2]);
      if (this.name === "clear") {
        if (uid) {
          clearVoxel(uid);
        }
      } else {
        if (uid) {
          clearVoxel(uid);
        }
        el = _zone.s.dataLoader.addElement(this.name, pat[0], pat[1], pat[2]);
        el.addSystem("drawEntity");
        el.initSystems();
      }
    }
    b.prevApplied = [x, y, z];
  };
  
  b.changeBrush = function(brushName) {
    console.debug("Change brush to: "+brushName);
    b.name = brushName;
  };

  b.changeBrushSize = function(brushSize) {
    console.debug("Change brush to size: "+brushSize);
    b.size = brushSize;
  };
  

  em.register("newBrushSelected", b.changeBrush);
  em.register("brushSizeChanged", b.changeBrushSize);

  return b;
};
