
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
  debugInfoZoom.textContent = `Zoom level: ${map.getZoom()}`;
}

function updateDebugInfoBounds(event) {
  const debugInfoBounds = document.querySelector("#bounds");
  debugInfoBounds.textContent = `Bounds: ${map.getBounds().toBBoxString()}`;
}

function updateDebugInfoCenter(event) {
  const debugInfoCenter = document.querySelector("#center");
  debugInfoCenter.textContent = `Map center: ${map.getCenter().toString()}`;
}

function updateDebugInfoMouse(event) {
  const debugInfoMouse = document.querySelector("#mouse");
  debugInfoMouse.textContent = `Mouse location: ${event.latlng.toString()}`;
}


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
// load features
//
const access_points = L.geoJson(access_points_excerpt, {
  style,
  onEachFeature
}).addTo(map);

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
    weight: 3,
    color: "#000000",
  };
}

function onEachFeature(feature, layer) {
  layer.on({
    click: zoomToFeature,
  });
}


