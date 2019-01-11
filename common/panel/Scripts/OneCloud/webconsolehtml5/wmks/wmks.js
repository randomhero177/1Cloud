/*
 * Modified from:
 * http://lxr.mozilla.org/mozilla/source/extensions/xml-rpc/src/nsXmlRpcClient.js#956
 */

/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla XML-RPC Client component.
 *
 * The Initial Developer of the Original Code is
 * Digital Creations 2, Inc.
 * Portions created by the Initial Developer are Copyright (C) 2000
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Martijn Pieters <mj@digicool.com> (original author)
 *   Samuel Sieb <samuel@sieb.net>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/*jslint white: false, bitwise: false, plusplus: false */
/*global console */


function stringFromArray (data) {
   var length = data.length,
      tmp = new Array(Math.ceil(length / 8)),
      i, j;

   for (i = 0, j = 0; i < length; i += 8, j++) {
      tmp[j] = String.fromCharCode(data[i],
                                     data[i + 1],
                                     data[i + 2],
                                     data[i + 3],
                                     data[i + 4],
                                     data[i + 5],
                                     data[i + 6],
                                     data[i + 7]);
   }

   return tmp.join('').substr(0, length);
};


function arrayFromString (str) {
   var length = str.length,
      array = new Array(length),
      i;

   for (i = 0; i+7 < length; i += 8) {
      array[i] = str.charCodeAt(i);
      array[i + 1] = str.charCodeAt(i + 1);
      array[i + 2] = str.charCodeAt(i + 2);
      array[i + 3] = str.charCodeAt(i + 3);
      array[i + 4] = str.charCodeAt(i + 4);
      array[i + 5] = str.charCodeAt(i + 5);
      array[i + 6] = str.charCodeAt(i + 6);
      array[i + 7] = str.charCodeAt(i + 7);
   }

   for (; i < length; i++) {
      array[i] = str.charCodeAt(i);
   }

   return array;
};


var Base64Old = {

/* Convert data (an array of integers) to a Base64 string. */
toBase64Table : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
base64Pad     : '=',

encodeFromArray: function (data) {
    "use strict";
    var result = '',
        chrTable = Base64Old.toBase64Table.split(''),
        pad = Base64Old.base64Pad,
        length = data.length,
        iterLength = length - 2,
        lengthMod3 = length % 3,
        i;
    // Convert every three bytes to 4 ascii characters.
    for (i = 0; i < iterLength; i += 3) {
        result += chrTable[data[i] >> 2];
        result += chrTable[((data[i] & 0x03) << 4) + (data[i+1] >> 4)];
        result += chrTable[((data[i+1] & 0x0f) << 2) + (data[i+2] >> 6)];
        result += chrTable[data[i+2] & 0x3f];
    }

    // Convert the remaining 1 or 2 bytes, pad out to 4 characters.
    if (lengthMod3) {
        i = length - lengthMod3;
        result += chrTable[data[i] >> 2];
        if (lengthMod3 === 2) {
            result += chrTable[((data[i] & 0x03) << 4) + (data[i+1] >> 4)];
            result += chrTable[(data[i+1] & 0x0f) << 2];
            result += pad;
        } else {
            result += chrTable[(data[i] & 0x03) << 4];
            result += pad + pad;
        }
    }

    return result;
},

encodeFromString: function (data) {
    "use strict";
    var result = '',
        chrTable = Base64Old.toBase64Table.split(''),
        pad = Base64Old.base64Pad,
        length = data.length,
        i;
    // Convert every three bytes to 4 ascii characters.
    for (i = 0; i < (length - 2); i += 3) {
       var c0, c1, c2;
       c0 = data.charCodeAt(i);
       c1 = data.charCodeAt(i+1);
       c2 = data.charCodeAt(i+2);
        result += chrTable[c0 >> 2];
        result += chrTable[((c0 & 0x03) << 4) + (c1 >> 4)];
        result += chrTable[((c1 & 0x0f) << 2) + (c2 >> 6)];
        result += chrTable[c2 & 0x3f];
    }

    // Convert the remaining 1 or 2 bytes, pad out to 4 characters.
    if (length%3) {
        var c0, c1, c2;
        c0 = data.charCodeAt(i);
        i = length - (length%3);
        result += chrTable[c0 >> 2];
        if ((length%3) === 2) {
            c1 = data.charCodeAt(i+1);
            result += chrTable[((c0 & 0x03) << 4) + (c1 >> 4)];
            result += chrTable[(c1 & 0x0f) << 2];
            result += pad;
        } else {
            result += chrTable[(c0 & 0x03) << 4];
            result += pad + pad;
        }
    }

    return result;
   },

/* Convert Base64 data to a string */
toBinaryTable : [
    -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1,
    -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1,
    -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,62, -1,-1,-1,63,
    52,53,54,55, 56,57,58,59, 60,61,-1,-1, -1, 0,-1,-1,
    -1, 0, 1, 2,  3, 4, 5, 6,  7, 8, 9,10, 11,12,13,14,
    15,16,17,18, 19,20,21,22, 23,24,25,-1, -1,-1,-1,-1,
    -1,26,27,28, 29,30,31,32, 33,34,35,36, 37,38,39,40,
    41,42,43,44, 45,46,47,48, 49,50,51,-1, -1,-1,-1,-1
],

decodeToArray: function (data) {
    "use strict";
    var binTable = Base64Old.toBinaryTable,
        pad = Base64Old.base64Pad,
        result, result_length, idx, i, c, padding,
        leftbits = 0, // number of bits decoded, but yet to be appended
        leftdata = 0, // bits decoded, but yet to be appended
    data_length, firstPad = data.indexOf('=');

    if (firstPad < 0) {
       data_length = data.length;
    } else {
       data_length = firstPad;
    }


    /* Every four characters is 3 resulting numbers */
    result_length = (data_length >> 2) * 3 + Math.floor((data_length%4)/1.5);
    result = new Array(result_length);

    idx = 0;
    i = 0;

    for (; i+4 < data_length; i += 4, idx += 3) {
       var c0 = binTable[data.charCodeAt(i+0)];
       var c1 = binTable[data.charCodeAt(i+1)];
       var c2 = binTable[data.charCodeAt(i+2)];
       var c3 = binTable[data.charCodeAt(i+3)];

       result[idx+0] = ((c0 << 2) | (c1 >> 4)) & 0xff;
       result[idx+1] = ((c1 << 4) | (c2 >> 2)) & 0xff;
       result[idx+2] = ((c2 << 6) | (c3)) & 0xff;
    }

    // Convert one by one.
    for (; i < data.length; i++) {
        c = binTable[data.charCodeAt(i)];
        padding = (data.charAt(i) === pad);

        // Collect data into leftdata, update bitcount
        leftdata = (leftdata << 6) | c;
        leftbits += 6;

        // If we have 8 or more bits, append 8 bits to the result
        if (leftbits >= 8) {
            leftbits -= 8;
            // Append if not padding.
            if (!padding) {
                result[idx++] = (leftdata >> leftbits) & 0xff;
            }
            leftdata &= (1 << leftbits) - 1;
        }
    }

    // If there are any bits left, the base64 string was corrupted
    if (leftbits) {
        throw {name: 'Base64-Error',
               message: 'Corrupted base64 string'};
    }

    return result;
   },

decodeToString: function (data) {
      return stringFromArray(this.decodeToArray(data));
   },


}; /* End of Base64 namespace */

var Base64New = {
decodeToArray: function (data) {
      return arrayFromString(window.atob(data));
   },

decodeToString: function (data) {
      return window.atob(data);
   },

encodeFromArray: function (data) {
      return window.btoa(stringFromArray(data));
   },

encodeFromString: function (data) {
      return window.btoa(data);
   }
};

if (window.atob) {
   Base64 = Base64New;
} else {
   Base64 = Base64Old;
}

/*
 * wmks/websocketInit.js
 *
 *   WebMKS WebSocket initialisation module for
 *   compatibility with older browsers.
 *
 *   Contains a helper function to inistanciate WebSocket object.
 *
 */


if (window.WebSocket) {
   /*
    * Nothing to do as the browser is WebSockets compliant.
    */
} else if (window.MozWebSocket) {
   window.WebSocket = window.MozWebSocket;
} else {
   (function () {
      window.WEB_SOCKET_SWF_LOCATION = "web-socket-js/WebSocketMain.swf";
      document.write("<script src='web-socket-js/swfobject.js'><\/script>" +
                     "<script src='web-socket-js/web_socket.js'><\/script>");
   }());
}


/*
 *------------------------------------------------------------------------------
 *
 * WMKSWebSocket
 *
 *    Create an alternate class that consumes WebSocket and provides a non-native
 *    code constructor we can use to stub out in Jasmine (a testing framework).
 *
 * Results:
 *    Newly constructed WebSocket.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

function WMKSWebSocket(url, protocol) {
   return new WebSocket(url, protocol);
};

/*
 * wmks/arrayPush.js
 *
 *   Convenience functions for building an array of bytes
 *   (for sending messages to servers or handling image formats).
 *
 */


Array.prototype.push8 = function (aByte) {
   this.push(aByte & 0xFF);
};


Array.prototype.push16 = function (aWord) {
   this.push((aWord >> 8) & 0xFF,
             (aWord     ) & 0xFF);
};


Array.prototype.push32 = function (aLongWord) {
   this.push((aLongWord >> 24) & 0xFF,
             (aLongWord >> 16) & 0xFF,
             (aLongWord >>  8) & 0xFF,
             (aLongWord      ) & 0xFF);
};


Array.prototype.push16le = function(aWord) {
   this.push((aWord     ) & 0xff,
             (aWord >> 8) & 0xff);
};


Array.prototype.push32le = function(aLongWord) {
   this.push((aLongWord     ) & 0xff,
             (aLongWord >> 8) & 0xff,
             (aLongWord >> 16) & 0xff,
             (aLongWord >> 24) & 0xff);
};

if (typeof console === "undefined") var console = { log: function() {} };

// ROOT of WMKS namespace.
var WMKS = {};

/**
 *------------------------------------------------------------------------------
 *
 * WMKS.LOGGER
 *
 *    The logging namespace that defines a log utility. It has:
 *    1. Five logging levels
 *    2. Generic log function that accepts a log level (defaults to LOG_LEVEL).
 *    3. Log level specific logging.
 *    4. Log only when requested log level is above or equal to LOG_LEVEL value.
 *    5. Dynamically set logging levels.
 *
 *------------------------------------------------------------------------------
 */

WMKS.LOGGER = new function() {
   'use strict';

   this.LEVEL = {
      TRACE: 0,
      DEBUG: 1,
      INFO:  2,
      WARN:  3,
      ERROR: 4
   };

   // The default log level is set to INFO.
   var _logLevel = this.LEVEL.INFO,
       _logLevelDesc = [' [Trace] ', ' [Debug] ', ' [Info ] ', ' [Warn ] ', ' [Error] '];

   // Logging functions for different log levels.
   this.trace = function(args) { this.log(args, this.LEVEL.TRACE); };
   this.debug = function(args) { this.log(args, this.LEVEL.DEBUG); };
   this.info =  function(args) { this.log(args, this.LEVEL.INFO);  };
   this.warn =  function(args) { this.log(args, this.LEVEL.WARN);  };
   this.error = function(args) { this.log(args, this.LEVEL.ERROR); };

   /*
    *---------------------------------------------------------------------------
    *
    * log
    *
    *    The common log function that uses the default logging level.
    *    Use this when you want to see this log at all logging levels.
    *
    *---------------------------------------------------------------------------
    */

   this.log = function(logData, level) {
      level = (level === undefined)? this.LEVEL.INFO : level;
      if (level >= _logLevel && logData) {
         // ISO format has ms precission, but lacks IE9 support.
         // Hence use UTC format for IE9.
         var str = ($.browser.msie? (new Date()).toUTCString() : (new Date()).toISOString())
            + _logLevelDesc[level] + logData;
         // IE does not like if (!console), so check for undefined explicitly. Bug: 917027
         if (!(typeof console === 'undefined' || typeof console.log === 'undefined')) {
            console.log(str);
         }
      }
   };

   /*
    *---------------------------------------------------------------------------
    *
    * setLogLevel
    *
    *    This public function is used to set the logging level. If the input is
    *    invalid, then the default logging level is used.
    *
    *---------------------------------------------------------------------------
    */

   this.setLogLevel = function(newLevel) {
      if (typeof newLevel === 'number' && newLevel >= 0 && newLevel < _logLevelDesc.length) {
         _logLevelDesc = newLevel;
      } else {
         this.log('Invalid input logLevel: ' + newLevel);
      }
   };
};


/**
 *------------------------------------------------------------------------------
 *
 * WMKS.BROWSER
 *
 *    This namespace object contains helper function to identify browser
 *    specific details such as isTouchDevice, isIOS, isAndroid, and extends
 *    $.browser values.
 *
 *    NOTE: We deliberately skipped detecting the version value, as the version
 *    checks are expected to be performed before using webmks. We can add it
 *    if it adds value going forward.
 *
 *------------------------------------------------------------------------------
 */

WMKS.BROWSER = new function() {
   var ua = navigator.userAgent.toLowerCase(),
       vs = navigator.appVersion.toString(),
       trueFunc = function() { return true; },
       falseFunc = function() { return false; };

   /*
    * TODO: Improve heuristic. We don't *really* care about browsers so much as
    * what they can do. Ideally we should provide capabilities here in a mask
    * and check against individual capabilities to see whether we can achieve
    * certain tasks rather than making generalizations based on browser type.
    */

   // In the wake of $.browser being depricated, use the following:
   this.isIE = (ua.indexOf('msie') !== -1)? trueFunc : falseFunc;
   this.isChrome = (ua.indexOf('chrome') !== -1)? trueFunc : falseFunc;
   this.isWebkit = (ua.indexOf('applewebkit') !== -1)? trueFunc : falseFunc;
   this.isOpera = (ua.indexOf('opera/') !== -1)? trueFunc : falseFunc;
   // See: https://developer.mozilla.org/en/Gecko_user_agent_string_reference
   // Also, Webkit says it's 'like Gecko', so we get a false positive here.
   this.isGecko = (!this.isWebkit() && ua.indexOf('gecko') !== -1)? trueFunc : falseFunc;

   // Flag indicating low bandwidth, not screen size.
   this.isLowBandwidth = (ua.indexOf('mobile') !== -1)? trueFunc : falseFunc;

   // Detect specific mobile devices. These are *not* guaranteed to also set
   // isLowBandwidth. Some however do when presenting over WiFi, etc.
   this.isIOS = ((ua.indexOf('iphone') !== -1) || (ua.indexOf('ipod') !== -1) ||
                 (ua.indexOf('ipad') !== -1))? trueFunc : falseFunc;

   /* typically also sets isLinux */
   this.isAndroid = (ua.indexOf('android') !== -1)? trueFunc : falseFunc;

   // Detect IE mobile versions.
   this.isIEMobile = (ua.indexOf('IEMobile') !== -1)? trueFunc : falseFunc;

   // TODO: Include windows phone as touchDevice.
   this.isTouchDevice = (this.isIOS() || this.isAndroid())? trueFunc : falseFunc;

   // PC OS if we need in the near future.
   this.isWindows = (ua.indexOf('windows') !== -1)? trueFunc : falseFunc;
   this.isLinux = (ua.indexOf('linux') !== -1)? trueFunc : falseFunc;
   this.isMacOS = (ua.indexOf('macos') !== -1 || ua.indexOf('macintosh') > -1)?
                  trueFunc : falseFunc;
};


/**
 *------------------------------------------------------------------------------
 *
 * WMKS.UTIL
 *
 *    This namespace object contains common helper function.
 *
 *------------------------------------------------------------------------------
 */

WMKS.UTIL = {
   /*
    *---------------------------------------------------------------------------
    *
    * createCanvas
    *
    *    This function creates a canvas element and adds the absolute
    *    position css to it if the input flag is set.
    *
    *---------------------------------------------------------------------------
    */

   createCanvas: function(addAbsolutePosition) {
      var css = {};
      if (addAbsolutePosition) {
         css.position = 'absolute';
      }
      return $('<canvas/>').css(css);
   },

   /*
    *---------------------------------------------------------------------------
    *
    * getLineLength
    *
    *    Gets the length of the line that starts at (0, 0) and ends at
    *    (dx, dy) and returns the floating point number.
    *
    *---------------------------------------------------------------------------
    */

   getLineLength: function(dx, dy) {
      return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
   }
};

/*
 *------------------------------------------------------------------------------
 * wmks/ImageManagerWMKS.js
 *
 *    This class abstracts Image caching solution in an optimal way. It takes
 *    care of returning the image in a clean, and memory leak proof manner.
 *    It exposes 2 functions  to get and release images. The get function
 *    returns an Image object either from an unused cache or by creating a new one.
 *    The return function, depending on the max allowed cache size decides to
 *    either add the image to the cache or get rid of it completely.
 *
 *------------------------------------------------------------------------------
 */

