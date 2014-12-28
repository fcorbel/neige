Game.e.s.move = {
  dependency: ["position", "associatedZone"],
  callbacks: {},
  entityCallbacks: {"yourTurn": "refreshPoints"},
  init: function() {
    var type = this.get("movement", "type");
    if (!Game.Movement[type]) {
      console.err("No movement of type: "+type);
    }
  },
  refreshPoints: function() {
    this.set("movement", "points", this.get("movement", "maxPoints"));
  },
  up: function() {
    var infos = this.get("movement");
    Game.Movement[infos.type].up(this);
  },
  down: function() {
    var infos = this.get("movement");
    Game.Movement[infos.type].down(this);
  },
  left: function() {
    var infos = this.get("movement");
    Game.Movement[infos.type].left(this);
  },
  right: function() {
    var infos = this.get("movement");
    Game.Movement[infos.type].right(this);
  },
  getTargetable: function() {
    return Game.Movement.getCanGoCoords(this);
  },
  execute: function(cbk, targetable, target) {
    console.log("executing");
    var path = [];
    var curr = target;
    while (curr !== "none") {
      path.push(curr);
      curr = targetable[curr];
    }
    path.pop();
    path.reverse();
    this.s.move.path(path, cbk);
  },
  path: function(path, cbk) {
    // console.log("follow path: ");
    // console.log(path);
    var cbkOnFinished = cbk;
    var pathFunc = this.s.move.path;
    var that = this;
    var first = path.shift().split("-");
    var firstObj = {"x": parseInt(first[0]), "y": parseInt(first[1]), "z": parseInt(first[2])};
    Game.Movement.goToNoCheck(this, firstObj, 50, function() {
      if (path.length > 0) {
        pathFunc(path, cbkOnFinished);
      } else {
        cbkOnFinished();
      }
    });
  },

  clean: function() {
  }
};

Game.e.s.uiControled = {
  dependency: [],
  callbacks: {},
  entityCallbacks: {"yourTurn": "startTurn",
                    "turnFinished": "endTurn"},
  init: function() {
  },
  startTurn: function() {
    //register to some input events
    // this.em.register("kd"+Game.keymap.VK_LEFT, this.s.move.left);
    // this.em.register("kd"+Game.keymap.VK_RIGHT, this.s.move.right);
    // this.em.register("kd"+Game.keymap.VK_UP, this.s.move.up);
    // this.em.register("kd"+Game.keymap.VK_DOWN, this.s.move.down);
    // this.em.register("clickOn", this.s.uiControled.clickOn);

    // this.s.move.showCanGo();
    // this.em.send("showActionsList", this.getUID());
    // this.s.uiControled.doSomething();


    // //REFACTOR TODO
    // this.em.register("tryToGoTo", this.s.uiControled.clickOn);
    // this.em.register("tryToMakeAction", this.s.uiControled.clickOn);
    // this.em.send("selectionModeChange", "movement");

    this.em.send("setGUIMode", "move", this.getUID());
  },
  endTurn: function() {
    // this.s.move.removeCanGo();

    // this.em.unRegister("kd"+Game.keymap.VK_LEFT, this.s.move.left);
    // this.em.unRegister("kd"+Game.keymap.VK_RIGHT, this.s.move.right);
    // this.em.unRegister("kd"+Game.keymap.VK_UP, this.s.move.up);
    // this.em.unRegister("kd"+Game.keymap.VK_DOWN, this.s.move.down);
    // this.em.unRegister("clickOn", this.s.uiControled.clickOn);
  },

  clickOn: function(ent) { //user clicked on some entity
    // console.debug("Click on: "+ent.type +":"+ent.name);
    // var pos = ent.get("position");
    // var size = ent.get("size", "value");
    // topSpace = pos.x + "-" + (pos.y+size[0]) + "-" + pos.z; 
    // var canGo = this.get("movement", "canGoCoords");
    // if (canGo) {
    //   if (canGo[topSpace] !== undefined) {
    //     var path = [];
    //     var curr = topSpace;
    //     while (curr !== "none") {
    //       path.push(curr);
    //       curr = canGo[curr];
    //     }
    //     path.pop();
    //     path.reverse();
    //     this.s.move.path(path);
    //   } else {
    //     console.log("Can't go there, out of range.");
    //   }
    // }
  },

  doSomething: function() {
    console.log(this.name+" is doing something...");
  },
  clean: function() {
  }
};

Game.e.s.aiControled = {
  dependency: [],
  callbacks: {},
  entityCallbacks: {"yourTurn": "think"},
  init: function() {
  },
  think: function() {
    console.log(this.name+" is thinking...");
    this.s.aiControled.moveRandomly();
    this.em.send("turnFinished", this);
  },
  moveRandomly: function() {
    var dir = Math.floor(4*Math.random());
    switch (dir) {
      case 0:
        this.s.move.left();
        break;
      case 1:
        this.s.move.right();
        break;
      case 2:
        this.s.move.up();
        break;
      case 3:
        this.s.move.down();
        break;
      default:
        console.warn("Don't know this direction...");
    }
  },
  clean: function() {
  }
};

