function _typeof(obj) {
	if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
		_typeof = function _typeof(obj) {
			return typeof obj;
		};
	} else {
		_typeof = function _typeof(obj) {
			return obj &&
				typeof Symbol === "function" &&
				obj.constructor === Symbol &&
				obj !== Symbol.prototype
				? "symbol"
				: typeof obj;
		};
	}
	return _typeof(obj);
}

/*!
 * Macy.js - v2.3.1
 * @see {@link https://github.com/bigbitecreative/macy.js}
 * passes jshint
 */
(function(global, factory) {
	if (
		(typeof exports === "undefined" ? "undefined" : _typeof(exports)) ===
			"object" &&
		typeof module !== "undefined"
	) {
		module.exports = factory();
	} else if (typeof define === "function" && define.amd) {
		define(factory);
	} else {
		global.Macy = factory();
	}
})("undefined" !== typeof window ? window : this, function () {
	"use strict";

	var $e = function $e(parameter, context) {
		if (!(this instanceof $e)) {
			return new $e(parameter, context);
		}

		parameter = parameter.replace(/^\s*/, "").replace(/\s*$/, "");

		if (context) {
			return this.byCss(parameter, context);
		}

		for (var key in this.selectors) {
			if (this.selectors.hasOwnProperty(key)) {
				context = key.split("/");

				if (new RegExp(context[1], context[2]).test(parameter)) {
					return this.selectors[key](parameter);
				}
			}
		}

		return this.byCss(parameter);
	};

	$e.prototype.byCss = function (parameter, context) {
		return (context || document).querySelectorAll(parameter);
	};

	$e.prototype.selectors = {};

	$e.prototype.selectors[/^\.[\w\-]+$/] = function (param) {
		return document.getElementsByClassName(param.substring(1));
	};

	$e.prototype.selectors[/^\w+$/] = function (param) {
		return document.getElementsByTagName(param);
	};

	$e.prototype.selectors[/^\#[\w\-]+$/] = function (param) {
		return document.getElementById(param.substring(1));
	};

	function wait(func, delta) {
		var to = void 0;
		return function () {
			if (to) {
				clearTimeout(to);
			}

			to = setTimeout(func, delta);
		};
	}

	var foreach = function foreach(iterable, callback) {
		var i = iterable.length,
			len = i;

		while (i--) {
			callback(iterable[len - i - 1]);
		}
	};

	function map(iterable, callback) {
		var i = iterable.length,
			len = i;
		var returns = [];

		while (i--) {
			returns.push(callback(iterable[len - i - 1]));
		}

		return returns;
	}

	var Queue = function Queue() {
		var events =
			arguments.length > 0 && arguments[0] !== undefined
				? arguments[0]
				: false;
		this.running = false;
		this.events = [];
		this.add(events);
	};

	Queue.prototype.run = function () {
		if (!this.running && this.events.length > 0) {
			var fn = this.events.shift();
			this.running = true;
			fn();
			this.running = false;
			this.run();
		}
	};

	Queue.prototype.add = function () {
		var _this = this;

		var event =
			arguments.length > 0 && arguments[0] !== undefined
				? arguments[0]
				: false;

		if (!event) {
			return false;
		}

		if (Array.isArray(event)) {
			return foreach(event, function(evt) {
				return _this.add(evt);
			});
		}

		this.events.push(event);
		this.run();
	};

	Queue.prototype.clear = function () {
		this.events = [];
	};

	var Event = function Event(instance) {
		var data =
			arguments.length > 1 && arguments[1] !== undefined
				? arguments[1]
				: {};
		this.instance = instance;
		this.data = data;
		return this;
	};

	var EventManager = function EventManager() {
		var instance =
			arguments.length > 0 && arguments[0] !== undefined
				? arguments[0]
				: false;
		this.events = {};
		this.instance = instance;
	};

	EventManager.prototype.on = function () {
		var key =
			arguments.length > 0 && arguments[0] !== undefined
				? arguments[0]
				: false;
		var func =
			arguments.length > 1 && arguments[1] !== undefined
				? arguments[1]
				: false;

		if (!key || !func) {
			return false;
		}

		if (!Array.isArray(this.events[key])) {
			this.events[key] = [];
		}

		return this.events[key].push(func);
	};

	EventManager.prototype.emit = function () {
		var key =
			arguments.length > 0 && arguments[0] !== undefined
				? arguments[0]
				: false;
		var data =
			arguments.length > 1 && arguments[1] !== undefined
				? arguments[1]
				: {};

		if (!key || !Array.isArray(this.events[key])) {
			return false;
		}

		var evt = new Event(this.instance, data);
		foreach(this.events[key], function(fn) {
			return fn(evt);
		});
	};

	var imageHasLoaded = function imageHasLoaded(img) {
		return (
			!(
				"naturalHeight" in img &&
				img.naturalHeight + img.naturalWidth === 0
			) || img.width + img.height !== 0
		);
	};

	var promise = function promise(ctx, image) {
		var emitOnLoad =
			arguments.length > 2 && arguments[2] !== undefined
				? arguments[2]
				: false;
		return new Promise(function(resolve, reject) {
			if (image.complete) {
				if (!imageHasLoaded(image)) {
					return reject(image);
				}

				return resolve(image);
			}

			image.addEventListener("load", function () {
				if (imageHasLoaded(image)) {
					return resolve(image);
				}

				return reject(image);
			});
			image.addEventListener("error", function () {
				return reject(image);
			});
		})
			.then(function(img) {
				if (emitOnLoad) {
					ctx.emit(ctx.constants.EVENT_IMAGE_LOAD, {
						img: img
					});
				}
			})
			["catch"](function(img) {
				return ctx.emit(ctx.constants.EVENT_IMAGE_ERROR, {
					img: img
				});
			});
	};

	var getImagePromises = function getImagePromises(ctx, images) {
		var emitOnLoad =
			arguments.length > 2 && arguments[2] !== undefined
				? arguments[2]
				: false;
		return map(images, function(image) {
			return promise(ctx, image, emitOnLoad);
		});
	};

	var imageLoaderPromise = function imageLoaderPromise(ctx, images) {
		var emitOnLoad =
			arguments.length > 2 && arguments[2] !== undefined
				? arguments[2]
				: false;
		return Promise.all(getImagePromises(ctx, images, emitOnLoad)).then(
			function() {
				ctx.emit(ctx.constants.EVENT_IMAGE_COMPLETE);
			}
		);
	};

	function imagesLoadedNew(ctx, imgs) {
		var during =
			arguments.length > 2 && arguments[2] !== undefined
				? arguments[2]
				: false;
		imageLoaderPromise(ctx, imgs, during);
	}

	var createResizeEvent = function createResizeEvent(ctx) {
		return wait(function () {
			ctx.emit(ctx.constants.EVENT_RESIZE);
			ctx.queue.add(function () {
				return ctx.recalculate(true, true);
			});
		}, 100);
	};

	var setupContainer = function setupContainer(ctx) {
		ctx.container = $e(ctx.options.container);

		if (ctx.container instanceof $e || !ctx.container) {
			return ctx.options.debug
				? console.error("Error: Container not found")
				: false;
		}

		delete ctx.options.container;

		if (ctx.container.length) {
			ctx.container = ctx.container[0];
		}

		ctx.container.style.position = "relative";
	};

	var setupState = function setupState(ctx) {
		ctx.queue = new Queue();
		ctx.events = new EventManager(ctx);
		ctx.rows = [];
		ctx.resizer = createResizeEvent(ctx);
	};

	var setupEventListeners = function setupEventListeners(ctx) {
		var imgs = $e("img", ctx.container);
		window.addEventListener("resize", ctx.resizer);
		ctx.on(ctx.constants.EVENT_IMAGE_LOAD, function () {
			return ctx.recalculate(false, false);
		});
		ctx.on(ctx.constants.EVENT_IMAGE_COMPLETE, function () {
			return ctx.recalculate(true, true);
		});

		if (!ctx.options.useOwnImageLoader) {
			imagesLoadedNew(ctx, imgs, !ctx.options.waitForImages);
		}

		ctx.emit(ctx.constants.EVENT_INITIALIZED);
	};

	var setup = function setup(ctx) {
		setupContainer(ctx);
		setupState(ctx);
		setupEventListeners(ctx);
	};

	var isObject = function isObject(obj) {
		return (
			obj === Object(obj) &&
			Object.prototype.toString.call(obj) !== "[object Array]"
		);
	};

	var replaceOptionsResponsively = function replaceOptionsResponsively(
		tempOpts,
		responsiveOptions
	) {
		if (!isObject(tempOpts)) {
			responsiveOptions.columns = tempOpts;
		}

		if (isObject(tempOpts) && tempOpts.columns) {
			responsiveOptions.columns = tempOpts.columns;
		}

		if (
			isObject(tempOpts) &&
			tempOpts.margin &&
			!isObject(tempOpts.margin)
		) {
			responsiveOptions.margin = {
				x: tempOpts.margin,
				y: tempOpts.margin
			};
		}

		if (
			isObject(tempOpts) &&
			tempOpts.margin &&
			isObject(tempOpts.margin) &&
			tempOpts.margin.x
		) {
			responsiveOptions.margin.x = tempOpts.margin.x;
		}

		if (
			isObject(tempOpts) &&
			tempOpts.margin &&
			isObject(tempOpts.margin) &&
			tempOpts.margin.y
		) {
			responsiveOptions.margin.y = tempOpts.margin.y;
		}
	};

	function getOptionsAsMobileFirst(_ref) {
		var options = _ref.options,
			responsiveOptions = _ref.responsiveOptions,
			keys = _ref.keys,
			docWidth = _ref.docWidth;
		var tempOpts = void 0;

		for (var i = 0; i < keys.length; i++) {
			var widths = parseInt(keys[i], 10);

			if (docWidth >= widths) {
				tempOpts = options.breakAt[widths];
				replaceOptionsResponsively(tempOpts, responsiveOptions);
			}
		}

		return responsiveOptions;
	}

	function getOptionsAsDesktopFirst(_ref2) {
		var options = _ref2.options,
			responsiveOptions = _ref2.responsiveOptions,
			keys = _ref2.keys,
			docWidth = _ref2.docWidth;
		var tempOpts = void 0;

		for (var i = keys.length - 1; i >= 0; i--) {
			var widths = parseInt(keys[i], 10);

			if (docWidth <= widths) {
				tempOpts = options.breakAt[widths];
				replaceOptionsResponsively(tempOpts, responsiveOptions);
			}
		}

		return responsiveOptions;
	}

	function getResponsiveOptions(options) {
		var docWidth = window.innerWidth;
		var responsiveOptions = {
			columns: options.columns
		};

		if (!isObject(options.margin)) {
			responsiveOptions.margin = {
				x: options.margin,
				y: options.margin
			};
		} else {
			responsiveOptions.margin = {
				x: options.margin.x,
				y: options.margin.y
			};
		}

		var keys = Object.keys(options.breakAt);

		if (options.mobileFirst) {
			return getOptionsAsMobileFirst({
				options: options,
				responsiveOptions: responsiveOptions,
				keys: keys,
				docWidth: docWidth
			});
		}

		return getOptionsAsDesktopFirst({
			options: options,
			responsiveOptions: responsiveOptions,
			keys: keys,
			docWidth: docWidth
		});
	}

	function getCurrentColumns(options) {
		var noOfColumns = getResponsiveOptions(options).columns;
		return noOfColumns;
	}

	function getCurrentMargin(options) {
		var margin = getResponsiveOptions(options).margin;
		return margin;
	}

	function getWidths(options) {
		var marginsIncluded =
			arguments.length > 1 && arguments[1] !== undefined
				? arguments[1]
				: true;
		var noOfColumns = getCurrentColumns(options);
		var margins = getCurrentMargin(options).x;
		var width = 100 / noOfColumns;

		if (!marginsIncluded) {
			return width;
		}

		if (noOfColumns === 1) {
			return "100%";
		}

		margins = ((noOfColumns - 1) * margins) / noOfColumns;
		return "calc(" + width + "% - " + margins + "px)";
	}

	function getLeftPosition(ctx, col) {
		var noOfColumns = getCurrentColumns(ctx.options);
		var totalLeft = 0;
		var margin = void 0,
			str = void 0,
			baseMargin = void 0;
		col++;

		if (col === 1) {
			return 0;
		}

		baseMargin = getCurrentMargin(ctx.options).x;
		margin =
			(baseMargin - ((noOfColumns - 1) * baseMargin) / noOfColumns) *
			(col - 1);
		totalLeft += getWidths(ctx.options, false) * (col - 1);
		str = "calc(" + totalLeft + "% + " + margin + "px)";
		return str;
	}

	function setContainerHeight(ctx) {
		var largest = 0;
		var container = ctx.container,
			rows = ctx.rows;
		foreach(rows, function(row) {
			largest = row > largest ? row : largest;
		});
		container.style.height = largest + "px";
	}

	var prop = function prop(element, property) {
		return window
			.getComputedStyle(element, null)
			.getPropertyValue(property);
	};

	var setUpRows = function setUpRows(ctx, cols) {
		var refresh =
			arguments.length > 2 && arguments[2] !== undefined
				? arguments[2]
				: false;

		if (!ctx.lastcol) {
			ctx.lastcol = 0;
		}

		if (ctx.rows.length < 1) {
			refresh = true;
		}

		if (refresh) {
			ctx.rows = [];
			ctx.cols = [];
			ctx.lastcol = 0;

			for (var i = cols - 1; i >= 0; i--) {
				ctx.rows[i] = 0;
				ctx.cols[i] = getLeftPosition(ctx, i);
			}

			return;
		}

		if (ctx.tmpRows) {
			ctx.rows = [];

			for (var j = cols - 1; j >= 0; j--) {
				ctx.rows[j] = ctx.tmpRows[j];
			}

			return;
		}

		ctx.tmpRows = [];

		for (var k = cols - 1; k >= 0; k--) {
			ctx.tmpRows[k] = ctx.rows[k];
		}
	};

	function shuffle(ctx, $eles) {
		var refresh =
			arguments.length > 2 && arguments[2] !== undefined
				? arguments[2]
				: false;
		var markasComplete =
			arguments.length > 3 && arguments[3] !== undefined
				? arguments[3]
				: true;
		var cols = getCurrentColumns(ctx.options);
		var margin = getCurrentMargin(ctx.options).y;
		setUpRows(ctx, cols, refresh);
		foreach($eles, function(ele) {
			var smallest = 0;
			var eleHeight = parseInt(ele.offsetHeight, 10);
			if (isNaN(eleHeight)) return;
			ctx.rows.forEach(function(v, k) {
				if (v < ctx.rows[smallest]) {
					smallest = k;
				}
			});
			ele.style.position = "absolute";
			ele.style.top = ctx.rows[smallest] + "px";
			ele.style.left = "" + ctx.cols[smallest];
			ctx.rows[smallest] += !isNaN(eleHeight) ? eleHeight + margin : 0;

			if (markasComplete) {
				ele.dataset.macyComplete = 1;
			}
		});

		if (markasComplete) {
			ctx.tmpRows = null;
		}

		setContainerHeight(ctx);
	}

	function sort(ctx, $eles) {
		var refresh =
			arguments.length > 2 && arguments[2] !== undefined
				? arguments[2]
				: false;
		var markasComplete =
			arguments.length > 3 && arguments[3] !== undefined
				? arguments[3]
				: true;
		var cols = getCurrentColumns(ctx.options);
		var margin = getCurrentMargin(ctx.options).y;
		setUpRows(ctx, cols, refresh);
		foreach($eles, function(ele) {
			if (ctx.lastcol === cols) {
				ctx.lastcol = 0;
			}

			var eleHeight = prop(ele, "height");
			eleHeight = parseInt(ele.offsetHeight, 10);
			if (isNaN(eleHeight)) return;
			ele.style.position = "absolute";
			ele.style.top = ctx.rows[ctx.lastcol] + "px";
			ele.style.left = "" + ctx.cols[ctx.lastcol];
			ctx.rows[ctx.lastcol] += !isNaN(eleHeight) ? eleHeight + margin : 0;
			ctx.lastcol += 1;

			if (markasComplete) {
				ele.dataset.macyComplete = 1;
			}
		});

		if (markasComplete) {
			ctx.tmpRows = null;
		}

		setContainerHeight(ctx);
	}

	var calculate = function calculate(ctx) {
		var refresh =
			arguments.length > 1 && arguments[1] !== undefined
				? arguments[1]
				: false;
		var loaded =
			arguments.length > 2 && arguments[2] !== undefined
				? arguments[2]
				: true;
		var children = refresh
			? ctx.container.children
			: $e(':scope > *:not([data-macy-complete="1"])', ctx.container);
		var eleWidth = getWidths(ctx.options);
		foreach(children, function(child) {
			if (refresh) {
				child.dataset.macyComplete = 0;
			}

			child.style.width = eleWidth;
		});

		if (ctx.options.trueOrder) {
			sort(ctx, children, refresh, loaded);
			return ctx.emit(ctx.constants.EVENT_RECALCULATED);
		}

		shuffle(ctx, children, refresh, loaded);
		return ctx.emit(ctx.constants.EVENT_RECALCULATED);
	};

	var init$1 = function init() {
		try {
			document.createElement("a").querySelector(":scope *");
		} catch (error) {
			(function () {
				var scope = /:scope\b/gi;
				var querySelectorWithScope = polyfill(
					Element.prototype.querySelector
				);

				Element.prototype.querySelector = function querySelector(
					selectors
				) {
					return querySelectorWithScope.apply(this, arguments);
				};

				var querySelectorAllWithScope = polyfill(
					Element.prototype.querySelectorAll
				);

				Element.prototype.querySelectorAll = function querySelectorAll(
					selectors
				) {
					return querySelectorAllWithScope.apply(this, arguments);
				};

				function polyfill(originalQuerySelector) {
					return function (selectors) {
						var hasScope = selectors && scope.test(selectors);

						if (hasScope) {
							var id = this.getAttribute("id");

							if (!id) {
								this.id =
									"q" +
									Math.floor(Math.random() * 9000000) +
									1000000;
							}

							arguments[0] = selectors.replace(
								scope,
								"#" + this.id
							);
							var elementOrNodeList = originalQuerySelector.apply(
								this,
								arguments
							);

							if (id === null) {
								this.removeAttribute("id");
							} else if (!id) {
								this.id = id;
							}

							return elementOrNodeList;
						} else {
							return originalQuerySelector.apply(this, arguments);
						}
					};
				}
			})();
		}
	};

	var _extends =
		Object.assign ||
		function(target) {
			for (var i = 1; i < arguments.length; i++) {
				var source = arguments[i];

				for (var key in source) {
					if (Object.prototype.hasOwnProperty.call(source, key)) {
						target[key] = source[key];
					}
				}
			}

			return target;
		};

	var defaults = {
		columns: 4,
		margin: 2,
		trueOrder: false,
		waitForImages: false,
		useImageLoader: true,
		breakAt: {},
		useOwnImageLoader: false,
		onInit: false
	};
	init$1();

	var Macy = function Macy() {
		var opts =
			arguments.length > 0 && arguments[0] !== undefined
				? arguments[0]
				: defaults;

		if (!(this instanceof Macy)) {
			return new Macy(opts);
		}

		this.options = {};

		_extends(this.options, defaults, opts);

		setup(this);
	};

	Macy.init = function (options) {
		console.warn(
			"Depreciated: Macy.init will be removed in v3.0.0 opt to use Macy directly like so Macy({ /*options here*/ }) "
		);
		return new Macy(options);
	};

	Macy.prototype.recalculateOnImageLoad = function () {
		var waitUntilFinish =
			arguments.length > 0 && arguments[0] !== undefined
				? arguments[0]
				: false;
		var imgs = $e("img", this.container);
		return imagesLoadedNew(this, imgs, !waitUntilFinish);
	};

	Macy.prototype.runOnImageLoad = function (func) {
		var everyLoad =
			arguments.length > 1 && arguments[1] !== undefined
				? arguments[1]
				: false;
		var imgs = $e("img", this.container);
		this.on(this.constants.EVENT_IMAGE_COMPLETE, func);

		if (everyLoad) {
			this.on(this.constants.EVENT_IMAGE_LOAD, func);
		}

		return imagesLoadedNew(this, imgs, everyLoad);
	};

	Macy.prototype.recalculate = function () {
		var _this = this;

		var refresh =
			arguments.length > 0 && arguments[0] !== undefined
				? arguments[0]
				: false;
		var loaded =
			arguments.length > 1 && arguments[1] !== undefined
				? arguments[1]
				: true;

		if (loaded) {
			this.queue.clear();
		}

		return this.queue.add(function () {
			return calculate(_this, refresh, loaded);
		});
	};

	Macy.prototype.remove = function () {
		window.removeEventListener("resize", this.resizer);
		foreach(this.container.children, function(child) {
			child.removeAttribute("data-macy-complete");
			child.removeAttribute("style");
		});
		this.container.removeAttribute("style");
	};

	Macy.prototype.reInit = function () {
		this.recalculate(true, true);
		this.emit(this.constants.EVENT_INITIALIZED);
		window.addEventListener("resize", this.resizer);
		this.container.style.position = "relative";
	};

	Macy.prototype.on = function (key, func) {
		this.events.on(key, func);
	};

	Macy.prototype.emit = function (key, data) {
		this.events.emit(key, data);
	};

	Macy.constants = {
		EVENT_INITIALIZED: "macy.initialized",
		EVENT_RECALCULATED: "macy.recalculated",
		EVENT_IMAGE_LOAD: "macy.image.load",
		EVENT_IMAGE_ERROR: "macy.image.error",
		EVENT_IMAGE_COMPLETE: "macy.images.complete",
		EVENT_RESIZE: "macy.resize"
	};
	Macy.prototype.constants = Macy.constants;
	return Macy;
});

/*!
 * @license Minigrid v3.1.1 minimal cascading grid layout http://alves.im/minigrid
 * @see {@link https://github.com/henriquea/minigrid}
 * changed element selection method
 * passes jshint
 */
