function loadJSON(callback) {

  var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
  xobj.open('GET', './data/data.json', true);
  xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
          // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
          callback(xobj.responseText);
        }
  };
  xobj.send(null);  
}

function init() {
  loadJSON(function(response) {
    // Parse JSON string into object
    var data = JSON.parse(response);
    var db = new PouchDB('wise');
    var remoteCouch = false;
    for (var i=0; i<data.length; i++) {
      addWisdom(data[i]);
    }
  });
}

// Database methods to get and probably set the wise-list

function addWisdom(wisdom) {
  var wisdome = {
    _id: new Date().toISOString(),
    title: wisdom.text,
    author: wisdom.author
  };
  db.put(todo, function callback(err, result) {
    if (!err) {
      console.log('Just became wiser!');
    }
  });
}

function filterWisdom(filter_by) {
  return new Array();
}



init()