function ImageManagerWMKS(imageCacheSize) {
  'use strict';
   var _cacheSize = 64;     // Default max size of images that will be cached.
   var _cacheArray = [];    // Cache to hold images.

   // Validate if input is a non-zero number.
   if (typeof imageCacheSize === 'number' && imageCacheSize) {
      _cacheSize = imageCacheSize;
   }

   /*
    *---------------------------------------------------------------------------
    *
    * _getImage
    *
    *    Pushes the current image to the cache if it is not full,
    *    and then deletes the image.
    *
    *---------------------------------------------------------------------------
    */

   var _getImageFromCache = function() {
      if (_cacheArray.length > 0) {
         return _cacheArray.shift();
      } else {
         return new Image();
      }
   };


   /*
    *---------------------------------------------------------------------------
    *
    * _deleteImage
    *
    *    This private function takes an array containing a single image and
    *    deletes the image. The reason for using an array containg the image
    *    instead of 'delete image' call is to comply with javascript strict mode.
    *
    *---------------------------------------------------------------------------
    */

   var _deleteImage = function(imgArray) {
      delete imgArray[0];
      imgArray[0] = null;
      imgArray = null;
   };


   /*
    *---------------------------------------------------------------------------
    *
    * _cacheImageOrDelete
    *
    *    Private function that resets event handlers if any. Sets src to an
    *    empty image. Pushes the current image to the cache if it is not full,
    *    else deletes the image.
    *
    *---------------------------------------------------------------------------
    */

   var _cacheImageOrDelete = function(image) {
      // Reset onload and onerror event handlers if any.
      image.onload = image.onerror = null;

      /*
       * Setting image.src to null is insufficient to turn off image caching in
       * chrome. Unless we set it to an actual string with an empty data URL,
       * if we try to decode the same image twice, onload will not be called
       * the second time. An empty string alone is not sufficient since
       * browsers may treat that as meaning the src is the current page (HTML!)
       * which will lead to a warning on the browsers javascript console.
       */
      image.src = "data:image/jpeg;base64,";

      if (_cacheArray.length <= _cacheSize) {
         _cacheArray.push(image);
      } else {
         // Image deleting in strict mode causes error. Hence the roundabout way.
         _deleteImage([image]);
      }
   };

   /*
    *---------------------------------------------------------------------------
    *
    * getImage
    *
    *    Public function that invokes a private function _getImageFromCache()
    *    to get an image.
    *
    *---------------------------------------------------------------------------
    */
   this.getImage = function() {
      return _getImageFromCache();
   };

   /*
    *---------------------------------------------------------------------------
    *
    * releaseImage
    *
    *    Public function that invokes a private function _cacheImageOrDelete()
    *    to add the image to a cache when the cache is not full or delete the
    *    image.
    *
    *---------------------------------------------------------------------------
    */
   this.releaseImage = function(image) {
      if (!image) {
         return;
      }
      _cacheImageOrDelete(image);
   };
};
/*
 * wmks/mousewheel.js
 *
 *    Event registration for mouse wheel support.
 *
 * jQuery doesn't provide events for mouse wheel movement. This script
 * registers some events we can hook into to detect mouse wheel events
 * in a somewhat cross-browser way.
 *
 * The only information we really need in WebMKS is the direction it scrolled,
 * and not the deltas. This is good, because there is no standard at all
 * for mouse wheel events across browsers when it comes to variables and
 * values, and it's nearly impossible to normalize.
 */

(function() {


var WHEEL_EVENTS = ['mousewheel', 'DOMMouseScroll'];


/*
 *------------------------------------------------------------------------------
 *
 * onMouseWheelEvent
 *
 *    Handles a mouse wheel event and attempts to normalize the values and
 *    emit the event. The resulting event will have wheelDeltaX and
 *    wheelDeltaY values. These should both be -1, 0, or 1, but it can
 *    potentially be other values if a browser sets unexpected data.
 *
 * Results:
 *    The returned value from the handler(s).
 *
 * Side Effects:
 *    Sends data.
 *
 *------------------------------------------------------------------------------
 */

function onMouseWheelEvent(event) {
   var delta = 0,
       deltaX,
       normalizedDeltaX = 0,
       deltaY,
       normalizedDeltaY = 0,
       dispatch = $.event.dispatch || $.event.handle;

   event = event || window.event;

   /*
    * Scroll wheel delta normalization.
    *
    * This is based on data from
    * http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers
    */
   deltaX = -(event.wheelDeltaX || 0);
   deltaY = -(event.wheelDeltaY || event.wheelDelta || 0);
   if (event.detail !== null) {
      if (event.axis === event.HORIZONTAL_AXIS) {
         deltaX = event.detail;
      } else if (event.axis === event.VERTICAL_AXIS) {
         deltaY = event.detail;
      }
   }
   if (deltaX) {
      normalizedDeltaX = Math.round(normalizeWheelDelta(deltaX));
      if (!normalizedDeltaX) {
         normalizedDeltaX = deltaX > 0 ? 1 : -1;
      }
   }
   if (deltaY) {
      var normalizedDeltaY = Math.round(normalizeWheelDelta(deltaY));
      if (!normalizedDeltaY) {
         normalizedDeltaY = deltaY > 0 ? 1 : -1;
      }
   }

   event = $.event.fix(event);
   event.type = 'mousewheel';
   delete event.wheelDelta;
   event.wheelDeltaX = normalizedDeltaX;
   event.wheelDeltaY = normalizedDeltaY;

   return dispatch.call(this, event);
}


/*
 *------------------------------------------------------------------------------
 *
 * normalizeWheelDelta
 *
 *    Keep a distribution of observed values, and scale by the 33rd percentile.
 *
 * Results:
 *    The normalized value.
 *
 * Side Effects:
 *    Updates a history of mouse wheel deltas.
 *
 *------------------------------------------------------------------------------
 */

var normalizeWheelDelta = function() {
   var distribution = [],
       done = null,
       scale = 30;
   return function(n) {
      var i = 0,
          abs,
          factor,
          doneDistribution = false;
      // Zeroes don't count.
      if (n == 0) {
         return n;
      }
      // After 500 samples, we stop sampling and keep current factor.
      if (done !== null) {
         return n * done;
      }
      abs = Math.abs(n);
      // Insert value (sorted in ascending order).
      for (i = 0; i < distribution.length; ++i) {
         if (abs <= distribution[i]) {
            distribution.splice(i, 0, abs);
            doneDistribution = true;
            break;
         }
      }
      if (!doneDistribution) {
          distribution.push(abs);
      }
      // Factor is scale divided by 33rd percentile.
      factor = scale / distribution[Math.floor(distribution.length / 3)];
      if (distribution.length === 500) {
         done = factor;
      }
      return n * factor;
   };
}();


/*
 *------------------------------------------------------------------------------
 *
 * $.event.special.mousewheel
 *
 *    Provides a "mousewheel" event in jQuery that can be binded to a callback.
 *    This handles the different browser events for wheel movements.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends data.
 *
 *------------------------------------------------------------------------------
 */

$.event.special.mousewheel = {
   setup: function() {
      if (this.addEventListener) {
         var i;

         for (i = 0; i < WHEEL_EVENTS.length; i++) {
            this.addEventListener(WHEEL_EVENTS[i], onMouseWheelEvent, false);
         }
      } else {
         this.onmousewheel = onMouseWheelEvent;
      }
   },

   tearDown: function() {
      if (this.removeEventListener) {
         var i;

         for (i = 0; i < WHEEL_EVENTS.length; i++) {
            this.removeEventListener(WHEEL_EVENTS[i], onMouseWheelEvent, false);
         }
      } else {
         this.onmousewheel = onMouseWheelEvent;
      }
   }
};


})();

/*
 * wmks/vncProtocol.js
 *
 *   WebMKS VNC decoder prototype.
 *
 */

WMKS.VNCDecoder = function(opts) {
   var i;
   this.options = $.extend({}, this.options, opts);

   $.extend(this, {
      useVMWRequestResolution: false,
      useVMWKeyEvent: false,
      useVMWAck: false,
      _websocket: null,
      _encrypted: false,
      _receivedFirstUpdate: false,
      _serverInitialized: false,
      _canvas: [],
      _currentCursorURI: 'default',
      _imageCache: [],

      _copyRectBlit: null,
      _copyRectOffscreenBlit: null,

      _state: this.DISCONNECTED,

      _FBWidth: 0,
      _FBHeight: 0,
      _FBName: '',
      _FBBytesPerPixel: 0,
      _FBDepth: 3,

      /*
       * Subvert any static analysis of what we're doing in flush() by
       * creating a side-effect here.
       */
      _flushSink: 0,

      /*
       * Mouse state.
       * The current button state(s) are sent with each pointer event.
       */
      _mouseButtonMask: 0,
      _mouseX: 0,
      _mouseY: 0,
      onDecodeComplete: {},

      /*
       * Frame buffer update state.
       */
      rects: 0,
      rectsRead: 0,
      rectsDecoded: 0,

      /*
       * Width/height requested through self.onRequestResolution()
       */
      requestedWidth: 0,
      requestedHeight: 0,

      /*
       * Rate-limit resolution requests to the server.  These are slow
       * & we get a better experience if we don't send too many of
       * them.
       */
      resolutionTimeout: {},
      resolutionTimer: null,
      resolutionRequestActive: false,

      /*
       * We maintain an incrementing ID for each update request.
       * This assists in tracking updates/acks with the host.
       */
      updateReqId: 0,

      /*
       * Typematic details for faking keyboard auto-repeat in
       * the client.
       */
      typematicState: 1,             // on
      typematicPeriod: 33333,        // microseconds
      typematicDelay: 500000,        // microseconds

      /*
       * Bitmask of Remote keyboard LED state
       *
       * Bit 0 - Scroll Lock
       * Bit 1 - Num Lock
       * Bit 2 - Caps Lock
       */
      _keyboardLEDs: 0,

      rect: [],
      _msgTimer: null,
      _mouseTimer: null,
      _mouseActive: false,
      msgTimeout: {},
      mouseTimeout: {},

      _url: "",
      _receiveQueue: "",
      _receiveQueueIndex: 0
   });

   this.setRenderCanvas(this.options.canvas);

   /*
    * Did we get a backbuffer canvas?
    */
   if (this.options.backCanvas) {
      this._canvas = this._canvas.concat([this.options.backCanvas]);
      this._canvas[1].ctx = this.options.backCanvas.getContext('2d');
   }

   if (this.options.blitTempCanvas) {
      this._canvas = this._canvas.concat([this.options.blitTempCanvas]);
      this._canvas[2].ctx = this.options.blitTempCanvas.getContext('2d');
   }

   // TODO: Make it a private var as the consumers if this object should have
   // been private too. Leave it as public until then.
   this._imageManager = new ImageManagerWMKS();

   /*
    *------------------------------------------------------------------------------
    *
    * _releaseImage
    *
    *    Pushes the current image to the cache if it is not full,
    *    and then deletes the image. Reset destX, destY before image recycle.
    *
    *------------------------------------------------------------------------------
    */

   this._releaseImage = function (image) {
      image.destX = image.destY = null;
      this._imageManager.releaseImage(image);
   };

   return this;
};


$.extend(WMKS.VNCDecoder.prototype, {
   options: {
      canvas: null,
      backCanvas: null,
      blitTempCanvas: null,
      useVNCHandshake: true,
      onConnecting: function() {},
      onConnected: function() {},
      onDisconnected: function() {},
      onAuthenticationFailed: function() {},
      onError: function(err) {},
      onProtocolError: function() {},
      onNewDesktopSize: function(width, height) {},
      onKeyboardLEDsChanged: function(leds) {}
   },

   DISCONNECTED: 0,
   VNC_ACTIVE_STATE: 1,
   FBU_DECODING_STATE: 2,
   FBU_RESTING_STATE: 3,

   /*
    * Server->Client message IDs.
    */
   msgFramebufferUpdate: 0,
   msgSetColorMapEntries: 1,
   msgRingBell: 2,
   msgServerCutText: 3,
   msgVMWSrvMessage: 127,

   /*
    * Client->Server message IDs.
    */
   msgClientEncodings: 2,
   msgFBUpdateRequest: 3,
   msgKeyEvent: 4,
   msgPointerEvent: 5,
   msgVMWClientMessage: 127,

   /*
    * Encodings for rectangles within FBUpdates.
    */
   encRaw:               0x00,
   encCopyRect:          0x01,
   encTightPNG:          -260,
   encDesktopSize:       -223,
   encTightPNGBase64:     21 + 0x574d5600,
   encTightDiffComp:      22 + 0x574d5600,
   encVMWDefineCursor:   100 + 0x574d5600,
   encVMWCursorState:    101 + 0x574d5600,
   encVMWCursorPosition: 102 + 0x574d5600,
   encVMWTypematicInfo:  103 + 0x574d5600,
   encVMWLEDState:       104 + 0x574d5600,
   encVMWServerPush2:    123 + 0x574d5600,
   encVMWServerCaps:     122 + 0x574d5600,
   encOffscreenCopyRect: 126 + 0x574d5600,
   encTightJpegQuality10: -23,

   diffCompCopyFromPrev: 0x1,
   diffCompAppend: 0x2,
   diffCompAppendRemaining:  0x3,

   /*
    * Capability bits from VMWServerCaps which we can make use of.
    */
   serverCapKeyEvent:   0x02,
   serverCapUpdateAck:  0x20,
   serverCapRequestResolution:  0x80,

   /*
    * Sub-encodings for the tightPNG/tightPNGBase64 encoding.
    */
   subEncFill: 0x80,
   subEncJPEG: 0x90,
   subEncPNG:  0xA0,
   subEncDiffJpeg:  0xB0,
   subEncMask: 0xF0,

   mouseTimeResolution: 16,  // milliseconds
   resolutionDelay: 500,    // milliseconds

   _receiveQueueSliceTrigger: 4096
});





/** @private */

/*
 *------------------------------------------------------------------------------
 *
 * fail
 *
 *    Prints an error message and disconnects from the server.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Prints an error message and disconnects from the server.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype.fail = function (msg) {
   console.log(msg);
   this.disconnect();
};



/*
 *------------------------------------------------------------------------------
 *
 * _assumeServerIsVMware
 *
 *    Enables features available only on VMware servers.
 *
 *    This is called when we have reason to believe that we are connecting
 *    to a VMware server. Old servers do not advertise their extensions,
 *    so we have to rely on fingerprinting for those.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Enables VMware-only features, which may crash connections
 *    to non-VMware servers.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._assumeServerIsVMware = function () {
   /*
    * Only when we skip VNC authentication we also assume that the server
    * is a VMware one. This is an additional protection in case someone
    * implements a server that emits CursorState updates.
    */
   if (this.options.useVNCHandshake) {
      return;
   }

   /*
    * The server seems to be a VMware server. Enable proprietary extensions.
    */
   this.useVMWKeyEvent = true;
};






/*
 *
 * RX/TX queue management
 *
 */


/*
 *------------------------------------------------------------------------------
 *
 * _receiveQueueBytesUnread
 *
 *    Calculates the number of bytes received but not yet parsed.
 *
 * Results:
 *    The number of bytes locally available to parse.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._receiveQueueBytesUnread = function () {
   "use strict";

   return this._receiveQueue.length - this._receiveQueueIndex;
};


/*
 *------------------------------------------------------------------------------
 *
 * _skipBytes
 *
 *    Drops 'nr' bytes from the front of the receive buffer.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Advances receive buffer.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._skipBytes = function (nr) {
   "use strict";
   this._receiveQueueIndex += nr;
};


/*
 *------------------------------------------------------------------------------
 *
 * _readString
 *
 *    Pops the first 'stringLength' bytes from the front of the read buffer.
 *
 * Results:
 *    An array of 'stringLength' bytes.
 *
 * Side Effects:
 *    Advances receive buffer.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readString = function (stringLength) {
   "use strict";

   var string = this._receiveQueue.slice(this._receiveQueueIndex,
                                         this._receiveQueueIndex + stringLength);
   this._receiveQueueIndex += stringLength;
   return string;
};


/*
 *------------------------------------------------------------------------------
 *
 * _readByte
 *
 *    Pops the first byte from the front of the receive buffer.
 *
 * Results:
 *    First byte of the receive buffer.
 *
 * Side Effects:
 *    Advances receive buffer.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readByte = function () {
   "use strict";

   var aByte = this._receiveQueue.charCodeAt(this._receiveQueueIndex);
   this._receiveQueueIndex += 1;
   return aByte;
};


/*
 *------------------------------------------------------------------------------
 *
 * _readInt16
 *
 *    Pops the first two bytes from the front of the receive buffer.
 *
 * Results:
 *    First two bytes of the receive buffer.
 *
 * Side Effects:
 *    Advances receive buffer.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readInt16 = function () {
   "use strict";

   return ((this._readByte() << 8) +
           (this._readByte()));
};


/*
 *------------------------------------------------------------------------------
 *
 * _readInt32
 *
 *    Pops the first four bytes from the front of the receive buffer.
 *
 * Results:
 *    First four bytes of the receive buffer.
 *
 * Side Effects:
 *    Advances receive buffer.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readInt32 = function () {
   "use strict";

   return ((this._readByte() << 24) +
           (this._readByte() << 16) +
           (this._readByte() <<  8) +
           (this._readByte()));
};


/*
 *------------------------------------------------------------------------------
 *
 * _readBytes
 *
 *    Pops the first 'length' bytes from the front of the receive buffer.
 *
 * Results:
 *    Array of 'length' bytes.
 *
 * Side Effects:
 *    Advances receive buffer.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readBytes = function (length) {
   "use strict";
   var result, i;

   result = new Array(length);

   for (i = 0; i < length; i++) {
      result[i] = this._receiveQueue.charCodeAt(i + this._receiveQueueIndex);
   }

   this._receiveQueueIndex += length;
   return result;
};


/*
 *------------------------------------------------------------------------------
 *
 * _sendString
 *
 *    Sends a string to the server, using the appropriate encoding.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends data.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._sendString = function (stringValue) {
   "use strict";

   if (this._websocket.protocol === "binary") {
      this._sendBytes(arrayFromString(stringValue));
   } else if (this._websocket.protocol === "base64") {
      this._websocket.send(Base64.encodeFromString(stringValue));
   } else {
      this._websocket.send(stringValue);
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * _sendBytes
 *
 *    Sends the array 'bytes' of data bytes to the server.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends data.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._sendBytes = function (bytes) {
   "use strict";
   if (this._websocket.protocol === "binary") {
      var msg = new ArrayBuffer(bytes.length);
      var uint8View = new Uint8Array(msg);
      var i;
      for (i = 0; i < bytes.length; i++) {
         uint8View[i] = bytes[i];
      }
      this._websocket.send(msg);
   } else {
      this._sendString(stringFromArray(bytes));
   }
};





/*
 *
 * Parser / queue bridge helpers
 *
 */

