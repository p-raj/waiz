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

// MODEL + CONTROLLER - Database methods to get and probably set the wise-list

// reset the database
function resetDatabase(db) {
  var isDataLoaded=false;
  db.destroy().then(() => {
    var db = new PouchDB('wise');
    var remoteCouch = false;
    initWisdom(db);
  });
}

// initiate the database
function initWisdom(db) {
  db.info(function(err, res) {
    if (err) {
      isDataLoaded = false;
      return console.log(err); 
    }
    if (res.doc_count == 0) {
      isDataLoaded = false;
      loadJSON(function(response) {
        var data = JSON.parse(response);
        for (var i=0; i<data.length; i++) {
          addWisdom(db, data[i], i);
        }
      })
    }
    isDataLoaded = true;
  })
}

// add data
function addWisdom(db, wisdom, index) {
  var wisdom = {
    _id: index.toString(),
    wisdom: wisdom
  };
  db.put({
    _id: wisdom._id,
    _rev: wisdom._rev,
    data: wisdom // TODO: refactor
  }, function(err, response) {
    if (err) { return console.log(err); }
    return console.log(response);
  });
}

// Fetch all the records
function getAllWisdom(db, callback) {
  db.allDocs({include_docs: true}, function(err, response) {
    if (err) { return console.log(err)}
    if ((callback == 'undefined') || (callback == null)) {
      return console.log(response);
    } else {
      callback(response.rows);
    }
  });
}

// Fetch all the records that matches the condition
function filterWisdomByTitle(db, query, callback) {
  // db.createIndex(
  //   {index: {fields: ['data.wisdom.wisdom.title', 'data.wisdom.author.name']}}, 
  //   (e,r) => { 
  //     if (e) {return console.log(e)} 
  //     return console.log(r)
  //   });
  db.createIndex({
    index: {
      fields: ['data.wisdom.wisdom.title', 'data.wisdom.author.name']
    }
  }).then(filterWisdom( db, {
    $or: [
      {'data.wisdom.wisdom.title': query.title},
      {'data.wisdom.author.name': query.title}
    ]
  }, function (response) {
      if ((callback == 'undefined') || (callback == null)) {
        return console.log(response);
      } else {
        callback(response.docs);
      }
    })
  );
}

// Fetch all the by ID
function filterWisdomById(db, query, callback) {
  filterWisdom(
    db, 
    {
      '_id': query.id,
      '_rev': query.rev
    }, 
    function (response) {
      if ((callback == 'undefined') || (callback == null)) {
        return console.log(response);
      } else {
        callback(response.docs);
      }
    }
  )
}

// standard query executor
function filterWisdom(db, selector, callback) {
  console.log(selector);
  db.find({
    selector: selector
  }, function (err, response) {
    if (err) { return console.log(err); }
    callback(response);
  });
}

// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// VIEW - Handlebars Help Functions

// Handlebars.registerHelper('getUniqueValues', function(context, block) {
//   var ret = "";
//   var got = [];
  
//   function contains(obj, a) {
//       for (var i = 0; i < a.length; i++) {
//           if (a[i] === obj) {
//               return true;
//           }
//       }
//   return false;
//   }
  
//   for (var i = 0; i < context.length; i++) {
//       if (!this.contains(context[i],got)) {
//           got.addObject(context[i]);
//           ret += block.fn(context[i]);
//       }
//   }

// return ret;
// });

// on page load init function
function init() {
  var db = new PouchDB('wise');
  var remoteCouch = false;
  var isDataLoaded=false;
  initWisdom(db);
}
init()