(function(root, document) {
	"use strict";

	function extend(a, b) {
		for (var key in b) {
			if (b.hasOwnProperty(key)) {
				a[key] = b[key];
			}
		}

		return a;
	}

	var elementsSelector;

	elementsSelector = function elementsSelector(selector, context, undefined) {
		var matches = {
			"#": "getElementById",
			".": "getElementsByClassName",
			"@": "getElementsByName",
			"=": "getElementsByTagName",
			"*": "querySelectorAll"
		}[selector[0]];
		var el = (context === undefined ? document : context)[matches](
			selector.slice(1)
		);
		return el.length < 2 ? el[0] : el;
	};

	var Minigrid = function Minigrid(props) {
		var containerEle =
			props.container instanceof Node
				? props.container
				: elementsSelector(props.container) || "";
		var itemsNodeList =
			props.item instanceof NodeList
				? props.item
				: elementsSelector(props.item) || "";
		this.props = extend(props, {
			container: containerEle,
			nodeList: itemsNodeList
		});
	};

	Minigrid.prototype.mount = function () {
		if (!this.props.container) {
			return false;
		}

		if (!this.props.nodeList || this.props.nodeList.length === 0) {
			return false;
		}

		var gutter =
			typeof this.props.gutter === "number" &&
			isFinite(this.props.gutter) &&
			Math.floor(this.props.gutter) === this.props.gutter
				? this.props.gutter
				: 0;
		var done = this.props.done;
		var containerEle = this.props.container;
		var itemsNodeList = this.props.nodeList;
		containerEle.style.width = "";
		var forEach = Array.prototype.forEach;
		var containerWidth = containerEle.getBoundingClientRect().width;
		var firstChildWidth =
			itemsNodeList[0].getBoundingClientRect().width + gutter;
		var cols = Math.max(
			Math.floor((containerWidth - gutter) / firstChildWidth),
			1
		);
		var count = 0;
		containerWidth = firstChildWidth * cols + gutter + "px";
		containerEle.style.width = containerWidth;
		containerEle.style.position = "relative";
		var itemsGutter = [];
		var itemsPosX = [];

		for (var g = 0; g < cols; ++g) {
			itemsPosX.push(g * firstChildWidth + gutter);
			itemsGutter.push(gutter);
		}

		if (this.props.rtl) {
			itemsPosX.reverse();
		}

		forEach.call(itemsNodeList, function(item) {
			var itemIndex = itemsGutter
				.slice(0)
				.sort(function(a, b) {
					return a - b;
				})
				.shift();
			itemIndex = itemsGutter.indexOf(itemIndex);
			var posX = parseInt(itemsPosX[itemIndex]);
			var posY = parseInt(itemsGutter[itemIndex]);
			item.style.position = "absolute";
			item.style.webkitBackfaceVisibility = item.style.backfaceVisibility =
				"hidden";
			item.style.transformStyle = "preserve-3d";
			item.style.transform =
				"translate3D(" + posX + "px," + posY + "px, 0)";
			itemsGutter[itemIndex] +=
				item.getBoundingClientRect().height + gutter;
			count = count + 1;
		});
		containerEle.style.display = "";
		var containerHeight = itemsGutter
			.slice(0)
			.sort(function(a, b) {
				return a - b;
			})
			.pop();
		containerEle.style.height = containerHeight + "px";

		if (typeof done === "function") {
			done(itemsNodeList);
		}
	};

	root.Minigrid = Minigrid;
})("undefined" !== typeof window ? window : this, document);

/*!
 * @app ReadMoreJS
 * @desc Breaks the content of an element to the specified number of words
 * @version 1.0.0
 * @license The MIT License (MIT)
 * @author George Raptis | http://georap.gr
 * @see {@link https://github.com/georapbox/ReadMore.js/blob/master/src/readMoreJS.js}
 * changed: rmLink = doc.querySelectorAll('.rm-link');
 * to: rmLink = doc.querySelectorAll('.rm-link') || "";
 * changed: var target = doc.querySelectorAll(options.target)
 * to: var target = elementsSelector(options.target)
 */
(function(win, doc, undef) {
	"use strict";

	var RM = {};
	RM.helpers = {
		extendObj: function extendObj() {
			for (var i = 1, l = arguments.length; i < l; i += 1) {
				for (var key in arguments[i]) {
					if (arguments[i].hasOwnProperty(key)) {
						if (
							arguments[i][key] &&
							arguments[i][key].constructor &&
							arguments[i][key].constructor === Object
						) {
							arguments[0][key] = arguments[0][key] || {};
							this.extendObj(
								arguments[0][key],
								arguments[i][key]
							);
						} else {
							arguments[0][key] = arguments[i][key];
						}
					}
				}
			}

			return arguments[0];
		}
	};

	RM.countWords = function (str) {
		return str.split(/\s+/).length;
	};

	RM.generateTrimmed = function (str, wordsNum) {
		return (
			str
				.split(/\s+/)
				.slice(0, wordsNum)
				.join(" ") + "..."
		);
	};

	RM.init = function (options) {
		var defaults = {
			target: "",
			numOfWords: 50,
			toggle: true,
			moreLink: "read more...",
			lessLink: "read less"
		};
		options = RM.helpers.extendObj({}, defaults, options);
		var target = doc.querySelectorAll(options.target),
			targetLen = target.length,
			targetContent,
			trimmedTargetContent,
			targetContentWords,
			initArr = [],
			trimmedArr = [],
			i,
			j,
			l,
			moreContainer,
			rmLink,
			moreLinkID,
			index;

		for (i = 0; i < targetLen; i++) {
			targetContent = target[i].innerHTML;
			trimmedTargetContent = RM.generateTrimmed(
				targetContent,
				options.numOfWords
			);
			targetContentWords = RM.countWords(targetContent);
			initArr.push(targetContent);
			trimmedArr.push(trimmedTargetContent);

			if (options.numOfWords < targetContentWords - 1) {
				target[i].innerHTML = trimmedArr[i];

				if (options.inline) {
					moreContainer = doc.createElement("span");
				} else {
					if (options.customBlockElement) {
						moreContainer = doc.createElement(
							options.customBlockElement
						);
					} else {
						moreContainer = doc.createElement("div");
					}
				}

				moreContainer.innerHTML =
					'<span id="rm-more_' +
					i +
					'" class="rm-link" style="cursor:pointer;">' +
					options.moreLink +
					"</span>";

				if (options.inline) {
					target[i].appendChild(moreContainer);
				} else {
					target[i].parentNode.insertBefore(
						moreContainer,
						target[i].nextSibling
					);
				}
			}
		}

		rmLink = doc.querySelectorAll(".rm-link") || "";

		var func = function func() {
			moreLinkID = this.getAttribute("id");
			index = moreLinkID.split("_")[1];

			if (this.getAttribute("data-clicked") !== "true") {
				target[index].innerHTML = initArr[index];

				if (options.toggle !== false) {
					this.innerHTML = options.lessLink;
					this.setAttribute("data-clicked", true);
				} else {
					this.innerHTML = "";
				}
			} else {
				target[index].innerHTML = trimmedArr[index];
				this.innerHTML = options.moreLink;
				this.setAttribute("data-clicked", false);
			}
		};

		for (j = 0, l = rmLink.length; j < l; j++) {
			rmLink[j].onclick = func;
		}
	};

	window.$readMoreJS = RM;
})("undefined" !== typeof window ? window : this, document);

/*!
 * A small javascript library for ripples
 * /Written by Aaron Längert
 * @see {@link https://github.com/SirBaaron/ripple-js}
 * replaced eval with workaround
 * moved functions away from for loop
 * == to ===
 * added is binded ripple class to avoid multiple assignments
 * moved some functions higher
 * passes jshint
 */
(function(root, document) {
	"use strict";

	var ripple = (function () {
		function getRippleContainer(el) {
			var childs = el.childNodes;

			for (var ii = 0; ii < childs.length; ii++) {
				try {
					/* if (childs[ii].className.indexOf("rippleContainer") > -1) { */
					if (childs[ii].classList.contains("rippleContainer")) {
						return childs[ii];
					}
				} catch (err) {}
			}

			return el;
		}

		function rippleStart(e) {
			var rippleContainer = getRippleContainer(e.target);
			/* if ((rippleContainer.getAttribute("animating") === "0" || !rippleContainer.hasAttribute("animating")) && e.target.className.indexOf("ripple") > -1) { */

			if (
				(rippleContainer.getAttribute("animating") === "0" ||
					!rippleContainer.hasAttribute("animating")) &&
				e.target.classList.contains("ripple")
			) {
				rippleContainer.setAttribute("animating", "1");
				var offsetX =
					typeof e.offsetX === "number"
						? e.offsetX
						: e.touches[0].clientX -
						  e.target.getBoundingClientRect().left;
				var offsetY =
					typeof e.offsetY === "number"
						? e.offsetY
						: e.touches[0].clientY -
						  e.target.getBoundingClientRect().top;
				var fullCoverRadius = Math.max(
					Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2)),
					Math.sqrt(
						Math.pow(e.target.clientWidth - offsetX, 2) +
							Math.pow(e.target.clientHeight - offsetY, 2)
					),
					Math.sqrt(
						Math.pow(offsetX, 2) +
							Math.pow(e.target.clientHeight - offsetY, 2)
					),
					Math.sqrt(
						Math.pow(offsetY, 2) +
							Math.pow(e.target.clientWidth - offsetX, 2)
					)
				);
				var expandTime =
					e.target.getAttribute("ripple-press-expand-time") || 3;
				rippleContainer.style.transition =
					"transform " +
					expandTime +
					"s ease-out, box-shadow 0.1s linear";
				rippleContainer.style.background =
					e.target.getAttribute("ripple-color") || "white";
				rippleContainer.style.opacity =
					e.target.getAttribute("ripple-opacity") || "0.6";
				rippleContainer.style.boxShadow =
					e.target.getAttribute("ripple-shadow") || "none";
				rippleContainer.style.top = offsetY + "px";
				rippleContainer.style.left = offsetX + "px";
				rippleContainer.style.transform =
					"translate(-50%, -50%) scale(" +
					fullCoverRadius / 100 +
					")";
			}
		}

		function rippleEnd(e) {
			var rippleContainer = getRippleContainer(e.target);

			if (rippleContainer.getAttribute("animating") === "1") {
				rippleContainer.setAttribute("animating", "2");
				var background = root
					.getComputedStyle(rippleContainer, null)
					.getPropertyValue("background");
				var destinationRadius =
					e.target.clientWidth + e.target.clientHeight;
				rippleContainer.style.transition = "none";
				var expandTime =
					e.target.getAttribute("ripple-release-expand-time") || 0.4;
				rippleContainer.style.transition =
					"transform " +
					expandTime +
					"s linear, background " +
					expandTime +
					"s linear, opacity " +
					expandTime +
					"s ease-in-out";
				rippleContainer.style.transform =
					"translate(-50%, -50%) scale(" +
					destinationRadius / 100 +
					")";
				rippleContainer.style.background =
					"radial-gradient(transparent 10%, " + background + " 40%)";
				rippleContainer.style.opacity = "0";
				e.target.dispatchEvent(
					new CustomEvent("ripple-button-click", {
						target: e.target
					})
				);
				var Fn = Function;
				new Fn("" + e.target.getAttribute("onrippleclick")).call(root);
			}
		}

		function rippleRetrieve(e) {
			var rippleContainer = getRippleContainer(e.target);

			if (
				rippleContainer.style.transform ===
				"translate(-50%, -50%) scale(0)"
			) {
				rippleContainer.setAttribute("animating", "0");
			}

			if (rippleContainer.getAttribute("animating") === "1") {
				rippleContainer.setAttribute("animating", "3");
				var collapseTime =
					e.target.getAttribute("ripple-leave-collapse-time") || 0.4;
				rippleContainer.style.transition =
					"transform " +
					collapseTime +
					"s linear, box-shadow " +
					collapseTime +
					"s linear";
				rippleContainer.style.boxShadow = "none";
				rippleContainer.style.transform =
					"translate(-50%, -50%) scale(0)";
			}
		}

		var ripple = {
			registerRipples: function registerRipples() {
				var rippleButtons = document.getElementsByClassName("ripple");
				var i;

				var fn1 = function fn1() {
					rippleButtons[i].addEventListener(
						"touchstart",
						function(e) {
							rippleStart(e);
						},
						{
							passive: true
						}
					);
					rippleButtons[i].addEventListener(
						"touchmove",
						function(e) {
							if (
								e.target.hasAttribute("ripple-cancel-on-move")
							) {
								rippleRetrieve(e);
								return;
							}

							var overEl;

							try {
								/* overEl = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY).className.indexOf("ripple") >= 0; */
								overEl = document
									.elementFromPoint(
										e.touches[0].clientX,
										e.touches[0].clientY
									)
									.classList.contains("ripple");
							} catch (err) {
								overEl = false;
							}

							if (!overEl) {
								rippleRetrieve(e);
							}
						},
						{
							passive: true
						}
					);
					rippleButtons[i].addEventListener(
						"touchend",
						function(e) {
							rippleEnd(e);
						},
						{
							passive: true
						}
					);
					rippleButtons[i].addEventListener(
						"mousedown",
						function(e) {
							rippleStart(e);
						},
						{
							passive: true
						}
					);
					rippleButtons[i].addEventListener(
						"mouseup",
						function(e) {
							rippleEnd(e);
						},
						{
							passive: true
						}
					);
					rippleButtons[i].addEventListener(
						"mousemove",
						function(e) {
							if (
								e.target.hasAttribute(
									"ripple-cancel-on-move"
								) &&
								(e.movementX !== 0 || e.movementY !== 0)
							) {
								rippleRetrieve(e);
							}
						},
						{
							passive: true
						}
					);
					rippleButtons[i].addEventListener(
						"mouseleave",
						function(e) {
							rippleRetrieve(e);
						},
						{
							passive: true
						}
					);
					rippleButtons[i].addEventListener(
						"transitionend",
						function(e) {
							if (
								e.target.getAttribute("animating") === "2" ||
								e.target.getAttribute("animating") === "3"
							) {
								e.target.style.transition = "none";
								e.target.style.transform =
									"translate(-50%, -50%) scale(0)";
								e.target.style.boxShadow = "none";
								e.target.setAttribute("animating", "0");
							}
						},
						{
							passive: true
						}
					);

					if (
						getRippleContainer(rippleButtons[i]) ===
						rippleButtons[i]
					) {
						rippleButtons[i].innerHTML +=
							'<div class="rippleContainer"></div>';
					}
				};

				var isBindedRippleClass = "ripple--is-binded";

				for (i = 0; i < rippleButtons.length; i++) {
					if (
						!rippleButtons[i].classList.contains(
							isBindedRippleClass
						)
					) {
						rippleButtons[i].classList.add(isBindedRippleClass);
						fn1();
					}
				}
			},
			ripple: function ripple(el) {
				/* if (el.className.indexOf("ripple") < 0) { */
				if (!el.classList.contains("ripple")) {
					return;
				}

				var rect = el.getBoundingClientRect();
				var e = {
					target: el,
					offsetX: rect.width / 2,
					offsetY: rect.height / 2
				};
				rippleStart(e);
				rippleEnd(e);
			}
		};
		/* root.addEventListener("load", function () { */

		var css = document.createElement("style");
		css.type = "text/css";
		css.innerHTML =
			".ripple { overflow: hidden !important; position: relative; } .ripple .rippleContainer { display: block; height: 200px !important; width: 200px !important; padding: 0px 0px 0px 0px; border-radius: 50%; position: absolute !important; top: 0px; left: 0px; transform: translate(-50%, -50%) scale(0); -webkit-transform: translate(-50%, -50%) scale(0); -ms-transform: translate(-50%, -50%) scale(0); background-color: transparent; } .ripple * {pointer-events: none !important;}";
		document.head.appendChild(css);
		ripple.registerRipples();
		/* }); */

		return ripple;
	})();

	root.ripple = ripple;
})("undefined" !== typeof window ? window : this, document);

/*!
 * @see {@link https://github.com/englishextra/iframe-lightbox}
 * modified Simple lightbox effect in pure JS
 * @see {@link https://github.com/squeral/lightbox}
 * @see {@link https://github.com/squeral/lightbox/blob/master/lightbox.js}
 * @params {Object} elem Node element
 * @params {Object} settings object
 * el.lightbox = new IframeLightbox(elem, settings)
 * passes jshint
 */

/*jshint -W014 */
(function(root, document) {
	"use strict";

	var docElem = document.documentElement || "";
	var docBody = document.body || "";
	var containerClass = "iframe-lightbox";
	var iframeLightboxWindowIsBindedClass = "iframe-lightbox-window--is-binded";
	var iframeLightboxOpenClass = "iframe-lightbox--open";
	var iframeLightboxLinkIsBindedClass = "iframe-lightbox-link--is-binded";
	var isLoadedClass = "is-loaded";
	var isOpenedClass = "is-opened";
	var isShowingClass = "is-showing";
	var isMobile = navigator.userAgent.match(
		/(iPad)|(iPhone)|(iPod)|(Android)|(PlayBook)|(BB10)|(BlackBerry)|(Opera Mini)|(IEMobile)|(webOS)|(MeeGo)/i
	);
	var isTouch =
		isMobile !== null ||
		document.createTouch !== undefined ||
		"ontouchstart" in root ||
		"onmsgesturechange" in root ||
		navigator.msMaxTouchPoints;

	var IframeLightbox = function IframeLightbox(elem, settings) {
		var options = settings || {};
		this.trigger = elem;
		this.el = document.getElementsByClassName(containerClass)[0] || "";
		this.body = this.el ? this.el.getElementsByClassName("body")[0] : "";
		this.content = this.el
			? this.el.getElementsByClassName("content")[0]
			: "";
		this.src = elem.dataset.src || "";
		this.href = elem.getAttribute("href") || "";
		this.dataPaddingBottom = elem.dataset.paddingBottom || "";
		this.dataScrolling = elem.dataset.scrolling || "";
		this.dataTouch = elem.dataset.touch || "";
		this.rate = options.rate || 500;
		this.scrolling = options.scrolling;
		this.touch = options.touch;
		this.onOpened = options.onOpened;
		this.onIframeLoaded = options.onIframeLoaded;
		this.onLoaded = options.onLoaded;
		this.onCreated = options.onCreated;
		this.onClosed = options.onClosed;
		this.init();
	};

	IframeLightbox.prototype.init = function () {
		var _this = this;

		if (!this.el) {
			this.create();
		}

		var debounce = function debounce(func, wait) {
			var timeout, args, context, timestamp;
			return function () {
				context = this;
				args = [].slice.call(arguments, 0);
				timestamp = new Date();

				var later = function later() {
					var last = new Date() - timestamp;

					if (last < wait) {
						timeout = setTimeout(later, wait - last);
					} else {
						timeout = null;
						func.apply(context, args);
					}
				};

				if (!timeout) {
					timeout = setTimeout(later, wait);
				}
			};
		};

		var logic = function logic() {
			_this.open();
		};

		var handleIframeLightboxLink = function handleIframeLightboxLink(e) {
			e.stopPropagation();
			e.preventDefault();
			debounce(logic, this.rate).call();
		};

		if (!this.trigger.classList.contains(iframeLightboxLinkIsBindedClass)) {
			this.trigger.classList.add(iframeLightboxLinkIsBindedClass);
			this.trigger.addEventListener("click", handleIframeLightboxLink);

			if (isTouch && (_this.touch || _this.dataTouch)) {
				this.trigger.addEventListener(
					"touchstart",
					handleIframeLightboxLink
				);
			}
		}
	};

	IframeLightbox.prototype.create = function () {
		var _this = this,
			backdrop = document.createElement("div");

		backdrop.classList.add("backdrop");
		this.el = document.createElement("div");
		this.el.classList.add(containerClass);
		this.el.appendChild(backdrop);
		this.content = document.createElement("div");
		this.content.classList.add("content");
		this.body = document.createElement("div");
		this.body.classList.add("body");
		this.content.appendChild(this.body);
		this.contentHolder = document.createElement("div");
		this.contentHolder.classList.add("content-holder");
		this.contentHolder.appendChild(this.content);
		this.el.appendChild(this.contentHolder);
		this.btnClose = document.createElement("button");
		this.btnClose.classList.add("btn-close");

		this.el.appendChild(this.btnClose);
		docBody.appendChild(this.el);
		backdrop.addEventListener("click", function () {
			_this.close();
		});
		this.btnClose.addEventListener("click", function () {
			_this.close();
		});

		if (!docElem.classList.contains(iframeLightboxWindowIsBindedClass)) {
			docElem.classList.add(iframeLightboxWindowIsBindedClass);
			root.addEventListener("keyup", function(ev) {
				if (27 === (ev.which || ev.keyCode)) {
					_this.close();
				}
			});
		}

		var clearBody = function clearBody() {
			if (_this.isOpen()) {
				return;
			}

			_this.el.classList.remove(isShowingClass);

			_this.body.innerHTML = "";
		};

		this.el.addEventListener("transitionend", clearBody, false);
		this.el.addEventListener("webkitTransitionEnd", clearBody, false);
		this.el.addEventListener("mozTransitionEnd", clearBody, false);
		this.el.addEventListener("msTransitionEnd", clearBody, false);
		this.callCallback(this.onCreated, this);
	};

	IframeLightbox.prototype.loadIframe = function () {
		var _this = this;

		this.iframeId = containerClass + Date.now();
		this.iframeSrc = this.src || this.href || "";
		var html = [];
		html.push(
			'<iframe src="' +
				this.iframeSrc +
				'" name="' +
				this.iframeId +
				'" id="' +
				this.iframeId +
				'" onload="this.style.opacity=1;" style="opacity:0;border:none;" webkitallowfullscreen="true" mozallowfullscreen="true" allowfullscreen="true" height="166" frameborder="no"></iframe>'
		);
		html.push(
			'<div class="half-circle-spinner"><div class="circle circle-1"></div><div class="circle circle-2"></div></div>'
		);
		this.body.innerHTML = html.join("");

		(function(iframeId, body) {
			var iframe = document.getElementById(iframeId);

			iframe.onload = function () {
				this.style.opacity = 1;
				body.classList.add(isLoadedClass);

				if (_this.scrolling || _this.dataScrolling) {
					iframe.removeAttribute("scrolling");
					iframe.style.overflow = "scroll";
				} else {
					iframe.setAttribute("scrolling", "no");
					iframe.style.overflow = "hidden";
				}

				_this.callCallback(_this.onIframeLoaded, _this);

				_this.callCallback(_this.onLoaded, _this);
			};
		})(this.iframeId, this.body);
	};

	IframeLightbox.prototype.open = function () {
		this.loadIframe();

		if (this.dataPaddingBottom) {
			this.content.style.paddingBottom = this.dataPaddingBottom;
		} else {
			this.content.removeAttribute("style");
		}

		this.el.classList.add(isShowingClass);
		this.el.classList.add(isOpenedClass);
		docElem.classList.add(iframeLightboxOpenClass);
		docBody.classList.add(iframeLightboxOpenClass);
		this.callCallback(this.onOpened, this);
	};

	IframeLightbox.prototype.close = function () {
		this.el.classList.remove(isOpenedClass);
		this.body.classList.remove(isLoadedClass);
		docElem.classList.remove(iframeLightboxOpenClass);
		docBody.classList.remove(iframeLightboxOpenClass);
		this.callCallback(this.onClosed, this);
	};

	IframeLightbox.prototype.isOpen = function () {
		return this.el.classList.contains(isOpenedClass);
	};

	IframeLightbox.prototype.callCallback = function (func, data) {
		if (typeof func !== "function") {
			return;
		}

		var caller = func.bind(this);
		caller(data);
	};

	root.IframeLightbox = IframeLightbox;
})("undefined" !== typeof window ? window : this, document);

/*!
 * @see {@link https://github.com/englishextra/img-lightbox}
 * imgLightbox
 * requires this very img-lightbox.js, and animate.css, img-lightbox.css
 * @params {String} linkClass
 * @params {Object} settings object
 * imgLightbox(linkClass, settings)
 * passes jshint
 */

