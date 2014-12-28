if (!Game) {
  var Game = {};
}

if (!Game.e) {
  Game.e = {};
}

Game.e.uid = 1; //start form 1, just in case...
Game.e.getUID = function() {
  return Game.e.uid++;
};

Game.e.entities = {};

Game.e.destroyEntity = function(ent, em) {
  if (!ent) {
    console.error("Trying to destroy en entity while ent=null");
  }
  var uid = ent.getUID();
  em = em || ent.em;
  Game.e.entities[uid].cleanSystems(em);
  delete Game.e.entities[uid];
  console.debug("Entity destroyed, uid="+uid);
  return true;
};

Game.e.createEntity = function(comp, sys, type, name, eManager) {
  var ent = {};
  var uid = Game.e.getUID();

  var c = {}; //private to monitor changes and set dirty flag
  var evMap = {};
  ent.em = eManager|| null;
  ent.s = {};
  if (type) {
    ent.type = type;
  }
  if (name) {
    ent.name = name;
  }

  ent.addComponent = function(compName) {
    var obj = Game.e.c[compName];
    if (obj) {
      c[compName] = obj();
      c[compName].dirty = true;
    } else {
      console.warn("Component named: " + compName + " not found.");
    }
  };

  ent.removeComponent = function(compName) {
    var comp = c[compName];
    if (comp) {
      delete c[compName];
    } else {
      console.warn("No component named: " + compName + ", can't remove.");
    }
  };

  //to access and modify component variables
  ent.get = function(compName, varName) {
    var comp = c[compName];
    if (comp) {
      if (varName) {
        var value = comp[varName];
        if (value === undefined) {
          console.warn("No variable named: " + varName+ " in component: " + compName);
        } else {
          return value;
        }
      } else {
        //return a copy of the comp object, to avoid it being changed
        // Attention, doesn't work if one property is itself an object
        var copy = {};
        for (var attr in comp) {
          if (comp.hasOwnProperty(attr)) copy[attr] = comp[attr];
        }
        return copy;
      }
    } else {
      console.warn("No component named: " + compName + ", can't access property.");
    }
  };

  ent.getComponents = function() {
    return c;
  };

  ent.set = function(compName, varName, newVal) {
    var comp = c[compName];
    if (comp) {
      if (comp[varName] !== undefined) {
        comp[varName] = newVal;
        if (varName !== "dirty") {
          comp.dirty = true;
        }
      } else {
        if (newVal === undefined) { //varName is a new object to replace component
          for (var attr in comp) {
            if (comp.hasOwnProperty(attr)) {
              newVal = varName[attr];
              if (newVal!== undefined) {
                comp[attr] = newVal;
              }
            }
          }
          comp.dirty = true;
        } else {
          console.warn("No variable named: " + varName + ", in component: " + compName);
        }
      }
    } else {
      console.warn("No component named: " + compName + ", can't access property to set: " + varName + " as " + newVal);
    }
  };

  ent.isDirty = function(compName){
    var comp = c[compName];
    if (comp) {
      return comp.dirty;
    } else {
      console.warn("No component named: " + compName + ", can't access property.");
    }
  };

  ent.register = function(eName, cbk) {
    if (!evMap[eName]) {
      evMap[eName] = [];
    }
    evMap[eName].push(cbk);
  };

  ent.unRegister = function(eName, cbk) {
    var cbks = evMap[eName];
    if (cbks) {
      for (var i=0; i<cbks.length; i++) {
        if (cbks[i] === cbk) {
          cbks.splice(i, 1);
          break;
        } 
      }
    }
  };

  ent.send = function(eName) {
    if (evMap[eName]) {
      var cbks = evMap[eName];
      for (var i=0; i<cbks.length; i++) {
        var arg = Array.prototype.slice.call(arguments, 1); //arguments is not a real Array
        cbks[i].apply(undefined, arg);
      }
    }
  };

  ent.addSystem = function(sysName) {
    var sys = Game.e.s[sysName];
    if (sys) {
      // Check dependency
      var dep = sys.dependency;
      if (dep) {
        for (var i=0; i<dep.length; i++) {
          if (!c[dep[i]]) {
            console.warn("Dependency \"" + dep[i] + "\" not found for system: " + sysName);
            return;
          }
        }
      }
      // Add functions of system
      ent.s[sysName] = {};
      for (var p in sys) {
        if (typeof sys[p] === "function") {
          ent.s[sysName][p] = sys[p].bind(ent);
        }
      }
    } else {
      console.warn("System named: " + sysName + " not found.");
    }
  };

  ent.removeSystem = function(sysName) {
    var sys = ent.s[sysName];
    if (sys) {
      ent.cleanSystem(sysName);
      delete ent.s[sysName];
    } else {
      console.warn("No system named: " + sysName + ", can't remove.");
    }
  };

  ent.initSystems = function(em) {
    em = em || ent.em;
    for (var sysName in ent.s) {
      ent.initSystem(sysName, em);
    }
  };

  ent.cleanSystems = function(em) {
    em = em || ent.em;
    for (var sysName in ent.s) {
      ent.cleanSystem(sysName, em);
    }
  };

  ent.initSystem = function(sysName, em) {
    em = em || ent.em;
    var sys = ent.s[sysName];
    if (sys) {
      if (!sys.initialized) {
        // console.debug("Init system \"" + sysName + "\" for entity uid = " + uid);
        //Set callbacks (global & entity)
        var cbks = Game.e.s[sysName].callbacks;
        if (Object.keys(cbks).length !== 0) {
          for (var evt in cbks) {
            em.register(evt, sys[cbks[evt]]);
          }
        }
        var entCbks = Game.e.s[sysName].entityCallbacks;
        if (Object.keys(entCbks).length !== 0) {
          for (var eEvt in entCbks) {
            this.register(eEvt, sys[entCbks[eEvt]]);
          }
        }
        //Call custom init if available
        if (sys.init) {
          sys.init();
        }
        sys.initialized = true;
      } else {
        console.warn("Trying to initialize a system (" + sysName + ") already initialized");
      }
    } else {
      console.warn("No system named: " + sysName + ", can't init.");
    }
  };

  ent.cleanSystem = function(sysName, em) {
    em = em || ent.em;
    var sys = ent.s[sysName];
    if (sys) {
      if (sys.initialized) {
        // console.debug("Clean system \"" + sysName + "\" for entity uid = " + uid);
        //Clean callbacks
        var cbks = Game.e.s[sysName].callbacks;
        if (cbks) {
          for (var evt in cbks) {
            em.unRegister(evt, sys[cbks[evt]]);
          }
        }
        var entCbks = Game.e.s[sysName].entityCallbacks;
        if (entCbks) {
          for (var eEvt in entCbks) {
            this.unRegister(eEvt, sys[entCbks[eEvt]]);
          }
        }
        //Call custom clean if available
        if (sys.clean) {
          sys.clean();
        }
        sys.initialized = false;
      }
    } else {
      console.warn("No system named: " + sysName + ", can't clean.");
    }

  };

  ent.getUID = function() {
    return uid;
  };

  //////////////////
  // Initialization
  //////////////////
  // console.debug("Create new entity of type="+type+" and uid="+uid);
  for (var i=0; i<comp.length; i++) {
    ent.addComponent(comp[i]);
  }
  for (i=0; i<sys.length; i++) {
    ent.addSystem(sys[i]);
  }

  Game.e.entities[uid] = ent;

  return ent;
};


