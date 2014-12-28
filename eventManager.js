function createEventManager() {
  var em = {};
  var evMap = {};

  em.register = function(eName, cbk) {
    if (!evMap[eName]) {
      evMap[eName] = [];
    }
    evMap[eName].push(cbk);
  };

  em.unRegister = function(eName, cbk) {
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

  em.send = function(eName) {
    if (evMap[eName]) {
      var cbks = evMap[eName];
      for (var i=0; i<cbks.length; i++) {
        var arg = Array.prototype.slice.call(arguments, 1); //arguments is not a real Array
        cbks[i].apply(undefined, arg);
      }
    }
  };
  
  em.showEventMap = function() {
    console.debug(evMap);
  };

  return em;
}