/*jshint -W014 */
(function(root, document) {
	"use strict";

	var docElem = document.documentElement || "";
	var docBody = document.body || "";
	var animatedClass = "animated";
	var btnCloseClass = "btn-close";
	var containerClass = "img-lightbox";
	var fadeInClass = "fadeIn";
	var fadeInUpClass = "fadeInUp";
	var fadeOutClass = "fadeOut";
	var fadeOutDownClass = "fadeOutDown";
	var imgLightboxWindowIsBindedClass = "img-lightbox-window--is-binded";
	var imgLightboxOpenClass = "img-lightbox--open";
	var imgLightboxLinkIsBindedClass = "img-lightbox-link--is-binded";
	var isLoadedClass = "is-loaded";
	var dummySrc =
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
	var isMobile = navigator.userAgent.match(
		/(iPad)|(iPhone)|(iPod)|(Android)|(PlayBook)|(BB10)|(BlackBerry)|(Opera Mini)|(IEMobile)|(webOS)|(MeeGo)/i
	);
	var isTouch =
		isMobile !== null ||
		document.createTouch !== undefined ||
		"ontouchstart" in root ||
		"onmsgesturechange" in root ||
		navigator.msMaxTouchPoints;

	var debounce = function debounce(func, wait) {
		var timeout;
		var args;
		var context;
		var timestamp;
		return function () {
			context = this;
			args = [].slice.call(arguments, 0);
			timestamp = new Date();

			var later = function later() {
				var last = new Date() - timestamp;

				if (last < wait) {
					timeout = setTimeout(later, wait - last);
				} else {
					timeout = null;
					func.apply(context, args);
				}
			};

			if (!timeout) {
				timeout = setTimeout(later, wait);
			}
		};
	};

	var callCallback = function callCallback(func, data) {
		if (typeof func !== "function") {
			return;
		}

		var caller = func.bind(this);
		caller(data);
	};

	var setDisplayBlock = function setDisplayBlock(e) {
		if (e) {
			e.style.display = "block";
		}
	};

	var setDisplayNone = function setDisplayNone(e) {
		if (e) {
			e.style.display = "none";
		}
	};

	var hideImgLightbox = function hideImgLightbox(callback) {
		var container =
			document.getElementsByClassName(containerClass)[0] || "";
		var img = container
			? container.getElementsByTagName("img")[0] || ""
			: "";

		var hideContainer = function hideContainer() {
			container.classList.remove(fadeInClass);
			container.classList.add(fadeOutClass);

			var hideImg = function hideImg() {
				container.classList.remove(animatedClass);
				container.classList.remove(fadeOutClass);
				img.classList.remove(animatedClass);
				img.classList.remove(fadeOutDownClass);

				img.onload = function () {
					container.classList.remove(isLoadedClass);
				};

				img.src = dummySrc;
				setDisplayNone(container);
				callCallback(callback, root);
			};

			var timer = setTimeout(function () {
				clearTimeout(timer);
				timer = null;
				hideImg();
			}, 400);
		};

		if (container && img) {
			img.classList.remove(fadeInUpClass);
			img.classList.add(fadeOutDownClass);
			var timer = setTimeout(function () {
				clearTimeout(timer);
				timer = null;
				hideContainer();
			}, 400);
		}

		docElem.classList.remove(imgLightboxOpenClass);
		docBody.classList.remove(imgLightboxOpenClass);
	};

	var imgLightbox = function imgLightbox(linkClass, settings) {
		var _linkClass = linkClass || "";

		var options = settings || {};
		var rate = options.rate || 500;
		var touch = options.touch;
		var onError = options.onError;
		var onLoaded = options.onLoaded;
		var onCreated = options.onCreated;
		var onClosed = options.onClosed;
		var link = document.getElementsByClassName(_linkClass) || "";
		var container =
			document.getElementsByClassName(containerClass)[0] || "";
		var img = container
			? container.getElementsByTagName("img")[0] || ""
			: "";

		if (!container) {
			container = document.createElement("div");
			container.classList.add(containerClass);
			var html = [];
			html.push('<img src="' + dummySrc + '" alt="" />');
			html.push(
				'<div class="half-circle-spinner"><div class="circle circle-1"></div><div class="circle circle-2"></div></div>'
			);
			html.push('<button class="btn-close"></button>');
			container.innerHTML = html.join("");
			docBody.appendChild(container);
			img = container
				? container.getElementsByTagName("img")[0] || ""
				: "";
			var btnClose = container
				? container.getElementsByClassName(btnCloseClass)[0] || ""
				: "";

			var handleImgLightboxContainer = function handleImgLightboxContainer() {
				hideImgLightbox(onClosed);
			};

			container.addEventListener("click", handleImgLightboxContainer);
			btnClose.addEventListener("click", handleImgLightboxContainer);

			if (!docElem.classList.contains(imgLightboxWindowIsBindedClass)) {
				docElem.classList.add(imgLightboxWindowIsBindedClass);
				root.addEventListener("keyup", function(ev) {
					if (27 === (ev.which || ev.keyCode)) {
						hideImgLightbox(onClosed);
					}
				});
			}
		}

		var arrange = function arrange(e) {
			var hrefString =
				e.getAttribute("href") || e.getAttribute("data-src") || "";
			var dataTouch = e.getAttribute("data-touch") || "";

			if (!hrefString) {
				return;
			}

			var handleImgLightboxLink = function handleImgLightboxLink(ev) {
				ev.stopPropagation();
				ev.preventDefault();
				docElem.classList.add(imgLightboxOpenClass);
				docBody.classList.add(imgLightboxOpenClass);
				container.classList.remove(isLoadedClass);

				var logic = function logic() {
					if (onCreated) {
						callCallback(onCreated, root);
					}

					container.classList.add(animatedClass);
					container.classList.add(fadeInClass);
					img.classList.add(animatedClass);
					img.classList.add(fadeInUpClass);

					img.onload = function () {
						container.classList.add(isLoadedClass);

						if (onLoaded) {
							callCallback(onLoaded, root);
						}
					};

					img.onerror = function () {
						if (onError) {
							callCallback(onError, root);
						}
					};

					img.src = hrefString;
					setDisplayBlock(container);
				};

				debounce(logic, rate).call();
			};

			if (!e.classList.contains(imgLightboxLinkIsBindedClass)) {
				e.classList.add(imgLightboxLinkIsBindedClass);
				e.addEventListener("click", handleImgLightboxLink);

				if (isTouch && (touch || dataTouch)) {
					e.addEventListener("touchstart", handleImgLightboxLink);
				}
			}
		};

		if (container && img && link) {
			var i,
			l;
			for (i = 0, l = link.length; i < l; i += 1) {
				arrange(link[i]);
			}
			i = l = null;
		}
	};

	root.imgLightbox = imgLightbox;
})("undefined" !== typeof window ? window : this, document);

/*!
 * modified qr.js -- QR code generator in Javascript (revision 2011-01-19)
 * Written by Kang Seonghoon <public+qrjs@mearie.org>.
 * v0.0.20110119
 * This source code is in the public domain; if your jurisdiction does not
 * recognize the public domain the terms of Creative Commons CC0 license
 * apply. In the other words, you can always do what you want.
 * added options properties: fillcolor and textcolor
 * svg now works in Edge 13 and IE 11
 * @see {@link https://gist.github.com/englishextra/b46969e3382ef737c611bb59d837220b}
 * @see {@link https://github.com/lifthrasiir/qr.js/blob/v0.0.20110119/qr.js}
 * passes jshint with suppressing comments
 */

/*jshint bitwise: false */
(function(root, document) {
	"use strict";

	var length = "length";
	var VERSIONS = [
		null,
		[[10, 7, 17, 13], [1, 1, 1, 1], []],
		[[16, 10, 28, 22], [1, 1, 1, 1], [4, 16]],
		[[26, 15, 22, 18], [1, 1, 2, 2], [4, 20]],
		[[18, 20, 16, 26], [2, 1, 4, 2], [4, 24]],
		[[24, 26, 22, 18], [2, 1, 4, 4], [4, 28]],
		[[16, 18, 28, 24], [4, 2, 4, 4], [4, 32]],
		[[18, 20, 26, 18], [4, 2, 5, 6], [4, 20, 36]],
		[[22, 24, 26, 22], [4, 2, 6, 6], [4, 22, 40]],
		[[22, 30, 24, 20], [5, 2, 8, 8], [4, 24, 44]],
		[[26, 18, 28, 24], [5, 4, 8, 8], [4, 26, 48]],
		[[30, 20, 24, 28], [5, 4, 11, 8], [4, 28, 52]],
		[[22, 24, 28, 26], [8, 4, 11, 10], [4, 30, 56]],
		[[22, 26, 22, 24], [9, 4, 16, 12], [4, 32, 60]],
		[[24, 30, 24, 20], [9, 4, 16, 16], [4, 24, 44, 64]],
		[[24, 22, 24, 30], [10, 6, 18, 12], [4, 24, 46, 68]],
		[[28, 24, 30, 24], [10, 6, 16, 17], [4, 24, 48, 72]],
		[[28, 28, 28, 28], [11, 6, 19, 16], [4, 28, 52, 76]],
		[[26, 30, 28, 28], [13, 6, 21, 18], [4, 28, 54, 80]],
		[[26, 28, 26, 26], [14, 7, 25, 21], [4, 28, 56, 84]],
		[[26, 28, 28, 30], [16, 8, 25, 20], [4, 32, 60, 88]],
		[[26, 28, 30, 28], [17, 8, 25, 23], [4, 26, 48, 70, 92]],
		[[28, 28, 24, 30], [17, 9, 34, 23], [4, 24, 48, 72, 96]],
		[[28, 30, 30, 30], [18, 9, 30, 25], [4, 28, 52, 76, 100]],
		[[28, 30, 30, 30], [20, 10, 32, 27], [4, 26, 52, 78, 104]],
		[[28, 26, 30, 30], [21, 12, 35, 29], [4, 30, 56, 82, 108]],
		[[28, 28, 30, 28], [23, 12, 37, 34], [4, 28, 56, 84, 112]],
		[[28, 30, 30, 30], [25, 12, 40, 34], [4, 32, 60, 88, 116]],
		[[28, 30, 30, 30], [26, 13, 42, 35], [4, 24, 48, 72, 96, 120]],
		[[28, 30, 30, 30], [28, 14, 45, 38], [4, 28, 52, 76, 100, 124]],
		[[28, 30, 30, 30], [29, 15, 48, 40], [4, 24, 50, 76, 102, 128]],
		[[28, 30, 30, 30], [31, 16, 51, 43], [4, 28, 54, 80, 106, 132]],
		[[28, 30, 30, 30], [33, 17, 54, 45], [4, 32, 58, 84, 110, 136]],
		[[28, 30, 30, 30], [35, 18, 57, 48], [4, 28, 56, 84, 112, 140]],
		[[28, 30, 30, 30], [37, 19, 60, 51], [4, 32, 60, 88, 116, 144]],
		[[28, 30, 30, 30], [38, 19, 63, 53], [4, 28, 52, 76, 100, 124, 148]],
		[[28, 30, 30, 30], [40, 20, 66, 56], [4, 22, 48, 74, 100, 126, 152]],
		[[28, 30, 30, 30], [43, 21, 70, 59], [4, 26, 52, 78, 104, 130, 156]],
		[[28, 30, 30, 30], [45, 22, 74, 62], [4, 30, 56, 82, 108, 134, 160]],
		[[28, 30, 30, 30], [47, 24, 77, 65], [4, 24, 52, 80, 108, 136, 164]],
		[[28, 30, 30, 30], [49, 25, 81, 68], [4, 28, 56, 84, 112, 140, 168]]
	];
	var MODE_TERMINATOR = 0;
	var MODE_NUMERIC = 1,
		MODE_ALPHANUMERIC = 2,
		MODE_OCTET = 4,
		MODE_KANJI = 8;
	var NUMERIC_REGEXP = /^\d*$/;
	var ALPHANUMERIC_REGEXP = /^[A-Za-z0-9 $%*+\-./:] * $ /;
	var ALPHANUMERIC_OUT_REGEXP = /^[A-Z0-9 $%*+\-./:] * $ /;
	var ECCLEVEL_L = 1,
		ECCLEVEL_M = 0,
		ECCLEVEL_Q = 3,
		ECCLEVEL_H = 2;
	var GF256_MAP = [],
		GF256_INVMAP = [-1];

	for (var i1 = 0, v = 1; i1 < 255; ++i1) {
		GF256_MAP.push(v);
		GF256_INVMAP[v] = i1;
		v = (v * 2) ^ (v >= 128 ? 0x11d : 0);
	}

	var GF256_GENPOLY = [[]];

	for (var i2 = 0; i2 < 30; ++i2) {
		var prevpoly = GF256_GENPOLY[i2],
			poly = [];

		for (var j1 = 0; j1 <= i2; ++j1) {
			var a = j1 < i2 ? GF256_MAP[prevpoly[j1]] : 0;
			var b = GF256_MAP[(i2 + (prevpoly[j1 - 1] || 0)) % 255];
			poly.push(GF256_INVMAP[a ^ b]);
		}

		GF256_GENPOLY.push(poly);
	}

	var ALPHANUMERIC_MAP = {};

	for (var i = 0; i < 45; ++i) {
		ALPHANUMERIC_MAP[
			"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:".charAt(i)
		] = i;
	}

	var MASKFUNCS = [
		function(i, j) {
			return (i + j) % 2 === 0;
		},
		function(i) {
			return i % 2 === 0;
		},
		function(i, j) {
			return j % 3 === 0;
		},
		function(i, j) {
			return (i + j) % 3 === 0;
		},
		function(i, j) {
			return (((i / 2) | 0) + ((j / 3) | 0)) % 2 === 0;
		},
		function(i, j) {
			return ((i * j) % 2) + ((i * j) % 3) === 0;
		},
		function(i, j) {
			return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
		},
		function(i, j) {
			return (((i + j) % 2) + ((i * j) % 3)) % 2 === 0;
		}
	];

	var needsverinfo = function needsverinfo(ver) {
		return ver > 6;
	};

	var getsizebyver = function getsizebyver(ver) {
		return 4 * ver + 17;
	};

	var nfullbits = function nfullbits(ver) {
		var v = VERSIONS[ver];
		var nbits = 16 * ver * ver + 128 * ver + 64;

		if (needsverinfo(ver)) {
			nbits -= 36;
		}

		if (v[2][length]) {
			nbits -= 25 * v[2][length] * v[2][length] - 10 * v[2][length] - 55;
		}

		return nbits;
	};

	var ndatabits = function ndatabits(ver, ecclevel) {
		var nbits = nfullbits(ver) & ~7;
		var v = VERSIONS[ver];
		nbits -= 8 * v[0][ecclevel] * v[1][ecclevel];
		return nbits;
	};

	var ndatalenbits = function ndatalenbits(ver, mode) {
		switch (mode) {
			case MODE_NUMERIC:
				return ver < 10 ? 10 : ver < 27 ? 12 : 14;

			case MODE_ALPHANUMERIC:
				return ver < 10 ? 9 : ver < 27 ? 11 : 13;

			case MODE_OCTET:
				return ver < 10 ? 8 : 16;

			case MODE_KANJI:
				return ver < 10 ? 8 : ver < 27 ? 10 : 12;
		}
	};

	var getmaxdatalen = function getmaxdatalen(ver, mode, ecclevel) {
		var nbits = ndatabits(ver, ecclevel) - 4 - ndatalenbits(ver, mode);

		switch (mode) {
			case MODE_NUMERIC:
				return (
					((nbits / 10) | 0) * 3 +
					(nbits % 10 < 4 ? 0 : nbits % 10 < 7 ? 1 : 2)
				);

			case MODE_ALPHANUMERIC:
				return ((nbits / 11) | 0) * 2 + (nbits % 11 < 6 ? 0 : 1);

			case MODE_OCTET:
				return (nbits / 8) | 0;

			case MODE_KANJI:
				return (nbits / 13) | 0;
		}
	};

	var validatedata = function validatedata(mode, data) {
		switch (mode) {
			case MODE_NUMERIC:
				if (!data.match(NUMERIC_REGEXP)) {
					return null;
				}

				return data;

			case MODE_ALPHANUMERIC:
				if (!data.match(ALPHANUMERIC_REGEXP)) {
					return null;
				}

				return data.toUpperCase();

			case MODE_OCTET:
				if (typeof data === "string") {
					var newdata = [];

					for (var i = 0; i < data[length]; ++i) {
						var ch = data.charCodeAt(i);

						if (ch < 0x80) {
							newdata.push(ch);
						} else if (ch < 0x800) {
							newdata.push(0xc0 | (ch >> 6), 0x80 | (ch & 0x3f));
						} else if (ch < 0x10000) {
							newdata.push(
								0xe0 | (ch >> 12),
								0x80 | ((ch >> 6) & 0x3f),
								0x80 | (ch & 0x3f)
							);
						} else {
							newdata.push(
								0xf0 | (ch >> 18),
								0x80 | ((ch >> 12) & 0x3f),
								0x80 | ((ch >> 6) & 0x3f),
								0x80 | (ch & 0x3f)
							);
						}
					}

					return newdata;
				} else {
					return data;
				}
		}
	};

	var encode = function encode(ver, mode, data, maxbuflen) {
		var buf = [];
		var bits = 0,
			remaining = 8;
		var datalen = data[length];

		var pack = function pack(x, n) {
			if (n >= remaining) {
				buf.push(bits | (x >> (n -= remaining)));

				while (n >= 8) {
					buf.push((x >> (n -= 8)) & 255);
				}

				bits = 0;
				remaining = 8;
			}

			if (n > 0) {
				bits |= (x & ((1 << n) - 1)) << (remaining -= n);
			}
		};

		var nlenbits = ndatalenbits(ver, mode);
		pack(mode, 4);
		pack(datalen, nlenbits);

		switch (mode) {
			case MODE_NUMERIC:
				for (var i = 2; i < datalen; i += 3) {
					pack(parseInt(data.substring(i - 2, i + 1), 10), 10);
				}

				pack(
					parseInt(data.substring(i - 2), 10),
					[0, 4, 7][datalen % 3]
				);
				break;

			case MODE_ALPHANUMERIC:
				for (var i2 = 1; i2 < datalen; i2 += 2) {
					pack(
						ALPHANUMERIC_MAP[data.charAt(i2 - 1)] * 45 +
							ALPHANUMERIC_MAP[data.charAt(i2)],
						11
					);
				}

				if (datalen % 2 === 1) {
					pack(ALPHANUMERIC_MAP[data.charAt(i2 - 1)], 6);
				}

				break;

			case MODE_OCTET:
				for (var i3 = 0; i3 < datalen; ++i3) {
					pack(data[i3], 8);
				}

				break;
		}

		pack(MODE_TERMINATOR, 4);

		if (remaining < 8) {
			buf.push(bits);
		}

		while (buf[length] + 1 < maxbuflen) {
			buf.push(0xec, 0x11);
		}

		if (buf[length] < maxbuflen) {
			buf.push(0xec);
		}

		return buf;
	};

	var calculateecc = function calculateecc(poly, genpoly) {
		var modulus = poly.slice(0);
		var polylen = poly[length],
			genpolylen = genpoly[length];

		for (var k = 0; k < genpolylen; ++k) {
			modulus.push(0);
		}

		for (var i = 0; i < polylen; ) {
			var quotient = GF256_INVMAP[modulus[i++]];

			if (quotient >= 0) {
				for (var j = 0; j < genpolylen; ++j) {
					modulus[i + j] ^= GF256_MAP[(quotient + genpoly[j]) % 255];
				}
			}
		}

		return modulus.slice(polylen);
	};

	var augumenteccs = function augumenteccs(poly, nblocks, genpoly) {
		var subsizes = [];
		var subsize = (poly[length] / nblocks) | 0,
			subsize0 = 0;
		var pivot = nblocks - (poly[length] % nblocks);

		for (var i = 0; i < pivot; ++i) {
			subsizes.push(subsize0);
			subsize0 += subsize;
		}

		for (var i2 = pivot; i2 < nblocks; ++i2) {
			subsizes.push(subsize0);
			subsize0 += subsize + 1;
		}

		subsizes.push(subsize0);
		var eccs = [];

		for (var i3 = 0; i3 < nblocks; ++i3) {
			eccs.push(
				calculateecc(
					poly.slice(subsizes[i3], subsizes[i3 + 1]),
					genpoly
				)
			);
		}

		var result = [];
		var nitemsperblock = (poly[length] / nblocks) | 0;

		for (var i4 = 0; i4 < nitemsperblock; ++i4) {
			for (var j = 0; j < nblocks; ++j) {
				result.push(poly[subsizes[j] + i4]);
			}
		}

		for (var j2 = pivot; j2 < nblocks; ++j2) {
			result.push(poly[subsizes[j2 + 1] - 1]);
		}

		for (var i5 = 0; i5 < genpoly[length]; ++i5) {
			for (var j3 = 0; j3 < nblocks; ++j3) {
				result.push(eccs[j3][i5]);
			}
		}

		return result;
	};

	var augumentbch = function augumentbch(poly, p, genpoly, q) {
		var modulus = poly << q;

		for (var i = p - 1; i >= 0; --i) {
			if ((modulus >> (q + i)) & 1) {
				modulus ^= genpoly << i;
			}
		}

		return (poly << q) | modulus;
	};

	var makebasematrix = function makebasematrix(ver) {
		var v = VERSIONS[ver],
			n = getsizebyver(ver);
		var matrix = [],
			reserved = [];

		for (var i = 0; i < n; ++i) {
			matrix.push([]);
			reserved.push([]);
		}

		var blit = function blit(y, x, h, w, bits) {
			for (var i = 0; i < h; ++i) {
				for (var j = 0; j < w; ++j) {
					matrix[y + i][x + j] = (bits[i] >> j) & 1;
					reserved[y + i][x + j] = 1;
				}
			}
		};

		blit(0, 0, 9, 9, [
			0x7f,
			0x41,
			0x5d,
			0x5d,
			0x5d,
			0x41,
			0x17f,
			0x00,
			0x40
		]);
		blit(n - 8, 0, 8, 9, [0x100, 0x7f, 0x41, 0x5d, 0x5d, 0x5d, 0x41, 0x7f]);
		blit(0, n - 8, 9, 8, [
			0xfe,
			0x82,
			0xba,
			0xba,
			0xba,
			0x82,
			0xfe,
			0x00,
			0x00
		]);

		for (var i2 = 9; i2 < n - 8; ++i2) {
			matrix[6][i2] = matrix[i2][6] = ~i2 & 1;
			reserved[6][i2] = reserved[i2][6] = 1;
		}

		var aligns = v[2],
			m = aligns[length];

		for (var i3 = 0; i3 < m; ++i3) {
			var minj = i3 === 0 || i3 === m - 1 ? 1 : 0,
				maxj = i3 === 0 ? m - 1 : m;

			for (var j = minj; j < maxj; ++j) {
				blit(aligns[i3], aligns[j], 5, 5, [
					0x1f,
					0x11,
					0x15,
					0x11,
					0x1f
				]);
			}
		}

		if (needsverinfo(ver)) {
			var code = augumentbch(ver, 6, 0x1f25, 12);
			var k = 0;

			for (var i4 = 0; i4 < 6; ++i4) {
				for (var j2 = 0; j2 < 3; ++j2) {
					matrix[i4][n - 11 + j2] = matrix[n - 11 + j2][i4] =
						(code >> k++) & 1;
					reserved[i4][n - 11 + j2] = reserved[n - 11 + j2][i4] = 1;
				}
			}
		}

		return {
			matrix: matrix,
			reserved: reserved
		};
	};

	var putdata = function putdata(matrix, reserved, buf) {
		var n = matrix[length];
		var k = 0,
			dir = -1;

		for (var i = n - 1; i >= 0; i -= 2) {
			if (i === 6) {
				--i;
			}

			var jj = dir < 0 ? n - 1 : 0;

			for (var j = 0; j < n; ++j) {
				for (var ii = i; ii > i - 2; --ii) {
					if (!reserved[jj][ii]) {
						matrix[jj][ii] = (buf[k >> 3] >> (~k & 7)) & 1;
						++k;
					}
				}

				jj += dir;
			}

			dir = -dir;
		}

		return matrix;
	};

	var maskdata = function maskdata(matrix, reserved, mask) {
		var maskf = MASKFUNCS[mask];
		var n = matrix[length];

		for (var i = 0; i < n; ++i) {
			for (var j = 0; j < n; ++j) {
				if (!reserved[i][j]) {
					matrix[i][j] ^= maskf(i, j);
				}
			}
		}

		return matrix;
	};

	var putformatinfo = function putformatinfo(
		matrix,
		reserved,
		ecclevel,
		mask
	) {
		var n = matrix[length];
		var code = augumentbch((ecclevel << 3) | mask, 5, 0x537, 10) ^ 0x5412;

		for (var i = 0; i < 15; ++i) {
			var r = [
				0,
				1,
				2,
				3,
				4,
				5,
				7,
				8,
				n - 7,
				n - 6,
				n - 5,
				n - 4,
				n - 3,
				n - 2,
				n - 1
			][i];
			var c = [
				n - 1,
				n - 2,
				n - 3,
				n - 4,
				n - 5,
				n - 6,
				n - 7,
				n - 8,
				7,
				5,
				4,
				3,
				2,
				1,
				0
			][i];
			matrix[r][8] = matrix[8][c] = (code >> i) & 1;
		}

		return matrix;
	};

	var evaluatematrix = function evaluatematrix(matrix) {
		var PENALTY_CONSECUTIVE = 3;
		var PENALTY_TWOBYTWO = 3;
		var PENALTY_FINDERLIKE = 40;
		var PENALTY_DENSITY = 10;

		var evaluategroup = function evaluategroup(groups) {
			var score = 0;

			for (var i = 0; i < groups[length]; ++i) {
				if (groups[i] >= 5) {
					score += PENALTY_CONSECUTIVE + (groups[i] - 5);
				}
			}

			for (var i2 = 5; i2 < groups[length]; i2 += 2) {
				var p = groups[i2];

				if (
					groups[i2 - 1] === p &&
					groups[i2 - 2] === 3 * p &&
					groups[i2 - 3] === p &&
					groups[i2 - 4] === p &&
					(groups[i2 - 5] >= 4 * p || groups[i2 + 1] >= 4 * p)
				) {
					score += PENALTY_FINDERLIKE;
				}
			}

			return score;
		};

		var n = matrix[length];
		var score = 0,
			nblacks = 0;

		for (var i = 0; i < n; ++i) {
			var row = matrix[i];
			var groups;
			groups = [0];

			for (var j = 0; j < n; ) {
				var k;

				for (k = 0; j < n && row[j]; ++k) {
					++j;
				}

				groups.push(k);

				for (k = 0; j < n && !row[j]; ++k) {
					++j;
				}

				groups.push(k);
			}

			score += evaluategroup(groups);
			groups = [0];

			for (var j2 = 0; j2 < n; ) {
				var k2;

				for (k2 = 0; j2 < n && matrix[j2][i]; ++k2) {
					++j2;
				}

				groups.push(k2);

				for (k2 = 0; j2 < n && !matrix[j2][i]; ++k2) {
					++j2;
				}

				groups.push(k2);
			}

			score += evaluategroup(groups);
			var nextrow = matrix[i + 1] || [];
			nblacks += row[0];

			for (var j3 = 1; j3 < n; ++j3) {
				var p = row[j3];
				nblacks += p;

				if (
					row[j3 - 1] === p &&
					nextrow[j3] === p &&
					nextrow[j3 - 1] === p
				) {
					score += PENALTY_TWOBYTWO;
				}
			}
		}

		score +=
			PENALTY_DENSITY * ((Math.abs(nblacks / n / n - 0.5) / 0.05) | 0);
		return score;
	};

	var _generate = function generate(data, ver, mode, ecclevel, mask) {
		var v = VERSIONS[ver];
		var buf = encode(ver, mode, data, ndatabits(ver, ecclevel) >> 3);
		buf = augumenteccs(buf, v[1][ecclevel], GF256_GENPOLY[v[0][ecclevel]]);
		var result = makebasematrix(ver);
		var matrix = result.matrix,
			reserved = result.reserved;
		putdata(matrix, reserved, buf);

		if (mask < 0) {
			maskdata(matrix, reserved, 0);
			putformatinfo(matrix, reserved, ecclevel, 0);
			var bestmask = 0,
				bestscore = evaluatematrix(matrix);
			maskdata(matrix, reserved, 0);

			for (mask = 1; mask < 8; ++mask) {
				maskdata(matrix, reserved, mask);
				putformatinfo(matrix, reserved, ecclevel, mask);
				var score = evaluatematrix(matrix);

				if (bestscore > score) {
					bestscore = score;
					bestmask = mask;
				}

				maskdata(matrix, reserved, mask);
			}

			mask = bestmask;
		}

		maskdata(matrix, reserved, mask);
		putformatinfo(matrix, reserved, ecclevel, mask);
		return matrix;
	};

	var QRCode = {
		generate: function generate(data, settings) {
			var options = settings || {};
			var MODES = {
				numeric: MODE_NUMERIC,
				alphanumeric: MODE_ALPHANUMERIC,
				octet: MODE_OCTET
			};
			var ECCLEVELS = {
				L: ECCLEVEL_L,
				M: ECCLEVEL_M,
				Q: ECCLEVEL_Q,
				H: ECCLEVEL_H
			};
			var ver = options.version || -1;
			var ecclevel = ECCLEVELS[(options.ecclevel || "L").toUpperCase()];
			var mode = options.mode ? MODES[options.mode.toLowerCase()] : -1;
			var mask = "mask" in options ? options.mask : -1;

			if (mode < 0) {
				if (typeof data === "string") {
					if (data.match(NUMERIC_REGEXP)) {
						mode = MODE_NUMERIC;
					} else if (data.match(ALPHANUMERIC_OUT_REGEXP)) {
						mode = MODE_ALPHANUMERIC;
					} else {
						mode = MODE_OCTET;
					}
				} else {
					mode = MODE_OCTET;
				}
			} else if (
				!(
					mode === MODE_NUMERIC ||
					mode === MODE_ALPHANUMERIC ||
					mode === MODE_OCTET
				)
			) {
				throw "invalid or unsupported mode";
			}

			data = validatedata(mode, data);

			if (data === null) {
				throw "invalid data format";
			}

			if (ecclevel < 0 || ecclevel > 3) {
				throw "invalid ECC level";
			}

			if (ver < 0) {
				for (ver = 1; ver <= 40; ++ver) {
					if (data[length] <= getmaxdatalen(ver, mode, ecclevel)) {
						break;
					}
				}

				if (ver > 40) {
					throw "too large data";
				}
			} else if (ver < 1 || ver > 40) {
				throw "invalid version";
			}

			if (mask !== -1 && (mask < 0 || mask > 8)) {
				throw "invalid mask";
			}

			return _generate(data, ver, mode, ecclevel, mask);
		},
		generateHTML: function generateHTML(data, settings) {
			var options = settings || {};
			var fillcolor = options.fillcolor ? options.fillcolor : "#FFFFFF";
			var textcolor = options.textcolor ? options.textcolor : "#000000";
			var matrix = QRCode.generate(data, options);
			var modsize = Math.max(options.modulesize || 5, 0.5);
			var margin = Math.max(
				options.margin !== null ? options.margin : 4,
				0.0
			);
			var e = document.createElement("div");
			var n = matrix[length];
			var html = [
				'<table border="0" cellspacing="0" cellpadding="0" style="border:' +
					modsize * margin +
					"px solid " +
					fillcolor +
					";background:" +
					fillcolor +
					'">'
			];

			for (var i = 0; i < n; ++i) {
				html.push("<tr>");

				for (var j = 0; j < n; ++j) {
					html.push(
						'<td style="width:' +
							modsize +
							"px;height:" +
							modsize +
							"px" +
							(matrix[i][j] ? ";background:" + textcolor : "") +
							'"></td>'
					);
				}

				html.push("</tr>");
			}

			e.className = "qrcode";
			/* e.innerHTML = html.join("") + "</table>"; */

			var range = document.createRange();
			range.selectNodeContents(e);
			var frag = range.createContextualFragment(
				html.join("") + "</table>"
			);
			e.appendChild(frag);
			return e;
		},
		generateSVG: function generateSVG(data, settings) {
			var options = settings || {};
			var fillcolor = options.fillcolor ? options.fillcolor : "#FFFFFF";
			var textcolor = options.textcolor ? options.textcolor : "#000000";
			var matrix = QRCode.generate(data, options);
			var n = matrix[length];
			var modsize = Math.max(options.modulesize || 5, 0.5);
			var margin = Math.max(options.margin ? options.margin : 4, 0.0);
			var size = modsize * (n + 2 * margin);
			/* var common = ' class= "fg"' + ' width="' + modsize + '" height="' + modsize + '"/>'; */

			var e = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"svg"
			);
			e.setAttributeNS(null, "viewBox", "0 0 " + size + " " + size);
			e.setAttributeNS(null, "style", "shape-rendering:crispEdges");
			var qrcodeId = "qrcode" + Date.now();
			e.setAttributeNS(null, "id", qrcodeId);
			var frag = document.createDocumentFragment();
			/* var svg = ['<style scoped>.bg{fill:' + fillcolor + '}.fg{fill:' + textcolor + '}</style>', '<rect class="bg" x="0" y="0"', 'width="' + size + '" height="' + size + '"/>', ]; */

			var style = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"style"
			);
			style.appendChild(
				document.createTextNode(
					"#" +
						qrcodeId +
						" .bg{fill:" +
						fillcolor +
						"}#" +
						qrcodeId +
						" .fg{fill:" +
						textcolor +
						"}"
				)
			);
			/* style.setAttributeNS(null, "scoped", "scoped"); */

			frag.appendChild(style);

			var createRect = function createRect(c, f, x, y, s) {
				var fg =
					document.createElementNS(
						"http://www.w3.org/2000/svg",
						"rect"
					) || "";
				fg.setAttributeNS(null, "class", c);
				fg.setAttributeNS(null, "fill", f);
				fg.setAttributeNS(null, "x", x);
				fg.setAttributeNS(null, "y", y);
				fg.setAttributeNS(null, "width", s);
				fg.setAttributeNS(null, "height", s);
				return fg;
			};

			frag.appendChild(createRect("bg", "none", 0, 0, size));
			var yo = margin * modsize;

			for (var y = 0; y < n; ++y) {
				var xo = margin * modsize;

				for (var x = 0; x < n; ++x) {
					if (matrix[y][x]) {
						/* svg.push('<rect x="' + xo + '" y="' + yo + '"', common); */
						frag.appendChild(
							createRect("fg", "none", xo, yo, modsize)
						);
					}

					xo += modsize;
				}

				yo += modsize;
			}
			/* e.innerHTML = svg.join(""); */

			e.appendChild(frag);
			return e;
		},
		generatePNG: function generatePNG(data, settings) {
			var options = settings || {};
			var fillcolor = options.fillcolor || "#FFFFFF";
			var textcolor = options.textcolor || "#000000";
			var matrix = QRCode.generate(data, options);
			var modsize = Math.max(options.modulesize || 5, 0.5);
			var margin = Math.max(
				options.margin !== null && options.margin !== undefined
					? options.margin
					: 4,
				0.0
			);
			var n = matrix[length];
			var size = modsize * (n + 2 * margin);
			var canvas = document.createElement("canvas"),
				context;
			canvas.width = canvas.height = size;
			context = canvas.getContext("2d");

			if (!context) {
				throw "canvas support is needed for PNG output";
			}

			context.fillStyle = fillcolor;
			context.fillRect(0, 0, size, size);
			context.fillStyle = textcolor;

			for (var i = 0; i < n; ++i) {
				for (var j = 0; j < n; ++j) {
					if (matrix[i][j]) {
						context.fillRect(
							modsize * (margin + j),
							modsize * (margin + i),
							modsize,
							modsize
						);
					}
				}
			}

			return canvas.toDataURL();
		}
	};
	root.QRCode = QRCode;
})("undefined" !== typeof window ? window : this, document);
/*jshint bitwise: true */