WMKS.VNCDecoder.prototype._setReadCB = function(bytes, nextFn, nextArg) {
   this.nextBytes = bytes;
   this.nextFn = nextFn;
   this.nextArg = nextArg;
};


/*
 *
 * Client message sending
 *
 */


/*
 *------------------------------------------------------------------------------
 *
 * _sendMouseEvent
 *
 *    Sends the current absolute mouse state to the server.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends data.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._sendMouseEvent = function () {
   var arr = [];
   arr.push8(this.msgPointerEvent);
   arr.push8(this._mouseButtonMask);
   arr.push16(this._mouseX);
   arr.push16(this._mouseY);
   this._sendBytes(arr);
   this._mouseActive = false;
};


/*
 *------------------------------------------------------------------------------
 *
 * _sendResolutionRequest
 *
 *    Sends the most recently requested resolution to the server.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends data.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._sendResolutionRequest = function () {
   var arr = [];
   arr.push8(this.msgVMWClientMessage);
   arr.push8(5);       // Resolution request 2 message sub-type
   arr.push16(8);      // Length
   arr.push16(this.requestedWidth);
   arr.push16(this.requestedHeight);
   this._sendBytes(arr);
};


/*
 *------------------------------------------------------------------------------
 *
 * _sendClientEncodingsMsg
 *
 *    Sends the server a list of supported image encodings.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends data.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._sendClientEncodingsMsg = function () {
   var i;
   var encodings = [/* this.encTightDiffComp, */
                    this.encTightPNG,
                    this.encDesktopSize,
                    this.encVMWDefineCursor,
                    this.encVMWCursorState,
                    this.encVMWCursorPosition,
                    this.encVMWTypematicInfo,
                    this.encVMWLEDState,
                    this.encVMWServerPush2,
                    this.encVMWServerCaps,
                    this.encTightJpegQuality10];

   /*
    * Hopefully the server isn't silly enough to accept uint8utf8 if
    * it's unable to emit TightPNGBase64.  The two really need to be
    * used together.  Client-side we can avoid advertising
    * TightPNGBase64 when we know it will lead to
    * double-base64-encoding.
    */
   if (this._websocket.protocol === "uint8utf8") {
      encodings = [this.encTightPNGBase64].concat(encodings);
   }

   if (this._canvas[1]) {
      encodings = [this.encOffscreenCopyRect].concat(encodings);
   }

   /*
    * Blits seem to work well on most browsers now.
    */
   encodings = [this.encCopyRect].concat(encodings);

   var message = [];
   message.push8(this.msgClientEncodings);
   message.push8(0);
   message.push16(encodings.length);
   for (i = 0; i < encodings.length; i += 1) {
      message.push32(encodings[i]);
   }
   this._sendBytes(message);
};


/*
 *------------------------------------------------------------------------------
 *
 * _sendFBUpdateRequestMsg
 *
 *    Sends the server a request for a new image, and whether
 *    the update is to be incremental.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends data.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._sendFBUpdateRequestMsg = function (incremental) {
   var message = [];
   message.push8(this.msgFBUpdateRequest);
   message.push8(incremental);
   message.push16(0);
   message.push16(0);
   message.push16(this._FBWidth);
   message.push16(this._FBHeight);
   this._sendBytes(message);
};


/*
 *------------------------------------------------------------------------------
 *
 * _sendAck
 *
 *    Sends the server an acknowledgement of rendering the frame.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends data.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._sendAck = function(renderMilliseconds) {
   var updateReqId = this.updateReqId || 1;
   var msg;
   if (this.useVMWAck) {
      /*
       * Add one millisecond to account for the enforced sleep
       * between frames, and another as a bit of a swag.
       */
      var time = (renderMilliseconds + 2) * 10;
      var arr = [];
      arr.push8(this.msgVMWClientMessage);
      arr.push8(4);           // ACK message sub-type
      arr.push16(8);          // Length
      arr.push8(updateReqId); // update id
      arr.push8(0);           // padding
      arr.push16(time);       // render time in tenths of millis
      this._sendBytes(arr);
   } else {
      this._sendFBUpdateRequestMsg(updateReqId);
   }
};





/*
 *
 * Cursor updates
 *
 */


/*
 *------------------------------------------------------------------------------
 *
 * _changeCursor
 *
 *    Generates an array containing a Windows .cur file and loads it
 *    as the browser cursor to be used when hovering above the canvas.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Changes the cursor in the browser.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._changeCursor = function(pixels, mask, hotx, hoty, w, h) {
   var cursorData = [];

   var RGBImageDataSize = w * h * 4;   // 32 bits per pixel image data
   var maskSize = Math.ceil((w * h) / 8.0);  // 1 bit per pixel of mask data.

   var cursorDataSize = (RGBImageDataSize + 40 + /* Bitmap Info Header Size */
                         maskSize * 2);          /* 2 masks XOR & AND */

   /*
    * We need to build an array of bytes that looks like a Windows .cur:
    *   -> http://en.wikipedia.org/wiki/ICO_(file_format)
    *   -> http://en.wikipedia.org/wiki/BMP_file_format
    */
   cursorData.push16le(0);
   cursorData.push16le(2);     // .cur type
   cursorData.push16le(1);     // One image

   cursorData.push8(w);
   cursorData.push8(h);
   cursorData.push8(0);        // True Color cursor
   cursorData.push8(0);
   cursorData.push16le(hotx);  // Hotspot X location
   cursorData.push16le(hoty);  // Hostpot Y location

   // Total size of all image data including their headers (but
   // excluding this header).
   cursorData.push32le(cursorDataSize);

   // Offset (immediately past this header) to the BMP data
   cursorData.push32le(cursorData.length+4);

   // Bitmap Info Header
   cursorData.push32le(40);    // Bitmap Info Header size
   cursorData.push32le(w);
   cursorData.push32le(h*2);
   cursorData.push16le(1);
   cursorData.push16le(32);
   cursorData.push32le(0);     // Uncompressed Pixel Data
   cursorData.push32le(RGBImageDataSize  + (2 * maskSize));
   cursorData.push32le(0);
   cursorData.push32le(0);
   cursorData.push32le(0);
   cursorData.push32le(0);

   /*
    * Store the image data.
    * Note that the data is specified UPSIDE DOWN, like in a .bmp file.
    */
   for (y = h-1; y >= 0; y -= 1) {
      for (x = 0; x < w; x += 1) {
         /*
          * The mask is an array where each bit position indicates whether or
          * not the pixel is transparent. We need to convert that to an alpha
          * value for the pixel (clear or solid).
          */
         var arrayPos = y * Math.ceil(w/8) + Math.floor(x/8);
         var alpha = 0;
         if (mask.length > 0) {
            alpha = (mask[arrayPos] << (x % 8)) & 0x80 ? 0xff : 0;
         }

         arrayPos = ((w * y) + x) * 4;
         cursorData.push8(pixels[arrayPos]);
         cursorData.push8(pixels[arrayPos+1]);
         cursorData.push8(pixels[arrayPos+2]);
         if (mask.length > 0) {
            cursorData.push8(alpha);
         } else {
            cursorData.push8(pixels[arrayPos+3]);
         }
      }
   }

   /*
    * The XOR and AND masks need to be specified - but the data is unused
    * since the alpha channel of the cursor image is sufficient. So just
    * fill in a blank area for each.
    */
   for (y = 0; y < h; y += 1) {
      // The masks are single bit per pixel too
      for (x = 0; x < Math.ceil(w/8); x +=1) {
         cursorData.push8(0);
      }
   }

   for (y = 0; y < h; y += 1) {
      // The masks are single bit per pixel too
      for (x = 0; x < Math.ceil(w/8); x +=1) {
         cursorData.push8(0);
      }
   }

   var url = 'data:image/x-icon;base64,' + Base64.encodeFromArray(cursorData);
   this._currentCursorURI = 'url(' + url + ') ' + hotx + ' ' + hoty + ', default';
   this._setCanvasCursor(this._currentCursorURI);
};


/*
 *------------------------------------------------------------------------------
 *
 * _readOffscreenCopyRect
 *
 *    Parses payload of an offscreen copy rectangle packet.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readOffscreenCopyRect = function (rect) {
   rect.srcBuffer = this._readByte();
   rect.dstBuffer = this._readByte();
   rect.srcX = this._readInt16();
   rect.srcY = this._readInt16();
   this._nextRect();
};


/*
 *------------------------------------------------------------------------------
 *
 * _readCursorData
 *
 *    Parses payload of a mouse cursor update.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Changes cursor.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readCursorData = function (rect) {
   var pixelslength = rect.w * rect.h * this._FBBytesPerPixel;
   var masklength = Math.floor((rect.w + 7) / 8) * rect.h;
   this._changeCursor(this._readBytes(pixelslength),
                      this._readBytes(masklength),
                      x, y, w, h);
};


/*
 *------------------------------------------------------------------------------
 *
 * _readCursor
 *
 *    Parses a mouse cursor update.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Changes the cursor in the browser.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readCursor = function (rect) {
   var w = rect.width;
   var h = rect.height;
   var pixelslength = rect.w * rect.h * this._FBBytesPerPixel;
   var masklength = Math.floor((rect.w + 7) / 8) * rect.h;
   read(pixelslength + masklength, _readCursorData, rect);
};


/*
 *------------------------------------------------------------------------------
 *
 * _readVMWDefineCursorData
 *
 *    Parses a VMware cursor definition payload.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Changes the cursor in the browser.
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readVMWDefineCursorData = function (rect) {
   var y, x,
       andData = [], pixels = [], mask = [],
       hexMask, pixelIdx, maskIdx, channels;

   // If this is a color cursor
   if (rect.cursorType === 0) {
       if (rect.masklength > 0) {
          andData = this._readBytes(rect.masklength);
       }

       if (rect.pixelslength > 0) {
          pixels = this._readBytes(rect.pixelslength);
       }

      for (y = 0; y < rect.height; y++) {
         for (x = 0; x < rect.width; x++) {
            pixelIdx = x + y * rect.width;
            maskIdx = y * Math.ceil(rect.width / 8) + Math.floor(x / 8);
            // The mask is actually ordered 'backwards'
            hexMask = 1 << (7 - x % 8);

            // If the and mask is fully transparent
            if ((andData[pixelIdx * 4] === 255) &&
                (andData[pixelIdx * 4 + 1] === 255) &&
                (andData[pixelIdx * 4 + 2] === 255) &&
                (andData[pixelIdx * 4 + 3] === 255)) {
                // If the pixels at this point should be inverted then
                // make the image actually a simple black color.
                for (channel = 0; channel < 4; channel++) {
                   if (pixels[pixelIdx * 4 + channel] !== 0) {
                     pixels[pixelIdx * 4 + channel] = 0;
                     mask[maskIdx] |= hexMask;
                   }
                }
                // Otherwise leave the mask alone
            } else {
                mask[maskIdx] |= hexMask;
            }
         }
      }
   } else if (rect.cursorType === 1) {      // An Alpha Cursor
       if (rect.pixelslength > 0) {
          pixels = this._readBytes(rect.pixelslength);
       }
   }

   this._changeCursor(pixels, mask,
                      rect.x,
                      rect.y,
                      rect.width,
                      rect.height);
   this._nextRect();
};


/*
 *------------------------------------------------------------------------------
 *
 * _readVMWDefineCursor
 *
 *    Parses a VMware cursor definition header.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readVMWDefineCursor = function (rect) {
   /*
    * Start with 2 bytes of type (and padding).
    */
   rect.cursorType = this._readByte();
   this._skipBytes(1);

   rect.pixelslength = 4 * rect.width * rect.height;

   if (rect.cursorType === 0) {
      rect.masklength = rect.pixelslength;
   } else {
      rect.masklength = 0;
   }

   this._setReadCB(rect.pixelslength + rect.masklength,
                   this._readVMWDefineCursorData, rect);
};


/*
 *------------------------------------------------------------------------------
 *
 * _setCanvasCursor
 *
 *    Set the cursor to a custom value, except on MSIE where it
 *    appears to be busted.  On MSIE, just retain the default cursor
 *    always - which is better than nothing.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Changes the cursor in the browser.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._setCanvasCursor = function(str) {
   if (!$.browser.msie) {
      this._canvas[0].style.cursor = str;
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * _readVMWCursorState
 *
 *    Parses a VMware cursor state update (cursor visibility, etc.).
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Changes the cursor in the browser.
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readVMWCursorState = function(rect) {
   var cursorState = this._readInt16();
   var visible = (cursorState & 0x01);
   this._setCanvasCursor(visible ? this._currentCursorURI : "none, !important");
   this._nextRect();
};


/*
 *------------------------------------------------------------------------------
 *
 * _readVMWCursorPosition
 *
 *    Parses a VMware cursor position update.
 *    Ignores the payload as the client cursor cannot be moved in a browser.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readVMWCursorPosition = function (rect) {
   /*
    * We cannot warp or move the host/browser cursor
    */
   this._nextRect();
};


/*
 *------------------------------------------------------------------------------
 *
 * _readTypematicInfo
 *
 *    Parses a typematic info update.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readTypematicInfo = function(rect) {
   this.typematicState = this._readInt16(),
   this.typematicPeriod = this._readInt32(),
   this.typematicDelay = this._readInt32();
   this._nextRect();
};


/*
 *------------------------------------------------------------------------------
 *
 * _readLEDState
 *
 *    Parses an LED State update.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readLEDState = function(rect) {
   this._keyboardLEDs = this._readInt32();

   this.options.onKeyboardLEDsChanged(this._keyboardLEDs);

   this._nextRect();
};




/*
 *
 * Framebuffer updates
 *
 */