////////////////////
// Entities
////////////////////

// Game.e.createWorld = function() {
//   var comp = [];
//   var sys = [];
//   var e = Game.e.createEntity(comp, sys, "world");
// 
//   return e
// };

Game.e.elementList = ["stone", "bigStone", "earth", "water", "grass"];
Game.e.createNaturalElement = function(em, elName, x, y, z, scene) {
  var comp = ["position", "associatedZone", "weight", "consistence", "appearance", "size", "effects"];
  var sys = ["storedInZone", "effects"];
  var e = Game.e.createEntity(comp, sys, "terrain", elName, em);
  e.set("position", "x", x);
  e.set("position", "y", y);
  e.set("position", "z", z);
  e.set("position", "coordString", x+"-"+y+"-"+z);
  e.set("appearance", "scene", scene);
  e.set("appearance", "selectable", true);
  e.set("effects", "hover", ["notificationEffect", "whiteSquareEffect"]);
  switch (elName){
    case "stone":
      e.set("appearance","meshName", "stone");
      e.set("weight", "value", 100);
      e.set("consistence", "value", 1);
      break;
    case "bigStone":
      e.set("appearance","meshName", "bigStone");
      e.set("weight", "value", 100);
      e.set("consistence", "value", 1);
      e.set("size", "value", [1, 2, 1]);
      break;
    case "earth":
      e.set("appearance","meshName", "earth");
      e.set("weight", "value", 50);
      e.set("consistence", "value", 1);
      break;
    case "water":
      e.set("appearance","meshName", "water");
      e.set("appearance","oppacity", 1);
      e.set("weight", "value", 40);
      e.set("consistence", "value", 0.5);
      break;
    case "grass":
      e.set("appearance","meshName", "grass");
      e.set("weight", "value", 40);
      e.set("consistence", "value", 1);
      break;
    default:
      console.error("No knowned element named: " + elName);
      return null;
  }

  return e;
};

Game.e.createZone = function(em, scene) {
  var comp = ["associatedContainer", "entitiesList", "gravity", "temperature", "appearance"];
  var sys = ["drawZone", "dataLoader", "physicsRules", "sunLighting"];
  var e = Game.e.createEntity(comp, sys, "zone", "defaultZone", em);
  e.set("appearance", "scene", scene);
  
  return e;
};

Game.e.createPlayer = function(em, x, y, z, scene) {
  var comp = ["position", "movement", "action", "associatedZone", "weight", "consistence", "appearance", "size", "effects", "actions"];
  var sys = ["storedInZone", "move", "drawEntity", "uiControled", "effects",
      "dance", "attack", "jump"];
  var e = Game.e.createEntity(comp, sys, "living", "player", em);
  e.set("size", "value", [1, 4, 1]);
  e.set("position", "x", x);
  e.set("position", "y", y);
  e.set("position", "z", z);
  e.set("position", "coordString", x+"-"+y+"-"+z);
  e.set("appearance","meshName", "player");
  e.set("appearance", "scene", scene);
  e.set("appearance", "selectable", true);
  e.set("effects", "hover", ["notificationEffect", "highlightColorEffect", "embiggenSmoothEffect"]);
  
  return e;
};

Game.e.createMouse = function(em, x, y, z, scene) {
  var comp = ["position", "movement", "associatedZone", "weight", "consistence", "appearance", "size", "effects"];
  var sys = ["storedInZone", "move", "drawEntity", "aiControled", "effects"];
  var e = Game.e.createEntity(comp, sys, "living", "mouse", em);
  e.set("size", "value", [1, 1, 1]);
  e.set("position", "x", x);
  e.set("position", "y", y);
  e.set("position", "z", z);
  e.set("position", "coordString", x+"-"+y+"-"+z);
  e.set("appearance","meshName", "mouse");
  e.set("appearance", "scene", scene);
  e.set("appearance", "selectable", true);
  e.set("effects", "hover", ["notificationEffect", "highlightColorEffect", "embiggenSmoothEffect"]);
  
  return e;
};
