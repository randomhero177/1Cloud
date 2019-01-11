(function (lib, img, cjs, ss, an) {

var p; // shortcut to reference prototypes
lib.webFontTxtInst = {}; 
var loadedTypekitCount = 0;
var loadedGoogleCount = 0;
var gFontsUpdateCacheList = [];
var tFontsUpdateCacheList = [];
lib.ssMetadata = [];



lib.updateListCache = function (cacheList) {		
	for(var i = 0; i < cacheList.length; i++) {		
		if(cacheList[i].cacheCanvas)		
			cacheList[i].updateCache();		
	}		
};		

lib.addElementsToCache = function (textInst, cacheList) {		
	var cur = textInst;		
	while(cur != exportRoot) {		
		if(cacheList.indexOf(cur) != -1)		
			break;		
		cur = cur.parent;		
	}		
	if(cur != exportRoot) {		
		var cur2 = textInst;		
		var index = cacheList.indexOf(cur);		
		while(cur2 != cur) {		
			cacheList.splice(index, 0, cur2);		
			cur2 = cur2.parent;		
			index++;		
		}		
	}		
	else {		
		cur = textInst;		
		while(cur != exportRoot) {		
			cacheList.push(cur);		
			cur = cur.parent;		
		}		
	}		
};		

lib.gfontAvailable = function(family, totalGoogleCount) {		
	lib.properties.webfonts[family] = true;		
	var txtInst = lib.webFontTxtInst && lib.webFontTxtInst[family] || [];		
	for(var f = 0; f < txtInst.length; ++f)		
		lib.addElementsToCache(txtInst[f], gFontsUpdateCacheList);		

	loadedGoogleCount++;		
	if(loadedGoogleCount == totalGoogleCount) {		
		lib.updateListCache(gFontsUpdateCacheList);		
	}		
};		

lib.tfontAvailable = function(family, totalTypekitCount) {		
	lib.properties.webfonts[family] = true;		
	var txtInst = lib.webFontTxtInst && lib.webFontTxtInst[family] || [];		
	for(var f = 0; f < txtInst.length; ++f)		
		lib.addElementsToCache(txtInst[f], tFontsUpdateCacheList);		

	loadedTypekitCount++;		
	if(loadedTypekitCount == totalTypekitCount) {		
		lib.updateListCache(tFontsUpdateCacheList);		
	}		
};
// symbols:
// helper functions:

function mc_symbol_clone() {
	var clone = this._cloneProps(new this.constructor(this.mode, this.startPosition, this.loop));
	clone.gotoAndStop(this.currentFrame);
	clone.paused = this.paused;
	clone.framerate = this.framerate;
	return clone;
}

function getMCSymbolPrototype(symbol, nominalBounds, frameBounds) {
	var prototype = cjs.extend(symbol, cjs.MovieClip);
	prototype.clone = mc_symbol_clone;
	prototype.nominalBounds = nominalBounds;
	prototype.frameBounds = frameBounds;
	return prototype;
	}


(lib.Symbol35 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("EhalAlyMAAAhLjMC1LAAAMAAABLjg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol35, new cjs.Rectangle(-579.7,-241.7,1159.6,483.6), null);


(lib.Symbol34 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FAB542").s().p("Ai1C2QhKhMgBhqQABhpBKhMQBMhKBpgBQBqABBMBKQBKBMAABpQAABqhKBMQhMBKhqAAQhpAAhMhKg");
	this.shape._off = true;

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(3).to({_off:false},0).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = null;


(lib.Symbol33 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#5066AB").s().p("Ah4B5QgygyAAhHQAAhGAygyQAygyBGAAQBHAAAyAyQAyAyAABGQAABHgyAyQgyAyhHAAQhGAAgygyg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol33, new cjs.Rectangle(-17.1,-17.1,34.2,34.2), null);


(lib.Symbol32 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AgpBlQgUgJgQgQQgPgRgIgUQgIgVABgVQABgVAIgTQAIgSAOgPQAOgOASgIQASgJAVgBQAZgCAYAKQALAEAJAHQALAIAMAOIAVgQIgHBHIhBgQIAWgRIAAAAQgTgQgJgEQgJgEgKgCIgKAAQgNAAgOAFQgNAGgKALQgLAKgFAOQgFANAAAOQABAOAFANQAGAMAJAKQAKAJAMAGQAMAFAOABQATABAQgJQARgJALgQQACgEAEgCQAFgCAEAAIABAAQAFAAAEACQAFADACAEQACAFAAAFQAAAFgDAEQgPAYgYANQgZANgcAAQgVAAgVgIg");
	this.shape.setTransform(-0.3,-0.1,1,1,0,0,0,-0.3,-0.1);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol32, new cjs.Rectangle(-10.8,-10.9,21.7,21.9), null);


(lib.Symbol31 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FAB542").s().p("Ah6B7Qg0gzAAhIQAAhHA0gzQAzg0BHAAQBIAAAzA0QA0AzAABHQAABIg0AzQgzA0hIAAQhHAAgzg0g");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol31, new cjs.Rectangle(-17.4,-17.4,34.9,34.9), null);


(lib.Symbol29 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#30AC6C").s().p("AzSFbIiqlQICpllMApQAAAIAAK1g");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol29, new cjs.Rectangle(-140.5,-34.7,281,69.5), null);


(lib.Symbol28 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 3
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("ANRG4IjMm+IgBAAIAAgBIAAgCIABAAIDEmuIHxAAIjFGwIDNG/gAiRG4IjLm+IgCAAIABgBIgBgCIACAAIDDmuIHwAAIjEGwIDMG/gAx0G4IjLm+IgCAAIABgBIgBgCIACAAIDDmuIHxAAIjEGwIDMG/g");
	this.shape.setTransform(-329.1,0.9);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

	// Layer 2
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFFFFF").s().p("AVCG4IjMm+IgBAAIABgBIgBgCIACAAIDDmuIHxAAIjEGwIDMG/gAFfG4IjMm+IgBAAIABgBIgBgCIACAAIDDmuIHxAAIjEGwIDMG/gAqCG4IjMm+IgBAAIABgBIgBgCIABAAIDEmuIHxAAIjFGwIDNG/gA5lG4IjMm+IgBAAIABgBIgBgCIABAAIDEmuIHxAAIjFGwIDNG/g");
	this.shape_1.setTransform(19.1,0.9);

	this.timeline.addTween(cjs.Tween.get(this.shape_1).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol28, new cjs.Rectangle(-463.7,-43.1,667.2,88.1), null);


(lib.Symbol22 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#DADDE5").s().p("EgysAFUIAAqnMBi0AAAIClFVIilFSgEgyFAEsMBh0AAAICSkqIiSktMhh0AAAg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol22, new cjs.Rectangle(-324.5,-34,649.1,68), null);


(lib.Symbol18 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AtpXXMAAAgq7IbTAAMAAAAq7gAsWV0IYuAAIAAl2I4uAAgAAaPFIL+AAIAApfIr+AAgAsWPFIL9AAIAAinIr9AAgAsWLoIL9AAIAAimIr9AAgAsWIMIL9AAIAAimIr9AAgAsWEzIYuAAIAAimI4uAAgAsWBXIYuAAIAAilI4uAAgAsWiEIYuAAIAAimI4uAAgAsWlxIYuAAIAAsbI4uAAgABSOOIAAnxIKPAAIAAHxgArfOOIAAg5IKPAAIAAA5gArfKxIAAg4IKPAAIAAA4gArfHVIAAg4IKPAAIAAA4gArfD8IAAg4IXAAAIAAA4gArfAgIAAg3IXAAAIAAA3gArfi7IAAg4IXAAAIAAA4gArfmoIAAqtIXAAAIAAKtgAtp0iIAAi0IbTAAIAAC0gAo71eIA9AAIAAg9Ig9AAgAqy1eIA7AAIAAg9Ig7AAgAsr1eIA8AAIAAg9Ig8AAg");

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FAB542").s().p("AukYTMAAAgwlIdJAAMAAAAwlgAtpXXIbSAAMAAAgq7I7SAAgAtp0iIbSAAIAAi0I7SAAgAsWV0IAAl2IYuAAIAAF2gAAaPFIAApfIL+AAIAAJfgABROOIKQAAIAAnxIqQAAgAsWPFIAAinIL9AAIAACngArfOOIKPAAIAAg5IqPAAgAsWLoIAAimIL9AAIAACmgArfKxIKPAAIAAg4IqPAAgAsWIMIAAimIL9AAIAACmgArfHVIKPAAIAAg4IqPAAgAsWEzIAAimIYuAAIAACmgArfD8IXAAAIAAg4I3AAAgAsWBXIAAilIYuAAIAAClgArfAgIXAAAIAAg3I3AAAgAsWiEIAAimIYuAAIAACmgArfi7IXAAAIAAg4I3AAAgAsWlxIAAsbIYuAAIAAMbgArfmoIXAAAIAAqtI3AAAgAo71eIAAg9IA9AAIAAA9gAqz1eIAAg9IA8AAIAAA9gAsr1eIAAg9IA8AAIAAA9g");

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol18, new cjs.Rectangle(-93.3,-155.4,186.6,311), null);


(lib.Symbol17 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.text = new cjs.Text("БРАУЗЕР/КЛИЕНТ", "normal 400 20px 'Roboto'", "#5C646D");
	this.text.textAlign = "center";
	this.text.lineHeight = 30;
	this.text.lineWidth = 214;
	this.text.parent = this;
	this.text.setTransform(0,-12);
	if(!lib.properties.webfonts['Roboto']) {
		lib.webFontTxtInst['Roboto'] = lib.webFontTxtInst['Roboto'] || [];
		lib.webFontTxtInst['Roboto'].push(this.text);
	}

	this.timeline.addTween(cjs.Tween.get(this.text).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol17, new cjs.Rectangle(-108.9,-14,217.9,30.5), null);


(lib.Symbol16 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.text = new cjs.Text("СЕРВЕР", "normal 400 20px 'Roboto'", "#5C646D");
	this.text.textAlign = "center";
	this.text.lineHeight = 30;
	this.text.lineWidth = 195;
	this.text.parent = this;
	this.text.setTransform(0,-12);
	if(!lib.properties.webfonts['Roboto']) {
		lib.webFontTxtInst['Roboto'] = lib.webFontTxtInst['Roboto'] || [];
		lib.webFontTxtInst['Roboto'].push(this.text);
	}

	this.timeline.addTween(cjs.Tween.get(this.text).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol16, new cjs.Rectangle(-99.6,-14,199.3,30.5), null);


(lib.Symbol15 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AI6XiIAAlfICaAAIAAFfgAFiXiIAAlfICaAAIAAFfgArYXiIAAlfIP+AAIAAFfgAodUfQgIAIAAAMQAAAMAIAJQAJAJANAAQAMAAAIgJQAKgJAAgMQAAgMgKgIQgIgMgMAAQgNAAgJAMgAp8UfQgJAIAAAMQAAAMAJAJQAJAJALAAQANAAAIgJQAJgJAAgMQAAgMgJgIQgIgMgNAAQgLAAgJAMgApkRIIAAg+ITDAAIAAA+gAI6POIAAlgICaAAIAAFggAFiPOIAAlgICaAAIAAFggArYPOIAAlgIP+AAIAAFggAodMKQgIAIAAANQAAAMAIAKQAJAIANAAQAMAAAIgIQAKgKAAgMQAAgNgKgIQgIgJgMAAQgNAAgJAJgAp8MKQgJAIAAANQAAAMAJAKQAJAIALAAQANAAAIgIQAJgKAAgMQAAgNgJgIQgIgJgNAAQgLAAgJAJgApkI0IAAg9ITDAAIAAA9gAI6G7IAAlgICaAAIAAFggAFiG7IAAlgICaAAIAAFggArYG7IAAlgIP+AAIAAFggAodD2QgIAJAAANQAAAKAIAJQAJAKANAAQAMAAAIgKQAKgJAAgKQAAgNgKgJQgIgIgMAAQgNAAgJAIgAp8D2QgJAJAAANQAAAKAJAJQAJAKALAAQANAAAIgKQAJgJAAgKQAAgNgJgJQgIgIgNAAQgLAAgJAIgApkAcIAAg8ITDAAIAAA8gAI9haIAAlfICcAAIAAFfgAFmhaIAAlfICbAAIAAFfgArUhaIAAlfIP/AAIAAFfgAoZkfQgHAIAAANQAAANAHAIQAJAJAMAAQANAAAIgJQAKgIAAgNQAAgNgKgIQgIgKgNAAQgMAAgJAKgAp4kfQgJAIAAANQAAANAJAIQAJAJALAAQAOAAAHgJQAKgIAAgNQAAgNgKgIQgHgKgOAAQgLAAgJAKgApfn1IAAg+ITCAAIAAA+gAI9pvIAAlfICcAAIAAFfgAFmpvIAAlfICbAAIAAFfgArUpvIAAlfIP/AAIAAFfgAoZszQgHAJAAAMQAAAMAHALQAJAGAMABQANgBAIgGQAKgLAAgMQAAgMgKgJQgIgIgNgBQgMABgJAIgAp4szQgJAJAAAMQAAAMAJALQAJAGALABQAOgBAHgGQAKgLAAgMQAAgMgKgJQgHgIgOgBQgLABgJAIgApfwJIAAg9ITCAAIAAA9gAI9yBIAAlgICcAAIAAFggAFmyBIAAlgICbAAIAAFggArUyBIAAlgIP/AAIAAFggAoZ1GQgHAHAAANQAAAMAHAJQAJAJAMAAQANAAAIgJQAKgJAAgMQAAgNgKgHQgIgJgNAAQgMAAgJAJgAp41GQgJAHAAANQAAAMAJAJQAJAJALAAQAOAAAHgJQAKgJAAgMQAAgNgKgHQgHgJgOAAQgLAAgJAJg");
	this.shape.setTransform(0,0.1);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#5066AB").s().p("AsMYWQgJgJAAgNIAAmZQAAgOAJgJQAIgIANAAIBYAAIAAg+IhYAAQgNABgIgJQgJgIAAgNIAAmbQAAgNAJgIQAIgIANgBIBYAAIAAg9IhYAAQgNAAgIgKQgEgEgDgFQgCgFAAgGIAAmbIAAgCIAAgCQAAgMAJgIQAIgJANAAIBYAAIAAg8IhYAAQgNAAgIgJQgEgFgDgFIAFAAQgCgFAAgFIAAmaQAAgNAIgKQAIgHANAAIBXAAIAAg+IhXAAQgNAAgIgJQgIgIAAgMIAAmcQAAgMAIgIQAIgJANAAIBXAAIAAg9IhXAAQgNAAgIgKQgIgKAAgLIAAmaQAAgMAIgLQAIgHANAAIXpAAQANAAAJAHQAKALAAAMIAAGaQAAALgKAKQgJAKgNAAIhXAAIAAA9IBXAAQANAAAJAJQAKAIAAAMIAAGcQAAAMgKAIQgJAJgNAAIhXAAIAAA+IBXAAQANAAAJAHQAKAKAAANIAAGaQAAAMgKAJQgJAIgNAAIhbAAIAAA8IBXAAQANAAAJAJQAJAIAAAMIAAACIAAACIAAGbQAAAGgCAFQgCAFgFAEQgJAKgNAAIhXAAIAAA9IBXAAQANABAJAIQAJAIAAANIAAGbQAAANgJAIQgJAJgNgBIhXAAIAAA+IBXAAQANAAAJAIQAJAJAAAOIAAGYQAAANgJAJQgIAGgLACI3sAAQgNABgIgIgAI5XjICbAAIAAlfIibAAgAFhXjICbAAIAAlfIibAAgArYXjIP+AAIAAlfIv+AAgApkRIITCAAIAAg+IzCAAgAI5PPICbAAIAAlgIibAAgAFhPPICbAAIAAlgIibAAgArYPPIP+AAIAAlgIv+AAgApkI0ITCAAIAAg9IzCAAgAI5G8ICbAAIAAlgIibAAgAFhG8ICbAAIAAlgIibAAgArYG8IP+AAIAAlgIv+AAgApkAdITCAAIAAg8IzCAAgAI9haICcAAIAAlfIicAAgAFmhaICbAAIAAlfIibAAgArVhaIQAAAIAAlfIwAAAgApgn0ITDAAIAAg+IzDAAgAI9pvICcAAIAAlfIicAAgAFmpvICbAAIAAlfIibAAgArVpvIQAAAIAAlfIwAAAgApgwIITDAAIAAg9IzDAAgAI9yBICcAAIAAlgIicAAgAFmyBICbAAIAAlgIibAAgArVyBIQAAAIAAlgIwAAAgAodVJQgIgJAAgNQAAgMAIgIQAJgLAMAAQAMAAAJALQAKAIAAAMQAAANgKAJQgJAIgMABQgMgBgJgIgAp8VJQgJgJAAgNQAAgMAJgIQAIgLAMAAQANAAAIALQAJAIAAAMQAAANgJAJQgIAIgNABQgMgBgIgIgAodM2QgIgLAAgMQAAgMAIgJQAJgJAMAAQAMAAAJAJQAKAJAAAMQAAAMgKALQgJAHgMABQgMgBgJgHgAp8M2QgJgLAAgMQAAgMAJgJQAIgJAMAAQANAAAIAJQAJAJAAAMQAAAMgJALQgIAHgNABQgMgBgIgHgAodEgQgIgJAAgLQAAgNAIgIQAJgIAMAAQAMAAAJAIQAKAIAAANQAAALgKAJQgJAKgMAAQgMAAgJgKgAp8EgQgJgJAAgLQAAgNAJgIQAIgIAMAAQANAAAIAIQAJAIAAANQAAALgJAJQgIAKgNAAQgMAAgIgKgAoZj1QgIgIAAgMQAAgNAIgIQAJgLAMAAQAMAAAJALQAKAIAAANQAAAMgKAIQgJAKgMgBQgMABgJgKgAp4j1QgJgIAAgMQAAgNAJgIQAJgLALAAQANAAAIALQAJAIAAANQAAAMgJAIQgIAKgNgBQgLABgJgKgAoZsHQgIgKAAgMQAAgNAIgJQAJgIAMAAQAMAAAJAIQAKAJAAANQAAAMgKAKQgJAHgMAAQgMAAgJgHgAp4sHQgJgKAAgMQAAgNAJgJQAJgIALAAQANAAAIAIQAJAJAAANQAAAMgJAKQgIAHgNAAQgLAAgJgHgAoZ0dQgIgJAAgLQAAgNAIgIQAJgJAMAAQAMAAAJAJQAKAIAAANQAAALgKAJQgJAKgMgBQgMABgJgKgAp40dQgJgJAAgLQAAgNAJgIQAJgJALAAQANAAAIAJQAJAIAAANQAAALgJAJQgIAKgNgBQgLABgJgKg");

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol15, new cjs.Rectangle(-78.9,-156.5,158,313.1), null);


(lib.Symbol5copy4 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.text = new cjs.Text("Защищенное соединение установлено! Запросы шифруются публичными ключами сервера и браузера", "normal 400 16px 'Roboto'", "#FFFFFF");
	this.text.lineHeight = 24;
	this.text.lineWidth = 469;
	this.text.parent = this;
	this.text.setTransform(2,-22.7);
	if(!lib.properties.webfonts['Roboto']) {
		lib.webFontTxtInst['Roboto'] = lib.webFontTxtInst['Roboto'] || [];
		lib.webFontTxtInst['Roboto'].push(this.text);
	}

	this.timeline.addTween(cjs.Tween.get(this.text).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol5copy4, new cjs.Rectangle(0,-24.7,473,49.5), null);


(lib.Symbol5copy3 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.text = new cjs.Text("Сервер зашифровывает запрошенную страницу полученным  публичным ключом и отправляет её браузеру", "normal 400 16px 'Roboto'", "#5C646D");
	this.text.lineHeight = 24;
	this.text.lineWidth = 476;
	this.text.parent = this;
	this.text.setTransform(2,-22.7);
	if(!lib.properties.webfonts['Roboto']) {
		lib.webFontTxtInst['Roboto'] = lib.webFontTxtInst['Roboto'] || [];
		lib.webFontTxtInst['Roboto'].push(this.text);
	}

	this.timeline.addTween(cjs.Tween.get(this.text).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol5copy3, new cjs.Rectangle(0,-24.7,480,49.5), null);


(lib.Symbol5copy2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.text = new cjs.Text("Браузер проверяет подлинность сертификата и отправляет свой публичный ключ серверу", "normal 400 16px 'Roboto'", "#5C646D");
	this.text.lineHeight = 24;
	this.text.lineWidth = 463;
	this.text.parent = this;
	this.text.setTransform(2,-22.7);
	if(!lib.properties.webfonts['Roboto']) {
		lib.webFontTxtInst['Roboto'] = lib.webFontTxtInst['Roboto'] || [];
		lib.webFontTxtInst['Roboto'].push(this.text);
	}

	this.timeline.addTween(cjs.Tween.get(this.text).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol5copy2, new cjs.Rectangle(0,-24.7,467,49.5), null);


(lib.Symbol5copy = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.text = new cjs.Text("Сервер отправляет браузеру копию своего SSL-сертификата", "normal 400 16px 'Roboto'", "#5C646D");
	this.text.lineHeight = 24;
	this.text.lineWidth = 483;
	this.text.parent = this;
	this.text.setTransform(2,-10.6);
	if(!lib.properties.webfonts['Roboto']) {
		lib.webFontTxtInst['Roboto'] = lib.webFontTxtInst['Roboto'] || [];
		lib.webFontTxtInst['Roboto'].push(this.text);
	}

	this.timeline.addTween(cjs.Tween.get(this.text).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol5copy, new cjs.Rectangle(0,-12.6,487,25.3), null);


(lib.Symbol5 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.text = new cjs.Text("Браузер запрашивает веб-страницу по протоколу HTTPS", "normal 400 16px 'Roboto'", "#5C646D");
	this.text.lineHeight = 24;
	this.text.lineWidth = 483;
	this.text.parent = this;
	this.text.setTransform(2,-10.6);
	if(!lib.properties.webfonts['Roboto']) {
		lib.webFontTxtInst['Roboto'] = lib.webFontTxtInst['Roboto'] || [];
		lib.webFontTxtInst['Roboto'].push(this.text);
	}

	this.timeline.addTween(cjs.Tween.get(this.text).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol5, new cjs.Rectangle(0,-12.6,487,25.3), null);


(lib.Symbol4copy4 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AgVA2IgJgDIgDgBQAAgDABgDIADgGIADABIAHACIALABQAMAAAHgFQAGgEAAgLQABgKgHgFQgGgEgNAAIgKAAIgIABIAAg6IA3AAIABAHIgBAHIgoAAIAAAfIADgBIAGAAQARAAAJAIQAKAHAAARQAAAQgKAJQgKAIgUAAQgJAAgGgBg");
	this.shape.setTransform(-0.5,0.3);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#5066AB").s().p("Ah4B5QgygyAAhHQAAhGAygyQAygyBGAAQBHAAAyAyQAyAyAABGQAABHgyAyQgyAyhHAAQhGAAgygyg");

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol4copy4, new cjs.Rectangle(-17.1,-17.1,34.2,34.2), null);


(lib.Symbol4copy3 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AANA2IgCgBIAAgaIgyAAIgBgCIAAgEIAAgFIABgBIAxhDIACgBIAGgBIAGABIABABIAABDIAPAAIAAABIABAFIgBAEIAAACIgPAAIAAAaIgBABIgFAAIgGAAgAgXAPIAiAAIAAgug");
	this.shape.setTransform(0,0.3);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#5066AB").s().p("Ah4B5QgygyAAhHQAAhGAygyQAygyBGAAQBHAAAyAyQAyAyAABGQAABHgyAyQgyAyhHAAQhGAAgygyg");

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol4copy3, new cjs.Rectangle(-17.1,-17.1,34.2,34.2), null);


(lib.Symbol4copy2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AgUA2IgJgCIgEgBIABgHIADgFIAIACIAPACQALgBAGgEQAGgEAAgKQAAgLgGgFQgGgEgJAAIgMAAIgBgGIABgGIAMAAQAIAAAFgDQAFgEAAgKQAAgIgFgFQgFgDgKAAIgKABIgIABIgCABQgDgCgBgDQgCgCABgEIADgBIAJgEQAGgBAJAAQAPAAAKAIQAJAGAAAOQAAAJgDAHQgDAGgIADQAJADAEAHQAFAHAAAKQAAAJgEAIQgEAGgJAEQgIAEgOAAQgJAAgGgCg");
	this.shape.setTransform(-0.5,0.3);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#5066AB").s().p("Ah4B5QgygyAAhHQAAhGAygyQAygyBGAAQBHAAAyAyQAyAyAABGQAABHgyAyQgyAyhHAAQhGAAgygyg");

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol4copy2, new cjs.Rectangle(-17.1,-17.1,34.2,34.2), null);


(lib.Symbol4copy = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AghA3IAAgDIgBgHQABgNAFgIQAEgIAHgFIAPgKIAKgHQAFgEADgEQACgFAAgFQAAgIgFgEQgFgFgKAAIgLABIgIACIgEABIgDgFQgBgDAAgDIADgCIALgDQAHgBAIAAQAKAAAHADQAIADAEAGQAGAHAAAKQAAAKgFAGQgDAHgHAEIgQALIgKAGIgIAHQgEAFAAAGIAAACIAAACIAyAAIABADIAAAEIAAAEIgBADg");
	this.shape.setTransform(-0.4,0.2);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#5066AB").s().p("Ah4B5QgygyAAhHQAAhGAygyQAygyBGAAQBHAAAyAyQAyAyAABGQAABHgyAyQgyAyhHAAQhGAAgygyg");

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol4copy, new cjs.Rectangle(-17.1,-17.1,34.2,34.2), null);


(lib.Symbol4 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AAJA2IgCgBIAAhAIAAgMIABgJQgGAGgGADQgHADgHACQgDgCgBgDQgBgEABgDQAKgDAHgFQAHgGAGgIIABgBIAGgBIAGABIACABIAABpIgCABIgGAAIgGAAg");
	this.shape.setTransform(-1.8,0.3);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#5066AB").s().p("Ah4B5QgygyAAhHQAAhGAygyQAygyBGAAQBHAAAyAyQAyAyAABGQAABHgyAyQgyAyhHAAQhGAAgygyg");

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol4, new cjs.Rectangle(-17.1,-17.1,34.2,34.2), null);


(lib.Symbol30 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		var root = this
		
		TweenMax.set(this.tint, {alpha:0, scaleX:1, scaleY:1});	
		TweenMax.set(this.st, {scaleX:1, scaleY:1, rotation:0});	
		TweenMax.set(this.q1, {scaleX:1, scaleY:1});	
		
		var frequency = 25;
		stage.enableMouseOver(frequency);
		
		this.btn.addEventListener("mouseover", fl_MouseOverHandler);
		function fl_MouseOverHandler()
		{
		 TweenMax.to(root.tint, 0.2, {alpha:1, scaleX:1.15, scaleY:1.15, ease:Power0.easeNone});	
		 TweenMax.to(root.st, 0.2, {scaleX:1.15, scaleY:1.15, rotation:180, ease:Power0.easeNone});	
		 TweenMax.to(root.q1, 0.2, {scaleX:1.15, scaleY:1.15, ease:Power0.easeNone});	
		}
		
		this.btn.addEventListener("mouseout", fl_MouseOutHandler);
		function fl_MouseOutHandler()
		{
		 TweenMax.to(root.tint, 0.3, {alpha:0, scaleX:1, scaleY:1, ease:Back.easeOut});
		 TweenMax.to(root.st, 0.3, {scaleX:1, scaleY:1, rotation:0, ease:Back.easeOut});	
		 TweenMax.to(root.q1, 0.3, {scaleX:1, scaleY:1, ease:Back.easeOut});	
		}
		
		
		this.btn.addEventListener("click", fl_ClickToGoToWebPage);
		function fl_ClickToGoToWebPage() {
			exportRoot.main.gotoAndStop("end");
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer 5
	this.btn = new lib.Symbol34();
	this.btn.parent = this;
	new cjs.ButtonHelper(this.btn, 0, 1, 2, false, new lib.Symbol34(), 3);

	this.timeline.addTween(cjs.Tween.get(this.btn).wait(1));

	// Layer 4
	this.st = new lib.Symbol32();
	this.st.parent = this;
	this.st.setTransform(0,0.3);

	this.timeline.addTween(cjs.Tween.get(this.st).wait(1));

	// Layer 3
	this.tint = new lib.Symbol31();
	this.tint.parent = this;
	this.tint.alpha = 0.012;

	this.timeline.addTween(cjs.Tween.get(this.tint).wait(1));

	// Layer 1
	this.q1 = new lib.Symbol33();
	this.q1.parent = this;

	this.timeline.addTween(cjs.Tween.get(this.q1).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol30, new cjs.Rectangle(-25.6,-25.6,51.3,51.3), null);


(lib.Symbol27 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		TweenMax.set(this.q1, {x:0});
		
		this.gotoAndPlay(1);
	}
	this.frame_1 = function() {
		TweenMax.from(this.q1, 0.5, {x:"+=99.5", ease:Power0.easeNone, repeat:4});
		
		TweenMax.to(this.q1, 1.5, {x:"-=99.5", ease:Power3.easeOut, delay:2});
		
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// Layer 5 (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	mask.graphics.p("AzSFbIiqlQICpllMApQAAAIAAK1g");

	// Layer 2
	this.q1 = new lib.Symbol28();
	this.q1.parent = this;
	this.q1.setTransform(0,1.1);
	this.q1.alpha = 0.102;

	var maskedShapeInstanceList = [this.q1];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask;
	}

	this.timeline.addTween(cjs.Tween.get(this.q1).wait(2));

	// Layer 1
	this.instance = new lib.Symbol29();
	this.instance.parent = this;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-140.5,-34.7,281,69.5);


(lib.Symbol26 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		TweenMax.set(this.q1, {alpha:1, x:0});
		
		this.gotoAndPlay(1);
		this.q1.gotoAndPlay(0);
	}
	this.frame_1 = function() {
		this.stop();
		
		TweenMax.from(this.q1, 0.6, {x:"+=360", ease:Expo.easeOut, delay:0.3});
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// Layer 2 (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	mask.graphics.p("A22HJIAAuRMAttAAAIAAORg");
	mask.setTransform(-5.8,1.2);

	// Layer 1
	this.q1 = new lib.Symbol27();
	this.q1.parent = this;

	var maskedShapeInstanceList = [this.q1];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask;
	}

	this.timeline.addTween(cjs.Tween.get(this.q1).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-152.2,-42.1,292.7,88.1);


(lib.Symbol21copy7 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		TweenMax.set(this.q2, {alpha:1, scaleX:1, scaleY:1});
		TweenMax.set(this.q3, {alpha:1, x:-162});
		
		this.gotoAndPlay(1);
		this.w1.gotoAndPlay(0);
		this.w2.gotoAndPlay(0);
	}
	this.frame_1 = function() {
		this.stop();
		
		TweenMax.from(this.q2, 0.6, {scaleX:0.3, scaleY:0.3, ease:Elastic.easeOut.config(1, 0.7), delay:0.7});
		TweenMax.from(this.q2, 0.1, {alpha:0, ease:Power0.easeNone, delay:0.7});
		
		TweenMax.from(this.q3, 0.5, {x:"+=50", alpha:0, ease:Expo.easeOut, delay:0.7});
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// Layer 1
	this.q2 = new lib.Symbol4copy4();
	this.q2.parent = this;
	this.q2.setTransform(-195,0);

	this.q3 = new lib.Symbol5copy4();
	this.q3.parent = this;
	this.q3.setTransform(-162,-1.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.q3},{t:this.q2}]}).wait(2));

	// Layer 3
	this.w1 = new lib.Symbol26();
	this.w1.parent = this;
	this.w1.setTransform(-94.9,0);

	this.w2 = new lib.Symbol26();
	this.w2.parent = this;
	this.w2.setTransform(184.6,0,1,1,0,0,180);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.w2},{t:this.w1}]}).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-558.6,-44.5,1206.9,91.4);


(lib.Symbol21copy6 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		TweenMax.set(this.q1, {alpha:1, x:0});
		TweenMax.set(this.q2, {alpha:1, scaleX:1, scaleY:1});
		TweenMax.set(this.q3, {alpha:1, x:-162});
		
		this.gotoAndPlay(1);
	}
	this.frame_1 = function() {
		this.stop();
		
		TweenMax.from(this.q1, 0.6, {x:"-=650", ease:Expo.easeOut, delay:0.3});
		TweenMax.from(this.q1, 0.1, {alpha:0, ease:Power0.easeNone, delay:0.3});
		
		TweenMax.from(this.q2, 0.6, {scaleX:0.3, scaleY:0.3, ease:Elastic.easeOut.config(1, 0.7), delay:0.7});
		TweenMax.from(this.q2, 0.1, {alpha:0, ease:Power0.easeNone, delay:0.7});
		
		TweenMax.from(this.q3, 0.5, {x:"+=50", alpha:0, ease:Expo.easeOut, delay:0.7});
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// Layer 1
	this.q1 = new lib.Symbol22();
	this.q1.parent = this;

	this.q2 = new lib.Symbol4copy2();
	this.q2.parent = this;
	this.q2.setTransform(-195,0);

	this.q3 = new lib.Symbol5copy2();
	this.q3.parent = this;
	this.q3.setTransform(-162,-1.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.q3},{t:this.q2},{t:this.q1}]}).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-324.5,-34,649.1,68);


(lib.Symbol21copy5 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		TweenMax.set(this.q1, {alpha:1, x:88});
		TweenMax.set(this.q2, {alpha:1, scaleX:1, scaleY:1});
		TweenMax.set(this.q3, {alpha:1, x:-162});
		
		this.gotoAndPlay(1);
	}
	this.frame_1 = function() {
		this.stop();
		
		TweenMax.from(this.q1, 0.6, {x:"+=650", ease:Expo.easeOut, delay:0.3});
		TweenMax.from(this.q1, 0.1, {alpha:0, ease:Power0.easeNone, delay:0.3});
		
		TweenMax.from(this.q2, 0.6, {scaleX:0.3, scaleY:0.3, ease:Elastic.easeOut.config(1, 0.7), delay:0.7});
		TweenMax.from(this.q2, 0.1, {alpha:0, ease:Power0.easeNone, delay:0.7});
		
		TweenMax.from(this.q3, 0.5, {x:"+=50", alpha:0, ease:Expo.easeOut, delay:0.7});
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// Layer 1
	this.q1 = new lib.Symbol22();
	this.q1.parent = this;
	this.q1.setTransform(88,0,1,1,0,0,180);

	this.q2 = new lib.Symbol4copy3();
	this.q2.parent = this;
	this.q2.setTransform(-195,0);

	this.q3 = new lib.Symbol5copy3();
	this.q3.parent = this;
	this.q3.setTransform(-162,-1.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.q3},{t:this.q2},{t:this.q1}]}).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-236.5,-34,649.1,68);


(lib.Symbol21copy = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		TweenMax.set(this.q1, {alpha:1, x:88});
		TweenMax.set(this.q2, {alpha:1, scaleX:1, scaleY:1});
		TweenMax.set(this.q3, {alpha:1, x:-162});
		
		this.gotoAndPlay(1);
	}
	this.frame_1 = function() {
		this.stop();
		
		TweenMax.from(this.q1, 0.6, {x:"+=650", ease:Expo.easeOut, delay:0.3});
		TweenMax.from(this.q1, 0.1, {alpha:0, ease:Power0.easeNone, delay:0.3});
		
		TweenMax.from(this.q2, 0.6, {scaleX:0.3, scaleY:0.3, ease:Elastic.easeOut.config(1, 0.7), delay:0.7});
		TweenMax.from(this.q2, 0.1, {alpha:0, ease:Power0.easeNone, delay:0.7});
		
		TweenMax.from(this.q3, 0.5, {x:"+=50", alpha:0, ease:Expo.easeOut, delay:0.7});
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// Layer 1
	this.q1 = new lib.Symbol22();
	this.q1.parent = this;
	this.q1.setTransform(88,0,1,1,0,0,180);

	this.q2 = new lib.Symbol4copy();
	this.q2.parent = this;
	this.q2.setTransform(-195,0);

	this.q3 = new lib.Symbol5copy();
	this.q3.parent = this;
	this.q3.setTransform(-162,1.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.q3},{t:this.q2},{t:this.q1}]}).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-236.5,-34,649.1,68);


(lib.Symbol21 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		TweenMax.set(this.q1, {alpha:1, x:0});
		TweenMax.set(this.q2, {alpha:1, scaleX:1, scaleY:1});
		TweenMax.set(this.q3, {alpha:1, x:-162});
		
		this.gotoAndPlay(1);
	}
	this.frame_1 = function() {
		this.stop();
		
		TweenMax.from(this.q1, 0.6, {x:"-=650", ease:Expo.easeOut, delay:0.3});
		TweenMax.from(this.q1, 0.1, {alpha:0, ease:Power0.easeNone, delay:0.3});
		
		TweenMax.from(this.q2, 0.6, {scaleX:0.3, scaleY:0.3, ease:Elastic.easeOut.config(1, 0.7), delay:0.7});
		TweenMax.from(this.q2, 0.1, {alpha:0, ease:Power0.easeNone, delay:0.7});
		
		TweenMax.from(this.q3, 0.5, {x:"+=50", alpha:0, ease:Expo.easeOut, delay:0.7});
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// Layer 1
	this.q1 = new lib.Symbol22();
	this.q1.parent = this;

	this.q2 = new lib.Symbol4();
	this.q2.parent = this;
	this.q2.setTransform(-195,0);

	this.q3 = new lib.Symbol5();
	this.q3.parent = this;
	this.q3.setTransform(-162,1.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.q3},{t:this.q2},{t:this.q1}]}).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-324.5,-34,649.6,68);