/*
 *------------------------------------------------------------------------------
 *
 * _fillRectWithColor
 *
 *    Fills a rectangular area in the canvas with a solid colour.
  *
 * Results:
 *    None.
 *
 * Side Effects:
 *    A coloured canvas.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._fillRectWithColor = function(canvas2dCtx, x, y,
                                                        width, height, color) {
   var newStyle;
   newStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
   canvas2dCtx.fillStyle = newStyle;
   canvas2dCtx.fillRect(x, y, width, height);
};


/*
 *------------------------------------------------------------------------------
 *
 * _blitImageString
 *
 *    Blits a serialised image (as a string) onto the canvas.
 *    Ignores the Alpha channel information and blits it opaquely.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    A coloured canvas.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._blitImageString = function(canvas2dCtx, x, y,
                                                      width, height, str) {
   var img, i, data;
   img = canvas2dCtx.createImageData(width, height);
   data = img.data;
   for (i=0; i < (width * height * 4); i=i+4) {
      data[i    ] = str.charCodeAt(i + 2);
      data[i + 1] = str.charCodeAt(i + 1);
      data[i + 2] = str.charCodeAt(i + 0);
      data[i + 3] = 255; // Set Alpha
   }
   canvas2dCtx.putImageData(img, x, y);
};


/*
 *------------------------------------------------------------------------------
 *
 * _copyRectGetPut
 * _copyRectDrawImage
 * _copyRectDrawImageTemp
 *
 *    Copy a rectangle from one canvas/context to another.  The
 *    canvas/contexts are indicated by an index into this._canvas[]
 *    array.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._copyRectGetPut = function (srcIndex,
                                                      srcX, srcY,
                                                      width, height,
                                                      dstIndex,
                                                      dstX, dstY) {
   var img;
   img = this._canvas[srcIndex].ctx.getImageData(srcX, srcY,
                                                 width, height);

   this._canvas[dstIndex].ctx.putImageData(img, dstX, dstY);
   delete img;
};


WMKS.VNCDecoder.prototype._copyRectDrawImage = function (srcIndex,
                                                         srcX, srcY,
                                                         width, height,
                                                         dstIndex,
                                                         dstX, dstY) {
   this._canvas[dstIndex].ctx.drawImage(this._canvas[srcIndex],
                                        srcX, srcY,
                                        width, height,
                                        dstX, dstY,
                                        width, height);
};


WMKS.VNCDecoder.prototype._copyRectDrawImageTemp = function (srcIndex,
                                                             srcX, srcY,
                                                             width, height,
                                                             dstIndex,
                                                             dstX, dstY) {
   this._copyRectDrawImage(srcIndex,
                           srcX, srcY,
                           width, height,
                           2,
                           srcX, srcY);

   this._copyRectDrawImage(2,
                           srcX, srcY,
                           width, height,
                           dstIndex,
                           dstX, dstY);
};


/*
 *------------------------------------------------------------------------------
 *
 * _flush
 *
 *    Make sure all rendering is complete on the given canvas
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._flush = function (dstIndex) {
   var img;
   img = this._canvas[dstIndex].ctx.getImageData(0, 0, 1,1);
   this._flushSink += img.data[0];
   delete img;
};


/*
 *------------------------------------------------------------------------------
 *
 * _decodeDiffComp
 *
 *    Decodes a diff-compressed jpeg string from the encoder.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._decodeDiffComp = function (data, oldData) {
   var l = data.length;
   var i = 0;
   var out = "";
   while (i < l) {
      switch(data.charCodeAt(i++)) {
      case this.diffCompCopyFromPrev:
         var nr = data.charCodeAt(i++);
         var pos = out.length;
         out = out.concat(oldData.slice(pos, pos+nr));
         break;
      case this.diffCompAppend:
         var nr = data.charCodeAt(i++);
         out = out.concat(data.slice(i, i+nr));
         i += nr;
         break;
      case this.diffCompAppendRemaining:
         out = out.concat(data.slice(i));
         i = l;
         break;
      }
   }
   return out;
};


/*
 *------------------------------------------------------------------------------
 *
 * _readTightData
 *
 *    Parses a compressed FB update payload.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readTightData = function (rect) {
   /*
    * Skip the preamble and read the actual JPEG data.
    */
   var data = this._readString(this.nextBytes);

   /*
    * Construct an Image and keep a reference to it in the
    * rectangle object. Since Images are loaded asynchronously
    * we can't draw it until the image has finished loading so
    * we don't call onDecodeComplete() until this has happened.
    */
   rect.image = this._imageManager.getImage();
   rect.image.onload = this.onDecodeComplete;
   rect.image.width = rect.width;
   rect.image.height = rect.height;
   rect.image.destX = rect.x;
   rect.image.destY = rect.y;

   if (rect.subEncoding === this.subEncDiffJpeg) {
      data = this._decodeDiffComp(data, this._lastJpegData);
   }

   if (rect.subEncoding !== this.subEncPNG) {
      this._lastJpegData = data;
   }

   if (rect.encoding !== this.encTightPNGBase64) {
      data = Base64.encodeFromString(data);
   }

   if (rect.subEncoding === this.subEncPNG) {
      rect.image.src = 'data:image/png;base64,' + data;
   } else {
      rect.image.src = 'data:image/jpeg;base64,' + data;
   }
   this._nextRect();
};


/*
 *------------------------------------------------------------------------------
 *
 * _readTightPNG
 *
 *    Parses the head of a compressed FB update payload.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readTightPNG = function (rect) {

   rect.subEncoding = this._readByte();
   rect.subEncoding &= this.subEncMask;

   if (rect.subEncoding === this.subEncFill) {
      rect.color = [];
      rect.color[0] = this._readByte();
      rect.color[1] = this._readByte();
      rect.color[2] = this._readByte();
      rect.color[3] = 0xff;
      this.rectsDecoded++;
      this._nextRect();
   } else {
      var lengthSize = 1;
      var dataSize = this._readByte();
      if (dataSize & 0x80) {
         lengthSize = 2;
         dataSize &= ~0x80;
         dataSize += this._readByte() << 7;
         if (dataSize & 0x4000) {
            lengthSize = 3;
            dataSize &= ~0x4000;
            dataSize += this._readByte() << 14;
         }
      }

      this._setReadCB(dataSize, this._readTightData, rect);
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * _readCopyRect
 *
 *    Parses a CopyRect (blit) FB update.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readCopyRect = function (rect) {
   rect.srcX = this._readInt16();
   rect.srcY = this._readInt16();
   this._nextRect();
};


/*
 *------------------------------------------------------------------------------
 *
 * _readRaw
 *
 *    Reads a raw rectangle payload.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readRaw = function (rect) {
   rect.imageString = this._readString(this.nextBytes);
   this._nextRect();
};


/*
 *------------------------------------------------------------------------------
 *
 * _readDesktopSize
 *
 *    Parses a screen size update.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Calls the outer widget's onNewDesktopSize callback.
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readDesktopSize = function (rect) {
   this._FBWidth = rect.width;
   this._FBHeight = rect.height;

   /*
    * Resize the canvas to the new framebuffer dimensions.
    */
   this.options.onNewDesktopSize(this._FBWidth, this._FBHeight);
   this._nextRect();
};


/*
 *------------------------------------------------------------------------------
 *
 * _readRect
 *
 *    Parses an FB update rectangle.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readRect = function() {
   var i = this.rectsRead;

   this.rect[i] = {};
   this.rect[i].x        = this._readInt16();
   this.rect[i].y        = this._readInt16();
   this.rect[i].width    = this._readInt16();
   this.rect[i].height   = this._readInt16();
   this.rect[i].encoding = this._readInt32();

   if (this.rect[i].encoding !== this.encTightPNGBase64 &&
       this.rect[i].encoding !== this.encTightPNG) {
      this.rectsDecoded++;
   }

   switch (this.rect[i].encoding) {
   case this.encRaw:
      this._setReadCB(this.rect[i].width *
                      this.rect[i].height *
                      this._FBBytesPerPixel,
                      this._readRaw, this.rect[i]);
      break;
   case this.encCopyRect:
      this._setReadCB(4, this._readCopyRect, this.rect[i]);
      break;
   case this.encOffscreenCopyRect:
      this._setReadCB(6, this._readOffscreenCopyRect, this.rect[i]);
      break;
   case this.encTightPNGBase64:
   case this.encTightPNG:
      this._setReadCB(4, this._readTightPNG, this.rect[i]);
      break;
   case this.encDesktopSize:
      this._readDesktopSize(this.rect[i]);
      break;
   case this.encVMWDefineCursor:
      this._setReadCB(2, this._readVMWDefineCursor, this.rect[i]);
      break;
   case this.encVMWCursorState:
      this._assumeServerIsVMware();
      this._setReadCB(2, this._readVMWCursorState, this.rect[i]);
      break;
   case this.encVMWCursorPosition:
      this._readVMWCursorPosition(this.rect[i]);
      break;
   case this.encVMWTypematicInfo:
      this._setReadCB(10, this._readTypematicInfo, this.rect[i]);
      break;
   case this.encVMWLEDState:
      this._setReadCB(4, this._readLEDState, this.rect[i]);
      break;
   default:
      return this.fail("Disconnected: unsupported encoding " +
                       this.rect[i].encoding);
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * _executeRectSingle
 *
 *    Execute the update command specified in a single rect.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Updates the canvas contents.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._executeRectSingle = function (rect) {
   var ctx = this._canvas[0].ctx;

   switch (rect.encoding) {
      case this.encRaw:
         this._blitImageString(ctx,
                               rect.x,
                               rect.y,
                               rect.width,
                               rect.height,
                               rect.imageString);
         rect.imageString = "";
         break;
      case this.encCopyRect:
         this._copyRectBlit(0,      // source index
                            rect.srcX,
                            rect.srcY,
                            rect.width,
                            rect.height,
                            0,      // dest index
                            rect.x,
                            rect.y);
         break;
      case this.encOffscreenCopyRect:
         this._copyRectOffscreenBlit(rect.srcBuffer,
                                     rect.srcX,
                                     rect.srcY,
                                     rect.width,
                                     rect.height,
                                     rect.dstBuffer,
                                     rect.x,
                                     rect.y);
         break;
      case this.encTightPNG:
      case this.encTightPNGBase64:
         if (rect.subEncoding === this.subEncFill) {
            this._fillRectWithColor(ctx,
                                    rect.x,
                                    rect.y,
                                    rect.width,
                                    rect.height,
                                    rect.color);
         } else {
            ctx.drawImage(rect.image,
                          rect.image.destX,
                          rect.image.destY);
            this._releaseImage(rect.image);
            rect.image = null;
         }
         break;
      case this.encDesktopSize:
      case this.encVMWDefineCursor:
      case this.encVMWCursorState:
      case this.encVMWCursorPosition:
         break;
      default:
         break;
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * _executeRects
 *
 *    When this is called, all data for all rectangles is available
 *    and all JPEG images have been loaded. We can noe perform all
 *    drawing in a single step, in the correct order.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Updates the canvas contents.
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._executeRects = function () {
   /*
    * When this is called, all data for all rectangles is
    * available and all JPEG images have been loaded.  We can
    * now perform all drawing in a single step, in the correct order.
    */
   var i;

   if (this._state !== this.FBU_DECODING_STATE) {
      return this.fail("wrong state: " + this._state);
   }

   if (this.rectsDecoded !== this.rects ||
      this.rectsRead !== this.rects) {
      return this.fail("messed up state");
   }

   var start = (new Date()).getTime();

   for (i = 0; i < this.rects; i++) {
      this._executeRectSingle(this.rect[i]);

      delete this.rect[i];
   }

   this._flush(0);

   var now = (new Date()).getTime();
   this._sendAck(now - start);

   this.rects = 0;
   this.rectsRead = 0;
   this.rectsDecoded = 0;
   this.updateReqId = 0;

   if (this._receivedFirstUpdate === false) {
    this.options.onConnected();
    this._receivedFirstUpdate = true;
   }


   var self = this;
   this._state = this.FBU_RESTING_STATE;
   this._getNextServerMessage();


   /*
    * Resting like this is a slight drain on performance,
    * especially at higher framerates.
    *
    * If the client could just hit 50fps without resting (20
    * ms/frame), it will now manage only 47.6fps (21 ms/frame).
    *
    * At lower framerates the difference is proportionately
    * less, eg 20fps->19.6fps.
    *
    * It is however necessary to do something like this to
    * trigger the screen update, as the canvas double buffering
    * seems to use idleness as a trigger for swapbuffers.
    */

   this._msgTimer = setTimeout(this.msgTimeout, 1 /* milliseconds */);
};


/*
 *------------------------------------------------------------------------------
 *
 * _nextRect
 *
 *    Configures parser to process next FB update rectangle,
 *    or progresses to rendering.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._nextRect = function() {
   this.rectsRead++;
   if (this.rectsRead < this.rects) {
      this._setReadCB(12, this._readRect);
   } else {
      this._state = this.FBU_DECODING_STATE;
      if (this.rectsDecoded === this.rects) {
         this._executeRects();
      }
   }
};





/*
 *
 * Server message handling
 *
 */


/*
 *------------------------------------------------------------------------------
 *
 * _gobble
 *
 *    Throws away a sequence of bytes and calls next().
 *    Like _skipBytes(), but usable with _setReadCB().
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Skips a message chunk.
 *    Calls a dynamic callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._gobble = function (next) {
   this._skipBytes(this.nextBytes);
   next();
};


/*
 *------------------------------------------------------------------------------
 *
 * _getNextServerMessage
 *
 *    Sets up parser to expect the head of a new message from the server.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._getNextServerMessage = function () {
   this._setReadCB(1, this._handleServerMsg);
};



/*
 *------------------------------------------------------------------------------
 *
 * _framebufferUpdate
 *
 *    Parses header of new image being received.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Resets FB update parser.
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._framebufferUpdate = function () {
   this.updateReqId = this._readByte();
   this.rects = this._readInt16();
   this.rectsRead = 0;
   this.rectsDecoded = 0;
   this._setReadCB(12, this._readRect);
};



/*
 *------------------------------------------------------------------------------
 *
 * _handleServerInitializedMsg
 *
 *    Callback to handle VNC server init'd message.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sets various instance-wide config vars that describe the connection.
 *    Processes the message.
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._handleServerInitializedMsg = function () {
   var self = this;

   /*
    * Screen size
    */
   this._FBWidth  = this._readInt16();
   this._FBHeight = this._readInt16();

   /*
    * PIXEL_FORMAT
    * We really only need the depth/bpp and endian flag.
    */
   var bpp           = this._readByte();
   var depth         = this._readByte();
   var bigEndian     = this._readByte();
   var trueColor     = this._readByte();

   console.log('Screen: ' + this._FBWidth + ' x ' + this._FBHeight +
               ', bits-per-pixel: ' + bpp + ', depth: ' + depth +
               ', big-endian-flag: ' + bigEndian +
               ', true-color-flag: ' + trueColor);

   /*
    * Skip the 'color'-max values.
    */
   this._skipBytes(6);

   var redShift = this._readByte();
   var greenShift = this._readByte();
   var blueShift = this._readByte();

   console.log('red shift: ' + redShift +
               ', green shift: ' + greenShift +
               ', blue shift: ' + blueShift);

   /*
    * Skip the 3 bytes of padding
    */
   this._skipBytes(3);

   /*
    * Read the connection name.
    */
   var nameLength   = this._readInt32();

   this.options.onNewDesktopSize(this._FBWidth, this._FBHeight);

   /*
    * After measuring on many browsers, these appear to be universal
    * best choices for blits and offscreen blits respectively.
    */
   this._copyRectBlit = this._copyRectDrawImageTemp;
   this._copyRectOffscreenBlit = this._copyRectDrawImage;

   // keyboard.grab();

   if (trueColor) {
      this._FBBytesPerPixel = 4;
      this._FBDepth        = 3;
   } else {
      return this.fail('no colormap support');
   }

   var getFBName = function () {
      self._FBName = self._readString(nameLength);

      self._sendClientEncodingsMsg();
      self._sendFBUpdateRequestMsg(0);

      if (self._encrypted) {
         console.log('Connected (encrypted) to: ' + self._FBName);
      } else {
         console.log('Connected (unencrypted) to: ' + self._FBName);
      }

      self._serverInitialized = true;
      self._getNextServerMessage();
   };

   this._setReadCB(nameLength, getFBName);
};


/*
 *------------------------------------------------------------------------------
 *
 * _readServerInitializedMsg
 *
 *    Abstraction to set the parser to read a ServerInitializedMsg.
 *    This is used in both _handleSecurityResultMsg() and connect().
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._readServerInitializedMsg = function() {
   this._setReadCB(24, this._handleServerInitializedMsg);
};


/*
 *------------------------------------------------------------------------------
 *
 * _handleSecurityResultMsg
 *
 *    Callback to handle VNC security result message.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Processes the message.
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._handleSecurityResultMsg = function () {
   var self = this;
   var reasonLength;
   var handleReason = function() {
      var reason = self._readString(reasonLength);
      self.options.onAuthenticationFailed();
      return self.fail(reason);
   };

   var handleReasonLength = function() {
      reasonLength = self._readInt32();
      self._setReadCB(reasonLength, handleReason);
   };


   switch (this._readInt32()) {
      case 0:  // OK
         /*
          * Send '1' to indicate the the host should try to
          * share the desktop with others.  This is currently
          * ignored by our server.
          */
         this._sendBytes([1]);
         this._readServerInitializedMsg();
         return;
      case 1:  // failed
         this._setReadCB(4, handleReasonLength);
         return;
      case 2:  // too-many
         this.options.onAuthenticationFailed();
         return this.fail("Too many auth attempts");
      default:
         return this.fail("Bogus security result");
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * _handleSecurityMsg
 *
 *    Callback to handle VNC security message.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Processes the message.
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._handleSecurityMsg = function () {
   var authenticationScheme = 0;
   var numTypes;
   var reasonLength;
   var self = this;

   var handleReason = function() {
      var reason = this._readString(reasonLength);
      self.options.onAuthenticationFailed();
      return self.fail(reason);
   };

   var handleReasonLength = function() {
      reasonLength = self._readInt32();
      self._setReadCB(reasonLength, handleReason);
   };

   var handleSecurityTypes = function() {
      var securityTypes = self._readBytes(numTypes);
      console.log("Server security types: " + securityTypes);
      for (i=0; i < securityTypes.length; i+=1) {
         if (securityTypes && (securityTypes[i] < 3)) {
            authenticationScheme = securityTypes[i];
         }
      }
      if (authenticationScheme === 0) {
         return self.fail("Unsupported security types: " + securityTypes);
      }
      self._sendBytes([authenticationScheme]);
      console.log('Using authentication scheme: ' + authenticationScheme);
      if (authenticationScheme === 1) {
         // No authentication required - just handle the result state.
         self._setReadCB(4, self._handleSecurityResultMsg);
      } else {
         return self.fail("vnc authentication not implemented");
      }
   };

   numTypes = this._readByte();
   if (numTypes === 0) {
      this._setReadCB(4, handleReasonLength);
   } else {
      this._setReadCB(numTypes, handleSecurityTypes);
   }
};

/*
 *------------------------------------------------------------------------------
 *
 * _handleRequestConnectVmxMsg
 *
 *    Callback to handle console proxy VMX info request message.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends the VMX string passed to the initial connect call.
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */
WMKS.VNCDecoder.prototype._handleRequestConnectVmxMsg = function () {
   var requestString = this._readString(17);
   if (requestString !== "connect info vmx\n") {
     return this.fail("Invalid connection vmx request: " + requestString);
   }
   this._sendString(this._vmx);
   this._setReadCB(12, this._handleProtocolVersionMsg);
};

