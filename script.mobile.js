
////////////////////////////////////////////////////////////////////////////////
// initialize Leaflet map
//
var map = L.map("map", {
  zoomSnap: 0.05
}) .setView([55.9688, -3.1925], 14);


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
map.on("zoomstart zoom zoomend movestart move moveend", updateDebugCrosshair);

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

var crosshairIcon = L.icon({
  iconUrl:    "freesvg.org_Crosshairs-3456.svg",
  iconSize:   [45, 45],
  iconAnchor: [23, 23],
  className:  "debug-crosshair invisible",
});

var crosshairMarker = L.marker(map.getCenter(), {icon: crosshairIcon}).addTo(map);

function updateDebugCrosshair(event) {
  crosshairMarker.setLatLng(map.getCenter());
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
      const debugCrosshair = document.querySelector(".debug-crosshair");
      debugCrosshair.classList.toggle("hidden");
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
var protomaps_light = protomapsL.leafletLayer({url: "edinburgh.pmtiles", theme: "light"});
var protomaps_dark = protomapsL.leafletLayer({url: "edinburgh.pmtiles", theme: "dark"});
var protomaps_white = protomapsL.leafletLayer({url: "edinburgh.pmtiles", theme: "white"});
var protomaps_black = protomapsL.leafletLayer({url: "edinburgh.pmtiles", theme: "black"});
var protomaps_grayscale = protomapsL.leafletLayer({url: "edinburgh.pmtiles", theme: "grayscale" });
protomaps_grayscale.addTo(map);

var baseMaps = {
  "Protomaps Light": protomaps_light,
  "Protomaps Dark": protomaps_dark,
  "Protomaps White": protomaps_white,
  "Protomaps Black": protomaps_black,
  "Protomaps Grayscale": protomaps_grayscale,
};

var layerControl = L.control.layers(baseMaps, null, {position: 'topleft'}).addTo(map);


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

var style_point_curated = {
    radius: 40,
    weight: 4,
    color: "#000000",
    fillColor: "#FFAD0A",
    fillOpacity: 0.5,
    opacity: 1,
};

var style_point_primary = {
    radius: 15,
    weight: 3,
    color: "#000000",
    fillColor: "#FFAD0A",
    fillOpacity: 0.5,
    opacity: 1,
};

var style_point_secondary = {
    radius: 8,
    weight: 2,
    color: "#000000",
    fillColor: "#FFAD9A",
    fillOpacity: 0.5,
    opacity: 1,
};


////////////////////////////////////////////////////////////////////////////////
// load features
//
const paths = L.geoJson(primary_path_network, {
  style: stylePath,
  onEachFeature
}).addTo(map);

const spurs = L.geoJson(access_spurs, {
  style: styleSpur,
  onEachFeature
});

const access_points_curated = L.geoJson(access_points_primary_curated, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, style_point_curated);
  },
  onEachFeature
});

const access_points_primary = L.geoJson(access_points_primary_all, {
  pointToLayer: function (feature, latlng) {
    return L.circle(latlng, style_point_primary);
  },
  onEachFeature
});

const access_points_secondary = L.geoJson(access_points_secondary_all, {
  pointToLayer: function (feature, latlng) {
    return L.circle(latlng, style_point_secondary);
  },
  onEachFeature
});


////////////////////////////////////////////////////////////////////////////////
// ...
//
function stylePath(feature) {
  return {
    weight: 2,
    color: "#000000",
  };
}

function styleSpur(feature) {
  return {
    weight: 1.5,
    color: "#000000",
    dashArray: "3 5",
  };
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    click: zoomToFeature,
  });
}

var accessPrimary = new L.FeatureGroup();
accessPrimary.addLayer(access_points_curated).addTo(map);

var accessSecondary = new L.FeatureGroup();
accessSecondary.addLayer(access_points_secondary);


var spurLines = new L.FeatureGroup();
spurLines.addLayer(spurs);

map.on("zoomend overlayadd overlayremove", function() {
  if (map.getZoom() <= 12) {
    if (map.hasLayer(accessPrimary)) {
      map.removeLayer(accessPrimary);
    }
    //paths.setStyle(f => ({weight: 5}));
  } else {
    if (map.hasLayer(accessPrimary)) {
      map.addLayer(accessPrimary);
    }
  }

  if (map.getZoom() < 16) {
    map.removeLayer(spurLines);
    if (map.hasLayer(accessPrimary)) {
      accessPrimary.addLayer(access_points_curated);
      accessPrimary.removeLayer(access_points_primary);
    }
  } else {
    map.addLayer(spurLines);
    if (map.hasLayer(accessPrimary)) {
      accessPrimary.removeLayer(access_points_curated);
      accessPrimary.addLayer(access_points_primary);
    }
  }

});


layerControl.addOverlay(accessPrimary, '<div class="legend-primary-access-points"></div> primary access points');
layerControl.addOverlay(accessSecondary, '<div class="legend-secondary-access-points"></div> secondary access points');