/*global jQuery */

/*!
 * Super lightweight script (~1kb) to detect via Javascript events like
 * 'tap' 'dbltap' "swipeup" "swipedown" "swipeleft" "swiperight"
 * on any kind of device.
 * Version: 2.0.1
 * Author: Gianluca Guarini
 * Contact: gianluca.guarini@gmail.com
 * Website: http://www.gianlucaguarini.com/
 * Twitter: @gianlucaguarini
 * Copyright (c) Gianluca Guarini
 * @see {@link https://github.com/GianlucaGuarini/Tocca.js/blob/master/Tocca.js}
 * passes jshint
 */
(function(doc, win) {
	"use strict";

	if (typeof doc.createEvent !== "function") {
		return false;
	}

	var tapNum = 0,
		pointerId,
		currX,
		currY,
		cachedX,
		cachedY,
		timestamp,
		target,
		dblTapTimer,
		longtapTimer;

	var pointerEventSupport = function pointerEventSupport(type) {
			var lo = type.toLowerCase(),
				ms = "MS" + type;
			return navigator.msPointerEnabled
				? ms
				: window.PointerEvent
				? lo
				: "";
		},
		defaults = {
			useJquery: !win.IGNORE_JQUERY && typeof jQuery !== "undefined",
			swipeThreshold: win.SWIPE_THRESHOLD || 100,
			tapThreshold: win.TAP_THRESHOLD || 150,
			dbltapThreshold: win.DBL_TAP_THRESHOLD || 200,
			longtapThreshold: win.LONG_TAP_THRESHOLD || 1000,
			tapPrecision: win.TAP_PRECISION / 2 || 60 / 2,
			justTouchEvents: win.JUST_ON_TOUCH_DEVICES
		},
		wasTouch = false,
		touchevents = {
			touchstart: pointerEventSupport("PointerDown") || "touchstart",
			touchend: pointerEventSupport("PointerUp") + " touchend",
			touchmove: pointerEventSupport("PointerMove") + " touchmove"
		},
		isTheSameFingerId = function isTheSameFingerId(e) {
			return (
				!e.pointerId ||
				typeof pointerId === "undefined" ||
				e.pointerId === pointerId
			);
		},
		setListener = function setListener(elm, events, callback) {
			var eventsArray = events.split(" "),
				i = eventsArray.length;

			while (i--) {
				elm.addEventListener(eventsArray[i], callback, false);
			}
		},
		getPointerEvent = function getPointerEvent(event) {
			return event.targetTouches ? event.targetTouches[0] : event;
		},
		getTimestamp = function getTimestamp() {
			return new Date().getTime();
		},
		sendEvent = function sendEvent(elm, eventName, originalEvent, data) {
			var customEvent = doc.createEvent("Event");
			customEvent.originalEvent = originalEvent;
			data = data || {};
			data.x = currX;
			data.y = currY;
			data.distance = data.distance;

			if (defaults.useJquery) {
				customEvent = jQuery.Event(eventName, {
					originalEvent: originalEvent
				});
				jQuery(elm).trigger(customEvent, data);
			}

			if (customEvent.initEvent) {
				for (var key in data) {
					if (data.hasOwnProperty(key)) {
						customEvent[key] = data[key];
					}
				}

				customEvent.initEvent(eventName, true, true);
				elm.dispatchEvent(customEvent);
			}

			while (elm) {
				if (elm["on" + eventName]) {
					elm["on" + eventName](customEvent);
				}

				elm = elm.parentNode;
			}
		},
		onTouchStart = function onTouchStart(e) {
			if (!isTheSameFingerId(e)) {
				return;
			}

			var isMousedown = e.type === "mousedown";
			wasTouch = !isMousedown;
			pointerId = e.pointerId;

			if (e.type === "mousedown" && wasTouch) {
				return;
			}

			var pointer = getPointerEvent(e);
			cachedX = currX = pointer.pageX;
			cachedY = currY = pointer.pageY;
			longtapTimer = setTimeout(function () {
				sendEvent(e.target, "longtap", e);
				target = e.target;
			}, defaults.longtapThreshold);
			timestamp = getTimestamp();
			tapNum++;
		},
		onTouchEnd = function onTouchEnd(e) {
			if (!isTheSameFingerId(e)) {
				return;
			}

			pointerId = undefined;

			if (e.type === "mouseup" && wasTouch) {
				wasTouch = false;
				return;
			}

			var eventsArr = [],
				now = getTimestamp(),
				deltaY = cachedY - currY,
				deltaX = cachedX - currX;
			clearTimeout(dblTapTimer);
			clearTimeout(longtapTimer);

			if (deltaX <= -defaults.swipeThreshold) {
				eventsArr.push("swiperight");
			}

			if (deltaX >= defaults.swipeThreshold) {
				eventsArr.push("swipeleft");
			}

			if (deltaY <= -defaults.swipeThreshold) {
				eventsArr.push("swipedown");
			}

			if (deltaY >= defaults.swipeThreshold) {
				eventsArr.push("swipeup");
			}

			if (eventsArr.length) {
				for (var i = 0; i < eventsArr.length; i++) {
					var eventName = eventsArr[i];
					sendEvent(e.target, eventName, e, {
						distance: {
							x: Math.abs(deltaX),
							y: Math.abs(deltaY)
						}
					});
				}

				tapNum = 0;
			} else {
				if (
					cachedX >= currX - defaults.tapPrecision &&
					cachedX <= currX + defaults.tapPrecision &&
					cachedY >= currY - defaults.tapPrecision &&
					cachedY <= currY + defaults.tapPrecision
				) {
					if (timestamp + defaults.tapThreshold - now >= 0) {
						sendEvent(
							e.target,
							tapNum >= 2 && target === e.target
								? "dbltap"
								: "tap",
							e
						);
						target = e.target;
					}
				}

				dblTapTimer = setTimeout(function () {
					tapNum = 0;
				}, defaults.dbltapThreshold);
			}
		},
		onTouchMove = function onTouchMove(e) {
			if (!isTheSameFingerId(e)) {
				return;
			}

			if (e.type === "mousemove" && wasTouch) {
				return;
			}

			var pointer = getPointerEvent(e);
			currX = pointer.pageX;
			currY = pointer.pageY;
		};

	setListener(
		doc,
		touchevents.touchstart + (defaults.justTouchEvents ? "" : " mousedown"),
		onTouchStart
	);
	setListener(
		doc,
		touchevents.touchend + (defaults.justTouchEvents ? "" : " mouseup"),
		onTouchEnd
	);
	setListener(
		doc,
		touchevents.touchmove + (defaults.justTouchEvents ? "" : " mousemove"),
		onTouchMove
	);

	win.tocca = function (options) {
		for (var opt in options) {
			if (options.hasOwnProperty(opt)) {
				defaults[opt] = options[opt];
			}
		}

		return defaults;
	};
})(document, "undefined" !== typeof window ? window : this);

function _typeof(obj) {
	if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
		_typeof = function _typeof(obj) {
			return typeof obj;
		};
	} else {
		_typeof = function _typeof(obj) {
			return obj &&
				typeof Symbol === "function" &&
				obj.constructor === Symbol &&
				obj !== Symbol.prototype
				? "symbol"
				: typeof obj;
		};
	}
	return _typeof(obj);
}

/*!
 * modified Generates event when user makes new movement (like a swipe on a touchscreen).
 * @version 1.1.4
 * @link https://github.com/Promo/wheel-indicator
 * @license MIT
 * @see {@link https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection}
 * forced passive event listener if supported
 * passes jshint
 */

/* global module, window, document */
var WheelIndicator = (function(root, document) {
	var eventWheel = "onwheel" in document ? "wheel" : "mousewheel",
		DEFAULTS = {
			callback: function callback() {},
			elem: document,
			preventMouse: true
		};

	function Module(options) {
		this._options = extend(DEFAULTS, options);
		this._deltaArray = [0, 0, 0];
		this._isAcceleration = false;
		this._isStopped = true;
		this._direction = "";
		this._timer = "";
		this._isWorking = true;
		var self = this;

		this._wheelHandler = function (event) {
			if (self._isWorking) {
				processDelta.call(self, event);

				if (self._options.preventMouse) {
					preventDefault(event);
				}
			}
		};

		addEvent(this._options.elem, eventWheel, this._wheelHandler);
	}

	Module.prototype = {
		constructor: Module,
		turnOn: function turnOn() {
			this._isWorking = true;
			return this;
		},
		turnOff: function turnOff() {
			this._isWorking = false;
			return this;
		},
		setOptions: function setOptions(options) {
			this._options = extend(this._options, options);
			return this;
		},
		getOption: function getOption(option) {
			var neededOption = this._options[option];

			if (neededOption !== undefined) {
				return neededOption;
			}

			throw new Error("Unknown option");
		},
		destroy: function destroy() {
			removeEvent(this._options.elem, eventWheel, this._wheelHandler);
			return this;
		}
	};

	function triggerEvent(event) {
		event.direction = this._direction;

		this._options.callback.call(this, event);
	}

	var _getDeltaY = function getDeltaY(event) {
		if (event.wheelDelta && !event.deltaY) {
			_getDeltaY = function getDeltaY(event) {
				return event.wheelDelta * -1;
			};
		} else {
			_getDeltaY = function getDeltaY(event) {
				return event.deltaY;
			};
		}

		return _getDeltaY(event);
	};

	function preventDefault(event) {
		event = event || root.event;

		if (event.preventDefault) {
			event.preventDefault();
		} else {
			event.returnValue = false;
		}
	}

	function processDelta(event) {
		var self = this,
			delta = _getDeltaY(event);

		if (delta === 0) return;
		var direction = delta > 0 ? "down" : "up",
			arrayLength = self._deltaArray.length,
			changedDirection = false,
			repeatDirection = 0,
			sustainableDirection,
			i;
		clearTimeout(self._timer);
		self._timer = setTimeout(function () {
			self._deltaArray = [0, 0, 0];
			self._isStopped = true;
			self._direction = direction;
		}, 150);

		for (i = 0; i < arrayLength; i++) {
			if (self._deltaArray[i] !== 0) {
				if (self._deltaArray[i] > 0) {
					++repeatDirection;
				} else {
					--repeatDirection;
				}
			}
		}

		if (Math.abs(repeatDirection) === arrayLength) {
			sustainableDirection = repeatDirection > 0 ? "down" : "up";

			if (sustainableDirection !== self._direction) {
				changedDirection = true;
				self._direction = direction;
			}
		}

		if (!self._isStopped) {
			if (changedDirection) {
				self._isAcceleration = true;
				triggerEvent.call(this, event);
			} else {
				if (Math.abs(repeatDirection) === arrayLength) {
					analyzeArray.call(this, event);
				}
			}
		}

		if (self._isStopped) {
			self._isStopped = false;
			self._isAcceleration = true;
			self._direction = direction;
			triggerEvent.call(this, event);
		}

		self._deltaArray.shift();

		self._deltaArray.push(delta);
	}

	function analyzeArray(event) {
		var deltaArray0Abs = Math.abs(this._deltaArray[0]),
			deltaArray1Abs = Math.abs(this._deltaArray[1]),
			deltaArray2Abs = Math.abs(this._deltaArray[2]),
			deltaAbs = Math.abs(_getDeltaY(event));

		if (
			deltaAbs > deltaArray2Abs &&
			deltaArray2Abs > deltaArray1Abs &&
			deltaArray1Abs > deltaArray0Abs
		) {
			if (!this._isAcceleration) {
				triggerEvent.call(this, event);
				this._isAcceleration = true;
			}
		}

		if (deltaAbs < deltaArray2Abs && deltaArray2Abs <= deltaArray1Abs) {
			this._isAcceleration = false;
		}
	}

	var supportsPassive = (function () {
		var support = false;

		try {
			var opts =
				Object.defineProperty &&
				Object.defineProperty({}, "passive", {
					get: function get() {
						support = true;
					}
				});
			root.addEventListener("test", function () {}, opts);
		} catch (err) {}

		return support;
	})();

	function addEvent(elem, type, handler) {
		if (elem.addEventListener) {
			elem.addEventListener(
				type,
				handler,
				supportsPassive
					? {
							passive: true
					  }
					: false
			);
		} else if (elem.attachEvent) {
			elem.attachEvent("on" + type, handler);
		}
	}

	function removeEvent(elem, type, handler) {
		if (elem.removeEventListener) {
			elem.removeEventListener(
				type,
				handler,
				supportsPassive
					? {
							passive: true
					  }
					: false
			);
		} else if (elem.detachEvent) {
			elem.detachEvent("on" + type, handler);
		}
	}

	function extend(defaults, options) {
		var extended = {},
			prop;

		for (prop in defaults) {
			if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
				extended[prop] = defaults[prop];
			}
		}

		for (prop in options) {
			if (Object.prototype.hasOwnProperty.call(options, prop)) {
				extended[prop] = options[prop];
			}
		}

		return extended;
	}

	return Module;
})("undefined" !== typeof window ? window : this, document);