/*
 *------------------------------------------------------------------------------
 *
 * _handleProtocolVersionMsg
 *
 *    Callback to handle VNC handshake message.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends own ID string back.
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._handleProtocolVersionMsg = function () {
   var serverVersionPacket = this._readString(12);
   if (serverVersionPacket !== "RFB 003.008\n") {
      return this.fail("Invalid Version packet: " + serverVersionPacket);
   }
   this._sendString("RFB 003.008\n");
   this._setReadCB(1, this._handleSecurityMsg);
};



/*
 *------------------------------------------------------------------------------
 *
 * _handleServerMsg
 *
 *    Parses a VNC message header and dispatches it to the correct callback.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Parses first byte of a message (type ID).
 *    Sets next parser callback.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._handleServerMsg = function () {
   var length, c, red, green, blue;
   var self = this;
   var msgType = this._readByte();

   switch (msgType) {
   case this.msgFramebufferUpdate:
      this._setReadCB(3, this._framebufferUpdate);
      break;
   case this.msgSetColorMapEntries:
      var getNumColors = function () {
         self._skipBytes(3);
         var numColours = self._readInt16();
         // XXX: just ignoring incoming colors
         self._setReadCB(6 * numColors, self._gobble, self._getNextServerMessage);
      };
      this._setReadCB(5, getNumColors);
      break;
   case this.msgRingBell:
      this._getNextServerMessage();
      break;
   case this.msgServerCutText:
      var getServerCutTextHead = function () {
         self._readBytes(3);  // Padding
         length = self._readInt32();
         // XXX: just ignoring the incoming text
         self._setReadCB(length, self._gobble, self._getNextServerMessage);
      };

      this._setReadCB(8, getServerCutTextHead);
      break;
   case this.msgVMWSrvMessage:
      var getVMWSrvMsgHead = function () {
         var id = self._readByte();
         var len = self._readInt16();
         var caps = self._readInt32();
         if (id !== 0 || len < 8) {
            self.options.onProtocolError();
            return self.fail('unknown VMW server submessage ' + id);
         }
         self.useVMWKeyEvent = !!(caps & self.serverCapKeyEvent);
         self.useVMWAck      = !!(caps & self.serverCapUpdateAck);
         self.useVMWRequestResolution = !!(caps & self.serverCapRequestResolution);

         /*
          * If we have already been asked to send a resolution request
          * to the server, this is the point at which it becomes legal
          * to do so.
          */
         if (self.useVMWRequestResolution &&
             self.requestedWidth > 0 &&
             self.requestedHeight > 0) {
            this.onRequestResolution(self.requestedWidth,
                                     self.requestedHeight);
         }

         if (len > 8) {
            self._setReadCB(len-8, self._gobble, self._getNextServerMessage);
         } else {
            self._getNextServerMessage();
         }
      };

      this._setReadCB(7, getVMWSrvMsgHead);
      break;

   default:
      this.options.onProtocolError();
      return this.fail('Disconnected: illegal server message type ' + msgType);
   }

};



/*
 *------------------------------------------------------------------------------
 *
 * _processMessages
 *
 *    VNC message loop.
 *    Dispatches data to the specified callback(s) until nothing is left.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Calls dynamically specified callbacks.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype._processMessages = function () {
   while (this._state === this.VNC_ACTIVE_STATE &&
         this._receiveQueueBytesUnread() >= this.nextBytes) {
      var nrBytes = this.nextBytes;
      var before = this._receiveQueueBytesUnread();
      this.nextFn(this.nextArg);
      var after = this._receiveQueueBytesUnread();
      if (nrBytes < before - after) {
         return this.fail("decode overrun " + nrBytes + " vs " +
                          (before - after));
      }
   }
};





/** @public */

/*
 *
 * Event handlers called from the UI
 *
 */


/*
 *------------------------------------------------------------------------------
 *
 * onMouseMove
 *
 *    Updates absolute mouse state internally and on the server.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends data.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype.onMouseMove = function (x, y) {
   this._mouseX = x;
   this._mouseY = y;

   if (this._serverInitialized) {
      this._mouseActive = true;
      if (this._mouseTimer === null) {
         this._sendMouseEvent();
         this._mouseTimer = setTimeout(this.mouseTimeout,
                                       this.mouseTimeResolution);
      }
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * onMouseButton
 *
 *    Updates absolute mouse state internally and on the server.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends data.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype.onMouseButton = function (x, y, down, bmask) {
   this._mouseX = x;
   this._mouseY = y;
   if (down) {
      this._mouseButtonMask |= bmask;
   } else {
      this._mouseButtonMask &= ~bmask;
   }
   if (this._serverInitialized) {
      this._mouseActive = true;
      this._sendMouseEvent();
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * onKeyVScan
 *
 *    Sends a VMware VScancode key event to the server.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends data.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype.onKeyVScan = function (keysym, down) {
   if (this._serverInitialized) {
      var arr = [];
      arr.push8(this.msgVMWClientMessage);
      arr.push8(0);   // Key message sub-type
      arr.push16(8);  // Length
      arr.push16(keysym);
      arr.push8(down);
      arr.push8(0);   /// padding
      this._sendBytes(arr);
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * onMouseWheel
 *
 *    Sends a VMware mouse wheel event to the server.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends data.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype.onMouseWheel = function(x, y, dx, dy) {
   if (this._serverInitialized) {
      var arr = [];
      arr.push8(this.msgVMWClientMessage);
      arr.push8(2);    // Pointer event 2 message sub-type
      arr.push16(19);  // Length
      arr.push8(1);    // isAbsolute
      arr.push32(x);
      arr.push32(y);
      arr.push32(0);
      arr.push8(dy);
      arr.push8(dx);
      this._sendBytes(arr);
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * onRequestResolution
 *
 *    Schedules a rate-limited VMware resolution request from client
 *    to server.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends data.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype.onRequestResolution = function(width, height) {
   this.requestedWidth = width;
   this.requestedHeight = height;

   if (this._serverInitialized &&
       this.useVMWRequestResolution &&
       (width !== this._FBWidth || height !== this._FBHeight)) {

      this.resolutionRequestActive = true;

      /*
       * Cancel any previous timeout and start the clock ticking
       * again.  This means that opaque window resizes will not
       * generate intermediate client->server messages, rather we will
       * wait until the user has stopped twiddling for half a second
       * or so & send a message then.
       */
      clearTimeout(this.resolutionTimer);
      this.resolutionTimer = setTimeout(this.resolutionTimeout,
                                        this.resolutionDelay);
   }
};


/*
 *
 * Connection handling
 *
 */


/*
 *------------------------------------------------------------------------------
 *
 * disconnect
 *
 *    Tears down the WebSocket and discards internal state.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    See above.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype.disconnect = function () {
   "use strict";

   if (this._state !== this.DISCONNECTED) {
      this._state = this.DISCONNECTED;
      this._websocket.close();
      delete this._websocket;
      this._receiveQueue = "";
      this._receiveQueueIndex = 0;
      this.rects = 0;
      this._receivedFirstUpdate = false;
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * connect
 *
 *    Initialises the client and connects to the server.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Resets state and connects to the server.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype.connect = function (destinationUrl, vmx) {
   var self = this;

   this._state = this.VNC_ACTIVE_STATE;

   this.setRenderCanvas(this.options.canvas);

   /*
    * This closure is run whenever the handler indicates it's
    * completed its decoding pass. We use it to indicate to the
    * server that we've decoded this request if this is the last
    * rect in the update.
    */
   this.onDecodeComplete = function () {
      self.rectsDecoded++;
      if (self.rectsDecoded === self.rects && self.rectsRead === self.rects) {
         self._state = self.FBU_DECODING_STATE;
         self._executeRects();
      }
   };

   this.msgTimeout = function() {
      self._state = self.VNC_ACTIVE_STATE;
      self._processMessages();
   };

   this.mouseTimeout = function() {
      self._mouseTimer = null;
      if (self._mouseActive) {
         self._sendMouseEvent();
         self._mouseTimer = setTimeout(self.mouseTimeout, self.mouseTimeResolution);
      }
   };

   /*
    * Timer callback to limit the rate we send resolution-request
    * packets to the server.  No more than once a second is plenty.
    */
   this.resolutionTimeout = function() {
      if (self.resolutionRequestActive) {
         self._sendResolutionRequest();
         self.resolutionRequestActive = false;
      }
   };

   if (this.options.useVNCHandshake) {
      this._setReadCB(17, self._handleRequestConnectVmxMsg);
   } else {
      /*
       * On a standard MKS connection, we don't deal with the VNC handshake,
       * so skip it.
       */
      this._readServerInitializedMsg();
   }

   this._url = destinationUrl;
   this._vmx = vmx;
   this._receiveQueue = "";
   this._receiveQueueIndex = 0;

   this.wsOpen = function (evt) {
      self.options.onConnecting();
      if (this.protocol !== "base64" &&
          this.protocol !== "uint8utf8" &&
          this.protocol !== "binary") {
         return this.fail("no agreement on protocol");
      }

      if (this.protocol === "binary") {
         this.binaryType = "arraybuffer";
         console.log('WebSocket HAS binary support');
      }

      console.log('WebSocket created newAPI: ' + self.newAPI +
                  ' protocol: ', this.protocol);
   };

   this.wsClose = function (evt) {
      self.options.onDisconnected(evt.reason, evt.code);
   };

   this.wsMessage = function (evt) {
      if (self._receiveQueueIndex > self._receiveQueue.length) {
         return this.fail("overflow receiveQueue");
      } else if (self._receiveQueueIndex === self._receiveQueue.length) {
         self._receiveQueue = "";
         self._receiveQueueIndex = 0;
      } else if (self._recieveQueueIndex > self._receiveQueueSliceTrigger) {
         self._receiveQueue = self._receiveQueue.slice(self._receiveQueueIndex);
         self._receiveQueueIndex = 0;
      }

      if (typeof evt.data !== "string") {
         var data = new Uint8Array(evt.data);
         self._receiveQueue = self._receiveQueue.concat(stringFromArray(data));
      } else if (this.protocol === "base64") {
         var data = Base64.decodeToString(evt.data);
         self._receiveQueue = self._receiveQueue.concat(data);
      } else {
         self._receiveQueue = self._receiveQueue.concat(evt.data);
      }
      self._processMessages();
   };

   this.wsError = function (evt) {
      self.options.onError(evt);
   };

   this.wsHixieOpen = function (evt) {
      this.protocol = self.protocolGuess;
      this.onclose = self.wsClose;
      this.onopen = self.wsOpen;
      this.onopen(evt);
   };

   this.wsHixieNextProtocol = function (evt) {
      if (self.protocolList.length > 0) {
         self.protocolGuess = self.protocolList[0];
         self.protocolList = self.protocolList.slice(1);
         self._websocket = new WMKSWebSocket(self._url, self.protocolGuess);
         self._websocket.onopen = self.wsHixieOpen;
         self._websocket.onclose = self.wsHixieNextProtocol;
         self._websocket.onmessage = self.wsMessage;
         self._websocket.onerror = self.wsError;
      } else {
         self.wsClose(evt);
      }
   };

   /*
    * Note that the Hixie WebSockets (used in current Safari) do not
    * support passing multiple protocols to the server - at most a
    * single string is passed, and the server must accept that
    * protocol or fail the connection.  We would like to try uint8utf8
    * first but fall back to base64 if that is all that the server
    * supports.  This is easy with Hybi and newer APIs, but needs
    * extra code to work on Safari.
    */
   if (window.WebSocket.CLOSING) {
      this.newAPI = true;
   } else {
      this.newAPI = false;
   }

   if ($.browser.msie) {
      /*
       * IE9 doesn't like uint8utf8, haven't established why not.
       */
      this.protocolList = ["base64"];
   } else if (!(window.WebSocket.__flash) &&
              this.newAPI &&
              typeof(ArrayBuffer) !== undefined) {
      this.protocolList = ["binary", "uint8utf8", "base64"];
   } else {
      this.protocolList = ["uint8utf8", "base64"];
   }

   if (this.newAPI) {
      this._websocket = new WMKSWebSocket(this._url, this.protocolList);
      this._websocket.onopen = this.wsOpen;
      this._websocket.onclose = this.wsClose;
      this._websocket.onmessage = this.wsMessage;
      this._websocket.onerror = this.wsError;
   } else {
      this.wsHixieNextProtocol();
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * setRenderCanvas
 *
 *    Set the canvas that is used to render the image data. Used by the
 *    analyzer to redirect pixel data to a backbuffer.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    This canvas is also used as the source for blits, so it should be set
 *    early on and not modified externally afterwards.
 *
 *------------------------------------------------------------------------------
 */

WMKS.VNCDecoder.prototype.setRenderCanvas = function (rc) {
   this._canvas[0] = rc;
   this._canvas[0].ctx = rc.getContext('2d');

   if (!this._canvas[0].ctx.createImageData) {
      throw("no canvas imagedata support");
   }
};

/*
 * wmks/keyboardUtils.js
 *
 *   WebMKS keyboard event decoder and key remapper.
 *
 */

WMKS.keyboardUtils = {};



WMKS.keyboardUtils._keyInfoTemplate = {
   jsScanCode: 0,
   vScanCode: 0,
};



/*
 *------------------------------------------------------------------------------
 *
 * keyDownUpInfo
 *
 *    Parses a keydown/keyup event.
 *
 * Results:
 *    { jsScanCode,  The JavaScript-reposted scancode, if any. Arbitrary.
 *      vScanCode }  The VMX VScancode for the key on a US keyboard, if any.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

WMKS.keyboardUtils.keyDownUpInfo = function(event) {
   var evt = event || window.event;
   var ki = this._keyInfoTemplate;

   if (evt.type === 'keydown' || evt.type === 'keyup') {
      /*
       * Convert JS scancode to VMware VScancode
       */
      ki.jsScanCode = evt.keyCode;
      ki.vScanCode = this._jsToVScanTable[ki.jsScanCode];

      /*
       * Workaround ie9/ie10 enter key behaviour.  We receive
       * keydown/keyup events but no keypress events for the enter
       * key.  On the other hand Firefox and Chrome give us
       * keydown/keyup *plus* keypress events for this key.  Short of
       * using a timer, don't see a way to catch both cases without
       * introducing a browser dependency here.
       */
      if ($.browser.msie && ki.jsScanCode == 13) {
         ki.vScanCode = 28;
      }
   }

   return ki;
};


/*
 *------------------------------------------------------------------------------
 *
 * keyPressInfo
 *
 *    Parses a keypress event.
 *
 * Results:
 *    The Unicode character generated during the event, or 0 if none.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

WMKS.keyboardUtils.keyPressInfo = function(event) {
   var evt = event || window.event;
   var uChar = 0;

   if (evt.type === 'keypress') {
      uChar = evt.which;

      /*
       * Handle Backspace, Tab, ESC via keyDown instead.
       */
      if (uChar == 8 || uChar == 9 || uChar == 27) {
         uChar = 0;
      }
   }

   return uChar;
};





/*
 * JS scancode to VMware VScancode conversion table
 */
WMKS.keyboardUtils._jsToVScanTable = {
   // Space, enter, tab, escape, backspace
   //32 : 0x039,
   //13 : 0x01c,
   9 : 0x00f,
   27 : 0x001,
   8 : 0x00e,

   // shift, control, alt, Caps Lock, Num Lock
   16 : 0x02a,     // left shift
   17 : 0x01d,     // left control
   18 : 0x038,     // left alt
   20 : 0x03a,
   144 : 0x045,

   // Arrow keys (left, up, right, down)
   37 : 0x14b,
   38 : 0x148,
   39 : 0x14d,
   40 : 0x150,

   // Special keys (Insert, delete, home, end, page up, page down, F1 - F12)
   45 : 0x152,
   46 : 0x153,
   36 : 0x147,
   35 : 0x14f,
   33 : 0x149,
   34 : 0x151,
   112 : 0x03b,
   113 : 0x03c,
   114 : 0x03d,
   115 : 0x03e,
   116 : 0x03f,
   117 : 0x040,
   118 : 0x041,
   119 : 0x042,
   120 : 0x043,
   121 : 0x044,
   122 : 0x057,
   123 : 0x058,

   // Special Keys (Left Apple/Command, Right Apple/Command, Left Windows, Right Windows, Menu)
   224 : 0x038,
   // ? : 0x138,
   91 : 0x15b,
   92 : 0x15c,
   93 : 0, //?

   42 : 0x054,  // PrintScreen / SysRq
   19 : 0x100,  // Pause / Break

   /*
    * Commented out since these are locking modifiers that easily get
    * out of sync between server and client and thus cause unexpected
    * behaviour.
    */
   //144 : 0x045,  // NumLock
   //20 : 0x03a,  // CapsLock
   //145 : 0x046,  // Scroll Lock
};
/*globals WMKS */

WMKS.keyboardMapper = function(options) {
   if (!options.vncDecoder) {
      return null;
   }

   this._vncDecoder = options.vncDecoder;

   this._keysDownVScan = [];
   this._keysDownUnicode = [];

   this.VSCAN_CAPS_LOCK_KEY = 58;
   this.VSCAN_CMD_KEY = 347;

   // The current repeating typematic key
   this._typematicKeyVScan = 0;
   this._typematicDelayTimer = null;

   return this;
};


