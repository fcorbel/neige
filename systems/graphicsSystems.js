Game.e.s.drawEntity = {
  dependency: ["appearance", "position", "size"],
  callbacks: {"updateLogic": "update"},
  entityCallbacks: {},
  init: function() {
    var name = this.get("appearance", "meshName");
    if (name) {
      var mesh = Game.Graphics.meshFactory.get(name);
      mesh.name = this.getUID();
      this.set("appearance", "mesh", mesh);
      this.s.drawEntity.setPosition();
      this.get("appearance", "scene").add(mesh);
      if (this.get("appearance", "selectable")) {
        Game.Graphics.selectableMeshs.push(mesh);
      }
    }
  },
  setPosition: function() {
    var mesh = this.get("appearance", "mesh");
    if (mesh) {
      var meshSize = this.get("size", "value");
      mesh.position.x = this.get("position", "x")*Game.Graphics.voxelSize.x + (Game.Graphics.voxelSize.x*(meshSize[0]-1)/2);
      mesh.position.y = this.get("position", "y")*Game.Graphics.voxelSize.y + (Game.Graphics.voxelSize.y*(meshSize[1]-1)/2);
      mesh.position.z = this.get("position", "z")*Game.Graphics.voxelSize.z + (Game.Graphics.voxelSize.z*(meshSize[2]-1)/2);
    }
  },
  update: function() {
    if (this.isDirty("position")) {
      this.s.drawEntity.setPosition();
    }
  },
  clean: function() {
    var mesh = this.get("appearance", "mesh");
    var index = Game.Graphics.selectableMeshs.indexOf(mesh);
    if (index > -1){
      Game.Graphics.selectableMeshs.splice(index, 1);
    }
    this.get("appearance", "scene").remove(mesh);
  }
};

Game.e.s.drawZone = {
  dependency: ["associatedContainer", "appearance"],
  callbacks: {},
  entityCallbacks: {},
  init: function() {
    var data = this.get("associatedContainer", "value");
    var mesh;
    if (!data) {
      console.error("No zoneData in container, can't draw world.");
    } else {
      // this.s.drawWorld.drawRawData(this, data);
      // mesh = this.s.drawZone.createMeshNaive(data);
      mesh = Game.Graphics.createChunkMesh([0,0,0], [data.sizeX-1, data.sizeY-1, data.sizeZ-1], data);
      mesh.name = this.getUID();
      this.set("appearance", "mesh", mesh);
      this.get("appearance", "scene").add(mesh);
      Game.Graphics.selectableMeshs.push(mesh);
    }
  },
  drawRawData: function(data) {
    console.group("Zone content");
    map.forEach(function(el, x, y, z) {
      if (el) {
        console.debug(x+" : "+y+" : "+z+" --> "+el);
      }
    });
    console.groupEnd();
  },

  createMeshNaive: function(data) {
    var geometry, material, mesh;
    var zoneMesh = new THREE.Object3D();
    data.forEach(function(uid, x, y, z) {
      mesh = null;
      var el = Game.e.entities[uid];
      if (el) {
        if (el.isDirty("appearance")) {
          var meshName = el.get("appearance", "meshName");
          var meshSize = el.get("size", "value");
          if (meshName) {
            // console.debug("Draw mesh: "+meshName);
            mesh = Game.Graphics.meshFactory.get(meshName);
          }
          if (mesh) {
            mesh.position.x = x*Game.Graphics.voxelSize.x + (Game.Graphics.voxelSize.x*(meshSize[0]-1)/2);
            mesh.position.y = y*Game.Graphics.voxelSize.y + (Game.Graphics.voxelSize.y*(meshSize[1]-1)/2);
            mesh.position.z = z*Game.Graphics.voxelSize.z + (Game.Graphics.voxelSize.z*(meshSize[2]-1)/2);

            zoneMesh.add(mesh);
          }
          el.set("appearance","dirty", false);
        }
      }
    });
    zoneMesh.name = "zone";
    return zoneMesh;

  },

  clean: function() {
    var mesh = this.get("appearance", "mesh", mesh);
    if (mesh){
      this.get("appearance", "scene").remove(mesh);
    }
  }
};

