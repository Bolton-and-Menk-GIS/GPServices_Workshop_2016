// ::::::::::::::::::::::::::::::::::::: \\
// :::::::::: MAP STYLE MODULE ::::::::: \\
// :::::::::: HELPER FUNCTION :::::::::: \\
// ::::::::::::::::::::::::::::::::::::: \\
Module.Style = (function() {
  return {
    getSymbol: function() {
      var ArcGISMod = {};
      require(["esri/renderers/SimpleRenderer", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color"], function(Renderer, SimpleFillSymbol, SimpleLineSymbol, Color, InfoTemplate) {
        ArcGISMod.Renderer = Renderer;
        ArcGISMod.SimpleFillSymbol = SimpleFillSymbol;
        ArcGISMod.SimpleLineSymbol = SimpleLineSymbol;
        ArcGISMod.Color = Color;
      });
      symbol = {
      // PARCEL LAYER SYMBOL \\
      parcels: new ArcGISMod.SimpleFillSymbol(ArcGISMod.SimpleFillSymbol.STYLE_SOLID, new ArcGISMod.SimpleLineSymbol(ArcGISMod.SimpleLineSymbol.STYLE_SOLID, new ArcGISMod.Color([255, 255, 255, 0.35]), 1), new ArcGISMod.Color([125, 125, 125, 0.35])),
      // SELECTION SYMBOL \\
      selection: new ArcGISMod.SimpleFillSymbol(ArcGISMod.SimpleFillSymbol.STYLE_SOLID, new ArcGISMod.SimpleLineSymbol(ArcGISMod.SimpleLineSymbol.STYLE_SOLID, new ArcGISMod.Color([172, 11, 48]), 3), new ArcGISMod.Color([99, 247, 221, 0.35])),
      // DRAW TOOL SYMBOL \\
      draw: new ArcGISMod.SimpleFillSymbol(ArcGISMod.SimpleFillSymbol.STYLE_SOLID, new ArcGISMod.SimpleLineSymbol(ArcGISMod.SimpleLineSymbol.STYLE_SOLID, new ArcGISMod.Color(["#000"]), 1), new ArcGISMod.Color([99, 247, 221, 0.35])),
      // EXPORT SELECTION MAP SYMBOL \\
      exportMapSelect: new ArcGISMod.SimpleFillSymbol(ArcGISMod.SimpleFillSymbol.STYLE_NULL, new ArcGISMod.SimpleLineSymbol(ArcGISMod.SimpleLineSymbol.STYLE_SOLID, new ArcGISMod.Color([210, 194, 5]), 3)),
      // EXPORT MAP SYMBOL \\
      exportMapParcels: new ArcGISMod.SimpleFillSymbol(ArcGISMod.SimpleFillSymbol.STYLE_SOLID, new ArcGISMod.SimpleLineSymbol(ArcGISMod.SimpleLineSymbol.STYLE_SOLID, new ArcGISMod.Color([255, 255, 255, 0.9]), 2), new ArcGISMod.Color([0, 0, 0, 0]))
    }
    symbol.renderer = new ArcGISMod.Renderer(symbol.exportMapParcels);

    return symbol
  },
  getInfoTemplate: function() {
    var ArcGISMod = {};
    require(["esri/InfoTemplate"], function(InfoTemplate) {
      ArcGISMod.InfoTemplate = InfoTemplate;
    });
    var template = {
      title : "<b style='font-size:11pt;'>${OWNAME}</b>",
      template : "<table class='space-table' cellspacing='0'>" + "<tr><td class='field'><b>Parcel #</b></td><td>${PRCL_NBR}</td></tr>" + "<tr><td class='field'><b>Place</b></td><td>${PLDESC}</td></tr>" + "<tr><td class='field'><b>Land Value</b></td><td>$${LAND_EST}</td></tr>" + "<tr><td class='field'><b>Total Value</b></td><td>$${EstTotalValue}</td></tr>" + "<tr><td class='field' style='border-bottom:0'><b>Acreage</b></td><td style='border-bottom:0'>${ACREAGE}</td></tr></table>"
    }
      // :: INITIALIZE INFOTEMPLATE :: \\
      infoTemplate = new ArcGISMod.InfoTemplate(template.title, template.template);
      // :: INFO TEMPLATE DEFINITION :: \\
      return infoTemplate
    },
    getPopup: function(map) {
        // :: SET POPUP :: \\
        popup = map.infoWindow;
        popup.resize(500, 300);
        popup.highlight = true;
        popup.titleInBody = true;
        popup.domNode.className += " dark";
        popup.fillSymbol = Module.Style.getSymbol().selection;
      // :: SET POPUP :: \\ 
      return popup;
    }
  }
})();