if (
	(typeof exports === "undefined" ? "undefined" : _typeof(exports)) ===
	"object"
) {
	module.exports = WheelIndicator;
}

function _typeof(obj) {
	if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
		_typeof = function _typeof(obj) {
			return typeof obj;
		};
	} else {
		_typeof = function _typeof(obj) {
			return obj &&
				typeof Symbol === "function" &&
				obj.constructor === Symbol &&
				obj !== Symbol.prototype
				? "symbol"
				: typeof obj;
		};
	}
	return _typeof(obj);
}

/*!
LegoMushroom @legomushroom http://legomushroom.com
MIT License 2014
 */

/*!
 * @see {@link https://github.com/legomushroom/resize/blob/master/dist/any-resize-event.js}
 * v1.0.0
 * fixed functions within the loop and some variables
 * not defined on more upper level
 * and if (proto.prototype === null || proto.prototype === undefined)
 * passes jshint
 */

/*global define, module*/

/*!
LegoMushroom @legomushroom http://legomushroom.com
MIT License 2014
 */
(function () {
	var Main;

	Main = (function () {
		function Main(o) {
			this.o = o != null ? o : {};

			if (window.isAnyResizeEventInited) {
				return;
			}

			this.vars();
			this.redefineProto();
		}

		Main.prototype.vars = function () {
			window.isAnyResizeEventInited = true;
			this.allowedProtos = [
				HTMLDivElement,
				HTMLFormElement,
				HTMLLinkElement,
				HTMLBodyElement,
				HTMLParagraphElement,
				HTMLFieldSetElement,
				HTMLLegendElement,
				HTMLLabelElement,
				HTMLButtonElement,
				HTMLUListElement,
				HTMLOListElement,
				HTMLLIElement,
				HTMLHeadingElement,
				HTMLQuoteElement,
				HTMLPreElement,
				HTMLBRElement,
				HTMLFontElement,
				HTMLHRElement,
				HTMLModElement,
				HTMLParamElement,
				HTMLMapElement,
				HTMLTableElement,
				HTMLTableCaptionElement,
				HTMLImageElement,
				HTMLTableCellElement,
				HTMLSelectElement,
				HTMLInputElement,
				HTMLTextAreaElement,
				HTMLAnchorElement,
				HTMLObjectElement,
				HTMLTableColElement,
				HTMLTableSectionElement,
				HTMLTableRowElement
			];
			return (this.timerElements = {
				img: 1,
				textarea: 1,
				input: 1,
				embed: 1,
				object: 1,
				svg: 1,
				canvas: 1,
				tr: 1,
				tbody: 1,
				thead: 1,
				tfoot: 1,
				a: 1,
				select: 1,
				option: 1,
				optgroup: 1,
				dl: 1,
				dt: 1,
				br: 1,
				basefont: 1,
				font: 1,
				col: 1,
				iframe: 1
			});
		};

		Main.prototype.redefineProto = function () {
			var i, it, proto, t;
			it = this;
			return (t = function () {
				var _i, _len, _ref, _results;

				_ref = this.allowedProtos;
				_results = [];

				var fn = function fn(proto) {
					var listener, remover;
					listener =
						proto.prototype.addEventListener ||
						proto.prototype.attachEvent;
					var wrappedListener;

					(function(listener) {
						wrappedListener = function wrappedListener() {
							var option;

							if (this !== window || this !== document) {
								option =
									arguments[0] === "onresize" &&
									!this.isAnyResizeEventInited;

								if (option) {
									it.handleResize({
										args: arguments,
										that: this
									});
								}
							}

							return listener.apply(this, arguments);
						};

						if (proto.prototype.addEventListener) {
							return (proto.prototype.addEventListener = wrappedListener);
						} else if (proto.prototype.attachEvent) {
							return (proto.prototype.attachEvent = wrappedListener);
						}
					})(listener);

					remover =
						proto.prototype.removeEventListener ||
						proto.prototype.detachEvent;
					return (function(remover) {
						var wrappedRemover;

						wrappedRemover = function wrappedRemover() {
							this.isAnyResizeEventInited = false;

							if (this.iframe) {
								this.removeChild(this.iframe);
							}

							return remover.apply(this, arguments);
						};

						if (proto.prototype.removeEventListener) {
							return (proto.prototype.removeEventListener = wrappedRemover);
						} else if (proto.prototype.detachEvent) {
							return (proto.prototype.detachEvent = wrappedListener);
						}
					})(remover);
				};

				for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
					proto = _ref[i];

					if (proto.prototype == null) {
						continue;
					}
					/* _results.push(fn.bind(null, proto)()); */

					_results.push(fn(proto));
				}

				return _results;
			}.call(this));
		};

		Main.prototype.handleResize = function (args) {
			var computedStyle, el, iframe, isEmpty, isStatic, _ref;

			el = args.that;

			if (!this.timerElements[el.tagName.toLowerCase()]) {
				iframe = document.createElement("iframe");
				el.appendChild(iframe);
				iframe.style.width = "100%";
				iframe.style.height = "100%";
				iframe.style.position = "absolute";
				iframe.style.zIndex = -999;
				iframe.style.opacity = 0;
				iframe.style.top = 0;
				iframe.style.left = 0;
				iframe.setAttribute("title", "any-resize-event");
				iframe.setAttribute("aria-hidden", true);
				computedStyle = window.getComputedStyle
					? getComputedStyle(el)
					: el.currentStyle;
				isStatic =
					computedStyle.position === "static" &&
					el.style.position === "";
				isEmpty =
					computedStyle.position === "" && el.style.position === "";

				if (isStatic || isEmpty) {
					el.style.position = "relative";
				}

				if ((_ref = iframe.contentWindow) != null) {
					_ref.onresize = (function(_this) {
						return function (e) {
							return _this.dispatchEvent(el);
						};
					})(this);
				}

				el.iframe = iframe;
			} else {
				this.initTimer(el);
			}

			return (el.isAnyResizeEventInited = true);
		};

		Main.prototype.initTimer = function (el) {
			var height, width;
			width = 0;
			height = 0;
			return (this.interval = setInterval(
				(function(_this) {
					return function () {
						var newHeight, newWidth;
						newWidth = el.offsetWidth;
						newHeight = el.offsetHeight;

						if (newWidth !== width || newHeight !== height) {
							_this.dispatchEvent(el);

							width = newWidth;
							return (height = newHeight);
						}
					};
				})(this),
				this.o.interval || 62.5
			));
		};

		Main.prototype.dispatchEvent = function (el) {
			var e;

			if (document.createEvent) {
				e = document.createEvent("HTMLEvents");
				e.initEvent("onresize", false, false);
				return el.dispatchEvent(e);
			} else if (document.createEventObject) {
				e = document.createEventObject();
				return el.fireEvent("onresize", e);
			} else {
				return false;
			}
		};

		Main.prototype.destroy = function () {
			var i, it, proto, _i, _len, _ref, _results;

			clearInterval(this.interval);
			this.interval = null;
			window.isAnyResizeEventInited = false;
			it = this;
			_ref = this.allowedProtos;
			_results = [];

			var fn = function fn(proto) {
				var listener;
				listener =
					proto.prototype.addEventListener ||
					proto.prototype.attachEvent;

				if (proto.prototype.addEventListener) {
					proto.prototype.addEventListener =
						Element.prototype.addEventListener;
				} else if (proto.prototype.attachEvent) {
					proto.prototype.attachEvent = Element.prototype.attachEvent;
				}

				if (proto.prototype.removeEventListener) {
					return (proto.prototype.removeEventListener =
						Element.prototype.removeEventListener);
				} else if (proto.prototype.detachEvent) {
					return (proto.prototype.detachEvent =
						Element.prototype.detachEvent);
				}
			};

			for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
				proto = _ref[i];

				if (proto.prototype == null) {
					continue;
				}

				_results.push(fn(proto));
			}

			return _results;
		};

		return Main;
	})();

	if (typeof define === "function" && define.amd) {
		define("any-resize-event", [], function () {
			return new Main();
		});
	} else if (
		(typeof module === "undefined" ? "undefined" : _typeof(module)) ===
			"object" &&
		_typeof(module.exports) === "object"
	) {
		module.exports = new Main();
	} else {
		if (typeof window !== "undefined" && window !== null) {
			window.AnyResizeEvent = Main;
		}

		if (typeof window !== "undefined" && window !== null) {
			window.anyResizeEvent = new Main();
		}
	}
}.call(this));

function _typeof(obj) {
	if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
		_typeof = function _typeof(obj) {
			return typeof obj;
		};
	} else {
		_typeof = function _typeof(obj) {
			return obj &&
				typeof Symbol === "function" &&
				obj.constructor === Symbol &&
				obj !== Symbol.prototype
				? "symbol"
				: typeof obj;
		};
	}
	return _typeof(obj);
}

/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 * if (tokens == null) {
 * changed to: if (tokens === null || tokens === undefined)
 * != null changed to: !== null
 * parses jshint
 */

/*global define, exports */
(function defineMustache(global, factory) {
	if (
		(typeof exports === "undefined" ? "undefined" : _typeof(exports)) ===
			"object" &&
		exports &&
		typeof exports.nodeName !== "string"
	) {
		factory(exports);
	} else if (typeof define === "function" && define.amd) {
		define(["exports"], factory);
	} else {
		global.Mustache = {};
		factory(global.Mustache);
	}
})(this, function mustacheFactory(mustache) {
	var objectToString = Object.prototype.toString;

	var isArray =
		Array.isArray ||
		function isArrayPolyfill(object) {
			return objectToString.call(object) === "[object Array]";
		};

	function isFunction(object) {
		return typeof object === "function";
	}

	function typeStr(obj) {
		return isArray(obj) ? "array" : _typeof(obj);
	}

	function escapeRegExp(string) {
		return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
	}

	function hasProperty(obj, propName) {
		return obj !== null && _typeof(obj) === "object" && propName in obj;
	}

	var regExpTest = RegExp.prototype.test;

	function testRegExp(re, string) {
		return regExpTest.call(re, string);
	}

	var nonSpaceRe = /\S/;

	function isWhitespace(string) {
		return !testRegExp(nonSpaceRe, string);
	}

	var entityMap = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#39;",
		"/": "&#x2F;",
		"`": "&#x60;",
		"=": "&#x3D;"
	};

	function escapeHtml(string) {
		return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(
			s
		) {
			return entityMap[s];
		});
	}

	var whiteRe = /\s*/;
	var spaceRe = /\s+/;
	var equalsRe = /\s*=/;
	var curlyRe = /\s*\}/;
	var tagRe = /#|\^|\/|>|\{|&|=|!/;

	function squashTokens(tokens) {
		var squashedTokens = [];
		var token, lastToken;

		for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
			token = tokens[i];

			if (token) {
				if (
					token[0] === "text" &&
					lastToken &&
					lastToken[0] === "text"
				) {
					lastToken[1] += token[1];
					lastToken[3] = token[3];
				} else {
					squashedTokens.push(token);
					lastToken = token;
				}
			}
		}

		return squashedTokens;
	}

	function nestTokens(tokens) {
		var nestedTokens = [];
		var collector = nestedTokens;
		var sections = [];
		var token, section;

		for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
			token = tokens[i];

			switch (token[0]) {
				case "#":
				case "^":
					collector.push(token);
					sections.push(token);
					collector = token[4] = [];
					break;

				case "/":
					section = sections.pop();
					section[5] = token[2];
					collector =
						sections.length > 0
							? sections[sections.length - 1][4]
							: nestedTokens;
					break;

				default:
					collector.push(token);
			}
		}

		return nestedTokens;
	}

	function Scanner(string) {
		this.string = string;
		this.tail = string;
		this.pos = 0;
	}

	function parseTemplate(template, tags) {
		if (!template) {
			return [];
		}

		var sections = [];
		var tokens = [];
		var spaces = [];
		var hasTag = false;
		var nonSpace = false;

		function stripSpace() {
			if (hasTag && !nonSpace) {
				while (spaces.length) {
					delete tokens[spaces.pop()];
				}
			} else {
				spaces = [];
			}

			hasTag = false;
			nonSpace = false;
		}

		var openingTagRe, closingTagRe, closingCurlyRe;

		function compileTags(tagsToCompile) {
			if (typeof tagsToCompile === "string") {
				tagsToCompile = tagsToCompile.split(spaceRe, 2);
			}

			if (!isArray(tagsToCompile) || tagsToCompile.length !== 2) {
				throw new Error("Invalid tags: " + tagsToCompile);
			}

			openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + "\\s*");
			closingTagRe = new RegExp("\\s*" + escapeRegExp(tagsToCompile[1]));
			closingCurlyRe = new RegExp(
				"\\s*" + escapeRegExp("}" + tagsToCompile[1])
			);
		}

		compileTags(tags || mustache.tags);
		var scanner = new Scanner(template);
		var start, type, value, chr, token, openSection;

		while (!scanner.eos()) {
			start = scanner.pos;
			value = scanner.scanUntil(openingTagRe);

			if (value) {
				for (
					var i = 0, valueLength = value.length;
					i < valueLength;
					++i
				) {
					chr = value.charAt(i);

					if (isWhitespace(chr)) {
						spaces.push(tokens.length);
					} else {
						nonSpace = true;
					}

					tokens.push(["text", chr, start, start + 1]);
					start += 1;

					if (chr === "\n") {
						stripSpace();
					}
				}
			}

			if (!scanner.scan(openingTagRe)) {
				break;
			}

			hasTag = true;
			type = scanner.scan(tagRe) || "name";
			scanner.scan(whiteRe);

			if (type === "=") {
				value = scanner.scanUntil(equalsRe);
				scanner.scan(equalsRe);
				scanner.scanUntil(closingTagRe);
			} else if (type === "{") {
				value = scanner.scanUntil(closingCurlyRe);
				scanner.scan(curlyRe);
				scanner.scanUntil(closingTagRe);
				type = "&";
			} else {
				value = scanner.scanUntil(closingTagRe);
			}

			if (!scanner.scan(closingTagRe)) {
				throw new Error("Unclosed tag at " + scanner.pos);
			}

			token = [type, value, start, scanner.pos];
			tokens.push(token);

			if (type === "#" || type === "^") {
				sections.push(token);
			} else if (type === "/") {
				openSection = sections.pop();

				if (!openSection) {
					throw new Error(
						'Unopened section "' + value + '" at ' + start
					);
				}

				if (openSection[1] !== value) {
					throw new Error(
						'Unclosed section "' + openSection[1] + '" at ' + start
					);
				}
			} else if (type === "name" || type === "{" || type === "&") {
				nonSpace = true;
			} else if (type === "=") {
				compileTags(value);
			}
		}

		openSection = sections.pop();

		if (openSection) {
			throw new Error(
				'Unclosed section "' + openSection[1] + '" at ' + scanner.pos
			);
		}

		return nestTokens(squashTokens(tokens));
	}

	Scanner.prototype.eos = function eos() {
		return this.tail === "";
	};

	Scanner.prototype.scan = function scan(re) {
		var match = this.tail.match(re);

		if (!match || match.index !== 0) {
			return "";
		}

		var string = match[0];
		this.tail = this.tail.substring(string.length);
		this.pos += string.length;
		return string;
	};

	Scanner.prototype.scanUntil = function scanUntil(re) {
		var index = this.tail.search(re),
			match;

		switch (index) {
			case -1:
				match = this.tail;
				this.tail = "";
				break;

			case 0:
				match = "";
				break;

			default:
				match = this.tail.substring(0, index);
				this.tail = this.tail.substring(index);
		}

		this.pos += match.length;
		return match;
	};

	function Context(view, parentContext) {
		this.view = view;
		this.cache = {
			".": this.view
		};
		this.parent = parentContext;
	}

	Context.prototype.push = function push(view) {
		return new Context(view, this);
	};

	Context.prototype.lookup = function lookup(name) {
		var cache = this.cache;
		var value;

		if (cache.hasOwnProperty(name)) {
			value = cache[name];
		} else {
			var context = this,
				names,
				index,
				lookupHit = false;

			while (context) {
				if (name.indexOf(".") > 0) {
					value = context.view;
					names = name.split(".");
					index = 0;

					while (value !== null && index < names.length) {
						if (index === names.length - 1) {
							lookupHit = hasProperty(value, names[index]);
						}

						value = value[names[index++]];
					}
				} else {
					value = context.view[name];
					lookupHit = hasProperty(context.view, name);
				}

				if (lookupHit) {
					break;
				}

				context = context.parent;
			}

			cache[name] = value;
		}

		if (isFunction(value)) {
			value = value.call(this.view);
		}

		return value;
	};

	function Writer() {
		this.cache = {};
	}

	Writer.prototype.clearCache = function clearCache() {
		this.cache = {};
	};

	Writer.prototype.parse = function parse(template, tags) {
		var cache = this.cache;
		var tokens = cache[template];

		if (tokens === null || tokens === undefined) {
			tokens = cache[template] = parseTemplate(template, tags);
		}

		return tokens;
	};

	Writer.prototype.render = function render(template, view, partials) {
		var tokens = this.parse(template);
		var context = view instanceof Context ? view : new Context(view);
		return this.renderTokens(tokens, context, partials, template);
	};

	Writer.prototype.renderTokens = function renderTokens(
		tokens,
		context,
		partials,
		originalTemplate
	) {
		var buffer = "";
		var token, symbol, value;

		for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
			value = undefined;
			token = tokens[i];
			symbol = token[0];

			if (symbol === "#") {
				value = this.renderSection(
					token,
					context,
					partials,
					originalTemplate
				);
			} else if (symbol === "^") {
				value = this.renderInverted(
					token,
					context,
					partials,
					originalTemplate
				);
			} else if (symbol === ">") {
				value = this.renderPartial(
					token,
					context,
					partials,
					originalTemplate
				);
			} else if (symbol === "&") {
				value = this.unescapedValue(token, context);
			} else if (symbol === "name") {
				value = this.escapedValue(token, context);
			} else if (symbol === "text") {
				value = this.rawValue(token);
			}

			if (value !== undefined) {
				buffer += value;
			}
		}

		return buffer;
	};

	Writer.prototype.renderSection = function renderSection(
		token,
		context,
		partials,
		originalTemplate
	) {
		var self = this;
		var buffer = "";
		var value = context.lookup(token[1]);

		function subRender(template) {
			return self.render(template, context, partials);
		}

		if (!value) {
			return;
		}

		if (isArray(value)) {
			for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
				buffer += this.renderTokens(
					token[4],
					context.push(value[j]),
					partials,
					originalTemplate
				);
			}
		} else if (
			_typeof(value) === "object" ||
			typeof value === "string" ||
			typeof value === "number"
		) {
			buffer += this.renderTokens(
				token[4],
				context.push(value),
				partials,
				originalTemplate
			);
		} else if (isFunction(value)) {
			if (typeof originalTemplate !== "string") {
				throw new Error(
					"Cannot use higher-order sections without the original template"
				);
			}

			value = value.call(
				context.view,
				originalTemplate.slice(token[3], token[5]),
				subRender
			);

			if (value !== null) {
				buffer += value;
			}
		} else {
			buffer += this.renderTokens(
				token[4],
				context,
				partials,
				originalTemplate
			);
		}

		return buffer;
	};

	Writer.prototype.renderInverted = function renderInverted(
		token,
		context,
		partials,
		originalTemplate
	) {
		var value = context.lookup(token[1]);

		if (!value || (isArray(value) && value.length === 0)) {
			return this.renderTokens(
				token[4],
				context,
				partials,
				originalTemplate
			);
		}
	};

	Writer.prototype.renderPartial = function renderPartial(
		token,
		context,
		partials
	) {
		if (!partials) {
			return;
		}

		var value = isFunction(partials)
			? partials(token[1])
			: partials[token[1]];

		if (value !== null) {
			return this.renderTokens(
				this.parse(value),
				context,
				partials,
				value
			);
		}
	};

	Writer.prototype.unescapedValue = function unescapedValue(token, context) {
		var value = context.lookup(token[1]);

		if (value !== null) {
			return value;
		}
	};

	Writer.prototype.escapedValue = function escapedValue(token, context) {
		var value = context.lookup(token[1]);

		if (value !== null) {
			return mustache.escape(value);
		}
	};

	Writer.prototype.rawValue = function rawValue(token) {
		return token[1];
	};

	mustache.name = "mustache.js";
	mustache.version = "2.3.2";
	mustache.tags = ["{{", "}}"];
	var defaultWriter = new Writer();

	mustache.clearCache = function clearCache() {
		return defaultWriter.clearCache();
	};

	mustache.parse = function parse(template, tags) {
		return defaultWriter.parse(template, tags);
	};

	mustache.render = function render(template, view, partials) {
		if (typeof template !== "string") {
			throw new TypeError(
				'Invalid template! Template should be a "string" ' +
					'but "' +
					typeStr(template) +
					'" was given as the first ' +
					"argument for mustache#render(template, view, partials)"
			);
		}

		return defaultWriter.render(template, view, partials);
	};

	mustache.to_html = function to_html(template, view, partials, send) {
		var result = mustache.render(template, view, partials);

		if (isFunction(send)) {
			send(result);
		} else {
			return result;
		}
	};

	mustache.escape = escapeHtml;
	mustache.Scanner = Scanner;
	mustache.Context = Context;
	mustache.Writer = Writer;
	return mustache;
});

function _typeof(obj) {
	if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
		_typeof = function _typeof(obj) {
			return typeof obj;
		};
	} else {
		_typeof = function _typeof(obj) {
			return obj &&
				typeof Symbol === "function" &&
				obj.constructor === Symbol &&
				obj !== Symbol.prototype
				? "symbol"
				: typeof obj;
		};
	}
	return _typeof(obj);
}

/*!
 * EventEmitter v5.2.5 - git.io/ee
 * Unlicense - http://unlicense.org/
 * Oliver Caldwell - http://oli.me.uk/
 * @preserve
 */

/*!
 * @see {@link https://github.com/Olical/EventEmitter}
 * passes jshint
 */