Game.e.s.drawZoneEditor = {
  dependency: ["associatedContainer", "appearance"],
  callbacks: {},
  entityCallbacks: {},
  init: function() {
    var data = this.get("associatedContainer", "value");
    var mesh;
    if (!data) {
      console.error("No zoneData in container, can't draw world.");
    } else {
      //entities will draw themselves
      for (var y=0; y<data.sizeY; y++) {
        for (var x=0; x<data.sizeX; x++) {
          for (var z=0; z<data.sizeZ; z++) {
            var uids = data.get(x, y, z);
            for (var i=0; i<uids.length; i++) {
              var el = Game.e.entities[uids[i]];
              if (el) {
                el.addSystem("drawEntity");
                el.initSystem("drawEntity");
              }
            }
          }
        }
      }
      var sx = Game.Graphics.voxelSize.x*data.sizeX;
      var sy = Game.Graphics.voxelSize.z*data.sizeZ;
      var drawingPlane = this.s.drawZoneEditor.createDrawingPlane(sx, sy);
      this.get("appearance", "scene").add(drawingPlane);
    }
  },

  redraw: function() {
    var mesh = this.get("appearance", "mesh", mesh);
    if (mesh){
      this.get("appearance", "scene").remove(mesh);
    }
    var data = this.get("associatedContainer", "value");
    mesh = this.s.drawZoneEditor.createMeshNaive(data);
    this.set("appearance", "mesh", mesh);
    this.get("appearance", "scene").add(mesh);
  },

  createMeshNaive: function(data) {
    var geometry, material, mesh;
    var zoneMesh = new THREE.Object3D();
    for (var i=0; i<data.sizeY; i++) {
      var levelMesh = new THREE.Object3D();
      levelMesh.name = i;
      for (var j=0; j<data.sizeX; j++) {
        for (var k=0; k<data.sizeZ; k++) {
          var uids = data.get(j, i, k);
          for (var m=0; m<uids.length; m++) {
            var el = Game.e.entities[uids[m]];
            if (el) {
              if (el.isDirty("appearance")) {
                var meshName = el.get("appearance", "meshName");
                var meshSize = el.get("size", "value");
                if (meshName) {
                  mesh = Game.Graphics.meshFactory.get(meshName);
                }
                if (mesh) {
                  mesh.position.x = j*Game.Graphics.voxelSize.x + (Game.Graphics.voxelSize.x*(meshSize[0]-1)/2);
                  mesh.position.y = i*Game.Graphics.voxelSize.y + (Game.Graphics.voxelSize.y*(meshSize[1]-1)/2);
                  mesh.position.z = k*Game.Graphics.voxelSize.z + (Game.Graphics.voxelSize.z*(meshSize[2]-1)/2);

                  levelMesh.add(mesh);
                }
                el.set("appearance","dirty", false);
              }
            }
          }
        }
      }
      zoneMesh.add(levelMesh);
    }
    return zoneMesh;
  },

  setViewLimit: function(limit) {
    //hide all meshs above the limit
    var data = this.get("associatedContainer", "value");

    var sizeY = data.sizeY;
    if (limit>=sizeY) {
      console.warn("Limit too big");
    }
    for (var i=0; i<sizeY; i++) {
      for (var j=0; j<data.sizeX; j++) {
        for (var k=0; k<data.sizeZ; k++) {
          var uids = data.get(j, i, k);
          for (var m=0; m<uids.length; m++) {
            var el = Game.e.entities[uids[m]];
            var mesh = el.get("appearance", "mesh");
            if (mesh) {
              if (i>limit) {
                //hide
                console.debug("Hide el, uid="+uids[m]);
                mesh.visible = false;
              } else {
                //show
                console.debug("Show el, uid="+uids[m]);
                mesh.visible = true;
              }
            }
          }
        }
      }
    }
    var plane = this.get("appearance", "scene").getObjectByName("drawingPlane");
    plane.position.y = (limit*Game.Graphics.voxelSize.y + Game.Graphics.voxelSize.y/2 +1) - Game.Graphics.voxelSize.y;
  },

  createDrawingPlane: function(sX, sY) {
    var mesh;

    var geom = new THREE.PlaneGeometry(sX, sY);
    var mat = new THREE.MeshBasicMaterial({color: 0xffff00, opacity: 0.6, transparent: true});
    mesh = new THREE.Mesh(geom, mat);
    mesh.name = "drawingPlane";
    mesh.position.x = ((sX/Game.Graphics.voxelSize.x)-1) * (Game.Graphics.voxelSize.x/2);
    mesh.position.y = 0;
    mesh.position.z = ((sY/Game.Graphics.voxelSize.z)-1) * (Game.Graphics.voxelSize.z/2);
    mesh.rotation.x = -90*(Math.PI/180);

    return mesh;
  },

  clean: function() {
    var mesh = this.get("appearance", "mesh", mesh);
    if (mesh){
      this.get("appearance", "scene").remove(mesh);
    }
    this.get("appearance", "scene").remove(this.get("appearance", "scene").getObjectByName("drawingPlane"));
  }
};

