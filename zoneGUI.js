if (!Game) {
  var Game = {};
}

if (!Game.GUI) {
  Game.GUI = {};
}

Game.GUI.createZoneGUI = function(em, camera, zone) {
  var gui = {};

  gui.em = em;
  gui.mode = null;
  gui.selected = null;
  gui.targetable = null;
  gui.targetableMesh = null;
  gui.pointer = Game.createPointer(em, camera, zone);
  gui.domEl = document.getElementById("zoneGUI");
  gui.domEl.style.display = "initial";
  gui.turnQueue = document.getElementById("turnQueue").getElementsByTagName("ol")[0];
  gui.actionsList = document.getElementById("actionsList").getElementsByTagName("ol")[0];
  //initialization
  document.getElementById("endTurnBtn").onclick = function() {
    em.send("turnFinished");
  };

  gui.updateTurnQueue = function(list) {
    gui.turnQueue.innerHTML = "";
    var frag = document.createDocumentFragment();
    for (var i=0; i<list.length; i++) {
      var li = document.createElement("li");
      li.innerHTML = Game.e.entities[list[i]].name;
      frag.appendChild(li);
    }
    gui.turnQueue.appendChild(frag);
  };

  gui.updateSelection = function(ent) {
    var name = document.getElementById("entName");
    var type = document.getElementById("entType");
    var position = document.getElementById("entPos");
    if (!ent) {
      name.innerHTML = "none";
      type.innerHTML = "none";
      position.innerHTML = "_, _, _";
    } else {
      name.innerHTML = ent.name;
      type.innerHTML = ent.type;
      var pos = ent.get("position");
      position.innerHTML = pos.x+","+pos.y+","+pos.z;
    }
  };

  gui.showActionsList = function(uid) {
    function createActionLi(action) {
      var li = document.createElement("li");
      li.innerHTML = action;
      li.id = action;
      li.onclick = function() {
        // if (ent.s[action].getTargetable) {
        //   console.log(ent.s[action].getTargetable());
          gui.setMode(action, uid);
        // }
        // ent.s[action].execute(li.id);
      };
      return li;
    }
    gui.actionsList.innerHTML = "";
    var ent = Game.e.entities[uid];
    var actions = [];
    for (var sys in ent.s) {
      if (Game.e.s[sys].type === "action") {
        actions.push(sys);
      }
    }
    var frag = document.createDocumentFragment();
    for (var i=0; i<actions.length; i++) {
      var li = createActionLi(actions[i]);
      frag.appendChild(li);
    }
    gui.actionsList.appendChild(frag);
    gui.actionsList.parentNode.hidden = false;
  };
  
  gui.hideActionsList = function() {
    gui.actionsList.innerHTML = "";
    gui.actionsList.parentNode.hidden = true;
  };

  gui.setMode = function(mode, uid) {
    var ent = Game.e.entities[uid];
    var sys = ent.s[mode];
    if (!sys) {
      console.error("No system named: "+mode);
      return;
    }
    gui.mode = mode;
    //clean from previous mode
    if (gui.targetable) {
      gui.targetable = null;
    }
    if (gui.targetableMesh) {
      ent.get("appearance", "scene").remove(gui.targetableMesh);
      gui.targetableMesh = null;
    }
    if (uid !== gui.selected) {
      gui.selected = uid;
    }
    console.info("Gui mode set to: "+mode);
    //If move, show actions list
    if (mode === "move") {
      gui.showActionsList(uid);
    } else {
      if (gui.actionsList !== "") {
        gui.hideActionsList();
      }
    }
    //If there is a selection to make, show target, otherwise, perform action
    if (sys.getTargetable !== undefined) {
      var targetable = sys.getTargetable();
      console.log(targetable);
      var highlightStyle;
      if (mode === "move") {
        highlightStyle = "move";
      } else {
        highlightStyle = "action";
      }
      var mesh = Game.Graphics.getHighlightTilesMesh(targetable, highlightStyle);
      ent.get("appearance", "scene").add(mesh);
      gui.targetable = targetable;
      gui.targetableMesh = mesh;
    } else {
      gui.hideActionsList();
      sys.execute(function() {
        gui.setMode("move", uid);
        gui.showActionsList(uid);
      });
    }
  };

  gui.startNewTurn = function(queue) {
    gui.updateTurnQueue(queue);
  };

  gui.mouseClick = function(down, event) {
    if (event.target.className !== "gui") { //Don't do anyrhing if mouse on gui
      return;
    }
    if (down) {
      if (gui.pointer.pointed) {
        // console.log(gui.targetable);
        // console.log(gui.pointer.pointed);
        var pEnt = Game.e.entities[gui.pointer.pointed];
        var pos = pEnt.get("position");
        var size = pEnt.get("size", "value");
        var topSpace = pos.x + "-" + (pos.y+size[0]) + "-" + pos.z; 
        if (gui.targetable[topSpace] !== undefined) {
          var sys = Game.e.entities[gui.selected].s[gui.mode];
          gui.hideActionsList();
          sys.execute(function() {
            gui.setMode("move", gui.selected);
            gui.showActionsList(gui.selected);
          }, gui.targetable, topSpace);
        } else {
          console.info("Click not on any targetable");
        }
      }
    }
    

  };

  em.register("startNewTurn", gui.startNewTurn);
  em.register("updateSelection", gui.updateSelection);
  em.register("mouseClicked", gui.mouseClick);
  em.register("setGUIMode", function(mode, uid) {
    gui.setMode(mode, uid);
  });
  // em.register("showActionsList", gui.showActionsList);
  return gui;
};
