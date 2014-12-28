if (!Game) {
  var Game = {};
}

if (!Game.GUI) {
  Game.GUI = {};
}

Game.GUI.createEditorGUI = function(em) {
  var gui = {};

  gui.em = em;
  gui.domEl = document.getElementById("editorGUI");
  gui.domEl.style.display = "initial";
  gui.newZoneDial = document.getElementById("newZoneDial");

  document.getElementById("newZoneBtn").onclick = function() {
    gui.newZoneDial.parentNode.style.display = "initial";
    gui.newZoneDial.style.display = "block";
    document.getElementById("createNewZoneDialBtn").focus();
  };
  document.getElementById("saveZoneBtn").onclick = function() {
    em.send("saveZoneToFile");
  };

  //current level indicator
  gui.lvlInd = document.getElementById("levelIndicator");
  var lvlRange = gui.lvlInd.children[1];
  lvlRange.max = 10;
  lvlRange.value = 0;
  lvlRange.setAttribute("data-val", "0");
  var lvlOut = gui.lvlInd.children[0];
  lvlOut.value = "0";
  lvlRange.oninput = function() {
    if (lvlOut.value !== lvlRange.value) {
      lvlOut.value = lvlRange.value;
      gui.em.send("displayLevelChanged", [parseInt(lvlOut.value)]);
    }
  };

  //newZoneDial
  document.getElementById("createNewZoneDialBtn").onclick = function() {
    var sX = document.getElementById("sizeX");
    var sY = document.getElementById("sizeY");
    var sZ = document.getElementById("sizeZ");
    var size = [sX.value, sY.value, sZ.value]; 
    gui.em.send("createNewZone", size, "air");
    gui.newZoneDial.parentNode.style.display = "none";
    gui.newZoneDial.style.display = "none";
    gui.lvlInd.children[1].max = size[1]-1;
  };
  document.getElementById("closeNewZoneDialBtn").onclick = function() {
    gui.newZoneDial.parentNode.style.display = "none";
    gui.newZoneDial.style.display = "none";
  };

  //Brush size
  function brushSizeChanged(event) {
    var newVal = parseInt(event.target.value);
    em.send("brushSizeChanged", newVal);
  }
  var sizesEl = document.getElementsByClassName("brushSize");
  sizesEl[0].checked = true;
  for (var i=0; i<sizesEl.length; i++) {
    sizesEl[i].onclick = brushSizeChanged;
  }

  //Element list
  gui.elList = document.getElementById("brushControls");
  var elUl = document.getElementById("elementList");
  for (i=0; i<Game.e.elementList.length; i++) {
    var elLi = document.createElement("li");
    elLi.innerHTML = Game.e.elementList[i];
    elLi.id = Game.e.elementList[i];
    elUl.appendChild(elLi);
  }
  function selectedElementChanged(event) {
    var newSel = event.target;
    var selected = document.getElementsByClassName("elSelected")[0];
    if (newSel.id !== selected.id) {
      selected.className = "";
      newSel.className = "elSelected";
      gui.em.send("newBrushSelected", newSel.id);
    }
  }
  var elList = elUl.children;
  for (i=0; i<elList.length; i++) {
    elList[i].onclick = selectedElementChanged;
  }

  gui.updateHoveredElement = function(x, y, z, name) {
    document.getElementById("coord").innerHTML = x+","+y+","+z;
    document.getElementById("elName").innerHTML = name;
  };

  gui.deleteGUI = function() {

  };

  return gui;
};

