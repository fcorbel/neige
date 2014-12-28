if (!Game) {
  var Game = {};
}
if (!Game.States) {
  Game.States = {};
}

Game.States.createEditor = function() {
  var state = createEmptyState();
  state.name = "editor";
  state.zone = null;
  state.em = createEventManager();
  state.currentLevel = 0;
  state.brush = null;

  state.enter = function() {
    console.log("ENTER EDITOR STATE");
    state.createNewZone([2, 4, 3], "air");
    gui.lvlInd.children[1].max = 4-1;
  };

  state.createNewZone = function(size, filling) {
    if (state.zone !== null) {
      Game.e.destroyEntity(state.zone, state.em);
    }
    state.zone = Game.e.createZone(state.em);
    state.zone.removeSystem("drawZone");
    state.zone.addSystem("drawZoneEditor");
    state.zone.s.dataLoader.loadZone(size[0],size[1],size[2], filling);
    state.zone.initSystems();
    state.zone.s.drawZoneEditor.setViewLimit(0);
    state.brush = Game.createBrush(state.zone, state.em);
  };

  state.changeDisplayLevel = function(level) {
    console.debug("Have to show elements up to level: " + level[0]);
    state.zone.s.drawZoneEditor.setViewLimit(level[0]);
    state.currentLevel = level[0];
  };
  
  state.getVoxelCoordFromMouse = function(event) {
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
    projector.unprojectVector(mouse2D, Game.Graphics.camera.threejsCam);
    raycaster.set(Game.Graphics.camera.threejsCam.position, mouse2D.sub(Game.Graphics.camera.threejsCam.position).normalize());
    // See if the ray from the camera into the world hits one of our meshes
    var plane = Game.Graphics.scene.getObjectByName("drawingPlane");
    var intersects = raycaster.intersectObject(plane);
   
    if (intersects.length > 0) {
      var xAbs = intersects[0].point.x;
      var zAbs = intersects[0].point.z;
      // console.debug("pointed: " + xAbs + "  " + zAbs); 
      var xVox = Math.floor((xAbs + Game.Graphics.voxelSize.x/2) / Game.Graphics.voxelSize.x);
      var zVox = Math.floor((zAbs + Game.Graphics.voxelSize.z/2) / Game.Graphics.voxelSize.z);
      console.debug("pointed: " + xVox + "  " + zVox);
      return [xVox, state.currentLevel, zVox]; 
    } else {
      // console.debug("nothing...");
      return null;
    }

  };

  state.exit = function() {

  };

  var keyState = {
    "left": false,
    "right": false,
    "up": false,
    "down": false
  };
  state.keyDown = function(event) {
    if (event.keyCode == Game.keymap.VK_ESCAPE) {
      stateManager.pushState(Game.States.createZone());
    }
    if (event.keyCode == Game.keymap.VK_UP) {
      if (!keyState.up) {
        Game.Graphics.camera.movement.z -= Game.Graphics.camera.moveSpeed;
        keyState.up = true;
      }
    }
    if (event.keyCode == Game.keymap.VK_DOWN) {
      if (!keyState.down) {
        Game.Graphics.camera.movement.z += Game.Graphics.camera.moveSpeed;
        keyState.down = true;
      }
    }
    if (event.keyCode == Game.keymap.VK_LEFT) {
      if (!keyState.left) {
        Game.Graphics.camera.movement.x -= Game.Graphics.camera.moveSpeed;
        keyState.left = true;
      }
    }
    if (event.keyCode == Game.keymap.VK_RIGHT) {
      if (!keyState.right) {
        Game.Graphics.camera.movement.x += Game.Graphics.camera.moveSpeed;
        keyState.right = true;
      }
    }
    if (event.keyCode == Game.keymap.VK_S) {
      var txt = state.zone.s.dataLoader.serialize();
      //Using localStorage
      window.localStorage.setItem("toto", txt);
      console.info("Saved current map to local storage");
    }
    if (event.keyCode == Game.keymap.VK_L) {
      console.info("Load data from local storage");
      var json = window.localStorage.getItem("toto");
      var zoneInfos = JSON.parse(json);
      this.createNewZone([zoneInfos.sizeX, zoneInfos.sizeY, zoneInfos.sizeZ]);
      var els = zoneInfos.elements;
      for (var i=0; i<els.length; i++) {
        var type = els[i][0];
        var pos = els[i][1];
        var el = state.zone.s.dataLoader.addElement(type, pos.x, pos.y, pos.z);
        el.addSystem("drawEntity");
        el.initSystems();
      }
    }
    if (event.keyCode == Game.keymap.VK_D) {
      state.zone.get("container", "containers").zoneData.show();
    }
    //Send an event for those interested
    state.em.send("kd"+event.keyCode, event);

  };

  state.keyUp = function(event) {
    if (event.keyCode == Game.keymap.VK_UP) {
      if (keyState.up) {
        Game.Graphics.camera.movement.z += Game.Graphics.camera.moveSpeed;
        keyState.up = false;
      }
    }
    if (event.keyCode == Game.keymap.VK_DOWN) {
      if (keyState.down) {
        Game.Graphics.camera.movement.z -= Game.Graphics.camera.moveSpeed;
        keyState.down = false;
      }
    }
    if (event.keyCode == Game.keymap.VK_LEFT) {
      if (keyState.left) {
        Game.Graphics.camera.movement.x += Game.Graphics.camera.moveSpeed;
        keyState.left = false;
      }
    }
    if (event.keyCode == Game.keymap.VK_RIGHT) {
      if (keyState.right) {
        Game.Graphics.camera.movement.x -= Game.Graphics.camera.moveSpeed;
        keyState.right = false;
      }
    }
    //Send an event for those interested
    state.em.send("ku"+event.keyCode, event);
  };

  state.mouseClicked = function(down, event) {
    if (event.target.className === "gui") {
      var coord = state.getVoxelCoordFromMouse(event);
      if (down) {
        if (coord) {
          state.brush.startApply(coord[0], coord[1], coord[2]);
        }
      } else {
        state.brush.endApply();
      }
    } else {
      // console.log("Click on gui element.");
    }
  };

  state.mouseWheel = function(event) {
    if (event.target.className === "gui") {
      Game.Graphics.camera.distance += Game.Graphics.camera.zoomSpeed * event.deltaY;
    }
  };

  state.mouseMoved = function(event) {
    if (event.shiftKey) {
      console.log("Modify camera angles");
      //get mouse position relative to game window
      var domEl = document.getElementById("screen");
      var x = event.pageX - domEl.offsetLeft;
      var y = event.pageY - domEl.offsetTop;
      Game.Graphics.camera.rotate(x, y);
    } else {
      var coord = state.getVoxelCoordFromMouse(event);
      if (coord) {
        var uid = state.zone.get("container", "containers").zoneData.get(coord[0], coord[1], coord[2]);
        if (uid !== null) {
          gui.updateHoveredElement(coord[0], coord[1], coord[2], Game.e.entities[uid].type);
        }
        if (state.brush.toApply) {
          state.brush.apply(coord[0], coord[1], coord[2]);
        }
      }
    }
    state.em.send("mouseMoved", event);
  };

  state.update = function(delta) {
    this.em.send("updateLogic", delta);
    Game.Graphics.camera.update(delta);
  };

  state.draw = function(delta) {
    Game.Graphics.render();
  };
  //////////////////
  // Initialization
  //////////////////
  //GUI
  var gui = Game.GUI.createEditorGUI(state.em);
  Game.Graphics.init(state.em);
  // Events
  state.em.register("createNewZone", state.createNewZone);
  state.em.register("displayLevelChanged", state.changeDisplayLevel);
  state.em.register("saveZoneToFile", function() {
    var txt = state.zone.s.dataLoader.serialize();
    window.open("data:text/json;charset=utf-8," + txt);
  });

  var domEl = document.getElementById("screen");
  domEl.appendChild(Game.Graphics.renderer.domElement);

  return state;
};