(lib.Symbol20 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_239 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(239).call(this.frame_239).wait(41));

	// Layer 6
	this.instance = new lib.Symbol21copy7();
	this.instance.parent = this;
	this.instance.setTransform(-43.9,148.5);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(239).to({_off:false},0).wait(41));

	// Layer 7
	this.instance_1 = new lib.Symbol21copy5();
	this.instance_1.parent = this;
	this.instance_1.setTransform(-43.9,73.9);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(179).to({_off:false},0).wait(101));

	// Layer 4
	this.instance_2 = new lib.Symbol21copy6();
	this.instance_2.parent = this;
	this.instance_2.setTransform(-43.9,0.3);
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(119).to({_off:false},0).wait(161));

	// Layer 3
	this.instance_3 = new lib.Symbol21copy();
	this.instance_3.parent = this;
	this.instance_3.setTransform(-43.9,-73.3);
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(59).to({_off:false},0).wait(221));

	// Layer 2
	this.instance_4 = new lib.Symbol21();
	this.instance_4.parent = this;
	this.instance_4.setTransform(-43.9,-146.1);
	this.instance_4._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(1).to({_off:false},0).wait(279));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = null;


(lib.Symbol19 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{end:4});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
		
		TweenMax.set(this.brw, {x:-399, alpha:1});
		TweenMax.set(this.ser, {x:411, alpha:1});
		
		TweenMax.set(this.txt1, {y:205, alpha:1});
		TweenMax.set(this.txt2, {y:205, alpha:1});
		
		
		TweenMax.from(this.brw, 0.7, {x:"-=300", alpha:0, ease:Expo.easeOut});
		TweenMax.from(this.txt1, 0.4, {y:"-=20", alpha:0, ease:Expo.easeOut, delay:0.4});
		
		TweenMax.from(this.ser, 0.7, {x:"+=300", alpha:0, ease:Expo.easeOut});
		TweenMax.from(this.txt2, 0.4, {y:"-=20", alpha:0, ease:Expo.easeOut, delay:0.4});
		
		TweenMax.set(this.btn, {alpha:1, scaleX:1, scaleY:1});
		TweenMax.from(this.btn, 0.8, {scaleX:0.3, scaleY:0.3, ease:Elastic.easeOut.config(1, 0.5), delay:5});
		TweenMax.from(this.btn, 0.1, {alpha:0, ease:Power0.easeNone, delay:5});
	}
	this.frame_4 = function() {
		this.stop();
		
		TweenMax.to(this.btn, 0.3, {scaleX:0, scaleY:0, ease:Expo.easeIn});
		
		TweenMax.set(this.fade, {alpha:0});
		TweenMax.to(this.fade, 0.3, {alpha:1, ease:Power0.easeNone, onComplete:myFnc});
		
		function myFnc()
		{
		   exportRoot.main.play();
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(4).call(this.frame_4).wait(15));

	// Capa 1
	this.btn = new lib.Symbol30();
	this.btn.parent = this;
	this.btn.setTransform(545.9,-202.1);

	this.timeline.addTween(cjs.Tween.get(this.btn).to({_off:true},5).wait(14));

	// Layer 28
	this.fade = new lib.Symbol35();
	this.fade.parent = this;
	this.fade.setTransform(0,6.2);
	this.fade._off = true;

	this.timeline.addTween(cjs.Tween.get(this.fade).wait(4).to({_off:false},0).wait(15));

	// Layer 21
	this.txt1 = new lib.Symbol17();
	this.txt1.parent = this;
	this.txt1.setTransform(-398.4,205);

	this.brw = new lib.Symbol18();
	this.brw.parent = this;
	this.brw.setTransform(-399,15.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.brw},{t:this.txt1}]}).to({state:[]},5).wait(14));

	// Layer 22
	this.txt2 = new lib.Symbol16();
	this.txt2.parent = this;
	this.txt2.setTransform(412.3,205);

	this.ser = new lib.Symbol15();
	this.ser.parent = this;
	this.ser.setTransform(411,15.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.ser},{t:this.txt2}]}).to({state:[]},5).wait(14));

	// Layer 23 (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	var mask_graphics_0 = new cjs.Graphics().p("Eg1IAeZMAAAg8yMBqRAAAMAAAA8yg");

	this.timeline.addTween(cjs.Tween.get(mask).to({graphics:mask_graphics_0,x:0,y:42.9}).wait(5).to({graphics:null,x:0,y:0}).wait(14));

	// Layer 1
	this.text = new lib.Symbol20();
	this.text.parent = this;
	this.text.setTransform(15.7,40.7,1,1,0,0,0,0,0.5);

	var maskedShapeInstanceList = [this.text];

	for(var shapedInstanceItr = 0; shapedInstanceItr < maskedShapeInstanceList.length; shapedInstanceItr++) {
		maskedShapeInstanceList[shapedInstanceItr].mask = mask;
	}

	this.timeline.addTween(cjs.Tween.get(this.text).to({_off:true},5).wait(14));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-507.3,-219.6,1070.7,441.1);


// stage content:
(lib.shema = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 15
	this.main = new lib.Symbol19();
	this.main.parent = this;
	this.main.setTransform(585.7,246.8,1,1,0,0,0,0,1.7);

	this.timeline.addTween(cjs.Tween.get(this.main).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(663.4,275.5,1070.7,457.1);
// library properties:
lib.properties = {
	width: 1170,
	height: 500,
	fps: 60,
	color: "#FFFFFF",
	opacity: 1.00,
	webfonts: {},
	manifest: [],
	preloads: []
};




})(lib = lib||{}, images = images||{}, createjs = createjs||{}, ss = ss||{}, AdobeAn = AdobeAn||{});
var lib, images, createjs, ss, AdobeAn;