(function(exports) {
	"use strict";

	function EventEmitter() {}

	var proto = EventEmitter.prototype;
	var originalGlobalValue = exports.EventEmitter;

	function indexOfListener(listeners, listener) {
		var i = listeners.length;

		while (i--) {
			if (listeners[i].listener === listener) {
				return i;
			}
		}

		return -1;
	}

	function alias(name) {
		return function aliasClosure() {
			return this[name].apply(this, arguments);
		};
	}

	proto.getListeners = function getListeners(evt) {
		var events = this._getEvents();

		var response;
		var key;

		if (evt instanceof RegExp) {
			response = {};

			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					response[key] = events[key];
				}
			}
		} else {
			response = events[evt] || (events[evt] = []);
		}

		return response;
	};

	proto.flattenListeners = function flattenListeners(listeners) {
		var flatListeners = [];
		var i;

		for (i = 0; i < listeners.length; i += 1) {
			flatListeners.push(listeners[i].listener);
		}

		return flatListeners;
	};

	proto.getListenersAsObject = function getListenersAsObject(evt) {
		var listeners = this.getListeners(evt);
		var response;

		if (listeners instanceof Array) {
			response = {};
			response[evt] = listeners;
		}

		return response || listeners;
	};

	function isValidListener(listener) {
		if (typeof listener === "function" || listener instanceof RegExp) {
			return true;
		} else if (listener && _typeof(listener) === "object") {
			return isValidListener(listener.listener);
		} else {
			return false;
		}
	}

	proto.addListener = function addListener(evt, listener) {
		if (!isValidListener(listener)) {
			throw new TypeError("listener must be a function");
		}

		var listeners = this.getListenersAsObject(evt);
		var listenerIsWrapped = _typeof(listener) === "object";
		var key;

		for (key in listeners) {
			if (
				listeners.hasOwnProperty(key) &&
				indexOfListener(listeners[key], listener) === -1
			) {
				listeners[key].push(
					listenerIsWrapped
						? listener
						: {
								listener: listener,
								once: false
						  }
				);
			}
		}

		return this;
	};

	proto.on = alias("addListener");

	proto.addOnceListener = function addOnceListener(evt, listener) {
		return this.addListener(evt, {
			listener: listener,
			once: true
		});
	};

	proto.once = alias("addOnceListener");

	proto.defineEvent = function defineEvent(evt) {
		this.getListeners(evt);
		return this;
	};

	proto.defineEvents = function defineEvents(evts) {
		for (var i = 0; i < evts.length; i += 1) {
			this.defineEvent(evts[i]);
		}

		return this;
	};

	proto.removeListener = function removeListener(evt, listener) {
		var listeners = this.getListenersAsObject(evt);
		var index;
		var key;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key)) {
				index = indexOfListener(listeners[key], listener);

				if (index !== -1) {
					listeners[key].splice(index, 1);
				}
			}
		}

		return this;
	};

	proto.off = alias("removeListener");

	proto.addListeners = function addListeners(evt, listeners) {
		return this.manipulateListeners(false, evt, listeners);
	};

	proto.removeListeners = function removeListeners(evt, listeners) {
		return this.manipulateListeners(true, evt, listeners);
	};

	proto.manipulateListeners = function manipulateListeners(
		remove,
		evt,
		listeners
	) {
		var i;
		var value;
		var single = remove ? this.removeListener : this.addListener;
		var multiple = remove ? this.removeListeners : this.addListeners;

		if (_typeof(evt) === "object" && !(evt instanceof RegExp)) {
			for (i in evt) {
				if (evt.hasOwnProperty(i) && (value = evt[i])) {
					if (typeof value === "function") {
						single.call(this, i, value);
					} else {
						multiple.call(this, i, value);
					}
				}
			}
		} else {
			i = listeners.length;

			while (i--) {
				single.call(this, evt, listeners[i]);
			}
		}

		return this;
	};

	proto.removeEvent = function removeEvent(evt) {
		var type = _typeof(evt);

		var events = this._getEvents();

		var key;

		if (type === "string") {
			delete events[evt];
		} else if (evt instanceof RegExp) {
			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					delete events[key];
				}
			}
		} else {
			delete this._events;
		}

		return this;
	};

	proto.removeAllListeners = alias("removeEvent");

	proto.emitEvent = function emitEvent(evt, args) {
		var listenersMap = this.getListenersAsObject(evt);
		var listeners;
		var listener;
		var i;
		var key;
		var response;

		for (key in listenersMap) {
			if (listenersMap.hasOwnProperty(key)) {
				listeners = listenersMap[key].slice(0);

				for (i = 0; i < listeners.length; i++) {
					listener = listeners[i];

					if (listener.once === true) {
						this.removeListener(evt, listener.listener);
					}

					response = listener.listener.apply(this, args || []);

					if (response === this._getOnceReturnValue()) {
						this.removeListener(evt, listener.listener);
					}
				}
			}
		}

		return this;
	};

	proto.trigger = alias("emitEvent");

	proto.emit = function emit(evt) {
		var args = Array.prototype.slice.call(arguments, 1);
		return this.emitEvent(evt, args);
	};

	proto.setOnceReturnValue = function setOnceReturnValue(value) {
		this._onceReturnValue = value;
		return this;
	};

	proto._getOnceReturnValue = function _getOnceReturnValue() {
		if (this.hasOwnProperty("_onceReturnValue")) {
			return this._onceReturnValue;
		} else {
			return true;
		}
	};

	proto._getEvents = function _getEvents() {
		return this._events || (this._events = {});
	};

	EventEmitter.noConflict = function noConflict() {
		exports.EventEmitter = originalGlobalValue;
		return EventEmitter;
	};

	exports.EventEmitter = EventEmitter;
})(typeof window !== "undefined" ? window : this || {});

var _extends =
	Object.assign ||
	function(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];

			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}

		return target;
	};

var LazyLoad = (function () {
	"use strict";

	var defaultSettings = {
		elements_selector: "img",
		container: document,
		threshold: 300,
		thresholds: null,
		data_src: "src",
		data_srcset: "srcset",
		data_sizes: "sizes",
		data_bg: "bg",
		class_loading: "loading",
		class_loaded: "loaded",
		class_error: "error",
		load_delay: 0,
		callback_load: null,
		callback_error: null,
		callback_set: null,
		callback_enter: null,
		callback_finish: null,
		to_webp: false
	};

	var getInstanceSettings = function getInstanceSettings(customSettings) {
		return _extends({}, defaultSettings, customSettings);
	};

	var dataPrefix = "data-";
	var processedDataName = "was-processed";
	var timeoutDataName = "ll-timeout";
	var trueString = "true";

	var getData = function getData(element, attribute) {
		return element.getAttribute(dataPrefix + attribute);
	};

	var setData = function setData(element, attribute, value) {
		var attrName = dataPrefix + attribute;

		if (value === null) {
			element.removeAttribute(attrName);
			return;
		}

		element.setAttribute(attrName, value);
	};

	var setWasProcessedData = function setWasProcessedData(element) {
		return setData(element, processedDataName, trueString);
	};

	var getWasProcessedData = function getWasProcessedData(element) {
		return getData(element, processedDataName) === trueString;
	};

	var setTimeoutData = function setTimeoutData(element, value) {
		return setData(element, timeoutDataName, value);
	};

	var getTimeoutData = function getTimeoutData(element) {
		return getData(element, timeoutDataName);
	};

	var purgeProcessedElements = function purgeProcessedElements(elements) {
		return elements.filter(function(element) {
			return !getWasProcessedData(element);
		});
	};

	var purgeOneElement = function purgeOneElement(elements, elementToPurge) {
		return elements.filter(function(element) {
			return element !== elementToPurge;
		});
	};
	/* Creates instance and notifies it through the window element */

	var createInstance = function createInstance(classObj, options) {
		var event;
		var eventString = "LazyLoad::Initialized";
		var instance = new classObj(options);

		try {
			// Works in modern browsers
			event = new CustomEvent(eventString, {
				detail: {
					instance: instance
				}
			});
		} catch (err) {
			// Works in Internet Explorer (all versions)
			event = document.createEvent("CustomEvent");
			event.initCustomEvent(eventString, false, false, {
				instance: instance
			});
		}

		window.dispatchEvent(event);
	};
	/* Auto initialization of one or more instances of lazyload, depending on the
  	 options passed in (plain object or an array) */

	function autoInitialize(classObj, options) {
		if (!options) {
			return;
		}

		if (!options.length) {
			// Plain object
			createInstance(classObj, options);
		} else {
			// Array of objects
			for (var i = 0, optionsItem; (optionsItem = options[i]); i += 1) {
				createInstance(classObj, optionsItem);
			}
		}
	}

	var replaceExtToWebp = function replaceExtToWebp(value, condition) {
		return condition ? value.replace(/\.(jpe?g|png)/gi, ".webp") : value;
	};

	var detectWebp = function detectWebp() {
		var webpString = "image/webp";
		var canvas = document.createElement("canvas");

		if (canvas.getContext && canvas.getContext("2d")) {
			return (
				canvas.toDataURL(webpString).indexOf("data:" + webpString) === 0
			);
		}

		return false;
	};

	var runningOnBrowser = typeof window !== "undefined";
	var isBot =
		(runningOnBrowser && !("onscroll" in window)) ||
		/(gle|ing|ro)bot|crawl|spider/i.test(navigator.userAgent);
	var supportsIntersectionObserver =
		runningOnBrowser && "IntersectionObserver" in window;
	var supportsClassList =
		runningOnBrowser && "classList" in document.createElement("p");
	var supportsWebp = runningOnBrowser && detectWebp();

	var setSourcesInChildren = function setSourcesInChildren(
		parentTag,
		attrName,
		dataAttrName,
		toWebpFlag
	) {
		for (var i = 0, childTag; (childTag = parentTag.children[i]); i += 1) {
			if (childTag.tagName === "SOURCE") {
				var attrValue = getData(childTag, dataAttrName);
				setAttributeIfValue(childTag, attrName, attrValue, toWebpFlag);
			}
		}
	};

	var setAttributeIfValue = function setAttributeIfValue(
		element,
		attrName,
		value,
		toWebpFlag
	) {
		if (!value) {
			return;
		}

		element.setAttribute(attrName, replaceExtToWebp(value, toWebpFlag));
	};

	var setSourcesImg = function setSourcesImg(element, settings) {
		var toWebpFlag = supportsWebp && settings.to_webp;
		var srcsetDataName = settings.data_srcset;
		var parent = element.parentNode;

		if (parent && parent.tagName === "PICTURE") {
			setSourcesInChildren(parent, "srcset", srcsetDataName, toWebpFlag);
		}

		var sizesDataValue = getData(element, settings.data_sizes);
		setAttributeIfValue(element, "sizes", sizesDataValue);
		var srcsetDataValue = getData(element, srcsetDataName);
		setAttributeIfValue(element, "srcset", srcsetDataValue, toWebpFlag);
		var srcDataValue = getData(element, settings.data_src);
		setAttributeIfValue(element, "src", srcDataValue, toWebpFlag);
	};

	var setSourcesIframe = function setSourcesIframe(element, settings) {
		var srcDataValue = getData(element, settings.data_src);
		setAttributeIfValue(element, "src", srcDataValue);
	};

	var setSourcesVideo = function setSourcesVideo(element, settings) {
		var srcDataName = settings.data_src;
		var srcDataValue = getData(element, srcDataName);
		setSourcesInChildren(element, "src", srcDataName);
		setAttributeIfValue(element, "src", srcDataValue);
		element.load();
	};

	var setSourcesBgImage = function setSourcesBgImage(element, settings) {
		var toWebpFlag = supportsWebp && settings.to_webp;
		var srcDataValue = getData(element, settings.data_src);
		var bgDataValue = getData(element, settings.data_bg);

		if (srcDataValue) {
			var setValue = replaceExtToWebp(srcDataValue, toWebpFlag);
			element.style.backgroundImage = 'url("' + setValue + '")';
		}

		if (bgDataValue) {
			var _setValue = replaceExtToWebp(bgDataValue, toWebpFlag);

			element.style.backgroundImage = _setValue;
		}
	};

	var setSourcesFunctions = {
		IMG: setSourcesImg,
		IFRAME: setSourcesIframe,
		VIDEO: setSourcesVideo
	};

	var setSources = function setSources(element, instance) {
		var settings = instance._settings;
		var tagName = element.tagName;
		var setSourcesFunction = setSourcesFunctions[tagName];

		if (setSourcesFunction) {
			setSourcesFunction(element, settings);

			instance._updateLoadingCount(1);

			instance._elements = purgeOneElement(instance._elements, element);
			return;
		}

		setSourcesBgImage(element, settings);
	};

	var addClass = function addClass(element, className) {
		if (supportsClassList) {
			element.classList.add(className);
			return;
		}

		element.className += (element.className ? " " : "") + className;
	};

	var removeClass = function removeClass(element, className) {
		if (supportsClassList) {
			element.classList.remove(className);
			return;
		}

		element.className = element.className
			.replace(new RegExp("(^|\\s+)" + className + "(\\s+|$)"), " ")
			.replace(/^\s+/, "")
			.replace(/\s+$/, "");
	};

	var callbackIfSet = function callbackIfSet(callback, argument) {
		if (callback) {
			callback(argument);
		}
	};

	var genericLoadEventName = "load";
	var mediaLoadEventName = "loadeddata";
	var errorEventName = "error";

	var addEventListener = function addEventListener(
		element,
		eventName,
		handler
	) {
		element.addEventListener(eventName, handler);
	};

	var removeEventListener = function removeEventListener(
		element,
		eventName,
		handler
	) {
		element.removeEventListener(eventName, handler);
	};

	var addEventListeners = function addEventListeners(
		element,
		loadHandler,
		errorHandler
	) {
		addEventListener(element, genericLoadEventName, loadHandler);
		addEventListener(element, mediaLoadEventName, loadHandler);
		addEventListener(element, errorEventName, errorHandler);
	};

	var removeEventListeners = function removeEventListeners(
		element,
		loadHandler,
		errorHandler
	) {
		removeEventListener(element, genericLoadEventName, loadHandler);
		removeEventListener(element, mediaLoadEventName, loadHandler);
		removeEventListener(element, errorEventName, errorHandler);
	};

	var eventHandler = function eventHandler(event, success, instance) {
		var settings = instance._settings;
		var className = success ? settings.class_loaded : settings.class_error;
		var callback = success
			? settings.callback_load
			: settings.callback_error;
		var element = event.target;
		removeClass(element, settings.class_loading);
		addClass(element, className);
		callbackIfSet(callback, element);

		instance._updateLoadingCount(-1);
	};

	var addOneShotEventListeners = function addOneShotEventListeners(
		element,
		instance
	) {
		var loadHandler = function loadHandler(event) {
			eventHandler(event, true, instance);
			removeEventListeners(element, loadHandler, errorHandler);
		};

		var errorHandler = function errorHandler(event) {
			eventHandler(event, false, instance);
			removeEventListeners(element, loadHandler, errorHandler);
		};

		addEventListeners(element, loadHandler, errorHandler);
	};

	var managedTags = ["IMG", "IFRAME", "VIDEO"];

	var loadAndUnobserve = function loadAndUnobserve(
		element,
		observer,
		instance
	) {
		revealElement(element, instance);
		observer.unobserve(element);
	};

	var cancelDelayLoad = function cancelDelayLoad(element) {
		var timeoutId = getTimeoutData(element);

		if (!timeoutId) {
			return; // do nothing if timeout doesn't exist
		}

		clearTimeout(timeoutId);
		setTimeoutData(element, null);
	};

	var delayLoad = function delayLoad(element, observer, instance) {
		var loadDelay = instance._settings.load_delay;
		var timeoutId = getTimeoutData(element);

		if (timeoutId) {
			return; // do nothing if timeout already set
		}

		timeoutId = setTimeout(function () {
			loadAndUnobserve(element, observer, instance);
			cancelDelayLoad(element);
		}, loadDelay);
		setTimeoutData(element, timeoutId);
	};

	function revealElement(element, instance, force) {
		var settings = instance._settings;

		if (!force && getWasProcessedData(element)) {
			return; // element has already been processed and force wasn't true
		}

		callbackIfSet(settings.callback_enter, element);

		if (managedTags.indexOf(element.tagName) > -1) {
			addOneShotEventListeners(element, instance);
			addClass(element, settings.class_loading);
		}

		setSources(element, instance);
		setWasProcessedData(element);
		callbackIfSet(settings.callback_set, element);
	}
	/* entry.isIntersecting needs fallback because is null on some versions of MS Edge, and
  	entry.intersectionRatio is not enough alone because it could be 0 on some intersecting elements */

	var isIntersecting = function isIntersecting(entry) {
		return entry.isIntersecting || entry.intersectionRatio > 0;
	};

	var getObserverSettings = function getObserverSettings(settings) {
		return {
			root: settings.container === document ? null : settings.container,
			rootMargin: settings.thresholds || settings.threshold + "px"
		};
	};

	var LazyLoad = function LazyLoad(customSettings, elements) {
		this._settings = getInstanceSettings(customSettings);

		this._setObserver();

		this._loadingCount = 0;
		this.update(elements);
	};

	LazyLoad.prototype = {
		_manageIntersection: function _manageIntersection(entry) {
			var observer = this._observer;
			var loadDelay = this._settings.load_delay;
			var element = entry.target; // WITHOUT LOAD DELAY

			if (!loadDelay) {
				if (isIntersecting(entry)) {
					loadAndUnobserve(element, observer, this);
				}

				return;
			} // WITH LOAD DELAY

			if (isIntersecting(entry)) {
				delayLoad(element, observer, this);
			} else {
				cancelDelayLoad(element);
			}
		},
		_onIntersection: function _onIntersection(entries) {
			entries.forEach(this._manageIntersection.bind(this));
		},
		_setObserver: function _setObserver() {
			if (!supportsIntersectionObserver) {
				return;
			}

			this._observer = new IntersectionObserver(
				this._onIntersection.bind(this),
				getObserverSettings(this._settings)
			);
		},
		_updateLoadingCount: function _updateLoadingCount(plusMinus) {
			this._loadingCount += plusMinus;

			if (this._elements.length === 0 && this._loadingCount === 0) {
				callbackIfSet(this._settings.callback_finish);
			}
		},
		update: function update(elements) {
			var _this = this;

			var settings = this._settings;
			var nodeSet =
				elements ||
				settings.container.querySelectorAll(settings.elements_selector);
			this._elements = purgeProcessedElements(
				Array.prototype.slice.call(nodeSet) // NOTE: nodeset to array for IE compatibility
			);

			if (isBot || !this._observer) {
				this.loadAll();
				return;
			}

			this._elements.forEach(function(element) {
				_this._observer.observe(element);
			});
		},
		destroy: function destroy() {
			var _this2 = this;

			if (this._observer) {
				this._elements.forEach(function(element) {
					_this2._observer.unobserve(element);
				});

				this._observer = null;
			}

			this._elements = null;
			this._settings = null;
		},
		load: function load(element, force) {
			revealElement(element, this, force);
		},
		loadAll: function loadAll() {
			var _this3 = this;

			var elements = this._elements;
			elements.forEach(function(element) {
				_this3.load(element);
			});
		}
	};
	/* Automatic instances creation if required (useful for async script loading) */

	if (runningOnBrowser) {
		autoInitialize(LazyLoad, window.lazyLoadOptions);
	}

	return LazyLoad;
})();

/*jshint esnext: true */

/*jshint -W069 */

/*global define, module, Vimeo, YT, jwplayer */
(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define('GLightbox', ['module'], factory);
	} else if (typeof exports !== "undefined") {
		factory(module);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod);
		global.GLightbox = mod.exports;
	}
})("undefined" !== typeof window ? window : this, function (module) {
	'use strict';
/*jshint validthis: true */
	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}
	var _createClass = function () {
		function defineProperties(target, props) {
			for (var i = 0; i < props.length; i++) {
				var descriptor = props[i];
				descriptor.enumerable = descriptor.enumerable || false;
				descriptor.configurable = true;
				if ("value" in descriptor)
					descriptor.writable = true;
				Object.defineProperty(target, descriptor.key, descriptor);
			}
		}
		return function (Constructor, protoProps, staticProps) {
			if (protoProps)
				defineProperties(Constructor.prototype, protoProps);
			if (staticProps)
				defineProperties(Constructor, staticProps);
			return Constructor;
		};
	}
	();
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
		return typeof obj;
	}
	 : function (obj) {
		return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	};
/**
	 * GLightbox v1.0.8
	 * Awesome pure javascript lightbox
	 * made by mcstudios.com.mx
	 */
	var isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(Android)|(PlayBook)|(BB10)|(BlackBerry)|(Opera Mini)|(IEMobile)|(webOS)|(MeeGo)/i);
	var isTouch = isMobile !== null || document.createTouch !== undefined || 'ontouchstart' in window || 'onmsgesturechange' in window || navigator.msMaxTouchPoints;
	var html = document.getElementsByTagName('html')[0];
	var body = document.body;
	var transitionEnd = whichTransitionEvent();
	var animationEnd = whichAnimationEvent();
	var uid = Date.now();
	var YTTemp = [];
	var videoPlayers = {};
	// Default settings
	var defaults = {
		selector: 'glightbox',
		skin: 'clean',
		closeButton: true,
		startAt: 0,
		autoplayVideos: true,
		descPosition: 'bottom',
		width: 900,
		height: 506,
		videosWidth: 960,
		videosHeight: 540,
		beforeSlideChange: null,
		afterSlideChange: null,
		beforeSlideLoad: null,
		afterSlideLoad: null,
		onOpen: null,
		onClose: null,
		loopAtEnd: false,
		touchNavigation: true,
		keyboardNavigation: true,
		closeOnOutsideClick: true,
		jwplayer: {
			api: null,
			licenseKey: null,
			params: {
				width: '100%',
				aspectratio: '16:9',
				stretching: 'uniform'
			}
		},
		vimeo: {
			api: 'https://player.vimeo.com/api/player.js',
			params: {
				api: 1,
				title: 0,
				byline: 0,
				portrait: 0
			}
		},
		youtube: {
			api: 'https://www.youtube.com/iframe_api',
			params: {
				enablejsapi: 1,
				showinfo: 0
			}
		},
		openEffect: 'zoomIn', // fade, zoom, none
		closeEffect: 'zoomOut', // fade, zoom, none
		slideEffect: 'slide', // fade, slide, zoom, none
		moreText: 'See more',
		moreLength: 60,
		slideHtml: '',
		lightboxHtml: '',
		cssEfects: {
			fade: {
				in: 'fadeIn',
				out: 'fadeOut'
			},
			zoom: {
				in: 'zoomIn',
				out: 'zoomOut'
			},
			slide: {
				in: 'slideInRight',
				out: 'slideOutLeft'
			},
			slide_back: {
				in: 'slideInLeft',
				out: 'slideOutRight'
			}
		}
	};
/* jshint multistr: true */
	// You can pass your own slide structure
	// just make sure that add the same classes so they are populated
	// title class = gslide-title
	// desc class = gslide-desc
	// prev arrow class = gnext
	// next arrow id = gprev
	// close id = gclose
	var lightboxSlideHtml = '<div class="gslide">\
		<div class="gslide-inner-content">\
		<div class="ginner-container">\
		<div class="gslide-media">\
		</div>\
		<div class="gslide-description">\
		<h4 class="gslide-title"></h4>\
		<div class="gslide-desc"></div>\
		</div>\
		</div>\
		</div>\
		</div>';
	defaults.slideHtml = lightboxSlideHtml;
	var lightboxHtml = '<div id="glightbox-body" class="glightbox-container">\
		<div class="gloader visible"></div>\
		<div class="goverlay"></div>\
		<div class="gcontainer">\
		<div id="glightbox-slider" class="gslider"></div>\
		<a class="gnext"></a>\
		<a class="gprev"></a>\
		<a class="gclose"></a>\
		</div>\
		</div>';
	defaults.lightboxHtml = lightboxHtml;
