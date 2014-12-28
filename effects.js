var Game = Game || {};
Game.e = Game.e || {};

Game.e.effects = {

  notificationEffect: {
    enter: function() {
      console.info("enter: " + this.getUID());
    },
    leave: function() {
      console.info("leave: " + this.getUID()); 
    }
  },

  highlightColorEffect: {
    enter: function() {
      // console.debug(this.get("appearance","mesh"));
      var mat = this.get("appearance", "mesh").material.clone();
      mat.color.offsetHSL(0, 0, 0.08);
      this.get("appearance","mesh").material = mat;
      // this.get("appearance","mesh").material.color.offsetHSL(0,0,0.08);
    },
    leave: function() {
      this.get("appearance","mesh").material.color.offsetHSL(0,0,-0.08);
    }
  },

  whiteSquareEffect: {
    enter: function() {
      var mesh = Game.Graphics.meshFactory.get("whiteSquare");
      mesh.name = "whiteSquare";
      mesh.position.y += 2;
      if (!this.get("appearance", "mesh")) {
        var dummy = new THREE.Object3D();
        var size = this.get("size", "value");
        var pos = this.get("position");
        dummy.position.x = pos.x * Game.Graphics.voxelSize.x * size[0];
        dummy.position.y = pos.y * Game.Graphics.voxelSize.y * size[1];
        dummy.position.z = pos.z * Game.Graphics.voxelSize.z * size[2];
        this.get("appearance", "scene").add(dummy);
        this.set("appearance", "mesh", dummy);
        this.get("appearance", "mesh").add(mesh);
      }
      this.get("appearance", "mesh").add(mesh);
    },
    leave: function() {
      var mesh = this.get("appearance", "mesh");
      mesh.remove(mesh.getObjectByName("whiteSquare"));
    }
  },

  redColorEffect: {
    enter: function() {
      // console.debug(this.get("appearance","mesh"));
      this.get("appearance","mesh").material.color.r += 1;
    },
    leave: function() {
      this.get("appearance","mesh").material.color.r -= 1;
    }
  },

  embiggenEffect: {
    enter: function() {
      this.get("appearance","mesh").scale.x += 0.3;
      this.get("appearance","mesh").scale.y += 0.3;
      this.get("appearance","mesh").scale.z += 0.3;
    },
    leave: function() {
      this.get("appearance","mesh").scale.x -= 0.3;
      this.get("appearance","mesh").scale.y -= 0.3;
      this.get("appearance","mesh").scale.z -= 0.3;
    }
  },

  embiggenSmoothEffect: {
    enter: function() {
      var mesh = this.get("appearance", "mesh");
      new TWEEN.Tween({s:1})
        .to({s:1.2}, 200)
        .onUpdate(function() {
              mesh.scale.x = this.s;
              mesh.scale.y = this.s;
              mesh.scale.z = this.s;
            })
        .start();
    },
    leave: function() {
      var mesh = this.get("appearance", "mesh");
      new TWEEN.Tween({s:1.2})
        .to({s:1}, 300)
        .onUpdate(function() {
              mesh.scale.x = this.s;
              mesh.scale.y = this.s;
              mesh.scale.z = this.s;
            })
        .start();
    }
  },

  clickSoundEffect: {
    enter: function() {
      var snd = new Audio("sound/click1.wav");
      snd.play();
    },
    leave: function() {
      var snd = new Audio("sound/click2.wav");
      snd.play();
    }
  },

  arrowEffect: {
    enter: function() {
      var material = new THREE.MeshLambertMaterial({color: 0xb66bbb});
      var geometry = new THREE.TetrahedronGeometry(40, 0);
      geometry.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(1, 0, -1).normalize(), Math.atan( Math.sqrt(2)) ) );
      geometry.applyMatrix( new THREE.Matrix4().makeRotationAxis( new THREE.Vector3(0, 0, 1).normalize(), 180*(Math.PI/180)) );
      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(this.get("appearance","mesh").position.x, this.get("appearance","mesh").position.y+160, this.get("appearance","mesh").position.z);
      scene.add(mesh);
      //rotate
      var tween = new TWEEN.Tween(mesh.rotation)
        .to({y: mesh.rotation.y + 360*(Math.PI/180)}, 10000)
        .repeat(Infinity)
        .start();
      Game.e.effects.arrowEffect.tween = tween;
      Game.e.effects.arrowEffect.material = material;
      Game.e.effects.arrowEffect.geometry = geometry;
      Game.e.effects.arrowEffect.mesh = mesh;
    },
    leave: function() {
      //clean, everything necessary?
      Game.e.effects.arrowEffect.tween.stop();
      scene.remove(Game.e.effects.arrowEffect.mesh);
      Game.e.effects.arrowEffect.material.dispose();
      Game.e.effects.arrowEffect.geometry.dispose();
    }
  }


};
