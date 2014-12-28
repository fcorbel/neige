////////////////////
// Systems
////////////////////
Game.e.s = {};
// Game.e.s.move = {
//   dependency: [],
//   callbacks: {},
//   entityCallbacks: {},
//   init: function() {
// 
//   },
//   clean: function() {
// 
//   }
// };
// 

Game.e.s.dataLoader = {
  //Load elements in the map
  //Manage entities like player, ennemies,...
  dependency: ["associatedContainer", "entitiesList"],
  callbacks: {},
  entityCallbacks: {},
  init: function() {
  },

  addEntity: function(entity) {
    var entList = this.get("entitiesList", "value");
    entity.set("associatedZone", "value", this);
    entList.push(entity.getUID());
  },

  initEntities: function() {
    var entList = this.get("entitiesList", "value");
    for (var i=0; i<entList.length; i++) {
      Game.e.entities[entList[i]].initSystems();
    }
  },

  getEntitiesList: function() {
    return this.get("entitiesList", "value");
  },

  addElement: function(elName, x, y, z) {
    var data = this.get("associatedContainer", "value");
    if (x<0 || y<0 || z<0 || x>=data.sizeX || y>=data.sizeY || z>=data.sizeZ) {
      return null;
    }
    var el = Game.e.createNaturalElement(this.em, elName, x, y, z, this.get("appearance", "scene"));
    if (el) {
      el.set("associatedZone", "value", this);
    }
    return el;
  },

  getMapContent: function(x, y, z) {
    var data = this.get("associatedContainer", "value");
    if (x<0 || y<0 || z<0 || x>=data.sizeX || y>=data.sizeY || z>=data.sizeZ) {
      return null;
    }
    return data.get(x, y, z);
  },

  serialize: function() {
    var data = this.get("associatedContainer", "value");
    var zoneInfos = {};
    zoneInfos.sizeX = data.sizeX;
    zoneInfos.sizeY = data.sizeY;
    zoneInfos.sizeZ = data.sizeZ;
    zoneInfos.elements = [];
    var serializedEls = {};
    data.forEach(function(uids, x, y, z) {
      for (var i=0; i<uids.length; i++) {
        var uid = uids[i];
        if (uid) {
          if (serializedEls[uid] === undefined) {
            var ent = Game.e.entities[uid];
            var name = ent.type;
            if (name !== "player") {
              var pos = ent.get("position");
              delete pos.dirty;
              zoneInfos.elements.push([name, pos]);
              serializedEls[uid] = true;
            }
          }
        }
      }
    }, this);
    return JSON.stringify(zoneInfos);
  },

  loadFromJson: function(json) {
    console.debug("Loading from json data");
    var zoneInfos = JSON.parse(json);
    this.s.dataLoader.loadZone(zoneInfos.sizeX,zoneInfos.sizeY,zoneInfos.sizeZ);
    var els = zoneInfos.elements;
    for (var i=0; i<els.length; i++) {
      var type = els[i][0];
      var pos = els[i][1];
      var el = this.s.dataLoader.addElement(type, pos.x, pos.y, pos.z);
      if (el) {
        el.initSystems();
      }
    }
  },
  
  loadZone: function(x, y, z, elName) {
    var data = Tools.Containers.create3dContainer(x, y, z, []);
    this.set("associatedContainer", "value", data);
    if (elName) {
      data.forEach(function(uid, x, y, z) {
        var el = this.s.dataLoader.addElement(elName, x, y, z);
        el.initSystems();
      }, this);
    }
  },

  loadPlane: function() {
    var data = Tools.Containers.create3dContainer(2, 6, 2, []);
    this.set("associatedContainer", "value", data);
    var scene = this.get("appearance", "scene");
    for (var i=0; i<data.sizeX; i++){
      for (var j=0; j<data.sizeZ; j++) {
        var el = Game.e.createNaturalElement(this.em, "earth", i, 0, j, scene);
        el.set("associatedZone", "value", this);
        el.initSystems();
        el = Game.e.createNaturalElement(this.em, "grass", i, 1, j, scene);
        el.set("associatedZone", "value", this);
        el.initSystems();
      }
    }
  },

  clean: function() {
    var data = this.get("associatedContainer", "value");
    data.forEach(function(uid, x, y, z) {
      if (uid) {
        Game.e.destroyEntity(Game.e.entities[uid], this.em);
      }
    }, this);
    this.set("associatedContainer", "value", null);
    this.set("entitiesList", "value", null);
  }
};

Game.e.s.storedInZone = {
  dependency: ["associatedZone", "position", "size"],
  callbacks: {},
  entityCallbacks: {"moved": "updatePosition"},
  init: function() {
    var map = this.get("associatedZone", "value").get("associatedContainer", "value");
    if (!map) {
      console.error("No zoneData in container, can't store anywhere.");
    } else {
      var x = this.get("position", "x");
      var y = this.get("position", "y");
      var z = this.get("position", "z");
      this.s.storedInZone.storeAt(x, y, z);
    }
  },
  storeAt: function(x, y, z) {
    // console.group();
    var map = this.get("associatedZone", "value").get("associatedContainer", "value");
    var uid = this.getUID();
    // console.debug("Store element at: "+x+","+y+","+z);
    var size = this.get("size", "value");
    for (var i=0; i<size[0]; i++) {
      for (var j=0; j<size[1]; j++) {
        for (var k=0; k<size[2]; k++) {
          var content = map.get(x+i, y+j, z+k);
          content.push(uid);
          map.set(x+i, y+j, z+k, content);
        }
      }
    }
    // console.groupEnd();
  },
  removeFrom: function(x, y, z) {
    // console.group();
    var map = this.get("associatedZone", "value").get("associatedContainer", "value");
    var size = this.get("size", "value");
    var uid = this.getUID();
    for (var i=0; i<size[0]; i++) {
      for (var j=0; j<size[1]; j++) {
        for (var k=0; k<size[2]; k++) {
          // console.log("remove from: "+(x+i)+","+(y+j)+","+(z+k));
          var content = map.get(x+i, y+j, z+k);
          var index = content.indexOf(uid);
          if (index > -1){
            content.splice(index, 1);
          } else {
            console.warn("Try to remove element but not there.");
          }
          map.set(x+i, y+j, z+k, content);
        }
      }
    }
    // console.groupEnd();
  },
  updatePosition: function(fromPos, toPos) {
    this.s.storedInZone.removeFrom(fromPos.x, fromPos.y, fromPos.z);
    this.s.storedInZone.storeAt(toPos.x, toPos.y, toPos.z);
  },
  clean: function() {
    var x = this.get("position", "x");
    var y = this.get("position", "y");
    var z = this.get("position", "z");
    this.s.storedInZone.removeFrom(x, y, z);
  }
};
