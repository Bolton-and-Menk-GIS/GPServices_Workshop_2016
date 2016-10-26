
// :::::::::::: TOOL ACTIVATION UI :::::::::::: \\
$(function() {
  // MENU BAR DROPDOWN \\
  $('#info').hover(function() {
    $('.menuItem').slideToggle(function() {});
  });
  // :: GIVE DRAW AND MAPCLICK SCOPE OUTSIDE OF ONCLICK EVENTS :: \\
  var draw;
  var mapClick;
  // MENU ITEM CLICK HANDLERS \\
  $('.menuItem').click(function() {
    UI.Dialog().hide('fast');
    // :: CHECK IF SELECTED ELEMENT IS ACTIVE IF NOT ACTIVATE :: \\
    if (!($(this).hasClass('active'))) {
      $(this).addClass('active');
      $(this).siblings().removeClass('active');
      // MAILING LABELS \\
      if ($(this).attr('id') == 'mailingItem') {
        if (mapClick) {
          // IF MAP CLICK IS REGISTERED UNHOOK IT \\
          mapClick.remove();
        }
        if (draw) {
          // IF DRAW ACTIVE DEACTIVATE DRAW \\
          Module.Draw.deselect(draw);
        }
        var label = "<b><u>Mailing Labels</u></b>";
        // SHOW TOOLTIP ON ELEMENT ITEM CLICK \\
        UI.showToolTip().show(label);

        // CALL SELECT METHOD ON DRAW \\
        draw = Module.Draw.select(false, Module.Map.getMapInfo().parcels, 'mailingLabels', showDialog);
        // WHEN DONE EXECUTING CALL SHOW DIALOG \\
      }
      // FEATURE EXPORT \\
      else if ($(this).attr('id') == 'exportFtrsItem') {
        if (mapClick) {
          mapClick.remove();
        }
        if (draw) {
          Module.Draw.deselect(draw);
        }
        var label = "<b><u>Export Features</u></b>";
        UI.showToolTip().show(label);
        // CALL SELECT METHOD ON DRAW \\
        draw = Module.Draw.select(true, Module.Map.getMapInfo().parcels, 'ftrExport', showDialog);
        // WHEN DONE EXECUTING CALL SHOW DIALOG \\

        // MAP EXPORT \\
      } else {
        if (mapClick) {
          mapClick.remove();
        }
        if (draw) {
          Module.Draw.deselect(draw);
        }
        // CLEAR FEATURES HIDE INFO WINDOW \\
        Module.Map.getMapInfo().map.infoWindow.hide();
        Module.Map.getMapInfo().map.infoWindow.clearFeatures();

        var label = "<b><u>Export Property Map</u></b>";
        var mode = 'PropertyMap';
        UI.showToolTip().show(label, mode);
        mapClick = Module.Map.getMapInfo().map.on("click", function(ftr) {
          var selectedFeature = Module.Map.getMapInfo().map.infoWindow.getSelectedFeature();
          Module.GP.getData(selectedFeature);
          UI.Dialog().toolUI.show(ftr, mode);
        });
      }
      // CLEANUP INACTIVE ELEMENT PROPERTIES \\
    } else {
      $(this).removeClass('active');
      if (mapClick) {
        mapClick.remove();
      }
      if (draw) {
        Module.Draw.deselect(draw);
      }
      Module.Map.getMapInfo().map.infoWindow.hide()
      Module.Map.getMapInfo().map.infoWindow.clearFeatures();
      UI.Dialog().hide();
    }
    // TOOLUI CALLBACK WHEN GP PROCESS HAS FINISHED  \\
    function showDialog(JsonInput, type) {
      // from Draw.Select() callback > returns JsonInput \\
      UI.Dialog().toolUI.show(JsonInput.features, type);
    }
  });
});

