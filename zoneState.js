if (!Game) {
  var Game = {};
}
if (!Game.States) {
  Game.States = {};
}

Game.States.createZone = function() {
  var state = createEmptyState();
  state.name = "zone";
  state.zone = null;
  state.turnQueue = null;
  state.em = createEventManager();
  
  state.enter = function() {
    console.log("ENTER ZONE STATE");
    state.em.send("startNewTurn", state.turnQueue);
  };

  state.exit = function() {

  };

  state.keyDown = function(event) {
    if (event.keyCode == Game.keymap.VK_ESCAPE) {
      // stateManager.pushState(Game.States.createMainMenu());
    }
    if (event.keyCode == Game.keymap.VK_UP) {
    }
    if (event.keyCode == Game.keymap.VK_DOWN) {
    }
    if (event.keyCode == Game.keymap.VK_LEFT) {
    }
    if (event.keyCode == Game.keymap.VK_RIGHT) {
    }
    if (event.keyCode == Game.keymap.VK_S) {
      var txt = state.zone.s.dataLoader.serialize();
      //Using localStorage
      window.localStorage.setItem("toto", txt);
      console.info("Saved current map to local storage");
    }
    if (event.keyCode == Game.keymap.VK_C) {
      console.info(player.getComponents());
    }
    //Send an event for those interested
    state.em.send("kd"+event.keyCode, event);

  };

  state.keyUp = function(event) {
    state.em.send("ku"+event.keyCode, event);
  };

  state.mouseClicked = function(down, event) {
    state.em.send("mouseClicked", down, event);
   };

  state.mouseWheel = function(event) {
    if (event.target.className === "gui") {
      camera.distance += camera.zoomSpeed * event.deltaY;
    }
  };

  state.mouseMoved = function(event) {
    state.em.send("mouseMoved", event);
  };

  state.update = function(delta) {
    this.em.send("updateLogic", delta);
    camera.update(delta);
    TWEEN.update();
  };

  state.draw = function(delta) {
    sceneInfos.render(camera.threejsCam);
  };

  state.updateTurnQueue = function() {
    state.turnQueue = state.zone.s.dataLoader.getEntitiesList();
  };

  state.startTurn = function() {
    console.log("Starting turn: "+Game.e.entities[state.turnQueue[0]].name);
    Game.e.entities[state.turnQueue[0]].send("yourTurn");
    // gui.updateTurnQueue(state.turnQueue);
  };

  state.endTurn = function(el) {
    var first = state.turnQueue.shift();
    Game.e.entities[first].send("turnFinished");
    console.log("Finishing turn: "+Game.e.entities[first].name);
    state.turnQueue.push(first);
    state.em.send("startNewTurn", state.turnQueue);
  };

  //////////////////
  // Initialization
  //////////////////
  var sceneInfos = Game.Graphics.createScene();
  var camera = Game.Graphics.createCamera(state.em);
  //Zone
  state.zone = Game.e.createZone(state.em, sceneInfos.scene);
  // state.zone.s.dataLoader.loadPlane();
  // var player = Game.e.createPlayer(state.em, 0, 2, 0, sceneInfos.scene);
  var json = window.localStorage.getItem("toto");
  state.zone.s.dataLoader.loadFromJson(json);
  var gui = Game.GUI.createZoneGUI(state.em, camera.threejsCam, state.zone);

  //Entities
  var player = Game.e.createPlayer(state.em, 0, 4, 0, sceneInfos.scene);
  state.zone.s.dataLoader.addEntity(player);
  state.zone.s.dataLoader.addEntity(Game.e.createMouse(state.em, 1, 4, 0, sceneInfos.scene));
  for (var i=0; i<8; i++) {
    state.zone.s.dataLoader.addEntity(Game.e.createMouse(state.em, 2+i, 9, i, sceneInfos.scene));
  }

  state.zone.initSystems();
  state.zone.s.dataLoader.initEntities();
  state.updateTurnQueue();
  for (var j=0; j<state.turnQueue.length; j++) {
    console.groupCollapsed("resolve gravity: "+Game.e.entities[state.turnQueue[j]].name);
    state.zone.s.physicsRules.resolveGravity(Game.e.entities[state.turnQueue[j]]);
    console.groupEnd("resolve gravity");
  }

  camera.focusPoint = player.get("appearance", "mesh").position;
  state.em.register("startNewTurn", state.startTurn);
  state.em.register("turnFinished", state.endTurn);

  var domEl = document.getElementById("screen");
  domEl.appendChild(sceneInfos.renderer.domElement);

  return state;
};