Game.e.s.sunLighting = {
  dependency: [],
  callbacks: {},
  entityCallbacks: {},
  init: function() {
    //Add lighting
    var hemLight = new THREE.HemisphereLight(0x000000, 0xffffff, 0.3);
    hemLight.position.set(1, 0, 1).normalize();
    hemLight.name = "hemLight";
    this.get("appearance", "scene").add(hemLight); //regler les couleurs sans ca

    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    light.name = "dirLight";
    this.get("appearance", "scene").add(light);

  },
  clean: function() {
    var scene = this.get("appearance", "scene");
    scene.remove(scene.getObjectByName("hemLight"));
    scene.remove(scene.getObjectByName("dirLight"));
  }
};

Game.e.s.effects = {
  dependency: ["position", "appearance", "effects"],
  callbacks: {},
  entityCallbacks: {
    "hovered": "enterHover",
    "unHovered": "leaveHover",
    "clicked": "enterClick",
    "unClicked": "leaveClick",
    "selected": "enterSelect",
    "unSelected": "leaveSelect",
    "highlighted": "enterHighlight",
    "unHighlighted": "leaveHighlight"
  },
  init: function() {
    //TODO check if registered effects really exist
  },

  enterHover: function() {
    if (!this.get("effects", "hovered")) {
      var effNames = this.get("effects", "hover");
      for (var i=0; i<effNames.length; i++) {
        Game.e.effects[effNames[i]].enter.call(this);
      }
      this.set("effects", "hovered", true);
    }
  },
  leaveHover: function() {
    if (this.get("effects", "hovered")) {
      var effNames = this.get("effects", "hover");
      for (var i=0; i<effNames.length; i++) {
        Game.e.effects[effNames[i]].leave.call(this);
      }
      this.set("effects", "hovered", false);
    }
  },

  enterClick: function() {
    if (!this.get("effects", "clicked")) {
      // document.getElementById("container").style.cursor = "pointer";
      var effNames = this.get("effects", "click");
      for (var i=0; i<effNames.length; i++) {
        Game.e.effects[effNames[i]].enter.call(this);
      }
      this.set("effects", "clicked", true);
    }
  },
  leaveClick: function() {
    if (this.get("effects", "clicked")) {
      // document.getElementById("container").style.cursor = "auto";
      var effNames = this.get("effects", "click");
      for (var i=0; i<effNames.length; i++) {
        Game.e.effects[effNames[i]].leave.call(this);
      }
      this.set("effects", "clicked", false);
    }
  },

  enterSelect: function() {
    if (!this.get("effects", "selected")) {
      // document.getElementById("container").style.cursor = "pointer";
      var effNames = this.get("effects", "selection");
      for (var i=0; i<effNames.length; i++) {
        Game.e.effects[effNames[i]].enter.call(this);
      }
      this.set("effects", "selected", true);
    }
  },
  leaveSelect: function() {
    if (this.get("effects", "selected")) {
      // document.getElementById("container").style.cursor = "auto";
      var effNames = this.get("effects", "selection");
      for (var i=0; i<effNames.length; i++) {
        Game.e.effects[effNames[i]].leave.call(this);
      }
      this.set("effects", "selected", false);
    }
  },
  enterHighlight: function() {
    if (!this.get("effects", "highlighted")) {
      // document.getElementById("container").style.cursor = "pointer";
      var effNames = this.get("effects", "highlight");
      for (var i=0; i<effNames.length; i++) {
        Game.e.effects[effNames[i]].enter.call(this);
      }
      this.set("effects", "highlighted", true);
    }
  },
  leaveHighlight: function() {
    if (this.get("effects", "highlighted")) {
      // document.getElementById("container").style.cursor = "auto";
      var effNames = this.get("effects", "highlight");
      for (var i=0; i<effNames.length; i++) {
        Game.e.effects[effNames[i]].leave.call(this);
      }
      this.set("effects", "highlighted", false);
    }
  },
  clean: function() {
  }
};