/**
	 * Merge two or more objects
	 */
	function extend() {
		var extended = {};
		var deep = false;
		var i = 0;
		var length = arguments.length;
		if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
			deep = arguments[0];
			i++;
		}
		var merge = function merge(obj) {
			for (var prop in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, prop)) {
					if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
						extended[prop] = extend(true, extended[prop], obj[prop]);
					} else {
						extended[prop] = obj[prop];
					}
				}
			}
		};
		for (; i < length; i++) {
			var obj = arguments[i];
			merge(obj);
		}
		return extended;
	}
	var utils = {
		isFunction: function isFunction(f) {
			return typeof f === 'function';
		},
		isString: function isString(s) {
			return typeof s === 'string';
		},
		isNode: function isNode(el) {
			return !!(el && el.nodeType && el.nodeType == 1);
		},
		isArray: function isArray(ar) {
			return Array.isArray(ar);
		},
		isArrayLike: function isArrayLike(ar) {
			return ar && ar.length && isFinite(ar.length);
		},
		isObject: function isObject(o) {
			var type = typeof o === 'undefined' ? 'undefined' : _typeof(o);
			return type === 'object' && o != null && !utils.isFunction(o) && !utils.isArray(o);
		},
		isNil: function isNil(o) {
			return o == null;
		},
		has: function has(obj, key) {
			return obj !== null && hasOwnProperty.call(obj, key);
		},
		size: function size(o) {
			if (utils.isObject(o)) {
				if (o.keys) {
					return o.keys().length;
				}
				var l = 0;
				for (var k in o) {
					if (utils.has(o, k)) {
						l++;
					}
				}
				return l;
			} else {
				return o.length;
			}
		},
		isNumber: function isNumber(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		}
	};
/**
	 * Each
	 *
	 * @param {mixed} node lisy, array, object
	 * @param {function} callback
	 */
	function each(collection, callback) {
		if (utils.isNode(collection) || collection === window || collection === document) {
			collection = [collection];
		}
		if (!utils.isArrayLike(collection) && !utils.isObject(collection)) {
			collection = [collection];
		}
		if (utils.size(collection) == 0) {
			return;
		}
		if (utils.isArrayLike(collection) && !utils.isObject(collection)) {
			var l = collection.length,
			i = 0;
			for (; i < l; i += 1) {
				if (callback.call(collection[i], collection[i], i, collection) === false) {
					break;
				}
			}
		} else if (utils.isObject(collection)) {
			for (var key in collection) {
				if (utils.has(collection, key)) {
					if (callback.call(collection[key], collection[key], key, collection) === false) {
						break;
					}
				}
			}
		}
	}
/**
	 * Get nde events
	 * return node events and optionally
	 * check if the node has already a specific event
	 * to avoid duplicated callbacks
	 *
	 * @param {node} node
	 * @param {string} name event name
	 * @param {object} fn callback
	 * @returns {object}
	 */
	function getNodeEvents(node) {
		var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
		var fn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
		var cache = node[uid] = node[uid] || [];
		var data = {
			all: cache,
			evt: null,
			found: null
		};
		if (name && fn && utils.size(cache) > 0) {
			each(cache, function (cl, i) {
				if (cl.eventName == name && cl.fn.toString() == fn.toString()) {
					data.found = true;
					data.evt = i;
					return false;
				}
			});
		}
		return data;
	}
/**
	 * Add Event
	 * Add an event listener
	 *
	 * @param {string} eventName
	 * @param {object} detials
	 */
	function addEvent(eventName) {
		var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
		onElement = _ref.onElement,
		withCallback = _ref.withCallback,
		_ref$avoidDuplicate = _ref.avoidDuplicate,
		avoidDuplicate = _ref$avoidDuplicate === undefined ? true : _ref$avoidDuplicate,
		_ref$once = _ref.once,
		once = _ref$once === undefined ? false : _ref$once,
		_ref$useCapture = _ref.useCapture,
		useCapture = _ref$useCapture === undefined ? false : _ref$useCapture;
		var thisArg = arguments[2];
		var element = onElement || [];
		if (utils.isString(element)) {
			element = document.querySelectorAll(element);
		}
		function handler(event) {
			if (utils.isFunction(withCallback)) {
				withCallback.call(thisArg, event, this);
			}
			if (once) {
				handler.destroy();
			}
		}
		handler.destroy = function () {
			each(element, function (el) {
				var events = getNodeEvents(el, eventName, handler);
				if (events.found) {
					events.all.splice(events.evt, 1);
				}
				if (el.removeEventListener)
					el.removeEventListener(eventName, handler, useCapture);
			});
		};
		each(element, function (el) {
			var events = getNodeEvents(el, eventName, handler);
			if (el.addEventListener && avoidDuplicate && !events.found || !avoidDuplicate) {
				el.addEventListener(eventName, handler, useCapture);
				events.all.push({
					eventName: eventName,
					fn: handler
				});
			}
		});
		return handler;
	}
/**
	 * Add element class
	 *
	 * @param {node} element
	 * @param {string} class name
	 */
	function addClass(node, name) {
		if (hasClass(node, name)) {
			return;
		}
		if (node.classList) {
			node.classList.add(name);
		} else {
			node.className += " " + name;
		}
	}
/**
	 * Remove element class
	 *
	 * @param {node} element
	 * @param {string} class name
	 */
	function removeClass(node, name) {
		var c = name.split(' ');
		if (c.length > 1) {
			each(c, function (cl) {
				removeClass(node, cl);
			});
			return;
		}
		if (node.classList) {
			node.classList.remove(name);
		} else {
			node.className = node.className.replace(name, "");
		}
	}
/**
	 * Has class
	 *
	 * @param {node} element
	 * @param {string} class name
	 */
	function hasClass(node, name) {
		return node.classList ? node.classList.contains(name) : new RegExp("(^| )" + name + "( |$)", "gi").test(node.className);
	}
/**
	 * Determine animation events
	 */
	function whichAnimationEvent() {
		var t = void 0,
		el = document.createElement("fakeelement");
		var animations = {
			animation: "animationend",
			OAnimation: "oAnimationEnd",
			MozAnimation: "animationend",
			WebkitAnimation: "webkitAnimationEnd"
		};
		for (t in animations) {
			if (el.style[t] !== undefined) {
				return animations[t];
			}
		}
	}
/**
	 * Determine transition events
	 */
	function whichTransitionEvent() {
		var t = void 0,
		el = document.createElement("fakeelement");
		var transitions = {
			transition: "transitionend",
			OTransition: "oTransitionEnd",
			MozTransition: "transitionend",
			WebkitTransition: "webkitTransitionEnd"
		};
		for (t in transitions) {
			if (el.style[t] !== undefined) {
				return transitions[t];
			}
		}
	}
/**
	 * CSS Animations
	 *
	 * @param {node} element
	 * @param {string} animation name
	 * @param {function} callback
	 */
	function animateElement(element) {
		var animation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
		var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
		if (!element || animation === '') {
			return false;
		}
		if (animation == 'none') {
			if (utils.isFunction(callback))
				callback();
			return false;
		}
		var animationNames = animation.split(' ');
		each(animationNames, function (name) {
			addClass(element, 'g' + name);
		});
		addEvent(animationEnd, {
			onElement: element,
			avoidDuplicate: false,
			once: true,
			withCallback: function withCallback(event, target) {
				each(animationNames, function (name) {
					removeClass(target, 'g' + name);
				});
				if (utils.isFunction(callback))
					callback();
			}
		});
	}
/**
	 * Create a document fragment
	 *
	 * @param {string} html code
	 */
	function createHTML(htmlStr) {
		var frag = document.createDocumentFragment(),
		temp = document.createElement('div');
		temp.innerHTML = htmlStr;
		while (temp.firstChild) {
			frag.appendChild(temp.firstChild);
		}
		return frag;
	}
/**
	 * Get the closestElement
	 *
	 * @param {node} element
	 * @param {string} class name
	 */
	function getClosest(elem, selector) {
		while (elem !== document.body) {
			elem = elem.parentElement;
			var matches = typeof elem.matches == 'function' ? elem.matches(selector) : elem.msMatchesSelector(selector);
			if (matches)
				return elem;
		}
	}
/**
	 * Show element
	 *
	 * @param {node} element
	 */
	function show(element) {
		element.style.display = 'block';
	}
/**
	 * Hide element
	 */
	function hide(element) {
		element.style.display = 'none';
	}
/**
	 * Get slide data
	 *
	 * @param {node} element
	 */
	var getSlideData = function getSlideData() {
		var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		var settings = arguments[1];
		var data = {
			href: '',
			title: '',
			description: '',
			descPosition: 'bottom',
			effect: '',
			node: element
		};
		if (utils.isObject(element) && !utils.isNode(element)) {
			return extend(data, element);
		}
		var url = '';
		var config = element.getAttribute('data-glightbox');
		var type = element.nodeName.toLowerCase();
		if (type === 'a')
			url = element.href;
		if (type === 'img')
			url = element.src;
		data.href = url;
		each(data, function (val, key) {
			if (utils.has(settings, key)) {
				data[key] = settings[key];
			}
			var nodeData = element.dataset[key];
			if (!utils.isNil(nodeData)) {
				data[key] = nodeData;
			}
		});
		var sourceType = getSourceType(url);
		data = extend(data, sourceType);
		if (!utils.isNil(config)) {
			var cleanKeys = [];
			each(data, function (v, k) {
				cleanKeys.push(';\\s?' + k);
			});
			cleanKeys = cleanKeys.join('\\s?:|');
			if (config.trim() !== '') {
				each(data, function (val, key) {
					var str = config;
					var match = '\s?' + key + '\s?:\s?(.*?)(' + cleanKeys + '\s?:|$)';
					var regex = new RegExp(match);
					var matches = str.match(regex);
					if (matches && matches.length && matches[1]) {
						var value = matches[1].trim().replace(/;\s*$/, '');
						data[key] = value;
					}
				});
			}
		} else {
			if (type == 'a') {
				var title = element.title;
				if (!utils.isNil(title) && title !== '')
					data.title = title;
			}
			if (type == 'img') {
				var alt = element.alt;
				if (!utils.isNil(alt) && alt !== '')
					data.title = alt;
			}
			var desc = element.getAttribute('data-description');
			if (!utils.isNil(desc) && desc !== '')
				data.description = desc;
		}
		var nodeDesc = element.querySelector('.glightbox-desc');
		if (nodeDesc) {
			data.description = nodeDesc.innerHTML;
		}
		data.sourcetype = data.hasOwnProperty('type') ? data.type : data.sourcetype;
		data.type = data.sourcetype;
		var defaultWith = data.sourcetype == 'video' ? settings.videosWidth : settings.width;
		var defaultHeight = data.sourcetype == 'video' ? settings.videosHeight : settings.height;
		data.width = utils.has(data, 'width') ? data.width : defaultWith;
		data.height = utils.has(data, 'height') ? data.height : defaultHeight;
		return data;
	};
/**
	 * Set slide content
	 *
	 * @param {node} slide
	 * @param {object} data
	 * @param {function} callback
	 */
	var setSlideContent = function setSlideContent() {
		var slide = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		var _this = this;
		var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
		var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
		if (hasClass(slide, 'loaded')) {
			return false;
		}
		if (utils.isFunction(this.settings.beforeSlideLoad)) {
			this.settings.beforeSlideLoad(slide, data);
		}
		var type = data.type;
		var position = data.descPosition;
		var slideMedia = slide.querySelector('.gslide-media');
		var slideTitle = slide.querySelector('.gslide-title');
		var slideText = slide.querySelector('.gslide-desc');
		var slideDesc = slide.querySelector('.gslide-description');
		var finalCallback = callback;
		if (utils.isFunction(this.settings.afterSlideLoad)) {
			finalCallback = function finalCallback() {
				if (utils.isFunction(callback)) {
					callback();
				}
				_this.settings.afterSlideLoad(slide, data);
			};
		}
		if (data.title == '' && data.description == '') {
			if (slideDesc) {
				slideDesc.parentNode.removeChild(slideDesc);
			}
		} else {
			if (slideTitle && data.title !== '') {
				slideTitle.innerHTML = data.title;
			} else {
				slideTitle.parentNode.removeChild(slideTitle);
			}
			if (slideText && data.description !== '') {
				if (isMobile && this.settings.moreLength > 0) {
					data.smallDescription = slideShortDesc(data.description, this.settings.moreLength, this.settings.moreText);
					slideText.innerHTML = data.smallDescription;
					slideDescriptionEvents.apply(this, [slideText, data]);
				} else {
					slideText.innerHTML = data.description;
				}
			} else {
				slideText.parentNode.removeChild(slideText);
			}
			addClass(slideMedia.parentNode, 'desc-' + position);
			addClass(slideDesc, 'description-' + position);
		}
		addClass(slideMedia, 'gslide-' + type);
		addClass(slide, 'loaded');
		if (type === 'video') {
			setSlideVideo.apply(this, [slide, data, finalCallback]);
			return;
		}
		if (type === 'external') {
			var iframe = createIframe(data.href, data.width, data.height, finalCallback);
			slideMedia.appendChild(iframe);
			return;
		}
		if (type === 'inline') {
			setInlineContent.apply(this, [slide, data, finalCallback]);
			return;
		}
		if (type === 'image') {
			var img = new Image();
			img.addEventListener('load', function () {
				if (utils.isFunction(finalCallback)) {
					finalCallback();
				}
			}, false);
			img.src = data.href;
			slideMedia.appendChild(img);
			return;
		}
		if (utils.isFunction(finalCallback))
			finalCallback();
	};
/**
	 * Set slide video
	 *
	 * @param {node} slide
	 * @param {object} data
	 * @param {function} callback
	 */
	function setSlideVideo(slide, data, callback) {
		var _this2 = this;
		var source = data.source;
		var video_id = 'gvideo' + data.index;
		var slideMedia = slide.querySelector('.gslide-media');
		var url = data.href;
		var protocol = location.protocol.replace(':', '');
		if (protocol == 'file') {
			protocol = 'http';
		}
		// Set vimeo videos
		if (source == 'vimeo') {
			var vimeo_id = /vimeo.*\/(\d+)/i.exec(url);
			var params = parseUrlParams(this.settings.vimeo.params);
			var video_url = protocol + '://player.vimeo.com/video/' + vimeo_id[1] + '?' + params;
			injectVideoApi(this.settings.vimeo.api);
			var finalCallback = function finalCallback() {
				waitUntil(function () {
					return typeof Vimeo !== 'undefined';
				}, function () {
					var player = new Vimeo.Player(iframe);
					videoPlayers[video_id] = player;
					if (utils.isFunction(callback)) {
						callback();
					}
				});
			};
			var iframe = createIframe(video_url, data.width, data.height, finalCallback, slideMedia);
			iframe.id = video_id;
			iframe.className = 'vimeo-video gvideo';
			if (this.settings.autoplayVideos && !isMobile) {
				iframe.className += ' wait-autoplay';
			}
		}
		// Set youtube videos
		if (source == 'youtube') {
			var youtube_params = extend(this.settings.youtube.params, {
					playerapiid: video_id
				});
			var yparams = parseUrlParams(youtube_params);
			var youtube_id = getYoutubeID(url);
			var _video_url = protocol + '://www.youtube.com/embed/' + youtube_id + '?' + yparams;
			injectVideoApi(this.settings.youtube.api);
			var _finalCallback = function _finalCallback() {
				if (!utils.isNil(YT) && YT.loaded) {
					var player = new YT.Player(_iframe);
					videoPlayers[video_id] = player;
				} else {
					YTTemp.push(_iframe);
				}
				if (utils.isFunction(callback)) {
					callback();
				}
			};
			var _iframe = createIframe(_video_url, data.width, data.height, _finalCallback, slideMedia);
			_iframe.id = video_id;
			_iframe.className = 'youtube-video gvideo';
			if (this.settings.autoplayVideos && !isMobile) {
				_iframe.className += ' wait-autoplay';
			}
		}
		if (source == 'local') {
			var _html = '<video id="' + video_id + '" ';
			_html += 'style="background:#000; width: ' + data.width + 'px; height: ' + data.height + 'px;" ';
			_html += 'preload="metadata" ';
			_html += 'x-webkit-airplay="allow" ';
			_html += 'webkit-playsinline="" ';
			_html += 'controls ';
			_html += 'class="gvideo">';
			var format = url.toLowerCase().split('.').pop();
			var sources = {
				'mp4': '',
				'ogg': '',
				'webm': ''
			};
			sources[format] = url;
			for (var key in sources) {
				if (sources.hasOwnProperty(key)) {
					var videoFile = sources[key];
					if (data.hasOwnProperty(key)) {
						videoFile = data[key];
					}
					if (videoFile !== '') {
						_html += '<source src="' + videoFile + '" type="video/' + key + '">';
					}
				}
			}
			_html += '</video>';
			var video = createHTML(_html);
			slideMedia.appendChild(video);
			var vnode = document.getElementById(video_id);
			if (this.settings.jwplayer !== null && this.settings.jwplayer.api !== null) {
				var jwplayerConfig = this.settings.jwplayer;
				var jwplayerApi = this.settings.jwplayer.api;
				if (!jwplayerApi) {
					console.warn('Missing jwplayer api file');
					if (utils.isFunction(callback))
						callback();
					return false;
				}
				injectVideoApi(jwplayerApi, function () {
					var jwconfig = extend(_this2.settings.jwplayer.params, {
							width: data.width + 'px',
							height: data.height + 'px',
							file: url
						});
					jwplayer.key = _this2.settings.jwplayer.licenseKey;
					var player = jwplayer(video_id);
					player.setup(jwconfig);
					videoPlayers[video_id] = player;
					player.on('ready', function () {
						vnode = slideMedia.querySelector('.jw-video');
						addClass(vnode, 'gvideo');
						vnode.id = video_id;
						if (utils.isFunction(callback))
							callback();
					});
				});
			} else {
				addClass(vnode, 'html5-video');
				videoPlayers[video_id] = vnode;
				if (utils.isFunction(callback))
					callback();
			}
		}
	}
/**
	 * Create an iframe element
	 *
	 * @param {string} url
	 * @param {numeric} width
	 * @param {numeric} height
	 * @param {function} callback
	 */
	function createIframe(url, width, height, callback, appendTo) {
		var iframe = document.createElement('iframe');
		var winWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		iframe.className = 'vimeo-video gvideo';
		iframe.src = url;
		if (isMobile && winWidth < 767) {
			iframe.style.height = '';
		} else {
			iframe.style.height = height + 'px';
		}
		iframe.style.width = width + 'px';
		iframe.setAttribute('allowFullScreen', '');
		iframe.onload = function () {
			addClass(iframe, 'iframe-ready');
			if (utils.isFunction(callback)) {
				callback();
			}
		};
		if (appendTo) {
			appendTo.appendChild(iframe);
		}
		return iframe;
	}
/**
	 * Get youtube ID
	 *
	 * @param {string} url
	 * @returns {string} video id
	 */
	function getYoutubeID(url) {
		var videoID = '';
		url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
		if (url[2] !== undefined) {
			videoID = url[2].split(/[^0-9a-z_\-]/i);
			videoID = videoID[0];
		} else {
			videoID = url;
		}
		return videoID;
	}
/**
	 * Inject videos api
	 * used for youtube, vimeo and jwplayer
	 *
	 * @param {string} url
	 * @param {function} callback
	 */
	function injectVideoApi(url, callback) {
		if (utils.isNil(url)) {
			console.error('Inject videos api error');
			return;
		}
		var found = document.querySelectorAll('script[src="' + url + '"]');
		if (utils.isNil(found) || found.length == 0) {
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = url;
			script.onload = function () {
				if (utils.isFunction(callback))
					callback();
			};
			document.body.appendChild(script);
			return false;
		}
		if (utils.isFunction(callback))
			callback();
	}
/**
	 * Handle youtube Api
	 * This is a simple fix, when the video
	 * is ready sometimes the youtube api is still
	 * loading so we can not autoplay or pause
	 * we need to listen onYouTubeIframeAPIReady and
	 * register the videos if required
	 */
	function youtubeApiHandle() {
		for (var i = 0; i < YTTemp.length; i++) {
			var iframe = YTTemp[i];
			var player = new YT.Player(iframe);
			videoPlayers[iframe.id] = player;
		}
	}
	if (typeof window.onYouTubeIframeAPIReady !== 'undefined') {
		window.onYouTubeIframeAPIReady = function () {
			window.onYouTubeIframeAPIReady();
			youtubeApiHandle();
		};
	} else {
		window.onYouTubeIframeAPIReady = youtubeApiHandle;
	}
/**
	 * Wait until
	 * wait until all the validations
	 * are passed
	 *
	 * @param {function} check
	 * @param {function} onComplete
	 * @param {numeric} delay
	 * @param {numeric} timeout
	 */
	function waitUntil(check, onComplete, delay, timeout) {
		if (check()) {
			onComplete();
			return;
		}
		if (!delay)
			delay = 100;
		var timeoutPointer;
		var intervalPointer = setInterval(function () {
				if (!check())
					return;
				clearInterval(intervalPointer);
				if (timeoutPointer)
					clearTimeout(timeoutPointer);
				onComplete();
			}, delay);
		if (timeout)
			timeoutPointer = setTimeout(function () {
					clearInterval(intervalPointer);
				}, timeout);
	}
/**
	 * Parse url params
	 * convert an object in to a
	 * url query string parameters
	 *
	 * @param {object} params
	 */
	function parseUrlParams(params) {
		var qs = '';
		var i = 0;
		each(params, function (val, key) {
			if (i > 0) {
				qs += '&amp;';
			}
			qs += key + '=' + val;
			i += 1;
		});
		return qs;
	}
/**
	 * Set slide inline content
	 * we'll extend this to make http
	 * requests using the fetch api
	 * but for now we keep it simple
	 *
	 * @param {node} slide
	 * @param {object} data
	 * @param {function} callback
	 */
	function setInlineContent(slide, data, callback) {
		var slideMedia = slide.querySelector('.gslide-media');
		var div = document.getElementById(data.inlined.replace('#', ''));
		if (div) {
			var cloned = div.cloneNode(true);
			cloned.style.height = data.height + 'px';
			cloned.style.maxWidth = data.width + 'px';
			addClass(cloned, 'ginlined-content');
			slideMedia.appendChild(cloned);
			if (utils.isFunction(callback)) {
				callback();
			}
			return;
		}
	}
/**
	 * Get source type
	 * gte the source type of a url
	 *
	 * @param {string} url
	 */
	var getSourceType = function getSourceType(url) {
		var origin = url;
		url = url.toLowerCase();
		var data = {};
		if (url.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
			data.sourcetype = 'image';
			return data;
		}
		if (url.match(/(youtube\.com|youtube-nocookie\.com)\/watch\?v=([a-zA-Z0-9\-_]+)/) || url.match(/youtu\.be\/([a-zA-Z0-9\-_]+)/)) {
			data.sourcetype = 'video';
			data.source = 'youtube';
			return data;
		}
		if (url.match(/vimeo\.com\/([0-9]*)/)) {
			data.sourcetype = 'video';
			data.source = 'vimeo';
			return data;
		}
		if (url.match(/\.(mp4|ogg|webm)$/) !== null) {
			data.sourcetype = 'video';
			data.source = 'local';
			return data;
		}
		// Check if inline content
		if (url.indexOf("#") > -1) {
			var hash = origin.split('#').pop();
			if (hash.trim() !== '') {
				data.sourcetype = 'inline';
				data.source = url;
				data.inlined = '#' + hash;
				return data;
			}
		}
		// Ajax
		if (url.includes("gajax=true")) {
			data.sourcetype = 'ajax';
			data.source = url;
		}
		// Any other url
		data.sourcetype = 'external';
		data.source = url;
		return data;
	};
/**
	 * Desktop keyboard navigation
	 */
	function keyboardNavigation() {
		var _this3 = this;
		if (this.events.hasOwnProperty('keyboard')) {
			return false;
		}
		this.events['keyboard'] = addEvent('keydown', {
				onElement: window,
				withCallback: function withCallback(event, target) {
					event = event || window.event;
					var key = event.keyCode;
					if (key == 39)
						_this3.nextSlide();
					if (key == 37)
						_this3.prevSlide();
					if (key == 27)
						_this3.close();
				}
			});
	}
