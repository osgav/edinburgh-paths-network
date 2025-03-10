
////////////////////////////////////////////////////////////////////////////////
// initialize Leaflet map
//
var map = L.map("map", {
  zoomSnap: 0.05
}) .setView([55.9400, -3.1925], 12.35);


////////////////////////////////////////////////////////////////////////////////
// configure map debug information
//
map.whenReady(updateDebugInfoZoom);
map.whenReady(updateDebugInfoBounds);
map.whenReady(updateDebugInfoCenter);

map.on("zoomstart zoom zoomend", updateDebugInfoZoom);
map.on("zoomstart zoom zoomend movestart move moveend", updateDebugInfoBounds);
map.on("zoomstart zoom zoomend movestart move moveend", updateDebugInfoCenter);
map.on("mousemove", updateDebugInfoMouse);

function updateDebugInfoZoom(event) {
  const debugInfoZoom = document.querySelector("#zoom");
  debugInfoZoom.textContent = `${map.getZoom().toFixed(2)}`;
}

function updateDebugInfoBounds(event) {
  const debugInfoBounds = document.querySelector("#bounds");
  //debugInfoBounds.textContent = `Bounds: ${map.getBounds().toBBoxString()}`;
  let westLng = map.getBounds().getWest().toFixed(4);
  let southLat = map.getBounds().getSouth().toFixed(4);
  let eastLng = map.getBounds().getEast().toFixed(4);
  let northLat = map.getBounds().getNorth().toFixed(4);
  debugInfoBounds.textContent = `${westLng},${southLat},${eastLng},${northLat}`;
}

function updateDebugInfoCenter(event) {
  const debugInfoCenter = document.querySelector("#center");
  //debugInfoCenter.textContent = `Map center: ${map.getCenter().toString()}`;
  let mapCenterLat = map.getCenter().lat.toFixed(4);
  let mapCenterLng = map.getCenter().lng.toFixed(4);
  debugInfoCenter.textContent = `${mapCenterLat},${mapCenterLng}`;
}

function updateDebugInfoMouse(event) {
  const debugInfoMouse = document.querySelector("#mouse");
  //debugInfoMouse.textContent = `Mouse location: ${event.latlng.toString()}`;
  let mouseLat = event.latlng.lat.toFixed(4);
  let mouseLng = event.latlng.lng.toFixed(4);
  debugInfoMouse.textContent = `${mouseLat},${mouseLng}`;
}

// borrowed from https://stackoverflow.com/q/31924890
//
var debugControl = L.Control.extend({
  options: {
    position: "topleft"
  },

  onAdd: function(map) {
    var container = L.DomUtil.create("div", "leaflet-control-debug leaflet-bar leaflet-control");
    var anchor = L.DomUtil.create("a", "leaflet-control-debug-button");
    anchor.href = "#";
    anchor.title = "Debug info";
    anchor.role = "button";
    anchor.ariaLabel = "Debug info";
    anchor.ariaDisabled = "false";

    anchor.onclick = function() {
      const debugInfo = document.querySelector(".debug-info");
      debugInfo.classList.toggle("hidden");
      // return focus to the map.
      // without this, the button remains in focus/hover state
      // until you click on the map again.
      // this might be unnecessary if i upgrade from 1.9.3 to 1.9.4 ?
      // https://github.com/Leaflet/Leaflet/issues/9004
      map.getContainer().focus();
    }

    var span = L.DomUtil.create("span");
    span.ariaHidden = "true";
    span.textContent = "D";

    anchor.appendChild(span);
    container.appendChild(anchor);
    return container;
  }
});
map.addControl(new debugControl());


////////////////////////////////////////////////////////////////////////////////
// configure basemap
//
//let tileURL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
//let attr = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//L.tileLayer(tileURL, {
//    maxZoom: 19,
//    attribution: attr 
//}).addTo(map);

var basemap = protomapsL.leafletLayer({url: "edinburgh.pmtiles", theme: "white"});
basemap.addTo(map);


////////////////////////////////////////////////////////////////////////////////
// configure point styles
//
var style_point = {
    radius: 16,
    weight: 4,
    color: "#008800",
    fillColor: "#008800",
    fillOpacity: 0.25,
    opacity: 1,
};


////////////////////////////////////////////////////////////////////////////////
// load features
//
const access_points = L.geoJson(access_points_excerpt, {
  pointToLayer: function (feature, latlng) {
    return L.circle(latlng, style_point);
  },
  onEachFeature
//}).addTo(map);
});

const paths = L.geoJson(primary_path_network, {
  style,
  onEachFeature
}).addTo(map);


////////////////////////////////////////////////////////////////////////////////
// ...
//
function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function style(feature) {
  return {
    weight: 2.5,
    color: "#000000",
  };
}

function onEachFeature(feature, layer) {
  layer.on({
    click: zoomToFeature,
  });
}


var pointMarkers = new L.FeatureGroup();
pointMarkers.addLayer(access_points);

map.on("zoomend", function() {
  if (map.getZoom() < 14) {
    map.removeLayer(pointMarkers);
    //paths.setStyle(f => ({weight: 5}));
  } else {
    map.addLayer(pointMarkers);
  }
});
