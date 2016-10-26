// :::: CREATE MODULE OBJECT :::: \\
var Module = (function() {
  // RETURNS EMPTY MODULE OBJECT ON LOAD \\
  var module = {};
  // ESRI CONFIGS \\
  require(["esri/config"], function(esriConfig){
    esriConfig.defaults.io.corsDetection = true;
    esriConfig.defaults.io.corsEnabledServers.push("http://gis.bolton-menk.com/");
  });
  return module;
}());
// ::::::::::::::::::::::::::::::::: \\
// ::::::::::: MAP MODULE :::::::::: \\
// ::::::::::::::::::::::::::::::::: \\
Module.Map = (function(){
  var map, dialog, parcels
  require([
    "esri/map", "esri/layers/FeatureLayer", "esri/InfoTemplate", "esri/renderers/SimpleRenderer", "dijit/TooltipDialog", "dojo/_base/connect", "dojo/domReady!"
    ], function(
      Map, FeatureLayer, InfoTemplate, SimpleRenderer, TooltipDialog, connect
      ) {
        // :::: SET MAP :::: \\
        map = new Map("mapDiv", {
          basemap: "streets",
          center: [-92.100, 46.786],
          zoom: 17,
          slider: false,
          basemap: "topo"
        });

        // :: INSTANTIATE PARCEL LAYER :: \\
        parcels = new FeatureLayer("http://gis.stlouiscountymn.gov/arcgis/rest/services/GeneralUse/OpenData/MapServer/7", {
          // parcels = new FeatureLayer("http://gis.bolton-menk.com/arcdev/rest/services/MN_GIS/Duluth_Parcels/MapServer/1", {
            mode: FeatureLayer.ON_DEMAND,
            infoTemplate: Module.Style.getInfoTemplate(),
            outFields: ['*']
          });

        // :: PARCEL LAYER PROPERTIES :: \\
        // SET RENDERER \\
        parcels.setRenderer(new SimpleRenderer(Module.Style.getSymbol().parcels));
        // FILTER OUT ROW VALUES \\
        parcels.setDefinitionExpression("PRCL_NBR <> 'Dedicated ROW'");
        // ADD PARCEL LAYER \\
        map.addLayer(parcels);

        // :: SET SCALE DEPENDENCY ON PARCELS :: \\
        dojo.connect(map, "onZoomEnd", function(evt){
          if (map.getScale() > 9050){
            parcels.hide();
          }else{
            parcels.show();
          }
        });

      // :: POPUP EVENTS :: \\
      // DIALOG ADJUSTMENTS \\
      connect.connect(Module.Style.getPopup(map),"onMaximize",function(){
        $('.space-table td').addClass('expand')
      });
      connect.connect(Module.Style.getPopup(map),"onRestore",function(){
        $('.space-table td').removeClass('expand');
      });
      });
  return{
    // EXPOSE MAP AND PARCELS OBJECTS \\
    getMapInfo: function(){
      return {map: map, parcels: parcels}
    }
  }
})();

// ::::::::::::::::::::::::::::::::: \\
// :::::::::: DRAW MODULE :::::::::: \\
// ::::::::::::::::::::::::::::::::: \\
Module.Draw = (function() {
  // EXPOSE ARCGIS API MODULES TO REST OF DRAW MODULE \\ 
  var ArcGISMod = {};
  require(["esri/toolbars/draw", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/renderers/SimpleRenderer", "esri/Color", "esri/graphic", "esri/tasks/query"], function(Draw, SimpleFillSymbol, SimpleLineSymbol, Renderer, Color, Graphic, Query) {
    ArcGISMod.Draw = Draw;
    ArcGISMod.SimpleFillSymbol = SimpleFillSymbol;
    ArcGISMod.SimpleLineSymbol = SimpleLineSymbol;
    ArcGISMod.Color = Color;
    ArcGISMod.Graphic = Graphic;
    ArcGISMod.Query = Query;
    ArcGISMod.Renderer = Renderer;
  });
  return {
    // INITIALIZE DRAW \\
    init: function(map) {
      // INITIALIZE SELECTION COMPONENTS \\
      var selectionSet = {
        graphic: new ArcGISMod.Graphic(),
        freeDraw: new ArcGISMod.Draw(map),
        Draw: ArcGISMod.Draw,
        symbol: Module.Style.getSymbol().draw,
        selectQuery: new ArcGISMod.Query()
      }
      return selectionSet;
    },
    select: function(geom, layer, type, callback) {
      // CLEAN UP MAP \\ 
      Module.Map.getMapInfo().map.graphics.clear();
      Module.Map.getMapInfo().map.infoWindow.set("popupWindow", false);
      Module.Map.getMapInfo().map.infoWindow.set('highlight',false);
      // INITIALIZE DRAW TOOL \\
      var draw = this.init(Module.Map.getMapInfo().map);
      // ACTIVATE FREEDRAW TOOL \\
      draw.freeDraw.activate(draw.Draw.FREEHAND_POLYGON);
      // DRAW EVENT HANDLER \\
      draw.freeDraw.on("draw-complete", function(rsp) {
        draw.graphic.geometry = rsp.geometry;
        draw.graphic.symbol = draw.symbol;
        // SET SELECT QUERY GEOMETRY \\
        draw.selectQuery.geometry = rsp.geometry;
        // SET PARCELS FIELDS OFF OF FEATURE LAYER FIELDS DEFINITION \\
        var fields = layer.fields;
        // CREATE JSON OBJECT TO STORE SELECTION FEATURES \\ 
        var JSONinput = {fields: fields,
          features: []
        }
        // EXECUTE SELECT FEATURES ON PARCELS \\
        layer.selectFeatures(draw.selectQuery).then(function(rsp) {
          Module.Map.getMapInfo().map.graphics.clear();
          // SET SYMBOL FOR FEATURES SELECTED \\
          var symbol = Module.Style.getSymbol().selection;
          // ITERATE THROUGH SELECTION RESPONSE \\
          rsp.forEach(function(v, i) {
            // CREATE GRAPHICS LAYER FOR THE SELECTION SYMBOL \\
            var selectGraphic = new ArcGISMod.Graphic();
            selectGraphic.setSymbol(symbol);
            selectGraphic.geometry = v.geometry;
            // ADD SELECTED GRAPHIC TO THE MAP'S GRAPHICS LAYER \\
            Module.Map.getMapInfo().map.graphics.add(selectGraphic);
            // IF GEOMETRY IS NEEDED EXTRACT GEOMETRY \\
            if(geom){
            JSONinput.features.push({geometry: v.geometry, attributes: v.attributes});
            }else{
            JSONinput.features.push({attributes: v.attributes}); 
            }
          });
          // PUSH SELECTED FEATURES TO INFOWINDOW'S SELECTION IN POPUP \\
          Module.Map.getMapInfo().map.infoWindow.setFeatures(rsp);
          // PRELOAD GP FUNCTION WITH SELECTED FEATURES FROM SELECTION \\
          Module.GP.getData(JSONinput);
          // INVOKE CALLBACK \\
          callback(JSONinput, type);
        });
      });
      return draw;
    },
    deselect: function(draw){
      // DEACTIVATE DRAW EVENT HANDLER \\
      draw.freeDraw.deactivate();
      Module.Map.getMapInfo().map.infoWindow.set("popupWindow", true);
      Module.Map.getMapInfo().map.infoWindow.set('highlight',true);
      Module.Map.getMapInfo().map.infoWindow.fillSymbol = Module.Style.getSymbol().selection;
      Module.Map.getMapInfo().map.graphics.clear();
    }
  }
})();