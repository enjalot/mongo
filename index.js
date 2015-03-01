// https://github.com/derbyjs/derby-standalone
var app = derby.createApp();
// convenience function for loading templates that are defined as <script type="text/template">
app.registerViews();

var apiAggregations = "http://sensor-api.localdata.com/api/v1/aggregations";
var apiEntries = "http://sensor-api.localdata.com/api/v1/sources/";

var keys = Object.keys(data[0]).sort();


window.app = app
// we register our "tabs" component by associating the Tabs class with the 'tabs' template
app.component('intro', Intro);
function Intro() {}
Intro.prototype.init = function(model) {
  model.ref("data", model.scope("_page.data"));
  model.ref("keys", model.scope("_page.keys"));
  model.set("limit", 10)
  model.set("query", { city: "San Francisco"})
  //model.set("useTable", true)

  model.start("filtered", "data", "query", "limit", function(data, query, limit) {
    var q = new Mingo.Query(query)
    var cursor = q.find(data)
    return cursor.limit(limit).all()
  })
  model.start("filteredText", "filtered", function(filtered) {
    return JSON.stringify(filtered, null, 2)
  })
}
Intro.prototype.toggleTable = function() {
  this.model.set("useTable", !this.model.get("useTable"))
}
Intro.prototype.example1 = function() {
  this.model.set("query", {})
}
Intro.prototype.example2 = function() {
  this.model.set("query", { city: "San Francisco"})
}
Intro.prototype.example3 = function() {
  this.model.set("query", { city: "Shanghai"})
}

function Editor() {}
Editor.prototype.init = function(model) {
  model.set("queryText", JSON.stringify(model.get("query"), null, 2))
  model.on("change", "queryText", function(text){
    try {
      var json = JSON.parse(text)
      model.set("error", false)
      model.set("query", json)
    } catch(e) {
      model.set("error", true)
    }
  })
}
app.component('json-editor', Editor);

app.component('selectah', Selectah);
function Selectah() {}
Selectah.prototype.init = function(model) {}
Selectah.prototype.edit = function() {
  this.model.set('editing', true);
  var select = this.select;
  setTimeout(function() {
    var evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('mousedown', true, true, window);
    select.dispatchEvent(evt);
  }, 0)
}
Selectah.prototype.selected = function() {
  this.model.set('editing', false)
}

var page = app.createPage();
page.model.set('_page.data', data);
page.model.set('_page.keys', keys);

//this attaches your rendered templates to the body. You could instead append the templates into the div of your choice
document.body.appendChild(page.getFragment('body'));


// calculate dates
function lastDay() {
  var today = new Date();
  var day = today.getUTCDate() - 1;
  var month = today.getUTCMonth();
  if(day < 1) {
    month -= 1;
  }
  var from = new Date(today.getUTCFullYear(), month, day)
  var before = new Date(today.getUTCFullYear(), month, today.getUTCDate());
  return { from: from, before: before }
}
//console.log("from", lastDay().from.toISOString());
//console.log("before", lastDay().before.toISOString());
function last7Days() {
  var today = new Date();
  var day = today.getUTCDate() - 7;
  var month = today.getUTCMonth();
  if(day < 1) {
    month -= 1;
  }
  var from = new Date(today.getUTCFullYear(), month, day)
  var before = today;
  return { from: from, before: before }
}
//console.log("7 from", last7Days().from.toISOString());
//console.log("7 before", last7Days().before.toISOString());