// ::::: GEOPROCESSING FUNCTIONS ::::: \\
Module.GP = (function() {
  var GP;
  var featureSet;
  require(["esri/tasks/Geoprocessor"], function(Geoprocessor) {
    GP = Geoprocessor;
  });
  return {
    run: {
      // :::: MAILING LABEL EXPORT OPERATION :::: \\ 
      mailingLabels: function(callback) {
        // :::: SET GP PARAMATERS :::: \\
        // CHECK DROPDOWN VALUES \\
        // OWNER \\
        if (UI.Dialog().getFormProps().mailOpt == 'Owner') {
          var gpParams = {
            "Features": JSON.stringify(featureSet),
            "OwnerFields": 'ATTN: {OWNAME}',
            "AddressFields": '{OWADR1}',
            "CityStateZipFields": '{OWADR2}',
            "UseAliases": UI.Dialog().getFormProps().aliaschk
          }
        } else if (UI.Dialog().getFormProps().mailOpt == 'Taxpayer') {
          // TAXPAYER \\
          var gpParams = {
            "Features": JSON.stringify(featureSet),
            "OwnerFields": "ATTN: {TXNAME}",
            "AddressFields": '{TXADR1}',
            'CityStateZipFields': '{TXADR2}',
            "UseAliases": UI.Dialog().getFormProps().aliaschk
          }
        } else {
          // CURRENT \\
          var gpParams = {
            "Features": JSON.stringify(featureSet),
            "OwnerFields": 'CURRENT RESIDENT',
            "AddressFields": '{PHYSADDR}',
            'CityStateZipFields': '{PHYSCITY}, MN {PHYSZIP}',
            "UseAliases": UI.Dialog().getFormProps().aliaschk
          }
        }

         // :::: MAILING LABELS GP REST ENDPOINT :::: \\
        var gp = new GP('http://gis.bolton-menk.com/bmigis/rest/services/MN_GIS/ExportMailingLabels/GPServer/Export%20Mailing%20Labels');
        // EXECUTE GP PROCESS INVOKE CALLBACK WITH RESULTS \\
        // EXECUTE METHOD = SYNCHRONOUS GP TASK \\
        gp.execute(gpParams, callback, function(err) {
          UI.Dialog().download.error('Error Running Mailing Labels')
        });
      },
      // :::: FEATURE EXPORT OPERATION :::: \\ 
      featureExport: function(callback) {
        // :::: SET GP PARAMATERS :::: \\
        // :::: SET GP PARAMATERS :::: \\
        var gpParams = {
            "Features": JSON.stringify(featureSet),
            "OutputName": UI.Dialog().getFormProps().dataExpTitle,
            "GDB": UI.Dialog().getFormProps().GDBchk
          }
          // :::: FEATURE EXPORT GP REST ENDPOINT :::: \\
        var gp = new GP('http://gis.bolton-menk.com/bmigis/rest/services/MN_GIS/ExportFeatures/GPServer/Export%20Features');
        // CALL SUBMIT JOB METHOD PASS IN PARAMS \\
        // SUBMITJOB METHOD = ASYNCHRONOUS GP TASK \\
        gp.submitJob(gpParams, function(res) {
          gp.getResultData(res.jobId, "OutURL", callback);
        }, function(status) {
          if (status.jobStatus == 'esriJobFailed') {
            UI.Dialog().download.error('Error Running Export Features');
          }
        });
      },
      // :::: PROPERTY MAP EXPORT OPERATION :::: \\
      propertyMap: function(callback) {
        // EXPORT MAP JSON DEFINITION \\
        var webMapDef = {
            "mapOptions": {
              "extent": Module.Map.getMapInfo().map.extent.toJson()
            },
            "operationalLayers": [{
              "opacity": Module.Map.getMapInfo().parcels.opacity,
              "title": Module.Map.getMapInfo().parcels.name,
              "url": Module.Map.getMapInfo().parcels.url,
              "selectionSymbol": Module.Style.getSymbol().exportMapSelect.toJson(),
              "selectionObjectIds": [
                Module.Map.getMapInfo().map.infoWindow.getSelectedFeature().attributes.OBJECTID
              ],
              "layerDefinition": {
                "drawingInfo": {
                  "renderer": Module.Style.getSymbol().renderer.toJson()
                },
                "definitionExpression": Module.Map.getMapInfo().parcels.getDefinitionExpression()
              }
            }],
            "baseMap": {
              "baseMapLayers": [{
                "url": "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
              }],
              "title": "ESRI Imagery"
            }
          }
          // SET SELECTED FEATURE TO VALUE STORED WITH FEATURESET \\
        var selectedFeature = Module.Map.getMapInfo().map.infoWindow.getSelectedFeature();
        // BUILD EXPORT PROPERTY CARD GP PARAMETERS \\
        var gpParams = {
            "Feature": JSON.stringify(selectedFeature.toJson()),
            "WebMap": JSON.stringify(webMapDef),
            "FieldMap": JSON.stringify(FieldMapDef),
            "Resolution": UI.Dialog().getFormProps().sliderVal,
            "Orientation": UI.Dialog().getFormProps().orientOpt
          }

          // :: INSTANTIATE MAP EXPORT GP OBJECT FROM GP CLASS PASSING IN REST ENDPOINT :: \\
        var gp = new GP('http://gis.bolton-menk.com/bmigis/rest/services/MN_GIS/ExportPropertyCard/GPServer/Export%20Property%20Card');
        // CALL SUBMIT JOB METHOD PASS IN PARAMS \\
        // SUBMITJOB METHOD = ASYNCHRONOUS GP TASK \\
        gp.submitJob(gpParams, function(res) {
          gp.getResultData(res.jobId, "OutURL", callback);
        }, function(status) {
          if (status.jobStatus == 'esriJobFailed') {
            UI.Dialog().download.error('Error Running Property Map');
          }
        });
      }
    },
    // :::: SET FEATURE SET FROM DRAW SELECTION OPERATION :::: \\
    getData: function(fs) {
      featureSet = fs;
    }
  }
})();