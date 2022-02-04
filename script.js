/*
Create and Render map on div with zoom and center
*/
class OLMap {
  //Constructor accepts html div id, zoom level and center coordinaes
  constructor(map_div, zoom, center) {
    this.map = new ol.Map({
      target: map_div,
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat(center),
        zoom: zoom
      })
    });
  }
}

// Defining Style
let staticStyle = new ol.style.Style({
  // Line and Polygon Style
  stroke: new ol.style.Stroke({
    color: '#0e97fa',
    width: 4
  }),
  fill: new ol.style.Fill({
    color: 'rgba(0, 153, 255, 0.2)'
  }),  
});


/*
Create Vector Layer
*/
class VectorLayer{
  //Constructor accepts title of vector layer and map object
  constructor(title, map) {
    this.layer = new ol.layer.Vector({
      title: title,      
      source: new ol.source.Vector({
        projection:map.getView().projection
      }),
      style: staticStyle
    })
  }
}


/*
Create a Draw interaction for LineString and Polygon
*/
class Draw {  
  //Constructor accepts geometry type, map object and vector layer
  constructor(type, map, vector_layer) {
    this.map = map;
    this.vector_layer = vector_layer;
    this.features = [];
    
    //Draw feature
    this.draw = new ol.interaction.Draw({
        type: type,
        stopClick: true,
        source: vector_layer.getSource()
    });  
    this.map.addInteraction(this.draw);   
  }   
}


//Create map and vector layer
let map = new OLMap('map', 9, [-96.6345990807462, 32.81890764151014]).map;
let vector_layer = new VectorLayer('Temp Layer', map).layer
map.addLayer(vector_layer);


//Add Interaction to map depending on your selection
let draw = null;
let btnClick = (e) => {
  removeInteractions();
  let geomType = e.srcElement.attributes.geomtype.nodeValue;  
  draw = new Draw(geomType, map, vector_layer);
  
}

var nav_history=[];
var size=-1;
var undo_redo=false;

//Add event listener to map on move end.
map.on('moveend', function(){	
  if(undo_redo===false){
    if(size<nav_history.length-1){				
      for(var i=nav_history.length-1;i>size;i--){
        console.log(nav_history.pop());
      }
    }
    nav_history.push({extent:map.getView().calculateExtent(map.getSize()),size:map.getSize(), zoom:map.getView().getZoom()});			
    size=size+1;
    console.log(nav_history);
  }
});

//Function for undo pevious extent and zoom
let undoClick = () => {		
  if(size>0){			
    undo_redo=true;
    map.getView().fit(nav_history[size-1].extent, nav_history[size-1].size);
    map.getView().setZoom(nav_history[size-1].zoom);		
    setTimeout(function () {
        undo_redo = false;
    }, 360);
    size=size-1;
    console.log(size);
  }		
}

//Function for redo next extent and zoom
let redoClick = () => {
  if(size<nav_history.length-1){			
    undo_redo=true;						
    map.getView().fit(nav_history[size+1].extent, nav_history[size+1].size);
    map.getView().setZoom(nav_history[size+1].zoom);			
    setTimeout(function () {
        undo_redo = false;
    }, 360);
    size=size+1;
    console.log(size);
  }
}

//Remove map interactions except default interactions
let removeInteractions = () => {
  let extra_interactions = map.getInteractions().getArray().slice(9);
  let len = extra_interactions.length;
  for (let i in extra_interactions) {
    map.removeInteraction(extra_interactions[i]);
  }  
}

//Clear vector features and overlays and remove any interaction
let clear = () => {
  removeInteractions();
  map.getOverlays().clear();
  vector_layer.getSource().clear();
}

//Bind methods to click events of buttons
let poly = document.getElementById('btn1');
poly.onclick = btnClick;

let undo = document.getElementById('btn2');
undo.onclick = undoClick;

let redo = document.getElementById('btn3');
redo.onclick = redoClick;