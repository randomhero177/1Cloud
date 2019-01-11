/*
 * Also required before init:
 * <script src="https://code.createjs.com/createjs-2015.11.26.min.js"></script>
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.19.0/TweenMax.min.js"></script>
 */

var canvas, stage, exportRoot, anim_container, dom_overlay_container, fnStartAnimation;
var gFontsFamilies = ["Roboto"];

var sslBanner = function() {
  this.LoadGFonts = function(families) {
  	var googleObject = {type: "Google", loadedFonts: 0, totalFonts: families.length, callOnLoad: lib.gfontAvailable};
  	for(var i =0; i < families.length; i++)
  		this.isFontAvailable(gFontsFamilies[i], googleObject);
  };
  this.isFontAvailable = function(font, obj) {
  	var timeOut = 5000;
  	var delay = 200;
  	var interval = 0;
  	var timeElapsed = 0;
  	function checkFont() {
  		var node = document.createElement("span");
  		node.innerHTML = "giItT1WQy@!-/#";
  		node.style.position      = "absolute";
  		node.style.left          = "-1000px";
  		node.style.top           = "-1000px";
  		node.style.fontSize      = "300px";
  		node.style.fontFamily    = "sans-serif";
  		node.style.fontVariant   = "normal";
  		node.style.fontStyle     = "normal";
  		node.style.fontWeight    = "normal";
  		node.style.letterSpacing = "0";
  		document.body.appendChild(node);
  		var width = node.offsetWidth;
  		node.style.fontFamily = font+","+node.style.fontFamily;
  		var returnVal = false;
  		if((node && node.offsetWidth != width) || timeElapsed >=timeOut) {
  			obj.loadedFonts++;
  			if(interval)
  				clearInterval(interval);
  			obj.callOnLoad(font, obj.totalFonts);
  			returnVal = true;
  		}
  		if(node) {
  			node.parentNode.removeChild(node);
  			node = null;
  		}
  		timeElapsed += delay;
  		return returnVal;
  	}
  	if(!checkFont()) {
  		interval = setInterval(checkFont, delay);
  	}
  };
  this.initialized = false;
  this.init = function () {
      this.initialized = true;
  	canvas = document.getElementById("ssl-banner-canvas");
  	anim_container = document.getElementById("ssl-banner-container");
  	dom_overlay_container = document.getElementById("ssl-banner-overlay");
  	try {
  		if(!(typeof gFontsFamilies === 'undefined' || gFontsFamilies === null))
  			this.LoadGFonts(gFontsFamilies);
  		if(!(typeof totalTypekitFonts === 'undefined' || totalTypekitFonts === null)) {
  			var typekitObject = {type: 'Typekit', loadedFonts: 0, totalFonts: totalTypekitFonts, callOnLoad: lib.tfontAvailable};
  			Typekit.load({
  			async: true,
  			'fontactive': function(family) {
  				this.isFontAvailable(family, typekitObject);
  				}
  			});
  		}
  	} catch(e) {};
  	this.handleComplete();
  };
  this.handleComplete = function() {
  	//This function is always called, irrespective of the content. You can use the variable "stage" after it is created in token create_stage.
  	exportRoot = new lib.shema();
  	stage = new createjs.Stage(canvas);
  	stage.addChild(exportRoot);
  	stage.enableMouseOver();
  	//Registers the "tick" event listener.
  	fnStartAnimation = function() {
  		createjs.Ticker.setFPS(lib.properties.fps);
  		createjs.Ticker.addEventListener("tick", stage);
  	}
  	//Code to support hidpi screens and responsive scaling.
  	function makeResponsive(isResp, respDim, isScale, scaleType) {
  		var lastW, lastH, lastS=1;
  		window.addEventListener('resize', resizeCanvas);
  		resizeCanvas();
  		function resizeCanvas() {
  			var w = lib.properties.width, h = lib.properties.height;
  			var iw = window.innerWidth, ih=window.innerHeight;
  			var pRatio = window.devicePixelRatio || 1, xRatio=iw/w, yRatio=ih/h, sRatio=1;
  			if(isResp) {
  				if((respDim=='width'&&lastW==iw) || (respDim=='height'&&lastH==ih)) {
  					sRatio = lastS;
  				}
  				else if(!isScale) {
  					if(iw<w || ih<h)
  						sRatio = Math.min(xRatio, yRatio);
  				}
  				else if(scaleType==1) {
  					sRatio = Math.min(xRatio, yRatio);
  				}
  				else if(scaleType==2) {
  					sRatio = Math.max(xRatio, yRatio);
  				}
  			}
  			canvas.width = w*pRatio*sRatio;
  			canvas.height = h*pRatio*sRatio;
  			canvas.style.width = dom_overlay_container.style.width = anim_container.style.width =  w*sRatio+'px';
  			canvas.style.height = anim_container.style.height = dom_overlay_container.style.height = h*sRatio+'px';
  			stage.scaleX = pRatio*sRatio;
  			stage.scaleY = pRatio*sRatio;
  			lastW = iw; lastH = ih; lastS = sRatio;
  		}
  	}
  	makeResponsive(true,'both',false,1);
  	fnStartAnimation();
  };
};