WMKS.keyboardMapper.prototype.doKeyVScan = function(vscan, down) {
   if (!this._vncDecoder.useVMWKeyEvent) {
      return;
   }

   /*
    * Caps lock is an unusual key and generates a 'down' when the
    * caps lock light is going from off -> on, and then an 'up'
    * when the caps lock light is going from on -> off. The problem
    * is compounded by a lack of information between the guest & VMX
    * as to the state of caps lock light. So the best we can do right
    * now is to always send a 'down' for the Caps Lock key to try and
    * toggle the caps lock state in the guest.
    */
   if (vscan === this.VSCAN_CAPS_LOCK_KEY && (navigator.platform.indexOf('Mac') !== -1)) {
       this._vncDecoder.onKeyVScan(vscan, 1);
       this._vncDecoder.onKeyVScan(vscan, 0);
       return;
   }

   /*
    * Manage an array of VScancodes currently held down.
    */
   if (down) {
      if (this._keysDownVScan.indexOf(vscan) <= -1) {
         this._keysDownVScan.push(vscan);
      }
      this.beginTypematic(vscan);
   } else {
      this.cancelTypematic(vscan);
      /*
       * If the key is in the array of keys currently down, remove it.
       */
      var index = this._keysDownVScan.indexOf(vscan);
      if (index >= 0) {
         this._keysDownVScan.splice(index, 1);
      }
   }

   /*
    * Send the event.
    */
   this._vncDecoder.onKeyVScan(vscan, down);
};


WMKS.keyboardMapper.prototype.doKeyUnicode = function(uChar, down) {
   if (!this._vncDecoder.useVMWKeyEvent) {
      return;
   }

   /*
    * Manage an array of Unicode chars currently "held down".
    */
   if (down) {
      this._keysDownUnicode.push(uChar);
   } else {
      /*
       * If the key is in the array of keys currently down, remove it.
       */
      var index = this._keysDownUnicode.indexOf(uChar);
      if (index >= 0) {
         this._keysDownUnicode.splice(index, 1);
      }
   }


   var modvscan = this._tableUnicodeToVScan[uChar];

   /*
    * Press the final key itself.
    */
   if (modvscan) {
      if (down) {
         this.beginTypematic(modvscan & 0x1ff);
      } else {
         this.cancelTypematic(modvscan & 0x1ff);
      }
      this._vncDecoder.onKeyVScan(modvscan & 0x1ff, down);
   }
};


WMKS.keyboardMapper.prototype.doReleaseAll = function() {
   var i;

   for (i = 0; i < this._keysDownUnicode.length; i++) {
      this.doKeyUnicode(this._keysDownUnicode[i], 0);
   }
   if (this._keysDownUnicode.length > 0) {
      console.log("Warning: Could not release all Unicode keys.");
   }

   for (i = 0; i < this._keysDownVScan.length; i++) {
      this.cancelTypematic(this._keysDownVScan[i]);
      this._vncDecoder.onKeyVScan(this._keysDownVScan[i], 0);
   }
   this._keysDownVScan = [];
};


/*
 *------------------------------------------------------------------------------
 *
 * beginTypematic
 *
 *    Begin the typematic process for a new key going down. Cancel any pending
 *    timers, record the new key going down and start a delay timer.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

WMKS.keyboardMapper.prototype.beginTypematic = function (vscan) {
   /*
    * Don't begin typematic if the cmd key is down, we don't get
    * a key up for the alpha key if it was down whilst the cmd key
    * was also down. So there's no cancel of typematic.
    */
   if (this._keysDownVScan.indexOf(this.VSCAN_CMD_KEY) >= 0) {
      return;
   }

   // Cancel any typematic delay timer that may have been previously started
   this.cancelTypematicDelay();
   // And cancel any typematic periodic timer that may have been started
   this.cancelTypematicPeriod();
   if (this._vncDecoder.typematicState === 1) {
      // Begin the delay timer, when this fires we'll
      // start auto-generating down events for this key.
      this.startTypematicDelay(vscan);
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * cancelTypematic
 *
 *    Cancel the typematic process for a key going up. If the key going up is our
 *    current typematic key then cancel both delay and periodic timers (if they exist).
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

WMKS.keyboardMapper.prototype.cancelTypematic = function (vscan) {
    if (this._typematicKeyVScan === vscan) {
       this.cancelTypematicDelay();
       this.cancelTypematicPeriod();
    }
};


/*
 *------------------------------------------------------------------------------
 *
 * cancelTypematicDelay
 *
 *    Cancel a typematic delay (before auto-repeat) .
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

WMKS.keyboardMapper.prototype.cancelTypematicDelay = function() {
   if (this._typematicDelayTimer !== null) {
      clearTimeout(this._typematicDelayTimer);
   }
   this._typematicDelayTimer = null;
};


/*
 *------------------------------------------------------------------------------
 *
 * cancelTypematicPeriod
 *
 *    Cancel a typematic periodic timer (the auto-repeat timer) .
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

WMKS.keyboardMapper.prototype.cancelTypematicPeriod = function() {
    if (this.__typematicPeriodTimer !== null) {
        clearInterval(this._typematicPeriodTimer);
    }
    this._typematicPeriodTimer = null;
};


/*
 *------------------------------------------------------------------------------
 *
 * startTypematicDelay
 *
 *    Start the typematic delay timer, when this timer fires, the specified
 *    auto-repeat will begin and send the recorded typematic key vscan code.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

WMKS.keyboardMapper.prototype.startTypematicDelay = function(vscan) {
   var self = this;
   this._typematicKeyVScan = vscan;
   this._typematicDelayTimer = setTimeout(function () {
     self._typematicPeriodTimer = setInterval(function() {
        self._vncDecoder.onKeyVScan(self._typematicKeyVScan, 1);
     }, self._vncDecoder.typematicPeriod / 1000);
   }, this._vncDecoder.typematicDelay / 1000);
};


/*
 * Unicode to VMware VScancode conversion tables
 */

//WMKS.keyboardMapper.prototype._modShift = 0x1000;
//WMKS.keyboardMapper.prototype._modCtrl  = 0x2000;
//WMKS.keyboardMapper.prototype._modAlt   = 0x4000;
//WMKS.keyboardMapper.prototype._modWin   = 0x8000;

WMKS.keyboardMapper.prototype._tableUnicodeToVScan = {
   // Space, enter, backspace
   32 : 0x39,
   13 : 0x1c,
   //8 : 0x0e,

   // Keys a-z
   97  : 0x1e,
   98  : 0x30,
   99  : 0x2e,
   100 : 0x20,
   101 : 0x12,
   102 : 0x21,
   103 : 0x22,
   104 : 0x23,
   105 : 0x17,
   106 : 0x24,
   107 : 0x25,
   108 : 0x26,
   109 : 0x32,
   110 : 0x31,
   111 : 0x18,
   112 : 0x19,
   113 : 0x10,
   114 : 0x13,
   115 : 0x1f,
   116 : 0x14,
   117 : 0x16,
   118 : 0x2f,
   119 : 0x11,
   120 : 0x2d,
   121 : 0x15,
   122 : 0x2c,

   // keyboard number keys (across the top) 1,2,3... -> 0
   49 : 0x02,
   50 : 0x03,
   51 : 0x04,
   52 : 0x05,
   53 : 0x06,
   54 : 0x07,
   55 : 0x08,
   56 : 0x09,
   57 : 0x0a,
   48 : 0x0b,

   // Symbol keys ; = , - . / ` [ \ ] '
   59 : 0x27, // ;
   61 : 0x0d, // =
   44 : 0x33, // ,
   45 : 0x0c, // -
   46 : 0x34, // .
   47 : 0x35, // /
   96 : 0x29, // `
   91 : 0x1a, // [
   92 : 0x2b, // \
   93 : 0x1b, // ]
   39 : 0x28,  // '


   // Keys A-Z
   65 : 0x001e,
   66 : 0x0030,
   67 : 0x002e,
   68 : 0x0020,
   69 : 0x0012,
   70 : 0x0021,
   71 : 0x0022,
   72 : 0x0023,
   73 : 0x0017,
   74 : 0x0024,
   75 : 0x0025,
   76 : 0x0026,
   77 : 0x0032,
   78 : 0x0031,
   79 : 0x0018,
   80 : 0x0019,
   81 : 0x0010,
   82 : 0x0013,
   83 : 0x001f,
   84 : 0x0014,
   85 : 0x0016,
   86 : 0x002f,
   87 : 0x0011,
   88 : 0x002d,
   89 : 0x0015,
   90 : 0x002c,

   33 : 0x0002, // !
   64 : 0x0003, // @
   35 : 0x0004, // #
   36 : 0x0005, // $
   37 : 0x0006, // %
   94 : 0x0007, // ^
   38 : 0x0008, // &
   42 : 0x0009, // *
   40 : 0x000a, // (
   41 : 0x000b, // )

   58  : 0x0027, // :
   43  : 0x000d, // +
   60  : 0x0033, // <
   95  : 0x000c, // _
   62  : 0x0034, // >
   63  : 0x0035, // ?
   126 : 0x0029, // ~
   123 : 0x001a, // {
   124 : 0x002b, // |
   125 : 0x001b, // }
   34  : 0x0028, // "
};

/*
 * wmks/widgetProto.js
 *
 *   WebMKS widget prototype for use with jQuery-UI.
 *
 *
 * A widget for displaying a remote MKS or VNC stream over a WebSocket.
 *
 * This widget can be dropped into any page that needs to display the screen
 * of a VM. It communicates over a WebSocket connection using VMware's
 * enhanced VNC protocol, which is compatible either with a VM's configured
 * VNC WebSocket port or with a proxied Remote MKS connection.
 *
 * A few options are provided to customize the behavior of the WebMKS:
 *
 *    * fitToParent (default: true)
 *      - Scales the guest screen size to fit within the WebMKS's
 *        allocated size. It's important to note that this does
 *        not resize the guest resolution.
 *
 *    * fitGuest (default: false)
 *      - Requests that the guest change its resolution to fit within
 *        the WebMKS's allocated size.  Compared with fitToParent, this
 *        does resize the guest resolution.
 *
 *    * useNativePixels (default: false)
 *      - Enables the use of native pixel sizes on the device. On iPhone 4+ or
 *        iPad 3+, turning this on will enable "Retina mode," which provides
 *        more screen space for the guest, making everything much smaller.
 *
 *    * allowMobileKeyboardInput (default: true)
 *      - Enables the use of a native on-screen keyboard for mobile devices.
 *        When enabled, the showKeyboard() and hideKeyboard() functions
 *        will pop up a keyboard that can be used to interact with the VM.
 *
 *    * useVNCHandshake (default: true)
 *      - Enables a standard VNC handshake. This should be used when the
 *        endpoint is using standard VNC authentication. Set to false if
 *        connecting to a proxy that authenticates through authd and does
 *        not perform a VNC handshake.
 *
 * Handlers can also be registered to be triggered under certain circumstances:
 *
 *    * connecting
 *      - called when the websocket to the server is opened.
 *
 *    * connected
 *      - called when the websocket connection to the server has completed, the protocol
 *        has been negotiated and the first update from the server has been received, but
 *        not yet parsed, decoded or displayed.
 *
 *    * disconnected
 *      - called when the websocket connection to the server has been lost, either
 *        due to a normal shutdown, a dropped connection, or a failure to negotiate
 *        a websocket upgrade with a server. This handler is passed a map of information
 *        including a text reason string (if available) and a disconnection code from
 *        RFC6455.
 *
 *    * authenticationfailed
 *      - called when the VNC authentication procedure has failed. NOTE: this is only
 *        applicable if VNC style auth is used, other authentication mechanisms outside
 *        of VNC (such as authd tickets) will NOT trigger this handler if a failure
 *        occurs.
 *
 *    * error
 *      - called when an error occurs on the websocket. It is passed the DOM Event
 *        associated with the error.
 *
 *    * protocolerror
 *      - called when an error occurs during the parsing or a received VNC message, for
 *        example if the server sends an unsupported message type or an incorrectly
 *        formatted message.
 *
 *    * resolutionchanged
 *      - called when the resolution of the server's desktop has changed. It's passed
 *        the width and height of the new resolution.
 *
 *  Handlers should be registered using jQuery bind and the 'wmks' prefix:
 *
 *     .bind("wmksdisconnected", function(evt, info) {
 *           // Your handler code
 *      });
 */

WMKS.widgetProto = {};

WMKS.widgetProto.options = {
   fitToParent: false,
   fitGuest: false,
   useNativePixels: false,
   allowMobileKeyboardInput: true,
   useVNCHandshake: true
};

WMKS.widgetProto.SHIFT_KEYSYM = 0x02a;
WMKS.widgetProto.TOUCH_STATE_NONE = 0;
WMKS.widgetProto.TOUCH_STATE_MOUSE = 1;
WMKS.widgetProto.TOUCH_STATE_PANNING = 2;
WMKS.widgetProto.TOUCH_STATE_WAIT_NONE = 3;

/* These timeout values must always be in the following numerical order. */
WMKS.widgetProto.TOUCH_WAIT_PANNING_MS = 25;
WMKS.widgetProto.TOUCH_WAIT_FINGERS_MS = 100;
WMKS.widgetProto.TOUCH_TIMEOUT_MS = 500;

WMKS.widgetProto.TOUCH_WHEEL_MOVE_THRESHOLD = 30; // in pixels

WMKS.widgetProto.WHEEL_UP = 0x08;
WMKS.widgetProto.WHEEL_DOWN = 0x10;



/************************************************************************
 * Private Functions
 ************************************************************************/

/*
 *------------------------------------------------------------------------------
 *
 * _updatePixelRatio
 *
 *    Recalculates the pixel ratio used for displaying the canvas.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Stores new pixel ratio in this._pixelRatio.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto._updatePixelRatio = function() {
   if (this.options.useNativePixels) {
      this._pixelRatio = window.devicePixelRatio || 1.0;
   } else {
      this._pixelRatio = 1.0;
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * _updateMobileKeyboardInput
 *
 *    Shows/hides an offscreen <input> field to force the virtual keyboard
 *    to show up on tablet devices.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Modifies DOM.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto._updateMobileKeyboardInput = function() {
   if (this.options.allowMobileKeyboardInput) {
      var self = this,
         DEFAULT_VAL = ' '; // Allows backspace repeat on iOS

      this._keyboardInputEl = $('<input/>', {
               autocorrect: 'off',
               autocapitalize: 'none'
         })
         .val(DEFAULT_VAL)
         .bind('keydown', function(e) {
               return self._onKeyDown(e);
         })
         .bind('keypress', function(e) {
               return self._onKeyPress(e);
         })
         .bind('keyup', function(e) {
               return self._onKeyUp(e);
         })
         .bind('input', function(e) {
               /* We may have received speech-to-text input or something. */
               var val = $(this).val().substring(DEFAULT_VAL.length);

               if (val !== '') {
                  self.sendKeyInput(val);
                  $(this).val(DEFAULT_VAL);
               }
         })
         .css({
               position: 'absolute',
               left: -1000,
               top: -1000
         })
         .appendTo(document.body);
   } else {
      if (this._keyboardInputEl) {
         this._keyboardInputEl.remove();
      }

      this._keyboardInputEl = null;
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * _setOption
 *
 *    Changes a WMKS option.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Updates the given option in this.options.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto._setOption = function(key, value) {
   $.Widget.prototype._setOption.apply(this, arguments);

   switch (key) {
      case 'fitToParent':
         this.rescaleOrResize(false);
         break;

      case 'fitGuest':
         this.rescaleOrResize(true);
         break;

      case 'useNativePixels':
         this._updatePixelRatio();
         this.rescaleOrResize(false);
         break;

      case 'allowMobileKeyboardInput':
         this._updateMobileKeyboardInput();
         break;
   }
};



/*
 *------------------------------------------------------------------------------
 *
 * _onKeyDown
 *
 *    Keyboard event handler for 'keydown' events.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Looks up VScancode for current JS scancode and, if successful,
 *    sends a VMWKeyEvent message to the server.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto._onKeyDown = function(event) {
   ki = WMKS.keyboardUtils.keyDownUpInfo(event);

   if (ki.vScanCode) {
      this._keyboardMapper.doKeyVScan(ki.vScanCode, 1);

      this._lastJSScanCode = 0;

      /*
       * Suppress default actions if the key was handled via its VScancode.
       */
      event.stopPropagation();
      event.preventDefault();
      return false;
   }

   /*
    * Store the last jsScanCode, but only if it seems to be useful.
    * For example, Cyrillic characters on an iPad all generate a zero
    * JS scancode.
    */
   if (ki.jsScanCode > 0) {
      this._lastJSScanCode = ki.jsScanCode;
   }

   return true;
};


/*
 *------------------------------------------------------------------------------
 *
 * _onKeyPress
 *
 *    Keyboard event handler for 'keypress' events.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Dispatches the Unicode character entered by the user to the
 *    keyboardMapper.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto._onKeyPress = function(event) {
   uChar = WMKS.keyboardUtils.keyPressInfo(event);

   if (uChar) {
      /*
       * If valid JS scancode was stored on the last keyDown event, then
       * this Unicode character will be mapped to it until the corresponding
       * keyUp event occurs.
       */
      if (this._lastJSScanCode) {
         /*
          * Check if key is already in the map. If yes, then it is
          * assumed to be depressed already and not processed further
          * (we let the host take care of keyrepeat).
          */
         if (!this._jsScanCodeToUnicodeMap[this._lastJSScanCode]) {
            this._jsScanCodeToUnicodeMap[this._lastJSScanCode] = uChar;
            this._keyboardMapper.doKeyUnicode(uChar, 1);
         }
      } else {
         /*
          * If we do not get a JS scancode then we cannot tell when the
          * key will be released, so simulate immediate release.
          */
         this._keyboardMapper.doKeyUnicode(uChar, 1);
         this._keyboardMapper.doKeyUnicode(uChar, 0);
      }


      this._lastJSScanCode = 0;
   }

   // Suppress default actions
   event.stopPropagation();
   event.preventDefault();
   return false;
};