/**
	 * Touch navigation
	 */
	function touchNavigation() {
		var _this4 = this;
		if (this.events.hasOwnProperty('touchStart')) {
			return false;
		}
		var index = void 0,
		hDistance = void 0,
		vDistance = void 0,
		hDistanceLast = void 0,
		vDistanceLast = void 0,
		hDistancePercent = void 0,
		vSwipe = false,
		hSwipe = false,
		hSwipMinDistance = 0,
		vSwipMinDistance = 0,
		doingPinch = false,
		pinchBigger = false,
		startCoords = {},
		endCoords = {},
		slider = this.slidesContainer,
		activeSlide = null,
		xDown = 0,
		yDown = 0,
		activeSlideImage = null,
		activeSlideMedia = null,
		activeSlideDesc = null;
		var winWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		var winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
		this.events['doctouchmove'] = addEvent('touchmove', {
				onElement: document,
				withCallback: function withCallback(e, target) {
					if (hasClass(body, 'gdesc-open')) {
						e.preventDefault();
						return false;
					}
				}
			});
		this.events['touchStart'] = addEvent('touchstart', {
				onElement: body,
				withCallback: function withCallback(e, target) {
					if (hasClass(body, 'gdesc-open')) {
						return;
					}
					addClass(body, 'touching');
					activeSlide = _this4.getActiveSlide();
					activeSlideImage = activeSlide.querySelector('.gslide-image');
					activeSlideMedia = activeSlide.querySelector('.gslide-media');
					activeSlideDesc = activeSlide.querySelector('.gslide-description');
					index = _this4.index;
					endCoords = e.targetTouches[0];
					startCoords.pageX = e.targetTouches[0].pageX;
					startCoords.pageY = e.targetTouches[0].pageY;
					xDown = e.targetTouches[0].clientX;
					yDown = e.targetTouches[0].clientY;
				}
			});
		this.events['gestureStart'] = addEvent('gesturestart', {
				onElement: body,
				withCallback: function withCallback(e, target) {
					if (activeSlideImage) {
						e.preventDefault();
						doingPinch = true;
					}
				}
			});
		this.events['gestureChange'] = addEvent('gesturechange', {
				onElement: body,
				withCallback: function withCallback(e, target) {
					e.preventDefault();
					slideCSSTransform(activeSlideImage, 'scale(' + e.scale + ')');
				}
			});
		this.events['gesturEend'] = addEvent('gestureend', {
				onElement: body,
				withCallback: function withCallback(e, target) {
					doingPinch = false;
					if (e.scale < 1) {
						pinchBigger = false;
						slideCSSTransform(activeSlideImage, 'scale(1)');
					} else {
						pinchBigger = true;
					}
				}
			});
		this.events['touchMove'] = addEvent('touchmove', {
				onElement: body,
				withCallback: function withCallback(e, target) {
					if (!hasClass(body, 'touching')) {
						return;
					}
					if (hasClass(body, 'gdesc-open') || doingPinch || pinchBigger) {
						return;
					}
					e.preventDefault();
					endCoords = e.targetTouches[0];
					var slideHeight = activeSlide.querySelector('.gslide-inner-content').offsetHeight;
					var slideWidth = activeSlide.querySelector('.gslide-inner-content').offsetWidth;
					var xUp = e.targetTouches[0].clientX;
					var yUp = e.targetTouches[0].clientY;
					var xDiff = xDown - xUp;
					var yDiff = yDown - yUp;
					if (Math.abs(xDiff) > Math.abs(yDiff)) {
						/*most significant*/
						vSwipe = false;
						hSwipe = true;
					} else {
						hSwipe = false;
						vSwipe = true;
					}
					if (vSwipe) {
						vDistanceLast = vDistance;
						vDistance = endCoords.pageY - startCoords.pageY;
						if (Math.abs(vDistance) >= vSwipMinDistance || vSwipe) {
							var opacity = 0.75 - Math.abs(vDistance) / slideHeight;
							activeSlideMedia.style.opacity = opacity;
							if (activeSlideDesc) {
								activeSlideDesc.style.opacity = opacity;
							}
							slideCSSTransform(activeSlideMedia, 'translate3d(0, ' + vDistance + 'px, 0)');
						}
						return;
					}
					hDistanceLast = hDistance;
					hDistance = endCoords.pageX - startCoords.pageX;
					hDistancePercent = hDistance * 100 / winWidth;
					if (hSwipe) {
						if (_this4.index + 1 == _this4.elements.length && hDistance < -60) {
							resetSlideMove(activeSlide);
							return false;
						}
						if (_this4.index - 1 < 0 && hDistance > 60) {
							resetSlideMove(activeSlide);
							return false;
						}
						var _opacity = 0.75 - Math.abs(hDistance) / slideWidth;
						activeSlideMedia.style.opacity = _opacity;
						if (activeSlideDesc) {
							activeSlideDesc.style.opacity = _opacity;
						}
						slideCSSTransform(activeSlideMedia, 'translate3d(' + hDistancePercent + '%, 0, 0)');
					}
				}
			});
		this.events['touchEnd'] = addEvent('touchend', {
				onElement: body,
				withCallback: function withCallback(e, target) {
					vDistance = endCoords.pageY - startCoords.pageY;
					hDistance = endCoords.pageX - startCoords.pageX;
					hDistancePercent = hDistance * 100 / winWidth;
					removeClass(body, 'touching');
					var slideHeight = activeSlide.querySelector('.gslide-inner-content').offsetHeight;
					var slideWidth = activeSlide.querySelector('.gslide-inner-content').offsetWidth;
					// Swipe to top/bottom to close
					if (vSwipe) {
						var onEnd = slideHeight / 2;
						vSwipe = false;
						if (Math.abs(vDistance) >= onEnd) {
							_this4.close();
							return;
						}
						resetSlideMove(activeSlide);
						return;
					}
					if (hSwipe) {
						hSwipe = false;
						var where = 'prev';
						var asideExist = true;
						if (hDistance < 0) {
							where = 'next';
							hDistance = Math.abs(hDistance);
						}
						if (where == 'prev' && _this4.index - 1 < 0) {
							asideExist = false;
						}
						if (where == 'next' && _this4.index + 1 >= _this4.elements.length) {
							asideExist = false;
						}
						if (asideExist && hDistance >= slideWidth / 2 - 90) {
							if (where == 'next') {
								_this4.nextSlide();
							} else {
								_this4.prevSlide();
							}
							return;
						}
						resetSlideMove(activeSlide);
					}
				}
			});
	}
	function slideCSSTransform(slide) {
		var translate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
		if (translate == '') {
			slide.style.webkitTransform = '';
			slide.style.MozTransform = '';
			slide.style.msTransform = '';
			slide.style.OTransform = '';
			slide.style.transform = '';
			return false;
		}
		slide.style.webkitTransform = translate;
		slide.style.MozTransform = translate;
		slide.style.msTransform = translate;
		slide.style.OTransform = translate;
		slide.style.transform = translate;
	}
	function resetSlideMove(slide) {
		var media = slide.querySelector('.gslide-media');
		var desc = slide.querySelector('.gslide-description');
		addClass(media, 'greset');
		slideCSSTransform(media, 'translate3d(0, 0, 0)');
		var animation = addEvent(transitionEnd, {
				onElement: media,
				once: true,
				withCallback: function withCallback(event, target) {
					removeClass(media, 'greset');
				}
			});
		media.style.opacity = '';
		if (desc) {
			desc.style.opacity = '';
		}
	}
	function slideShortDesc(string) {
		var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;
		var wordBoundary = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
		var useWordBoundary = wordBoundary;
		string = string.trim();
		if (string.length <= n) {
			return string;
		}
		var subString = string.substr(0, n - 1);
		if (!useWordBoundary) {
			return subString;
		}
		return subString + '... <a href="#" class="desc-more">' + wordBoundary + '</a>';
	}
	function slideDescriptionEvents(desc, data) {
		var moreLink = desc.querySelector('.desc-more');
		if (!moreLink) {
			return false;
		}
		addEvent('click', {
			onElement: moreLink,
			withCallback: function withCallback(event, target) {
				event.preventDefault();
				var desc = getClosest(target, '.gslide-desc');
				if (!desc) {
					return false;
				}
				desc.innerHTML = data.description;
				addClass(body, 'gdesc-open');
				var shortEvent = addEvent('click', {
						onElement: [body, getClosest(desc, '.gslide-description')],
						withCallback: function withCallback(event, target) {
							if (event.target.nodeName.toLowerCase() !== 'a') {
								removeClass(body, 'gdesc-open');
								addClass(body, 'gdesc-closed');
								desc.innerHTML = data.smallDescription;
								slideDescriptionEvents(desc, data);
								setTimeout(function () {
									removeClass(body, 'gdesc-closed');
								}, 400);
								shortEvent.destroy();
							}
						}
					});
			}
		});
	}
/**
	 * GLightbox Class
	 * Class and public methods
	 */
	var GlightboxInit = function () {
		function GlightboxInit(options) {
			_classCallCheck(this, GlightboxInit);
			this.settings = extend(defaults, options || {});
			this.effectsClasses = this.getAnimationClasses();
		}
		_createClass(GlightboxInit, [{
					key: 'init',
					value: function init() {
						var _this5 = this;
						this.baseEvents = addEvent('click', {
								onElement: '.' + this.settings.selector,
								withCallback: function withCallback(e, target) {
									e.preventDefault();
									_this5.open(target);
								}
							});
					}
				}, {
					key: 'open',
					value: function open() {
						var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
						this.elements = this.getElements(element);
						if (this.elements.length == 0)
							return false;
						this.activeSlide = null;
						this.prevActiveSlideIndex = null;
						this.prevActiveSlide = null;
						var index = this.settings.startAt;
						if (element) {
							// if element passed, get the index
							index = this.elements.indexOf(element);
							if (index < 0) {
								index = 0;
							}
						}
						this.build();
						animateElement(this.overlay, this.settings.openEffect == 'none' ? 'none' : this.settings.cssEfects.fade.in);
						var bodyWidth = body.offsetWidth;
						body.style.width = bodyWidth + 'px';
						addClass(body, 'glightbox-open');
						addClass(html, 'glightbox-open');
						if (isMobile) {
							addClass(html, 'glightbox-mobile');
							this.settings.slideEffect = 'slide';
						}
						this.showSlide(index, true);
						if (this.elements.length == 1) {
							hide(this.prevButton);
							hide(this.nextButton);
						} else {
							show(this.prevButton);
							show(this.nextButton);
						}
						this.lightboxOpen = true;
						if (utils.isFunction(this.settings.onOpen)) {
							this.settings.onOpen();
						}
						if (isMobile && isTouch && this.settings.touchNavigation) {
							touchNavigation.apply(this);
							return false;
						}
						if (this.settings.keyboardNavigation) {
							keyboardNavigation.apply(this);
						}
					}
				}, {
					key: 'showSlide',
					value: function showSlide() {
						var _this6 = this;
						var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
						var first = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
						show(this.loader);
						this.index = index;
						var current = this.slidesContainer.querySelector('.current');
						if (current) {
							removeClass(current, 'current');
						}
						// hide prev slide
						this.slideAnimateOut();
						var slide = this.slidesContainer.querySelectorAll('.gslide')[index];
						show(this.slidesContainer);
						// Check if slide's content is alreay loaded
						if (hasClass(slide, 'loaded')) {
							this.slideAnimateIn(slide, first);
							hide(this.loader);
						} else {
							// If not loaded add the slide content
							show(this.loader);
							// console.log("a", this.settings);
							var slide_data = getSlideData(this.elements[index], this.settings);
							// console.log(slide_data);
							slide_data.index = index;
							setSlideContent.apply(this, [slide, slide_data, function () {
										hide(_this6.loader);
										_this6.slideAnimateIn(slide, first);
									}
								]);
						}
						// Preload subsequent slides
						this.preloadSlide(index + 1);
						this.preloadSlide(index - 1);
						// Handle navigation arrows
						removeClass(this.nextButton, 'disabled');
						removeClass(this.prevButton, 'disabled');
						if (index === 0) {
							addClass(this.prevButton, 'disabled');
						} else if (index === this.elements.length - 1 && this.settings.loopAtEnd !== true) {
							addClass(this.nextButton, 'disabled');
						}
						this.activeSlide = slide;
					}
				}, {
					key: 'preloadSlide',
					value: function preloadSlide(index) {
						var _this7 = this;
						// Verify slide index, it can not be lower than 0
						// and it can not be greater than the total elements
						if (index < 0 || index > this.elements.length)
							return false;
						if (utils.isNil(this.elements[index]))
							return false;
						var slide = this.slidesContainer.querySelectorAll('.gslide')[index];
						if (hasClass(slide, 'loaded')) {
							return false;
						}
						var slide_data = getSlideData(this.elements[index], this.settings);
						slide_data.index = index;
						var type = slide_data.sourcetype;
						if (type == 'video' || type == 'external') {
							setTimeout(function () {
								setSlideContent.apply(_this7, [slide, slide_data]);
							}, 200);
						} else {
							setSlideContent.apply(this, [slide, slide_data]);
						}
					}
				}, {
					key: 'prevSlide',
					value: function prevSlide() {
						var prev = this.index - 1;
						if (prev < 0) {
							return false;
						}
						this.goToSlide(prev);
					}
				}, {
					key: 'nextSlide',
					value: function nextSlide() {
						var next = this.index + 1;
						if (next > this.elements.length)
							return false;
						this.goToSlide(next);
					}
				}, {
					key: 'goToSlide',
					value: function goToSlide() {
						var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
						if (index > -1) {
							this.prevActiveSlide = this.activeSlide;
							this.prevActiveSlideIndex = this.index;
							if (index < this.elements.length) {
								this.showSlide(index);
							} else {
								if (this.settings.loopAtEnd === true) {
									index = 0;
									this.showSlide(index);
								}
							}
						}
					}
				}, {
					key: 'slideAnimateIn',
					value: function slideAnimateIn(slide, first) {
						var _this8 = this;
						var slideMedia = slide.querySelector('.gslide-media');
						var slideDesc = slide.querySelector('.gslide-description');
						var prevData = {
							index: this.prevActiveSlideIndex,
							slide: this.prevActiveSlide
						};
						var nextData = {
							index: this.index,
							slide: this.activeSlide
						};
						if (slideMedia.offsetWidth > 0 && slideDesc) {
							hide(slideDesc);
							slide.querySelector('.ginner-container').style.maxWidth = slideMedia.offsetWidth + 'px';
							slideDesc.style.display = '';
						}
						removeClass(slide, this.effectsClasses);
						if (first) {
							animateElement(slide, this.settings.openEffect, function () {
								if (!isMobile && _this8.settings.autoplayVideos) {
									_this8.playSlideVideo(slide);
								}
								if (utils.isFunction(_this8.settings.afterSlideChange)) {
									_this8.settings.afterSlideChange.apply(_this8, [prevData, nextData]);
								}
							});
						} else {
							var effect_name = this.settings.slideEffect;
							var animIn = effect_name !== 'none' ? this.settings.cssEfects[effect_name].in : effect_name;
							if (this.prevActiveSlideIndex > this.index) {
								if (this.settings.slideEffect == 'slide') {
									animIn = this.settings.cssEfects.slide_back.in;
								}
							}
							animateElement(slide, animIn, function () {
								if (!isMobile && _this8.settings.autoplayVideos) {
									_this8.playSlideVideo(slide);
								}
								if (utils.isFunction(_this8.settings.afterSlideChange)) {
									_this8.settings.afterSlideChange.apply(_this8, [prevData, nextData]);
								}
							});
						}
						addClass(slide, 'current');
					}
				}, {
					key: 'slideAnimateOut',
					value: function slideAnimateOut() {
						if (!this.prevActiveSlide) {
							return false;
						}
						var prevSlide = this.prevActiveSlide;
						removeClass(prevSlide, this.effectsClasses);
						addClass(prevSlide, 'prev');
						var animation = this.settings.slideEffect;
						var animOut = animation !== 'none' ? this.settings.cssEfects[animation].out : animation;
						this.stopSlideVideo(prevSlide);
						if (utils.isFunction(this.settings.beforeSlideChange)) {
							this.settings.beforeSlideChange.apply(this, [{
										index: this.prevActiveSlideIndex,
										slide: this.prevActiveSlide
									}, {
										index: this.index,
										slide: this.activeSlide
									}
								]);
						}
						if (this.prevActiveSlideIndex > this.index && this.settings.slideEffect == 'slide') {
							// going back
							animOut = this.settings.cssEfects.slide_back.out;
						}
						animateElement(prevSlide, animOut, function () {
							var media = prevSlide.querySelector('.gslide-media');
							var desc = prevSlide.querySelector('.gslide-description');
							media.style.transform = '';
							removeClass(media, 'greset');
							media.style.opacity = '';
							if (desc) {
								desc.style.opacity = '';
							}
							removeClass(prevSlide, 'prev');
						});
					}
				}, {
					key: 'stopSlideVideo',
					value: function stopSlideVideo(slide) {
						if (utils.isNumber(slide)) {
							slide = this.slidesContainer.querySelectorAll('.gslide')[slide];
						}
						var slideVideo = slide ? slide.querySelector('.gvideo') : null;
						if (!slideVideo) {
							return false;
						}
						var videoID = slideVideo.id;
						if (videoPlayers && videoPlayers.hasOwnProperty(videoID)) {
							var player = videoPlayers[videoID];
							if (hasClass(slideVideo, 'vimeo-video')) {
								player.pause();
							}
							if (hasClass(slideVideo, 'youtube-video')) {
								player.pauseVideo();
							}
							if (hasClass(slideVideo, 'jw-video')) {
								player.pause(true);
							}
							if (hasClass(slideVideo, 'html5-video')) {
								player.pause();
							}
						}
					}
				}, {
					key: 'playSlideVideo',
					value: function playSlideVideo(slide) {
						if (utils.isNumber(slide)) {
							slide = this.slidesContainer.querySelectorAll('.gslide')[slide];
						}
						var slideVideo = slide.querySelector('.gvideo');
						if (!slideVideo) {
							return false;
						}
						var videoID = slideVideo.id;
						if (videoPlayers && videoPlayers.hasOwnProperty(videoID)) {
							var player = videoPlayers[videoID];
							if (hasClass(slideVideo, 'vimeo-video')) {
								player.play();
							}
							if (hasClass(slideVideo, 'youtube-video')) {
								player.playVideo();
							}
							if (hasClass(slideVideo, 'jw-video')) {
								player.play();
							}
							if (hasClass(slideVideo, 'html5-video')) {
								player.play();
							}
							setTimeout(function () {
								removeClass(slideVideo, 'wait-autoplay');
							}, 300);
							return false;
						}
					}
				}, {
					key: 'setElements',
					value: function setElements(elements) {
						this.settings.elements = elements;
					}
				}, {
					key: 'getElements',
					value: function getElements() {
						var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
						this.elements = [];
						if (!utils.isNil(this.settings.elements) && utils.isArray(this.settings.elements)) {
							return this.settings.elements;
						}
						var nodes = false;
						if (element !== null) {
							var gallery = element.getAttribute('data-gallery');
							if (gallery && gallery !== '') {
								nodes = document.querySelectorAll('[data-gallery="' + gallery + '"]');
							}
						}
						if (nodes == false) {
							nodes = document.querySelectorAll('.' + this.settings.selector);
						}
						nodes = Array.prototype.slice.call(nodes);
						return nodes;
					}
				}, {
					key: 'getActiveSlide',
					value: function getActiveSlide() {
						return this.slidesContainer.querySelectorAll('.gslide')[this.index];
					}
				}, {
					key: 'getActiveSlideIndex',
					value: function getActiveSlideIndex() {
						return this.index;
					}
				}, {
					key: 'getAnimationClasses',
					value: function getAnimationClasses() {
						var effects = [];
						for (var key in this.settings.cssEfects) {
							if (this.settings.cssEfects.hasOwnProperty(key)) {
								var effect = this.settings.cssEfects[key];
								effects.push('g' + effect.in);
								effects.push('g' + effect.out);
							}
						}
						return effects.join(' ');
					}
				}, {
					key: 'build',
					value: function build() {
						var _this9 = this;
						if (this.built) {
							return false;
						}
						var lightbox_html = createHTML(this.settings.lightboxHtml);
						document.body.appendChild(lightbox_html);
						var modal = document.getElementById('glightbox-body');
						this.modal = modal;
						var closeButton = modal.querySelector('.gclose');
						this.prevButton = modal.querySelector('.gprev');
						this.nextButton = modal.querySelector('.gnext');
						this.overlay = modal.querySelector('.goverlay');
						this.loader = modal.querySelector('.gloader');
						this.slidesContainer = document.getElementById('glightbox-slider');
						this.events = {};
						addClass(this.modal, 'glightbox-' + this.settings.skin);
						if (this.settings.closeButton && closeButton) {
							this.events['close'] = addEvent('click', {
									onElement: closeButton,
									withCallback: function withCallback(e, target) {
										e.preventDefault();
										_this9.close();
									}
								});
						}
						if (closeButton && !this.settings.closeButton) {
							closeButton.parentNode.removeChild(closeButton);
						}
						if (this.nextButton) {
							this.events['next'] = addEvent('click', {
									onElement: this.nextButton,
									withCallback: function withCallback(e, target) {
										e.preventDefault();
										_this9.nextSlide();
									}
								});
						}
						if (this.prevButton) {
							this.events['prev'] = addEvent('click', {
									onElement: this.prevButton,
									withCallback: function withCallback(e, target) {
										e.preventDefault();
										_this9.prevSlide();
									}
								});
						}
						if (this.settings.closeOnOutsideClick) {
							this.events['outClose'] = addEvent('click', {
									onElement: modal,
									withCallback: function withCallback(e, target) {
										if (!getClosest(e.target, '.ginner-container')) {
											if (!hasClass(e.target, 'gnext') && !hasClass(e.target, 'gprev')) {
												_this9.close();
											}
										}
									}
								});
						}
						each(this.elements, function () {
							var slide = createHTML(_this9.settings.slideHtml);
							_this9.slidesContainer.appendChild(slide);
						});
						if (isTouch) {
							addClass(html, 'glightbox-touch');
						}
						this.built = true;
					}
				}, {
					key: 'reload',
					value: function reload() {
						this.init();
					}
				}, {
					key: 'close',
					value: function close() {
						var _this10 = this;
						if (this.closing) {
							return false;
						}
						this.closing = true;
						this.stopSlideVideo(this.activeSlide);
						addClass(this.modal, 'glightbox-closing');
						animateElement(this.overlay, this.settings.openEffect == 'none' ? 'none' : this.settings.cssEfects.fade.out);
						animateElement(this.activeSlide, this.settings.closeEffect, function () {
							_this10.activeSlide = null;
							_this10.prevActiveSlideIndex = null;
							_this10.prevActiveSlide = null;
							_this10.built = false;
							if (_this10.events) {
								for (var key in _this10.events) {
									if (_this10.events.hasOwnProperty(key)) {
										_this10.events[key].destroy();
									}
								}
							}
							removeClass(body, 'glightbox-open');
							removeClass(html, 'glightbox-open');
							removeClass(body, 'touching');
							removeClass(body, 'gdesc-open');
							body.style.width = '';
							_this10.modal.parentNode.removeChild(_this10.modal);
							if (utils.isFunction(_this10.settings.onClose)) {
								_this10.settings.onClose();
							}
							_this10.closing = null;
						});
					}
				}, {
					key: 'destroy',
					value: function destroy() {
						this.close();
						this.baseEvents.destroy();
					}
				}
			]);
		return GlightboxInit;
	}
	();
	module.exports = function () {
		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
		var instance = new GlightboxInit(options);
		instance.init();
		return instance;
	};
/*jshint validthis: false */
});
/*jshint +W069 */

/*jshint esnext: false */
