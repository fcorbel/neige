if (!Game) {
  var Game = {};
}


Game.createPointer = function(em_, cam, zone_) {
  var p = {};
  var em = em_;
  var camera = cam;
  var zone = zone_;
  var pointedCoord = null;
  
  p.pointed = null;
  
  function getVoxelCoordFromMouse(event) {
    //get mouse position relative to game window
    var domEl = document.getElementById("screen");
    var x = event.pageX - domEl.offsetLeft;
    var y = event.pageY - domEl.offsetTop;
    //get these coords as -1 +1 range
    var mouseX = (x / window.innerWidth) * 2 - 1;
    var mouseY = -(y / window.innerHeight) * 2 + 1;
    var mouse2D = new THREE.Vector3(mouseX, mouseY, 1);
    var projector = new THREE.Projector();
    var raycaster = new THREE.Raycaster();
    // Convert the [-1, 1] screen coordinate into a world coordinate on the near plane
    projector.unprojectVector(mouse2D, cam);
    raycaster.set(cam.position, mouse2D.sub(cam.position).normalize());
    // See if the ray from the camera into the world hits one of our meshes
    intersects = raycaster.intersectObjects(Game.Graphics.selectableMeshs);
    if (intersects.length > 0) {
      var ent = Game.e.entities[intersects[0].object.name];
      // an entity?
      if (ent.type === "living") {
        var pos = ent.get("position");
        return [pos.x, pos.y, pos.z];
      } else {
        var xAbs = Math.round(intersects[0].point.x);
        var yAbs = Math.round(intersects[0].point.y);
        var zAbs = Math.round(intersects[0].point.z);
        //x/zAbs is on a vertical face
        if ((zAbs - (Game.Graphics.voxelSize.z/2))% (Game.Graphics.voxelSize.z) === 0) {
          return null;
        }
        if ((xAbs - (Game.Graphics.voxelSize.x/2)) % Game.Graphics.voxelSize.x === 0) {
          return null;
        }

        var xVox = Math.floor((xAbs + Game.Graphics.voxelSize.x/2) / Game.Graphics.voxelSize.x);
        var yVox = Math.floor((yAbs + Game.Graphics.voxelSize.y/2) / Game.Graphics.voxelSize.y - 1);
        var zVox = Math.floor((zAbs + Game.Graphics.voxelSize.z/2) / Game.Graphics.voxelSize.z);
        return [xVox, yVox, zVox];
      }
    }
    // console.debug("nothing...");
    return null;
  }


  p.move = function(event) {
    if (event.target.className !== "gui") { //Don't do anyrhing if mouse on gui
      return;
    }
    // console.time("t");
    var coord = getVoxelCoordFromMouse(event);
    // console.timeEnd("t");
    // console.log(coord);
    if (coord === pointedCoord) {
      return;
    }
    if (coord) {
      var uids = zone.get("associatedContainer", "value").get(coord[0], coord[1], coord[2]);
      if (!uids) {
        console.error("Couldn't find entities on those coord"+ coord);
        return;
      }
      if (uids.length > 0) {
        for (var i=0; i<uids.length; i++) {
          if (p.pointed !== uids[i]) {
            if (p.pointed) {
              Game.e.entities[p.pointed].send("unHovered");
            }
            var ent = Game.e.entities[uids[i]];
            p.pointed = uids[i];
            ent.send("hovered");
            pointedCoord = coord;
            em.send("updateSelection", Game.e.entities[p.pointed]);
          }
        }
      } else {
        if (p.pointed) {
          Game.e.entities[p.pointed].send("unHovered");
          em.send("updateSelection", null);
        }
        p.pointed = null;
      }
    } else {
      if (p.pointed) {
        Game.e.entities[p.pointed].send("unHovered");
        em.send("updateSelection", null);
      }
      p.pointed = null;
    }
  };

  // p.click = function(down, event) {
  //   if (event.target.className !== "gui") { //Don't do anyrhing if mouse on gui
  //     return;
  //   }
  //   if (down) {
  //     if (p.pointed) {
  //       var pEnt = Game.e.entities[p.pointed];
  //       em.send("clickOn", pEnt);
  //     }
  //   }
  // };

  em.register("mouseMoved", p.move);
  // em.register("mouseClicked", p.click);

  return p;
};