/*
 *------------------------------------------------------------------------------
 *
 * _onKeyUp
 *
 *    Keyboard event handler for 'keyup' event.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Looks up VScancode for current JS scancode and, if successful,
 *    sends a VMWKeyEvent message to the server.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto._onKeyUp = function(event) {
   ki = WMKS.keyboardUtils.keyDownUpInfo(event);

   if (ki.vScanCode) {
      /*
       * Release a key identified by its VScancode.
       */
      this._keyboardMapper.doKeyVScan(ki.vScanCode, 0);
   } else if (this._jsScanCodeToUnicodeMap[ki.jsScanCode]) {
      /*
       * Release a key identified by a Unicode character...
       */
      this._keyboardMapper.doKeyUnicode(
               this._jsScanCodeToUnicodeMap[ki.jsScanCode], 0);

      /*
       * ... and delete its mapping to a JS scancode.
       */
      delete this._jsScanCodeToUnicodeMap[ki.jsScanCode];
   }

   // Suppress default actions
   event.stopPropagation();
   event.preventDefault();
   return false;
};



/*
 *------------------------------------------------------------------------------
 *
 * _getEventPosition
 *
 *    Gets the mouse event position within the canvas.
 *    Tracks the cursor throughout the document.
 *
 * Results:
 *    The current mouse position in the form { x, y }.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto._getEventPosition = function (evt) {

   var docX, docY, offsetX, offsetY, msg;

   if (evt.pageX || evt.pageY) {
      docX = evt.pageX;
      docY = evt.pageY;
   } else if (evt.clientX || evt.clientY) {
      docX = (evt.clientX +
              document.body.scrollLeft +
              document.documentElement.scrollLeft);
      docY = (evt.clientY +
              document.body.scrollTop +
              document.documentElement.scrollTop);
   } else {
      // ??
   }

   offsetX = this._canvas.offset().left;
   offsetY = this._canvas.offset().top;

   var x = Math.ceil((docX - offsetX) / this._scale * this._pixelRatio);
   var y = Math.ceil((docY - offsetY) / this._scale * this._pixelRatio);

   /*
    * Clamp bottom and right border.
    */
   var maxX = Math.ceil(this._canvas.width() / this._scale * this._pixelRatio) - 1;
   var maxY = Math.ceil(this._canvas.height() / this._scale * this._pixelRatio) - 1;
   x = Math.min(x, maxX);
   y = Math.min(y, maxY);

   /*
    * Clamp left and top border.
    */
   x = Math.max(x, 0);
   y = Math.max(y, 0);

   return { x: x, y: y };
};


/*
 *------------------------------------------------------------------------------
 *
 * _onMouseButton
 *
 *    Mouse event handler for 'mousedown' and 'mouseup' events.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends a VMWPointerEvent message to the server.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto._onMouseButton = function(event, down) {
   if (this._vncDecoder) {
      var evt = event || window.event;
      var pos = this._getEventPosition(evt);
      var bmask;

      if (evt.which) {
         /* everything except IE */
         bmask = 1 << evt.button;
      } else {
         /* IE including 9 */
         bmask = (((evt.button & 0x1) << 0) |
                  ((evt.button & 0x2) << 1) |
                  ((evt.button & 0x4) >> 1));
      }

      if (down) {
         this._mouseDownBMask |= bmask;
      } else {
         this._mouseDownBMask &= ~bmask;
      }

      /*
       * Send MouseMove event first, to ensure the pointer is at the
       * coordinates where the click should happen. This fixes the
       * erratic mouse behaviour when using touch devices to control
       * a Windows machine.
       */
      if (this._mousePosGuest.x !== pos.x ||
          this._mousePosGuest.y !== pos.y) {
         this._vncDecoder.onMouseMove(pos.x, pos.y);
      }

      this._vncDecoder.onMouseButton(pos.x, pos.y, down, bmask);
      this._mousePosGuest = pos;
   }
   return true;
};


/*
 *------------------------------------------------------------------------------
 *
 * _onMouseWheel
 *
 *    Mouse wheel handler. Normalizes the deltas from the event and
 *    sends it to the guest.
 *
 * Results:
 *    true, always.
 *
 * Side Effects:
 *    Sends data.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto._onMouseWheel = function(event) {
   if (this._vncDecoder) {
      var evt = event || window.event;
      var pos = this._getEventPosition(evt),
          dx = Math.max(Math.min(event.wheelDeltaX, 1), -1),
          dy = Math.max(Math.min(event.wheelDeltaY, 1), -1);

      /*
       * Send MouseMove event first, to ensure the pointer is at the
       * coordinates where the click should happen. This fixes the
       * erratic mouse behaviour when using touch devices to control
       * a Windows machine.
       */
      if (this._mousePosGuest.x !== pos.x ||
          this._mousePosGuest.y !== pos.y) {
         this._vncDecoder.onMouseMove(pos.x, pos.y);
      }

      this._vncDecoder.onMouseWheel(pos.x, pos.y, dx, dy);
      this._mousePosGuest = pos;
   }

   // Suppress default actions
   event.stopPropagation();
   event.preventDefault();
   return false;
};


/*
 *------------------------------------------------------------------------------
 *
 * _onMouseMove
 *
 *    Mouse event handler for 'mousemove' event.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends a VMWPointerEvent message to the server.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto._onMouseMove = function(event) {
   if (this._vncDecoder) {
      var evt = event || window.event;
      var pos = this._getEventPosition(evt);

      this._vncDecoder.onMouseMove(pos.x, pos.y);
      this._mousePosGuest = pos;
   }
   return true;
};


/*
 *------------------------------------------------------------------------------
 *
 * _onTouchEvents --
 *
 *    Mouse event handler for 'touchstart', 'touchmove' and 'touchend' events.
 *
 *    Emulates the various mouse events based on the fingers being pressed.
 *    There's a lot going on here, so see the comments below.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends one or more messages to the server, depending on the form of
 *    input.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto._onTouchEvents = function(e) {
   /*
    * Simulating mouse events with just a touchscreen is tricky. We need
    * to be able to handle moving the cursor, clicking, double-clicking,
    * click-and-dragging, and scrolling. Furthermore, we need to handle the
    * different mouse buttons.
    *
    * To do this reliably, we will need to keep track of the various state
    * of the touches and the sequence of touches.
    *
    * When in TOUCH_STATE_NONE:
    *
    *    - If one finger pressed, we're in mouse emulation mode.
    *      Start timer for right-click/additional taps.
    *      Go to TOUCH_STATE_MOUSE
    *
    *    - If multiple fingers pressed, go to TOUCH_STATE_PANNING.
    *
    *    (Note: Since people won't always place fingers on the screen at the
    *           exact same moment, we have some timers to allow for a margin
    *           of error. This allows us to figure out the proper finger
    *           count or MOUSE/PANNING state if the user quickly places one
    *           finger after another.)
    *
    * When in TOUCH_STATE_MOUSE:
    *
    *    - On touchstart:
    *
    *      - If additional fingers are placed while we're in our threshold
    *        for new fingers, modify the button count.
    *
    *    - On touchmove:
    *
    *      - If we're still accepting new fingers, ignore the event.
    *        We don't want spurious mouse events with wrong button counts.
    *
    *      - If we haven't sent a mousedown yet, send it.
    *
    *      - Send a mousemove.
    *
    *    - If the timer expired, we send a right mouse click. Go to
    *      TOUCH_STATE_NONE.
    *
    *    - On touchend:
    *
    *      - If the primary finger was released, send a mousedown with the
    *        right number of buttons.
    *
    *      - Send a mouse up.  Go to TOUCH_STATE_WAIT_NONE to wait until
    *        all fingers are lifted.
    *
    * When in TOUCH_STATE_PANNING:
    *
    *    - If 2 fingers pressed, send matching scroll wheel events.
    *
    *    - If touchend, reset the state and go to TOUCH_STATE_WAIT_NONE.
    *
    * When in TOUCH_STATE_WAIT_NONE:
    *
    *    - Ignore all events until all fingers are removed.
    *      Then go to TOUCH_STATE_NONE.
    */
   var self = this,
       now = new Date().getTime(),
       touches = e.originalEvent.touches;

   if (this._touchState === this.TOUCH_STATE_NONE) {
      /* We're waiting for fingers. */
      if (e.type === 'touchstart') {
         this._touchFingerCount = touches.length;
         this._touchPrimary = touches[0];

         if (this._touchFingerCount === 1) {
            var acceptFingersTimeout;

            /*
             * We're beginning an event that will result in a mouse button
             * event.
             */
            this._touchState = this.TOUCH_STATE_MOUSE;
            this._touchButtonState = 0;
            this._touchStartTime = now;
            this._touchAcceptingFingers = true;

            /*
             * NOTE: TOUCH_WAIT_PANNING_MS < TOUCH_WAIT_FINGERS_MS <
             *       TOUCH_TIMEOUT_MS
             */

            /*
             * Wait a brief period of time for additional finger presses.
             * In reality, people are pretty bad at pressing all fingers
             * at the exact moment, so we need to give them time before
             * making any assumptions about the number of fingers.
             */
            acceptFingersTimeout = window.setTimeout(function() {
               self._touchAcceptingFingers = false;

               if (self._touchFingerCount > 1 &&
                   self._touchState === self.TOUCH_STATE_MOUSE) {
                  /*
                   * At least one additional finger was added so we can
                   * safely say we're doing a mousedown now.
                   */
                  self._sendTouchMouseEvent(e, 'mousedown', self._touchPrimary);
               }
            }, this.TOUCH_WAIT_FINGERS_MS);

            /*
             * If two fingers are placed on the screen before a certain
             * (brief) amount of time, they probably meant to press them
             * simultaneously.
             */
            window.setTimeout(function() {
               if (self._touchFingerCount === 2 &&
                   self._touchState === self.TOUCH_STATE_MOUSE) {
                  /*
                   * Two fingers were pressed at almost the same time.
                   * Move into a panning/scrolling state.
                   */
                  self._touchState = self.TOUCH_STATE_PANNING;
                  self._touchAcceptingFingers = false;
                  window.clearTimeout(acceptFingersTimeout);
                  self._cancelWaitTouchEvents();
               }
            }, this.TOUCH_WAIT_PANNING_MS);

            this._touchTimeout = window.setTimeout(function() {
               /* The user pressed and held. Send a right-click. */
               self._touchTimeout = null;
               self._touchButtonState = 2;
               self._sendTouchMouseEvent(e, 'mousedown', self._touchPrimary);
               self._sendTouchMouseEvent(e, 'mouseup', self._touchPrimary);
            }, this.TOUCH_TIMEOUT_MS);
         } else if (this._touchFingerCount === 2) {
            /*
             * Two fingers were placed, so begin the panning/scrolling mode.
             */
            this._touchState = this.TOUCH_STATE_PANNING;
         }
      }
   } else if (this._touchState === this.TOUCH_STATE_MOUSE) {
      /*
       * One finger has been pressed. We're in the middle of waiting for
       * either more fingers, the primary finger to be lifted/moved, or
       * the timer to go off. Since we're here, the timer hasn't gone off.
       */
      if (!this._touchPrimary) {
         /*
          * Don't do anything. At one point, the primary finger was removed,
          * but that silly person started placing more fingers on the screen,
          * trying to confuse us. We're too smart for that. Just ignore him
          * and he'll go away.
          */
      } else if (e.type === 'touchstart') {
         if (this._touchAcceptingFingers) {
            /*
             * More fingers have been placed on the screen. We're going to go
             * with this count and do a mousedown, with buttons matching the
             * number of fingers (up to 3).
             */
            this._touchFingerCount = touches.length;

            if (this._touchFingerCount === 1) {
               this._touchButtonState = 0;
            } else if (this._touchFingerCount === 2) {
               this._touchButtonState = 2;
            } else {
               this._touchButtonState = 1;
            }
         }
      } else if (e.type === 'touchmove') {
         /*
          * See if the primary finger is moving. That would mean a mousemove.
          */
         if (this._hasTouch(touches, this._touchPrimary) &&
             !this._touchAcceptingFingers) {
            if (this._cancelWaitTouchEvents()) {
               this._sendTouchMouseEvent(e, 'mousedown', this._touchPrimary);
            }

            this._sendTouchMouseEvent(e, 'mousemove', this._touchPrimary);
         }
      } else if (e.type === 'touchend') {
         var changedTouches = e.originalEvent.changedTouches,
             count = touches.length + changedTouches.length,
             firstEvent = this._cancelWaitTouchEvents(),
             hasPrimary = this._hasTouch(touches, this._touchPrimary);

         if (!hasPrimary && firstEvent) {
            /*
             * The primary finger is no longer pressed, and in fact this
             * was the very first touch event after the initial touchstart,
             * so we haven't send a mousedown for it yet. So send one before
             * we proceed.
             */
            this._sendTouchMouseEvent(e, 'mousedown', this._touchPrimary);
         }

         /*
          * Send a mouseup and then finish with this sequence.
          * We're going to either wait until all fingers were released
          * before handling any more events, or if all fingers are already
          * released, just go back to the initial state.
          */
         this._sendTouchMouseEvent(e, 'mouseup', this._touchPrimary);
         this._touchPrimary = null;

         if (touches.length === 0) {
            this._resetTouchState();
         } else {
            this._touchState = this.TOUCH_STATE_WAIT_NONE;
         }
      }
   } else if (this._touchState === this.TOUCH_STATE_PANNING) {
      /*
       * We're in panning mode.
       *
       * Right now, we only support 2 finger panning, which emulates
       * horizontal and vertical scroll wheels.
       *
       * TODO: Later, we should add panning that scrolls the screen itself,
       *       for when the screen is larger than the viewport.
       */
      if (this._touchFingerCount === 2) {
         /* We're emulating a scroll wheel. */
         var pos = this._getEventPosition(e);

         if (this._touchLastWheelPos === null) {
            this._touchLastWheelPos = pos;
            this._touchStartWheelPos = pos;
         } else {
            var startPos = this._touchStartWheelPos,
                dx = 0,
                dy = 0,
                threshold = this.TOUCH_WHEEL_MOVE_THRESHOLD;

            /*
             * We don't want to send movements for every pixel we move.
             * So instead, we pick a threshold, and only scroll that amount.
             * This won't be perfect for all applications.
             */
            if (pos.x > this._touchLastWheelPos.x + threshold) {
               dx = -1;
            } else if (pos.x < this._touchLastWheelPos.x - threshold) {
               dx = 1;
            }

            if (pos.y > this._touchLastWheelPos.y + threshold) {
               dy = 1;
            } else if (pos.y < this._touchLastWheelPos.y - threshold) {
               dy = -1;
            }

            this._vncDecoder.onMouseWheel(startPos.x, startPos.y, dx, dy);

            if (dx !== 0) {
               this._touchLastWheelPos.x = pos.x;
            }

            if (dy !== 0) {
               this._touchLastWheelPos.y = pos.y;
            }
         }
      }

      if (e.type === 'touchend') {
         /* One or both fingers were lifted. Bail out. */
         if (touches.length === 0) {
            this._resetTouchState();
         } else {
            this._touchState = this.TOUCH_STATE_WAIT_NONE;
         }
      }
   } else if (this._touchState === this.TOUCH_STATE_WAIT_NONE) {
      /*
       * Continue ignoring events until all fingers have been removed
       * from the screen.
       */
      if (e.type === 'touchend' && touches.length === 0) {
         this._resetTouchState();
      }
   }

   return false;
};


/*
 *------------------------------------------------------------------------------
 *
 * _hasTouch --
 *
 *    Returns whether or not a list of touches has the specified touch.
 *
 * Results:
 *    true if the list has the specified touch, or false otherwise.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto._hasTouch = function(touches, touch) {
   var length = touches.length,
       i;

   for (i = 0; i < length; i++) {
      if (touches[i].identifier === touch.identifier) {
         return true;
      }
   }

   return false;
};


/*
 *------------------------------------------------------------------------------
 *
 * _cancelWaitTouchEvents --
 *
 *    Cancels waiting for any further touch events. This is used when
 *    we know we're engaging in a specific touch event and not a fallback
 *    of a press-and-hold (for right-click).
 *
 * Results:
 *    true if we canceled waiting, in which case we'll be handling the first
 *    touch event after the initial press.
 *
 *    false if we had nothing to cancel, in which case this was already
 *    canceled and therefore we're not handling the first event.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto._cancelWaitTouchEvents = function() {
   if (this._touchTimeout) {
      window.clearTimeout(this._touchTimeout);
      this._touchTimeout = null;
      return true;
   }

   return false;
};


/*
 *------------------------------------------------------------------------------
 *
 * _resetTouchState --
 *
 *    Resets all the main touch state. This includes the timeouts,
 *    finger counts, scroll wheel data, and input state.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto._resetTouchState = function() {
   this._touchTimeout = null;
   this._touchPrimary = null;
   this._touchFingerCount = 0;
   this._touchButtonState = null;
   this._touchState = this.TOUCH_STATE_NONE;
   this._touchLastWheelPos = null;
   this._touchAcceptingFingers = false;
};


/*
 *------------------------------------------------------------------------------
 *
 * _sendTouchMouseEvent --
 *
 *    Sends a mouse event based on the current touch data.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto._sendTouchMouseEvent = function(e, type, touch, button) {
   var doc = this.element[0].ownerDocument,
       mouseEvent;

   if (button === undefined) {
      button = this._touchButtonState;
   }

   mouseEvent = doc.createEvent('MouseEvent');
   mouseEvent.initMouseEvent(type, true, true, doc.window, 1,
                             touch.screenX, touch.screenY,
                             touch.pageX, touch.pageY,
                             false, false, false, false,
                             button, null);

   if (!e.target.dispatchEvent(mouseEvent)) {
      e.preventDefault();
   }

   /*
    * We manage our own button masks at our own times, and don't want
    * to have conflicting data from the main button handlers.
    */
   this._mouseDownBMask = 0;
};


