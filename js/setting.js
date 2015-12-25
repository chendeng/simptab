
define([ "jquery" ], function( $ ) {

    "use strict";

    var setting = (function () {

        // private
        // [ "0:false", "1:false", "2:false", "3:false", "4:false", "5:false", "6:false", "7:false", "8:false" ]
        var defaultOrigins = (function() {
            var origins = [];
            $( ".originstate" ).children().each( function( idx ) {
                origins.push( idx + ":false" );
            });
            return origins;
        })();

        function getCurrentOrigin() {
            try {
                var origins = JSON.parse(localStorage["simptab-background-origin"] || "[]" );
            }
            catch ( error ) {
                origins = [];
            }
            return origins;
        }

        function getMode( mode, value ) {
            if ( !localStorage[mode] ) localStorage[mode] = value;
            return localStorage[mode];
        }

        function Setting() {

            this.origins = getCurrentOrigin();

            this.mode = {
                "changestate" : {
                    value : getMode( "simptab-background-mode",  $( ".changestate" ).find( ".lrselected input" ).val() ),
                    type  : "simptab-background-mode"
                },
                "clockstate" : {
                    value : getMode( "simptab-background-clock", $( ".clockstate"  ).find( ".lrselected input" ).val() ),
                    type  : "simptab-background-clock"
                },
                "tsstate" : {
                    value : getMode( "simptab-topsites",          $( ".tsstate"    ).find( ".lrselected input" ).val() ),
                    type  : "simptab-topsites"
                }
            };

        }

        Setting.prototype.Correction = function() {
            var len     = this.origins.length;
            if ( defaultOrigins.length > len ) {
                for( var i = 0; i < defaultOrigins.length - len; i++ ) {
                    this.origins.splice( this.origins.length, 0, defaultOrigins[this.origins.length] );
                }
                this.Save();
            }
            else if ( defaultOrigins.length < len ) {
                this.origins = this.origins.slice( 0, defaultOrigins.length );
                this.Save();
            }
        }

        Setting.prototype.Save = function() {
            localStorage["simptab-background-origin"] = JSON.stringify( this.origins );
        }

        Setting.prototype.UpdateRdState = function( selector, mode ) {
            $( "." + selector ).find( "input" ).each( function( idx, item ) {
                if ( $(item).val() == mode ) {
                    $(item).attr( "checked", "checked"      );
                    $(item).prev().attr( "class", "checked" );
                    $(item).parent().addClass( "lrselected" );
                }
                else {
                    $(item).attr( "checked", false             );
                    $(item).prev().attr( "class", "unchecked"  );
                    $(item).parent().removeClass( "lrselected" );
                }
            });
        }

        Setting.prototype.UpdateMode = function( type, mode ) {
            this.mode[type].value = mode;
            localStorage[ this.mode[type].type ] = mode;
        }

        Setting.prototype.AddClickEvent = function( selctor, callback ) {
            $( "." + selctor +  " input" ).click( callback );
        }

        return new Setting();
    })();

    function initLR() {
        $( ".lineradio" ).each( function( index, item ) {
            if ( $( item ).hasClass("lrselected") ) {
                $( item ).prepend( '<span class="checked"></span>' );
                $( item ).find( "input" ).attr( "checked", true    );
            }
            else {
                $( item ).prepend( '<span class="unchecked"></span>' );
            }
        });
    }

    function updateLR( $target ) {
        updateLrIcon( $target );
        updateLrState( $target );
    }

    function updateLrIcon( $target ) {
        var $current = $target.parent(),
            $prev    = $current.prev(),
            $next    = $current.next();

        if ( $prev.find( "span" ).length > 0 ) {
            $prev.find( "span"  ).attr( "class", "unchecked" );
            $prev.find( "input" ).attr( "checked", false );
        }
        else {
            $next.find( "span"  ).attr( "class", "unchecked" );
            $next.find( "input" ).attr( "checked", false );
        }
        $current.find( "span"  ).attr( "class", "checked"    );
        $current.find( "input" ).attr( "checked", true    );
    }

    function updateLrState( $target ) {
        var $current = $target.parent(),
            $prev    = $current.prev(),
            $next    = $current.next();

        if ( $prev.length > 0 ) {
            $prev.attr( "class", "lineradio" );
        }
        else {
            $next.attr( "class", "lineradio" );
        }
        $current.attr( "class", "lineradio lrselected" );
    }

    function updateOriginState( $target, type ) {
        var $prev   = $($target.prev()),
            $parent = $($target.parent()),
            value   = $target.attr("value"),
            checked = "checked",
            inputel = "true",
            divel   = "lineradio lrselected";

        if ( type == "init" ) {
            value = value == "true" ? "false" : "true";
        }

        if ( value == "true" ) {
            checked = "unchecked";
            inputel = "false";
            divel   = "lineradio";
        }

        $target.attr( "value", inputel  );
        $prev.attr(   "class", checked  );
        $parent.attr( "class", divel    );
    }

    function updateLocalStorge( $target ) {
        var index = $target.attr("name"),
            value = $target.attr("value"),
            item  = setting.origins[index];

        // update arr[index] to new value
        setting.origins.splice( index, 1, index + ":" + value );

        // update local storge
        setting.Save();

    }

    return {
        Init: function() {

            // init line radio
            initLR();

            // update changestate lineradio
            setting.UpdateRdState( "changestate", setting.mode["changestate"].value );

            // update clockstate lineradio
            setting.UpdateRdState( "clockstate",  setting.mode["clockstate"].value  );
            /*
            var mode      = localStorage["simptab-background-clock"],
                checked   = $( ".clockstate input[value=" +  mode + "]" );
            if ( mode != undefined ) {
                updateLR( checked );
            }
            */

            // update originstate lineradio
            setting.Correction();
            var mode = setting.origins;
            $(".originstate").find("input").each( function( idx, item ) {
                $(item).attr( "value", mode.length == 0 ? false : mode[idx] && mode[idx].split(":")[1] );
                updateOriginState( $(item), "init" );
            });

            // update topsites lineradio
            setting.UpdateRdState( "tsstate", setting.mode["tsstate"].value );

        },

        Listen: function ( callback ) {

            // background state
            setting.AddClickEvent( "changestate", function( event ) {
                var mode    = $(event.currentTarget).attr( "value" );
                setting.UpdateRdState( "changestate", mode );
                setting.UpdateMode(    "changestate", mode );
            });

            // clock state
            setting.AddClickEvent( "clockstate", function( event ) {
                var mode    = $(event.currentTarget).attr( "value" );
                setting.UpdateRdState( "clockstate", mode );
                setting.UpdateMode(    "clockstate", mode );
                callback( "clock", mode );
            });

            /*
            $( ".clockstate input" ).click( function( event ) {

                localStorage["simptab-background-clock"] = $(event.currentTarget).attr( "value" );
                updateLR( $( event.currentTarget ));

                if ( localStorage["simptab-background-clock"] == "show") {
                    date.Show();
                }
                else {
                    date.Hide();
                }
            });
            */

            // background origin state
            $( ".originstate input" ).click( function( event ) {
                updateOriginState( $( event.currentTarget ), "update" );
                updateLocalStorge( $( event.currentTarget ));
            });

            // topsites state
            //$( ".tsstate input" ).click( function( event ) {
            setting.AddClickEvent( "tsstate", function( event ) {
                var mode    = $(event.currentTarget).attr( "value" );
                setting.UpdateRdState( "tsstate", mode );
                setting.UpdateMode(    "tsstate", mode );
                callback( "topsites", mode );
            });

        },

        Mode: function( type ) {
            return setting.mode[type].value;
        },

        /*Get: function ( state ) {

            if ( state == "changestate" ) {
                return $( ".changestate input[value=day]" ).attr( "checked" );
            }
            else if ( state == "clockstate" ) {
                return $( ".clockstate input[value=show]" ).attr( "checked" );
            }

        },*/

        IsRandom: function() {
          var mode = localStorage["simptab-background-mode"];
          // when undefined same as time
          if ( mode == undefined || mode == "time" ) {
            return true;
          }
          else {
            return false;
          }
        },

        Verify: function( idx ) {
            var value = setting.origins[idx],
                value = value || idx + ":" + "true";

            return value.split(":")[1];
        }

    };
});