// ::::: UI MODULE ::::: \\
var UI = (function() {
  return {
    Dialog: function() {
      UI.showToolTip().hide();
      return {
        // :::: EXPORT UI :::: \\
        toolUI: {
          show: function(features, type) {
            UI.Dialog().clear();
            $('.dlgbox').fadeIn('slow');
            // SELECTED FEATURE ARRAY \\
            var ftrs = [];
            if (features) {
              ftrs = features;
            }

            // :::: POPULATE MAILING LABEL UI DIALOG :::: \\
            if (type == 'mailingLabels') {
              var h3 = 'Mailing Label';
              // SET HEADER TEXT \\
              $('.dlg-header').append('<h1>Mailing Labels</h1>');
              $('#content').append('<h2># of Parcels Selected: ' + ftrs.length + '</h2>');
              $('#content').append('<div class="ddDsc"><h3>Mailing Label Type</h3></div>');
              $('.ddDsc').append('<select id="mailPckr" class="picker"><option select>Owner</option><option>Taxpayer</option><option>Current</option></select>').append('<i id="runMail" class="fa fa-check" aria-hidden="true" title="Run Mailing Labels"></i>').append('<div id="dl" style="margin-top: 14px; padding-left: 45%;"></div>').append('<div id="aliaschkdiv">Alias Fields<i id="aliaschk" class="fa fa-check-square-o" aria-hidden="true"></i></div>');
              // :::: EVALUATE CHECKBOX STATE :::: \\
              $('#aliaschk').click(function() {
                if (UI.Dialog().getFormProps().aliaschk) {
                  $(this).removeClass('fa-check-square-o');
                  $(this).addClass('fa-square-o');
                } else {
                  $(this).removeClass('fa-square-o');
                  $(this).addClass('fa-check-square-o');
                }
              });

              // :::: POPULATE EXPORT FEATURE UI DIALOG :::: \\
            } else if (type == 'ftrExport') {
              // SET HEADER TEXT \\
              $('.dlg-header').append('<h1 style="padding-left: 7%;">Export Features</h1>');
              var h3 = 'Export Features';
              $('#content').append('<h2># of Parcels Selected: ' + ftrs.length + '</h2>');
              $('#content').append('<div style="width: 350px; height: 0px;" class="ddDsc"><div style="display:flex; padding-top: 5px;"><h3 style="text-indent: 0; margin-left:4%">Feature Export Name</h3><div class="ui-widget" contenteditable="true" id="dataExpTitle" placeholder="' + Module.Map.getMapInfo().parcels.name + '" style="cursor: text;"></div></div></div>');
              $('.ddDsc').append('<div id="formatChk" style="display: flex; margin-left: 25px;">File GeoDatabase<i id="gdbchk" class="fa fa-check-square-o dataType" aria-hidden="true"></i>Shapefile<i id="shpchk" class="fa fa-square-o dataType" aria-hidden="true"></i><i style="margin-top: -1%; right:0" id="runFtrExp" class="fa fa-check" aria-hidden="true" title="Run Feature Export"></i></div>').append('<div id="dl"></div>');
              
              // :::: DATA FORMAT CHECKBOX UI | GDB/SHP :::: \\
              $('.dataType').click(function() {
                if (UI.Dialog().getFormProps().GDBchk) {
                  $(this).removeClass('fa-square-o');
                  $(this).addClass('fa-check-square-o');
                  $(this).siblings('.dataType').addClass('fa-square-o');
                  $(this).siblings('.dataType').removeClass('fa-check-square-o');
                } else {
                  $(this).removeClass('fa-square-o');
                  $(this).addClass('fa-check-square-o');
                  $(this).siblings('.dataType').addClass('fa-square-o');
                  $(this).siblings('.dataType').removeClass('fa-check-square-o');
                }
              });
            }

            // :::: POPULATE EXPORT PROPERTY MAP UI DIALOG :::: \\
            else {
              $('#content').append('<h2 style="text-indent: 20%;">Export Map Properties</h2>');
              $('#content').append('<div class="ddDsc" style="display: flex;"><h3 style="text-indent: 0; margin-left: 24px; margin-top: 4px; padding-right: 15px;">Resolution</h3></div>')
              $('.ddDsc').append('<div id="resDiv">50<input id="resSlider" type="range" min="50" max="300" step="50" />300</div>')
              $('#content').append('<div class="ddOr" style="display: flex; margin-top: 12px;"><h3 style="text-indent: 0; margin-left: 44px; margin-top: 4px; padding-right: 15px;">Orientation</h3></div>')
              $('.ddOr').append('<select style="margin-left:0; margin-top:0; height:25px; width: 120px;" id="OrntPcker" class="picker"><option select>Portrait</option><option>Landscape</option></select>').append('<i id="runProp" class="fa fa-check" aria-hidden="true" style="margin-top: -1%;" title="Run Property Map Export"></i>');
              $('.ddOr').append('<div style="margin-left:-290px; margin-top:39px;" id="dl"></div>');
              $('.dlg-header').append('<h1 style="font-size: 20pt; padding-left: 5%;">Export Property Map</h1>');
              
              // SLIDER TOOLTIP SHOW SLIDER VALUE \\
              $('#resSlider').val('150').attr('title', $('#resSlider').val());
              $('#resSlider').change(function() {
                $('#resSlider').attr('title', $('#resSlider').val())
              })
            }

            // :: RUN INPUT TO PREPARE SELECTION SET FOR GP TASK :: \\
            UI.Dialog().toolUI.runInput();
          },

          // EVALUATES SUBMIT BUTTON CLICKED (VISIBLE CHECKBOX) \\
          runInput: function() {
            // RUN METHOD HELPER FUNCTION \\
            $('.fa-check').click(function() {
              $('#aliaschkdiv').hide();
              // SHOW DOWNLOAD PROGRESS UI (PROGRESS SPINNER) \\
              UI.Dialog().download.progress();
              // STAGE RUN GP TOOL FOR MAILING LABELS \\
              if ($(this).attr('id') == 'runMail') {
                var GPToolProcess = 'mailingLabels';
                UI.Dialog().run(GPToolProcess);

              // STAGE RUN GP TOOL FOR FEATURE EXPORT \\
              } else if ($(this).attr('id') == 'runFtrExp') {
                var GPProcess = 'featureExport';
                UI.Dialog().run(GPProcess, 'asynchronous');
                var name = Module.Map.getMapInfo().parcels.name;
                if ($('#dataExpTitle').html()) {
                  name = $('#dataExpTitle').html();
                }
              }
              // STAGE RUN GP TOOL FOR EXPORT PROPERTY MAP \\
              else {
                var GPProcess = 'propertyMap';
                UI.Dialog().run(GPProcess, 'asynchronous');
              }
            });
          }
        },

        // CALLS GPTOOLS MODULE METHOD TO EXECUTE GP TASK \\
        run: function(prcs, async) {
          // EVALUATES PROCSS ARG AND INVOKES CORRESPONDING GPTool FUNCTION TO RUN GP PROCESS \\
          Module.GP.run[prcs](function(rslt) {
            // CHECK IF TASK IS SYNCHRONOUS OR ASYNCHRONOUS \\
            if (async) {
              UI.Dialog().download.complete(rslt, 'asynchronous');
            } else {
              UI.Dialog().download.complete(rslt);
            }
          });
        },

        // :: DOWNLOAD UI :: \\
        download: {
          progress: function() {
            $('#dlPrg').remove();
            $('#dlc').remove();
            $('#dl').empty();
            // SHOW PROGRESS SPINNER FOR LOADING FEEDBACK \\
            $('#dl').append('<i id="dlPrg"  style="font-size: 1.5em; display: none;" class="fa fa-cog fa-spin fa-3x fa-fw"></i><span class="sr-only"></span>');
            $('#dlPrg').fadeIn(500);
          },
          // SHOW DOWNLOAD BUTTON WHEN PROCESS IS COMPLETE \\
          complete: function(jobRslt, async) {
            // JOBRSLT = ARGUMENT CALLBACK GP RESULTS \\
            // ASYNC = ARGUMENT FOR GP TYPE \\
            $('#dlPrg').fadeOut(function() {
              $('#dl').append('<i id="dlc" class="fa fa-download" aria-hidden="true"></i>');
              $('#dlc').fadeIn(500);
              $('#dlc').click(function() {
                if (async) {
                  window.open(jobRslt.value);
                } else {
                  window.open(jobRslt[0].value);
                }
              })
            });
          },
          error: function(err) {
            $('#dl').empty();
            $('#dl').append('<div style="margin-left: -105px; color:red;">' + err + '</div>');
          }
        },
        // :: HIDE DIALOG :: \\
        hide: function(duration) {
          var speed = duration;
          if (!(duration)) {
            var spd = '400';
          }
          $('.dlgbox').fadeOut(spd);
        },
        // :: EMPTY DIALOG :: \\
        clear: function() {
          $('#content').empty();
          $('.dlg-header').empty();
        },
        
        // ::: FORM STATE ::: \\
        // GET FORM HELPER FUNCTION \\
        getFormProps: function() {
          var mailOpt;
          var GDBchk;
          var orientOpt;
          var sliderVal;
          var aliaschk;
          var dataExpTitle;

          // MAILING LABELS DROPDOWN VALUE | MAILING LABELS \\
          if ($('#mailPckr option:selected').val() == 'Owner') {
            mailOpt = 'Owner';
          } else if ($('#mailPckr option:selected').val() == 'Taxpayer') {
            mailOpt = 'Taxpayer';
          } else {
            mailOpt = 'Current';
          }

          // ALIAS CHECK BOX VALUE | MAILING LABELS \\
          if ($('#aliaschk').hasClass('fa-check-square-o')) {
            aliaschk = true;
          } else {
            aliaschk = false;
          }

          // DATA FORMAT (GDB/SHP) CHECK BOX VALUE | FEATURE EXPORT \\
          if ($('#gdbchk').hasClass('fa-check-square-o')) {
            GDBchk = true;
          } else {
            GDBchk = false;
          }
          if ($('#dataExpTitle').html()) {
            dataExpTitle = $('#dataExpTitle').html();
          } else {
            dataExpTitle = Module.Map.getMapInfo().parcels.name;
          }

          // SLIDER VALUE | PROPERTY MAP EXPORT \\
          sliderVal = $('#resSlider').val();

          // ORIENTATION DROPDOWN VALUE | PROPERTY MAP EXPORT \\
          if ($('#OrntPcker option:selected').val() == 'Portrait') {
            orientOpt = 'Portrait';
          } else {
            orientOpt = 'Landscape'
          }

          // :: RETURN DIALOG INPUT STATES :: \\
          return {
            mailOpt: mailOpt,
            orientOpt: orientOpt,
            sliderVal: sliderVal,
            aliaschk: aliaschk,
            dataExpTitle: dataExpTitle,
            GDBchk: GDBchk
          }
        }
      }
    },
    // ::: TOOLTIP DIALOG ::: \\
    showToolTip: function() {
      $('.dlgTT').show();
      return {
        // :: SHOW TOOLIP :: \\
        show: function(label, mode) {
          $('#tooltipDlg').empty();
          if (mode) {
            $('#tooltipDlg').append("<div style='margin-top: 2%'>" + label + " <br>Click parcel on map</div");
          } else {
            $('#tooltipDlg').append("<div style='margin-top: 2%'>" + label + " <br>Draw to select parcels on map</div");
          }
        },
        // :: HIDE TOOLIP :: \\
        hide: function() {
          $('.dlgTT').hide();
        }
      }
    }
  }
})();