/*
 *------------------------------------------------------------------------------
 *
 * _onBlur
 *
 *    Event handler for 'blur' event.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Releases all keys and mouse buttons by checking and clearing their
 *    tracking variables (this._keysDownVScan, this._mouseDownBMask) and
 *    sending the appropriate VMWKeyEvent and VMWPointerEvent messages.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto._onBlur = function(event) {
   if (this.connected) {
      /*
       * The user switched to a different element or window,
       * so release all keys.
       */

      this._keyboardMapper.doReleaseAll();

      this._vncDecoder.onMouseButton(this._mousePosGuest.x,
                                     this._mousePosGuest.y,
                                     0,
                                     this._mouseDownBMask);
      this._mouseDownBMask = 0;
   }

   return true;
};





/************************************************************************
 * Public API
 ************************************************************************/

/*
 *------------------------------------------------------------------------------
 *
 * disconnectEvents
 *
 *    Disconnects the events from the owner document.
 *
 *    This can be called by consumers of WebMKS to disconnect all the events
 *    used to interact with the guest.
 *
 *    The consumer may need to carefully manage the events (for example, if
 *    there are multiple WebMKS's in play, some hidden and some not), and can
 *    do this with connectEvents and disconnectEvents.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Disconnects the event handlers from the events in the WMKS container.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto.disconnectEvents = function() {
   /*
    * Remove our own handler for the 'keypress' event and the context menu.
    */
   $(this._canvas)
      .unbind('contextmenu.wmks')
      .unbind('keydown.wmks')
      .unbind('keypress.wmks')
      .unbind('keyup.wmks')
      .unbind('mousedown.wmks')
      .unbind('mousewheel.wmks')
      .unbind('touchstart.wmks')
      .unbind('touchmove.wmks')
      .unbind('touchend.wmks');

   $(this.element[0].ownerDocument)
      .unbind('mousemove.wmks')
      .unbind('mouseup.wmks')
      .unbind('blur.wmks');

   $(window)
      .unbind('blur.wmks');
};


/*
 *------------------------------------------------------------------------------
 *
 * connectEvents
 *
 *    Connects the events to the owner document.
 *
 *    This can be called by consumers of WebMKS to connect all the
 *    events used to interact with the guest.
 *
 *    The consumer may need to carefully manage the events (for example,
 *    if there are multiple WebMKS's in play, some hidden and some not),
 *    and can do this with connectEvents and disconnectEvents.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Connects the event handlers to the events in the WMKS container.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto.connectEvents = function() {
   var self = this;

   /*
    * We have to register a handler for the 'keypress' event as it is the
    * only one reliably reporting the key pressed. It gives character
    * codes and not scancodes however.
    */
   $(this.element[0].ownerDocument)
      .bind('mousemove.wmks', function(e) { return self._onMouseMove(e); })
      .bind('mouseup.wmks', function(e) { return self._onMouseButton(e, 0); })
      .bind('blur.wmks', function(e) { return self._onBlur(e); });

   $(this._canvas)
      .bind('contextmenu.wmks', function(e) { return false; })
      .bind('keydown.wmks', function(e) { return self._onKeyDown(e); })
      .bind('keypress.wmks', function(e) { return self._onKeyPress(e); })
      .bind('keyup.wmks', function(e) { return self._onKeyUp(e); })
      .bind('mousedown.wmks', function(e) { return self._onMouseButton(e, 1); })
      .bind('mousewheel.wmks', function(e) { return self._onMouseWheel(e); })
      .bind('touchstart.wmks', function(e) { return self._onTouchEvents(e); })
      .bind('touchmove.wmks', function(e) { return self._onTouchEvents(e); })
      .bind('touchend.wmks', function(e) { return self._onTouchEvents(e); });

   $(window)
      .bind('blur.wmks', function(e) { return self._onBlur(e); });
};


/*
 *------------------------------------------------------------------------------
 *
 * maxFitWidth
 *
 *    This calculates the maximum screen size that could fit, given the
 *    currently allocated scroll width. Consumers can use this with
 *    maxFitHeight() to request a resolution change in the guest.
 *
 *    This value takes into account the pixel ratio on the device, if
 *    useNativePixels is on.
 *
 * Results:
 *    The maximum screen width given the current width of the WebMKS.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto.maxFitWidth = function() {
   return this.element[0].scrollWidth * this._pixelRatio;
};


/*
 *------------------------------------------------------------------------------
 *
 * maxFitHeight
 *
 *    This calculates the maximum screen size that could fit, given the
 *    currently allocated scroll height. Consumers can use this with
 *    maxFitWidth() to request a resolution change in the guest.
 *
 *    This value takes into account the pixel ratio on the device, if
 *    useNativePixels is on.
 *
 * Results:
 *    The maximum screen height given the current height of the WebMKS.
 *
 * Side Effects:
 *    None.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto.maxFitHeight = function() {
   return this.element[0].scrollHeight * this._pixelRatio;
};


/*
 *------------------------------------------------------------------------------
 *
 * hideKeyboard
 *
 *    Hides the keyboard on a mobile device.
 *
 *    If allowMobileKeyboardInput is on, this command will hide the
 *    mobile keyboard if it's currently shown.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Moves browser focus away from input widget.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto.hideKeyboard = function() {
   if (this.options.allowMobileKeyboardInput) {
      this._keyboardInputEl.blur();
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * showKeyboard
 *
 *    Shows the keyboard on a mobile device.
 *
 *    If allowMobileKeyboardInput is on, this command will display the
 *    mobile keyboard.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Moves browser focus to input widget.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto.showKeyboard = function() {
   if (this.options.allowMobileKeyboardInput) {
      this._keyboardInputEl.focus();
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * sendKeyCode
 *
 *    Sends a key code to the VM as a keydown, keypress, or keyup.
 *
 *    This gives fine-grained control over keys going to the VM. The
 *    eventType is a key event type, and is one of "keydown", "keypress" or
 *    "keyup".
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends keyboard data to the server.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto.sendKeyCode = function(keyCode, eventType) {
   var canvas = $(this._canvas);

   return canvas.trigger($.Event(eventType, {
      which: keyCode,
      keyCode: keyCode
   }));
};


/*
 *------------------------------------------------------------------------------
 *
 * sendKeyInput
 *
 *    Sends a string to the VM.
 *
 *    This will take a string representing letter-wise keyboard input
 *    and send it to the VM as a series of key events.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends keyboard data to the server.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto.sendKeyInput = function(str) {
   var len = str.length,
       i;

   for (i = 0; i < len; i++) {
      var keyCode = str.charCodeAt(i);

      this._lastJSScanCode = 0;
      this.sendKeyCode(keyCode, 'keypress');
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * sendKeyCodes
 *
 *    Sends a series of special key codes to the VM.
 *
 *    This takes an array of special key codes and sends keydowns for
 *    each in the order listed. It then sends keyups for each in
 *    reverse order.
 *
 *    Keys usually handled via keyPress are also supported: If a keycode
 *    is negative, it is interpreted as a Unicode value and sent to
 *    keyPress. However, these need to be the final key in a combination,
 *    as they will be released immediately after being pressed. Only
 *    letters not requiring modifiers of any sorts should be used for
 *    the latter case, as the keyboardMapper may break the sequence
 *    otherwise. Mixing keyDown and keyPress handlers is semantically
 *    incorrect in JavaScript, so this separation is unavoidable.
 *
 *    This can be used to send key combinations such as
 *    Control-Alt-Delete, as well as Ctrl-V to the guest, e.g.:
 *    [17, 18, 46]      Control-Alt-Del
 *    [17, 18, 45]      Control-Alt-Ins
 *    [17, -118]        Control-v (note the lowercase 'v')
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Sends keyboard data to the server.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto.sendKeyCodes = function(keyCodes) {
   var self = this,
       len = keyCodes.length,
       keyups = [],
       i;

   for (i = 0; i < len; i++) {
      var keyCode = keyCodes[i];

      if (keyCode > 0) {
         this.sendKeyCode(keyCode, 'keydown');
         /*
          * Keycode 20 is 'special' - it's the Javascript keycode for the Caps Lock
          * key. In regular usage on Mac OS the browser sends a down when the caps
          * lock light goes on and an up when it goes off. The key handling code
          * special cases this, so if we fake both a down and up here we'll just
          * flip the caps lock state right back to where we started (if this is
          * a Mac OS browser platform).
          */
         if (!(keyCode === 20) || (navigator.platform.indexOf('Mac') <= -1)) {
            keyups.push(keyCode);
         }
      } else if (keyCode < 0) {
         this._lastJSScanCode = 0;
         this.sendKeyCode(0 - keyCode, 'keypress');
      }
   }

   len = keyups.length;

   for (i = len - 1; i >= 0; i--) {
      this.sendKeyCode(keyups[i], 'keyup');
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * rescale
 *
 *    Rescales the WebMKS to match the currently allocated size.
 *
 *    This will update the placement and size of the canvas to match
 *    the current options and allocated size (such as the pixel
 *    ratio).  This is an external interface called by consumers to
 *    force an update on size changes, internal users call
 *    rescaleOrResize(), below.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Updates this._scale and modifies the canvas size and position.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto.rescale = function() {
   this.rescaleOrResize(true);
};


/*
 *------------------------------------------------------------------------------
 *
 * rescaleOrResize
 *
 *    Rescales the WebMKS to match the currently allocated size, or
 *    alternately fits the guest to match the current canvas size.
 *
 *    This will either:
 *         update the placement and size of the canvas to match the
 *         current options and allocated size (such as the pixel
 *         ratio).  This is normally called internally as the result
 *         of option changes, but can be called by consumers to force
 *         an update on size changes
 *    Or:
 *         issue a resolutionRequest command to the server to resize
 *         the guest to match the current WebMKS canvas size.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Updates this._scale and modifies the canvas size and position.
 *    Possibly triggers a resolutionRequest message to the server.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto.rescaleOrResize = function(tryFitGuest) {
   var newScale = 1.0, x = 0, y = 0;
   var parentWidth = this.element.width(),
       parentHeight = this.element.height();


   this._canvas.css({
      width: this._guestWidth / this._pixelRatio,
      height: this._guestHeight / this._pixelRatio
   });

   var width = this._canvas.width();
   var height = this._canvas.height();

   if (this.transform !== null &&
       !this.options.fitToParent &&
       !this.options.fitGuest) {

      // scale = 1.0, x = 0, y = 0;

   } else if (this.transform !== null &&
              this.options.fitToParent) {
      var horizScale = parentWidth / width,
      vertScale = parentHeight / height;

      x = (parentWidth - width) / 2;
      y = (parentHeight - height) / 2;
      newScale = Math.max(0.1, Math.min(horizScale, vertScale));

   } else if (this.options.fitGuest && tryFitGuest) {

      // fitGuest doesn't rely on this.transform?

      if (width !== parentWidth ||
          height !== parentHeight) {
         this._vncDecoder.onRequestResolution(parentWidth, parentHeight);
      }

   } else if (this.transform === null) {
      console.log("No scaling support");
   }

   if (this.transform !== null) {
      if (newScale !== this._scale) {
         this._scale = newScale;
         this._canvas.css(this.transform, "scale(" + this._scale + ")");
      }

      if (x !== this._x || y !== this._y) {
         this._x = x;
         this._y = y;
         this._canvas.css({top: y, left: x});
      }
   }
};


/*
 *------------------------------------------------------------------------------
 *
 * disconnect
 *
 *    Disconnects the WebMKS.
 *
 *    Consumers should call this when they are done with the WebMKS
 *    component. Destroying the WebMKS will also result in a disconnect.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Disconnects from the server and tears down the WMKS UI.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto.disconnect = function() {
   this._vncDecoder.disconnect();
   this.disconnectEvents();
};


/*
 *------------------------------------------------------------------------------
 *
 * connect
 *
 *    Connects the WebMKS to a WebSocket URL.
 *
 *    Consumers should call this when they've placed the WebMKS and
 *    are ready to start displaying a stream from the guest.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Connects to the server and sets up the WMKS UI.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto.connect = function(url, vmx) {
   this.disconnect();
   this._vncDecoder.connect(url, vmx);
   this.connectEvents();

   this._keysDownVScan = [];
};


/*
 *------------------------------------------------------------------------------
 *
 * destroy
 *
 *    Destroys the WebMKS.
 *
 *    This will disconnect the WebMKS connection (if active) and remove
 *    the widget from the associated element.
 *
 *    Consumers should call this before removing the element from the DOM.
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Disconnects from the server and removes the WMKS class and canvas
 *    from the HTML code.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto.destroy = function() {
   this.disconnect();
   this.element.removeClass("wmks");
   this._canvas.remove();
   if (this._backCanvas) {
      this._backCanvas.remove();
   }
   if (this._blitTempCanvas) {
      this._blitTempCanvas.remove();
   }

   if (this._keyboardInputEl) {
      this._keyboardInputEl.remove();
   }

   $.Widget.prototype.destroy.call(this);
};


/************************************************************************
 * jQuery instantiation
 ************************************************************************/

/*
 *------------------------------------------------------------------------------
 *
 * _create
 *
 *    jQuery-UI initialisation function, called by $.widget()
 *
 * Results:
 *    None.
 *
 * Side Effects:
 *    Injects the WMKS canvas into the WMKS container HTML, sets it up
 *    and connects to the server.
 *
 *------------------------------------------------------------------------------
 */

WMKS.widgetProto._create = function() {
   var self = this;

   // Initialize our state.
   this._jsScanCodeToUnicodeMap = {};
   this._lastJSScanCode = 0;
   this._mouseDownBMask = 0;
   this._mousePosGuest = { x: 0, y: 0 };
   this._scale = 1.0;
   this._pixelRatio = 1.0;
   this.connected = false;

   this._resetTouchState();

   this._canvas = WMKS.UTIL.createCanvas(true)
      .prop({
         id:         'mainCanvas',
         tabindex:   1
      });
   this._backCanvas = WMKS.UTIL.createCanvas(true);
   this._blitTempCanvas = WMKS.UTIL.createCanvas(true);

   this.element
      .addClass("wmks")
      .append(this._canvas);

   this._updatePixelRatio();
   this._updateMobileKeyboardInput();

   var checkProperty = function (prop) {
      return typeof self._canvas[0].style[prop] !== 'undefined' ? prop : null;
   };

   this.transform = (checkProperty('transform') ||
                     checkProperty('WebkitTransform') ||
                     checkProperty('MozTransform') ||
                     checkProperty('msTransform') ||
                     checkProperty('OTransform'));

   this._vncDecoder = new WMKS.VNCDecoder({
      useVNCHandshake: this.options.useVNCHandshake,
      canvas: this._canvas[0],
      backCanvas: this._backCanvas[0],
      blitTempCanvas: this._blitTempCanvas[0],
      onConnecting: function() {
         self._trigger("connecting");
      },
      onConnected: function() {
         self.connected = true;
         self._trigger("connected");
         self.rescaleOrResize(true);
      },
      onDisconnected: function(reason, code) {
         self.connected = false;
         self._trigger("disconnected", 0, {'reason': reason, 'code': code});
      },
      onAuthenticationFailed: function() {
         self._trigger("authenticationFailed");
      },
      onError: function(err) {
         self._trigger("error", 0, err);
      },
      onProtocolError: function() {
         self._trigger("protocolError");
      },
      onNewDesktopSize: function(width, height) {
         self._guestWidth = width;
         self._guestHeight = height;
         var attrJson = {
            width: width,
            height: height
         };
         var cssJson = {
            width: width / self._pixelRatio,
            height: height / self._pixelRatio
         };
         self._canvas
            .attr(attrJson)
            .css(cssJson);

         attrJson.y = height;
         self._backCanvas
            .attr(attrJson)
            .css(cssJson);

         self._blitTempCanvas
            .attr(attrJson)
            .css(cssJson);

         self._trigger("resolutionchanged", null, attrJson);
         self.rescaleOrResize(false);
      },
      onKeyboardLEDsChanged: function(leds) {
         self._trigger("keyboardLEDsChanged", 0, leds);
      }
   });

   this._keyboardMapper = new WMKS.keyboardMapper({
      vncDecoder: this._vncDecoder
   });
};

$.widget("wmks.wmks", WMKS.widgetProto);