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

/*global $readMoreJS, ActiveXObject, console, DISQUS, doesFontExist,
EventEmitter, hljs, IframeLightbox, imgLightbox, instgrm, JsonHashRouter,
loadJsCss, Macy, Minigrid, Mustache, Promise, QRCode, require, ripple, t,
twttr, unescape, VK, WheelIndicator, Ya*/

/*property console, join, split */

/*!
 * safe way to handle console.log
 * @see {@link https://github.com/paulmillr/console-polyfill}
 */
(function(root) {
	"use strict";

	if (!root.console) {
		root.console = {};
	}

	var con = root.console;
	var prop;
	var method;

	var dummy = function dummy() {};

	var properties = ["memory"];
	var methods = [
		"assert,clear,count,debug,dir,dirxml,error,exception,group,",
		"groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,",
		"show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn"
	];
	methods.join("").split(",");

	for (; (prop = properties.pop()); ) {
		if (!con[prop]) {
			con[prop] = {};
		}
	}

	for (; (method = methods.pop()); ) {
		if (!con[method]) {
			con[method] = dummy;
		}
	}

	prop = method = dummy = properties = methods = null;
})("undefined" !== typeof window ? window : this);
/*!
 * json based hash routing
 * with loading external html into element
 */

/*global ActiveXObject, console */

(function(root, document) {
	"use strict";

	var JsonHashRouter = (function() {
		return function(jsonUrl, renderId, settings) {
			var options = settings || {};
			options.jsonHomePropName = options.jsonHomePropName || "home";
			options.jsonNotfoundPropName =
				options.jsonNotfoundPropName || "notfound";
			options.jsonHashesPropName = options.jsonHashesPropName || "hashes";
			options.jsonHrefPropName = options.jsonHrefPropName || "href";
			options.jsonUrlPropName = options.jsonUrlPropName || "url";
			options.jsonTitlePropName = options.jsonTitlePropName || "title";
			var docElem = document.documentElement || "";
			var docBody = document.body || "";
			var appendChild = "appendChild";
			var classList = "classList";
			var cloneNode = "cloneNode";
			var createContextualFragment = "createContextualFragment";
			var createDocumentFragment = "createDocumentFragment";
			var createRange = "createRange";
			var getElementById = "getElementById";
			var innerHTML = "innerHTML";
			var parentNode = "parentNode";
			var replaceChild = "replaceChild";
			var _addEventListener = "addEventListener";
			var _length = "length";
			var handleRoutesWindowIsBindedClass =
				"handle-routes-window--is-binded";

			var insertExternalHTML = function insertExternalHTML(
				id,
				url,
				callback
			) {
				var container =
					document[getElementById](id.replace(/^#/, "")) || "";

				var arrange = function arrange() {
					var x = root.XMLHttpRequest
						? new XMLHttpRequest()
						: new ActiveXObject("Microsoft.XMLHTTP");
					x.overrideMimeType("text/html;charset=utf-8");
					x.open("GET", url, !0);
					x.withCredentials = !1;

					x.onreadystatechange = function() {
						var cb = function cb() {
							return (
								callback &&
								"function" === typeof callback &&
								callback()
							);
						};

						if (x.status === 404 || x.status === 0) {
							console.log(
								"Error XMLHttpRequest-ing file",
								x.status
							);
						} else if (
							x.readyState === 4 &&
							x.status === 200 &&
							x.responseText
						) {
							var frag = x.responseText;

							try {
								var clonedContainer = container[cloneNode](
									false
								);

								if (document[createRange]) {
									var rg = document[createRange]();
									rg.selectNode(docBody);
									var df = rg[createContextualFragment](frag);
									clonedContainer[appendChild](df);
									return (
										container[parentNode]
											? container[parentNode][
													replaceChild
											  ](clonedContainer, container)
											: (container[innerHTML] = frag),
										cb()
									);
								} else {
									clonedContainer[innerHTML] = frag;
									return (
										container[parentNode]
											? container[parentNode][
													replaceChild
											  ](
													document[
														createDocumentFragment
													][appendChild](
														clonedContainer
													),
													container
											  )
											: (container[innerHTML] = frag),
										cb()
									);
								}
							} catch (e) {
								console.log(e);
							}

							return;
						}
					};

					x.send(null);
				};

				if (container) {
					arrange();
				}
			};

			var loadUnparsedJSON = function loadUnparsedJSON(url, callback) {
				var cb = function cb(string) {
					return (
						callback &&
						"function" === typeof callback &&
						callback(string)
					);
				};

				var x = root.XMLHttpRequest
					? new XMLHttpRequest()
					: new ActiveXObject("Microsoft.XMLHTTP");
				x.overrideMimeType("application/json;charset=utf-8");
				x.open("GET", url, !0);
				x.withCredentials = !1;

				x.onreadystatechange = function() {
					if (x.status === 404 || x.status === 0) {
						console.log("Error XMLHttpRequest-ing file", x.status);
					} else if (
						x.readyState === 4 &&
						x.status === 200 &&
						x.responseText
					) {
						cb(x.responseText);
					}
				};

				x.send(null);
			};

			var isValidId = function isValidId(a, full) {
				return full
					? /^\#[A-Za-z][-A-Za-z0-9_:.]*$/.test(a)
						? true
						: false
					: /^[A-Za-z][-A-Za-z0-9_:.]*$/.test(a)
					? true
					: false;
			};

			var findPos = function findPos(a) {
				a = a.getBoundingClientRect();
				return {
					top: Math.round(
						a.top +
							(root.pageYOffset ||
								docElem.scrollTop ||
								docBody.scrollTop) -
							(docElem.clientTop || docBody.clientTop || 0)
					),
					left: Math.round(
						a.left +
							(root.pageXOffset ||
								docElem.scrollLeft ||
								docBody.scrollLeft) -
							(docElem.clientLeft || docBody.clientLeft || 0)
					)
				};
			};

			var processJsonResponse = function processJsonResponse(
				jsonResponse
			) {
				var jsonObj;

				try {
					jsonObj = JSON.parse(jsonResponse);

					if (!jsonObj[options.jsonHashesPropName]) {
						throw new Error(
							"incomplete JSON data: no " +
								options.jsonHashesPropName
						);
					} else if (!jsonObj[options.jsonHomePropName]) {
						throw new Error(
							"incomplete JSON data: no " +
								options.jsonHomePropName
						);
					} else {
						if (!jsonObj[options.jsonNotfoundPropName]) {
							throw new Error(
								"incomplete JSON data: no " +
									options.jsonNotfoundPropName
							);
						}
					}
				} catch (err) {
					console.log("cannot init processJsonResponse", err);
					return;
				}

				if ("function" === typeof options.onJsonParsed) {
					options.onJsonParsed(jsonResponse);
				}

				var triggerOnContentInserted = function triggerOnContentInserted(
					jsonObj,
					titleString
				) {
					if ("function" === typeof options.onContentInserted) {
						options.onContentInserted(jsonObj, titleString);
					}
				};

				var handleRoutesWindow = function handleRoutesWindow() {
					if ("function" === typeof options.onBeforeContentInserted) {
						options.onBeforeContentInserted();
					}

					var locationHash = root.location.hash || "";

					if (locationHash) {
						var isFound = false;
						var i, l;

						for (
							i = 0,
								l =
									jsonObj[options.jsonHashesPropName][
										_length
									];
							i < l;
							i += 1
						) {
							if (
								locationHash ===
								jsonObj[options.jsonHashesPropName][i][
									options.jsonHrefPropName
								]
							) {
								isFound = true;
								insertExternalHTML(
									renderId,
									jsonObj[options.jsonHashesPropName][i][
										options.jsonUrlPropName
									],
									triggerOnContentInserted.bind(
										null,
										jsonObj,
										jsonObj[options.jsonHashesPropName][i][
											options.jsonTitlePropName
										]
									)
								);
								break;
							}
						}

						i = l = null;

						if (false === isFound) {
							var targetObj = locationHash
								? isValidId(locationHash, true)
									? document[getElementById](
											locationHash.replace(/^#/, "")
									  ) || ""
									: ""
								: "";

							if (targetObj) {
								root.scrollTo(
									findPos(targetObj).left,
									findPos(targetObj).top
								);
							} else {
								var notfoundUrl =
									jsonObj[options.jsonNotfoundPropName][
										options.jsonUrlPropName
									];
								var notfoundTitle =
									jsonObj[options.jsonNotfoundPropName][
										options.jsonTitlePropName
									];

								if (notfoundUrl && notfoundTitle) {
									insertExternalHTML(
										renderId,
										notfoundUrl,
										triggerOnContentInserted.bind(
											null,
											jsonObj,
											notfoundTitle
										)
									);
								}
							}
						}
					} else {
						var homeUrl =
							jsonObj[options.jsonHomePropName][
								options.jsonUrlPropName
							];
						var homeTitle =
							jsonObj[options.jsonHomePropName][
								options.jsonTitlePropName
							];

						if (homeUrl && homeTitle) {
							insertExternalHTML(
								renderId,
								homeUrl,
								triggerOnContentInserted.bind(
									null,
									jsonObj,
									homeTitle
								)
							);
						}
					}
				};

				handleRoutesWindow();

				if (
					!docElem[classList].contains(
						handleRoutesWindowIsBindedClass
					)
				) {
					docElem[classList].add(handleRoutesWindowIsBindedClass);

					root[_addEventListener]("hashchange", handleRoutesWindow);
				}
			};

			var render = document[getElementById](renderId) || "";

			if (render) {
				loadUnparsedJSON(jsonUrl, processJsonResponse);
			}
		};
	})();

	root.JsonHashRouter = JsonHashRouter;
})("undefined" !== typeof window ? window : this, document);
/*!
 * modified Detect Whether a Font is Installed
 * @param {String} fontName The name of the font to check
 * @return {Boolean}
 * @author Kirupa <sam@samclarke.com>
 * @see {@link https://www.kirupa.com/html5/detect_whether_font_is_installed.htm}
 * passes jshint
 */

(function(root, document) {
	"use strict";

	var doesFontExist = function doesFontExist(fontName) {
		var createElement = "createElement";
		var getContext = "getContext";
		var measureText = "measureText";
		var width = "width";
		var canvas = document[createElement]("canvas");
		var context = canvas[getContext]("2d");
		var text = "abcdefghijklmnopqrstuvwxyz0123456789";
		context.font = "72px monospace";
		var baselineSize = context[measureText](text)[width];
		context.font = "72px '" + fontName + "', monospace";
		var newSize = context[measureText](text)[width];
		canvas = null;

		if (newSize === baselineSize) {
			return false;
		} else {
			return true;
		}
	};

	root.doesFontExist = doesFontExist;
})("undefined" !== typeof window ? window : this, document);
/*!
 * modified loadExt
 * @see {@link https://gist.github.com/englishextra/ff9dc7ab002312568742861cb80865c9}
 * passes jshint
 */

(function(root, document) {
	"use strict";

	var loadJsCss = function loadJsCss(files, callback) {
		var _this = this;

		var appendChild = "appendChild";
		var body = "body";
		var createElement = "createElement";
		var getElementsByTagName = "getElementsByTagName";
		/* var insertBefore = "insertBefore"; */

		var _length = "length";
		/* var parentNode = "parentNode"; */

		var setAttribute = "setAttribute";
		_this.files = files;
		_this.js = [];
		_this.head = document[getElementsByTagName]("head")[0] || "";
		_this.body = document[body] || "";
		_this.ref = document[getElementsByTagName]("script")[0] || "";

		_this.callback = callback || function() {};

		_this.loadStyle = function(file) {
			var link = document[createElement]("link");
			link.rel = "stylesheet";
			link.type = "text/css";
			link.href = file;
			/* _this.head[appendChild](link); */

			link.media = "only x";

			link.onload = function() {
				this.onload = null;
				this.media = "all";
			};

			link[setAttribute]("property", "stylesheet");

			(_this.body || _this.head)[appendChild](link);
		};

		_this.loadScript = function(i) {
			var script = document[createElement]("script");
			script.type = "text/javascript";
			script.async = true;
			script.src = _this.js[i];

			var loadNextScript = function loadNextScript() {
				if (++i < _this.js[_length]) {
					_this.loadScript(i);
				} else {
					_this.callback();
				}
			};

			script.onload = function() {
				loadNextScript();
			};

			_this.head[appendChild](script);
			/* if (_this.ref[parentNode]) {
      	_this.ref[parentNode][insertBefore](script, _this.ref);
      } else {
      	(_this.body || _this.head)[appendChild](script);
      } */

			(_this.body || _this.head)[appendChild](script);
		};

		var i, l;

		for (i = 0, l = _this.files[_length]; i < l; i += 1) {
			if (/\.js$|\.js\?/.test(_this.files[i])) {
				_this.js.push(_this.files[i]);
			}

			if (/\.css$|\.css\?|\/css\?/.test(_this.files[i])) {
				_this.loadStyle(_this.files[i]);
			}
		}

		i = l = null;

		if (_this.js[_length] > 0) {
			_this.loadScript(0);
		} else {
			_this.callback();
		}
	};

	root.loadJsCss = loadJsCss;
})("undefined" !== typeof window ? window : this, document);
/*!
 * app logic
 */

(function(root, document) {
	"use strict";

	var docElem = document.documentElement || "";
	var docImplem = document.implementation || "";
	var docBody = document.body || "";
	var classList = "classList";
	var createElement = "createElement";
	var createElementNS = "createElementNS";
	var defineProperty = "defineProperty";
	var getElementsByClassName = "getElementsByClassName";
	var getOwnPropertyDescriptor = "getOwnPropertyDescriptor";
	var querySelector = "querySelector";
	var querySelectorAll = "querySelectorAll";
	var _addEventListener = "addEventListener";
	var _length = "length";
	docBody[classList].add("hide-sidedrawer");
	var toStringFn = {}.toString;
	var supportsSvgSmilAnimation =
		(!!document[createElementNS] &&
			/SVGAnimate/.test(
				toStringFn.call(
					document[createElementNS](
						"http://www.w3.org/2000/svg",
						"animate"
					)
				)
			)) ||
		"";

	if (supportsSvgSmilAnimation && docElem) {
		docElem[classList].add("svganimate");
	}

	var hasTouch = "ontouchstart" in docElem || "";
	var hasWheel =
		"onwheel" in document[createElement]("div") ||
		void 0 !== document.onmousewheel ||
		"";

	var getHTTP = function getHTTP(force) {
		var any = force || "";
		var locationProtocol = root.location.protocol || "";
		return "http:" === locationProtocol
			? "http"
			: "https:" === locationProtocol
			? "https"
			: any
			? "http"
			: "";
	};

	var forcedHTTP = getHTTP(true);

	var run = function run() {
		var appendChild = "appendChild";
		var body = "body";
		var cloneNode = "cloneNode";
		var createContextualFragment = "createContextualFragment";
		var createDocumentFragment = "createDocumentFragment";
		var createRange = "createRange";
		var createTextNode = "createTextNode";
		var dataset = "dataset";
		var getAttribute = "getAttribute";
		var getElementById = "getElementById";
		var getElementsByTagName = "getElementsByTagName";
		var innerHTML = "innerHTML";
		var parentNode = "parentNode";
		var setAttribute = "setAttribute";
		var setAttributeNS = "setAttributeNS";
		var style = "style";
		var title = "title";
		var _removeEventListener = "removeEventListener";
		var isActiveClass = "is-active";
		var isBindedClass = "is-binded";
		/* progressBar.increase(20); */

		if (docElem && docElem[classList]) {
			docElem[classList].remove("no-js");
			docElem[classList].add("js");
		}

		var earlyDeviceFormfactor = (function(selectors) {
			var orientation;
			var size;

			var f = function f(a) {
				var b = a.split(" ");

				if (selectors) {
					var c;

					for (c = 0; c < b[_length]; c += 1) {
						a = b[c];
						selectors.add(a);
					}

					c = null;
				}
			};

			var g = function g(a) {
				var b = a.split(" ");

				if (selectors) {
					var c;

					for (c = 0; c < b[_length]; c += 1) {
						a = b[c];
						selectors.remove(a);
					}

					c = null;
				}
			};

			var h = {
				landscape: "all and (orientation:landscape)",
				portrait: "all and (orientation:portrait)"
			};
			var k = {
				small: "all and (max-width:768px)",
				medium: "all and (min-width:768px) and (max-width:991px)",
				large: "all and (min-width:992px)"
			};
			var d;
			var matchMedia = "matchMedia";
			var matches = "matches";

			var o = function o(a, b) {
				var c = function c(a) {
					if (a[matches]) {
						f(b);
						orientation = b;
					} else {
						g(b);
					}
				};

				c(a);
				a.addListener(c);
			};

			var s = function s(a, b) {
				var c = function c(a) {
					if (a[matches]) {
						f(b);
						size = b;
					} else {
						g(b);
					}
				};

				c(a);
				a.addListener(c);
			};

			for (d in h) {
				if (h.hasOwnProperty(d)) {
					o(root[matchMedia](h[d]), d);
				}
			}

			for (d in k) {
				if (k.hasOwnProperty(d)) {
					s(root[matchMedia](k[d]), d);
				}
			}

			return {
				orientation: orientation || "",
				size: size || ""
			};
		})(docElem[classList] || "");

		var earlyDeviceType = (function(mobile, desktop, opera) {
			var selector =
				/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
					opera
				) ||
				/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
					opera.substr(0, 4)
				)
					? mobile
					: desktop;
			docElem[classList].add(selector);
			return selector;
		})(
			"mobile",
			"desktop",
			navigator.userAgent || navigator.vendor || root.opera
		);

		var earlySvgSupport = (function(selector) {
			selector = docImplem.hasFeature("http://www.w3.org/2000/svg", "1.1")
				? selector
				: "no-" + selector;
			docElem[classList].add(selector);
			return selector;
		})("svg");

		var earlySvgasimgSupport = (function(selector) {
			selector = docImplem.hasFeature(
				"http://www.w3.org/TR/SVG11/feature#Image",
				"1.1"
			)
				? selector
				: "no-" + selector;
			docElem[classList].add(selector);
			return selector;
		})("svgasimg");

		var earlyHasTouch = (function(selector) {
			selector = "ontouchstart" in docElem ? selector : "no-" + selector;
			docElem[classList].add(selector);
			return selector;
		})("touch");

		var getHumanDate = (function() {
			var newDate = new Date();
			var newDay = newDate.getDate();
			var newYear = newDate.getFullYear();
			var newMonth = newDate.getMonth();
			newMonth += 1;

			if (10 > newDay) {
				newDay = "0" + newDay;
			}

			if (10 > newMonth) {
				newMonth = "0" + newMonth;
			}

			return newYear + "-" + newMonth + "-" + newDay;
		})();

		var initialDocumentTitle = document.title || "";
		var userBrowsingDetails =
			" [" +
			(getHumanDate ? getHumanDate : "") +
			(earlyDeviceType ? " " + earlyDeviceType : "") +
			(earlyDeviceFormfactor.orientation
				? " " + earlyDeviceFormfactor.orientation
				: "") +
			(earlyDeviceFormfactor.size
				? " " + earlyDeviceFormfactor.size
				: "") +
			(earlySvgSupport ? " " + earlySvgSupport : "") +
			(earlySvgasimgSupport ? " " + earlySvgasimgSupport : "") +
			(earlyHasTouch ? " " + earlyHasTouch : "") +
			"]";

		if (document[title]) {
			document[title] = document[title] + userBrowsingDetails;
		}

		var scriptIsLoaded = function scriptIsLoaded(scriptSrc) {
			var scriptAll, i, l;

			for (
				scriptAll = document[getElementsByTagName]("script") || "",
					i = 0,
					l = scriptAll[_length];
				i < l;
				i += 1
			) {
				if (scriptAll[i][getAttribute]("src") === scriptSrc) {
					scriptAll = i = l = null;
					return true;
				}
			}

			scriptAll = i = l = null;
			return false;
		};

		var debounce = function debounce(func, wait) {
			var timeout;
			var args;
			var context;
			var timestamp;
			return function() {
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

		var throttle = function throttle(func, wait) {
			var ctx;
			var args;
			var rtn;
			var timeoutID;
			var last = 0;

			function call() {
				timeoutID = 0;
				last = +new Date();
				rtn = func.apply(ctx, args);
				ctx = null;
				args = null;
			}

			return function throttled() {
				ctx = this;
				args = arguments;
				var delta = new Date() - last;

				if (!timeoutID) {
					if (delta >= wait) {
						call();
					} else {
						timeoutID = setTimeout(call, wait - delta);
					}
				}

				return rtn;
			};
		};

		var scroll2Top = function scroll2Top(scrollTargetY, speed, easing) {
			var scrollY = root.scrollY || docElem.scrollTop;
			var posY = scrollTargetY || 0;
			var rate = speed || 2000;
			var soothing = easing || "easeOutSine";
			var currentTime = 0;
			var time = Math.max(
				0.1,
				Math.min(Math.abs(scrollY - posY) / rate, 0.8)
			);
			var easingEquations = {
				easeOutSine: function easeOutSine(pos) {
					return Math.sin(pos * (Math.PI / 2));
				},
				easeInOutSine: function easeInOutSine(pos) {
					return -0.5 * (Math.cos(Math.PI * pos) - 1);
				},
				easeInOutQuint: function easeInOutQuint(pos) {
					if ((pos /= 0.5) < 1) {
						return 0.5 * Math.pow(pos, 5);
					}

					return 0.5 * (Math.pow(pos - 2, 5) + 2);
				}
			};

			function tick() {
				currentTime += 1 / 60;
				var p = currentTime / time;
				var t = easingEquations[soothing](p);

				if (p < 1) {
					requestAnimationFrame(tick);
					root.scrollTo(0, scrollY + (posY - scrollY) * t);
				} else {
					root.scrollTo(0, posY);
				}
			}

			tick();
		};

		var appendFragment = function appendFragment(e, a) {
			var parent = a || document[getElementsByTagName]("body")[0] || "";

			if (e) {
				var df = document[createDocumentFragment]() || "";

				if ("string" === typeof e) {
					e = document[createTextNode](e);
				}

				df[appendChild](e);
				parent[appendChild](df);
			}
		};

		var LoadingSpinner = (function() {
			var spinner = document[getElementById]("loading-spinner") || "";

			if (!spinner) {
				spinner = document[createElement]("div");
				var spinnerInner = document[createElement]("div");
				spinnerInner[setAttribute]("class", "half-circle-spinner");
				spinnerInner.id = "loading-spinner";
				spinnerInner[setAttribute]("aria-hidden", "true");
				var spinnerCircle1 = document[createElement]("div");
				spinnerCircle1[setAttribute]("class", "circle circle-1");
				spinnerInner[appendChild](spinnerCircle1);
				var spinnerCircle2 = document[createElement]("div");
				spinnerCircle2[setAttribute]("class", "circle circle-2");
				spinnerInner[appendChild](spinnerCircle2);
				spinner[appendChild](spinnerInner);
				appendFragment(spinner, docBody);
			}

			return {
				show: function show() {
					return (spinner[style].display = "block");
				},
				hide: function hide(callback, timeout) {
					var delay = timeout || 500;
					var timer = setTimeout(function() {
						clearTimeout(timer);
						timer = null;
						spinner[style].display = "none";

						if (callback && "function" === typeof callback) {
							callback();
						}
					}, delay);
				}
			};
		})();

		var removeChildren = function removeChildren(e) {
			if (e && e.firstChild) {
				for (; e.firstChild; ) {
					e.removeChild(e.firstChild);
				}
			}
		};

		var safelyParseJSON = function safelyParseJSON(response) {
			var isJson = function isJson(obj) {
				var objType = _typeof(obj);

				return (
					[
						"boolean",
						"number",
						"string",
						"symbol",
						"function"
					].indexOf(objType) === -1
				);
			};

			if (!isJson(response)) {
				return JSON.parse(response);
			} else {
				return response;
			}
		};
		/*jshint bitwise: false */

		var parseLink = function parseLink(url, full) {
			var _full = full || "";

			return (function() {
				var _replace = function _replace(s) {
					return s.replace(/^(#|\?)/, "").replace(/\:$/, "");
				};

				var _location = location || "";

				var _protocol = function _protocol(protocol) {
					switch (protocol) {
						case "http:":
							return _full ? ":" + 80 : 80;

						case "https:":
							return _full ? ":" + 443 : 443;

						default:
							return _full
								? ":" + _location.port
								: _location.port;
					}
				};

				var _isAbsolute =
					0 === url.indexOf("//") || !!~url.indexOf("://");

				var _locationHref = root.location || "";

				var _origin = function _origin() {
					var o =
						_locationHref.protocol +
						"//" +
						_locationHref.hostname +
						(_locationHref.port ? ":" + _locationHref.port : "");
					return o || "";
				};

				var _isCrossDomain = function _isCrossDomain() {
					var c = document[createElement]("a");
					c.href = url;
					var v =
						c.protocol +
						"//" +
						c.hostname +
						(c.port ? ":" + c.port : "");
					return v !== _origin();
				};

				var _link = document[createElement]("a");

				_link.href = url;
				return {
					href: _link.href,
					origin: _origin(),
					host: _link.host || _location.host,
					port:
						"0" === _link.port || "" === _link.port
							? _protocol(_link.protocol)
							: _full
							? _link.port
							: _replace(_link.port),
					hash: _full ? _link.hash : _replace(_link.hash),
					hostname: _link.hostname || _location.hostname,
					pathname:
						_link.pathname.charAt(0) !== "/"
							? _full
								? "/" + _link.pathname
								: _link.pathname
							: _full
							? _link.pathname
							: _link.pathname.slice(1),
					protocol:
						!_link.protocol || ":" === _link.protocol
							? _full
								? _location.protocol
								: _replace(_location.protocol)
							: _full
							? _link.protocol
							: _replace(_link.protocol),
					search: _full ? _link.search : _replace(_link.search),
					query: _full ? _link.search : _replace(_link.search),
					isAbsolute: _isAbsolute,
					isRelative: !_isAbsolute,
					isCrossDomain: _isCrossDomain(),
					hasHTTP: /^(http|https):\/\//i.test(url) ? true : false
				};
			})();
		};
		/*jshint bitwise: true */

		var isNodejs =
			("undefined" !== typeof process &&
				"undefined" !== typeof require) ||
			"";
		var isElectron =
			("undefined" !== typeof root &&
				root.process &&
				"renderer" === root.process.type) ||
			"";

		var isNwjs = (function() {
			if ("undefined" !== typeof isNodejs && isNodejs) {
				try {
					if ("undefined" !== typeof require("nw.gui")) {
						return true;
					}
				} catch (e) {
					return false;
				}
			}

			return false;
		})();

		var openDeviceBrowser = function openDeviceBrowser(url) {
			var triggerForElectron = function triggerForElectron() {
				var es = isElectron ? require("electron").shell : "";
				return es ? es.openExternal(url) : "";
			};

			var triggerForNwjs = function triggerForNwjs() {
				var ns = isNwjs ? require("nw.gui").Shell : "";
				return ns ? ns.openExternal(url) : "";
			};

			var triggerForHTTP = function triggerForHTTP() {
				return true;
			};

			var triggerForLocal = function triggerForLocal() {
				return root.open(url, "_system", "scrollbars=1,location=no");
			};

			if (isElectron) {
				triggerForElectron();
			} else if (isNwjs) {
				triggerForNwjs();
			} else {
				var locationProtocol = root.location.protocol || "",
					hasHTTP = locationProtocol
						? "http:" === locationProtocol
							? "http"
							: "https:" === locationProtocol
							? "https"
							: ""
						: "";

				if (hasHTTP) {
					triggerForHTTP();
				} else {
					triggerForLocal();
				}
			}
		};

		var renderTemplate = function renderTemplate(
			parsedJson,
			templateId,
			targetId
		) {
			var template = document[getElementById](templateId) || "";
			var target = document[getElementById](targetId) || "";
			var jsonObj = safelyParseJSON(parsedJson);

			if (jsonObj && template && target) {
				var targetHtml = template[innerHTML] || "";

				if (root.t) {
					var renderTargetTemplate = new t(targetHtml);
					return renderTargetTemplate.render(jsonObj);
				} else {
					if (root.Mustache) {
						Mustache.parse(targetHtml);
						return Mustache.render(targetHtml, jsonObj);
					}
				}
			}

			return "cannot renderTemplate";
		};

		var insertTextAsFragment = function insertTextAsFragment(
			text,
			container,
			callback
		) {
			var body = document.body || "";

			var cb = function cb() {
				return callback && "function" === typeof callback && callback();
			};

			try {
				var clonedContainer = container[cloneNode](false);

				if (document[createRange]) {
					var rg = document[createRange]();
					rg.selectNode(body);
					var df = rg[createContextualFragment](text);
					clonedContainer[appendChild](df);
					return (
						container[parentNode]
							? container[parentNode].replaceChild(
									clonedContainer,
									container
							  )
							: (container[innerHTML] = text),
						cb()
					);
				} else {
					clonedContainer[innerHTML] = text;
					return (
						container[parentNode]
							? container[parentNode].replaceChild(
									document[createDocumentFragment][
										appendChild
									](clonedContainer),
									container
							  )
							: (container[innerHTML] = text),
						cb()
					);
				}
			} catch (e) {
				console.log(e);
				return;
			}
		};

		var insertFromTemplate = function insertFromTemplate(
			parsedJson,
			templateId,
			targetId,
			callback,
			useInner
		) {
			var _useInner = useInner || "";

			var template = document[getElementById](templateId) || "";
			var target = document[getElementById](targetId) || "";

			var cb = function cb() {
				return callback && "function" === typeof callback && callback();
			};

			if (parsedJson && template && target) {
				var targetRendered = renderTemplate(
					parsedJson,
					templateId,
					targetId
				);

				if (_useInner) {
					target[innerHTML] = targetRendered;
					cb();
				} else {
					insertTextAsFragment(targetRendered, target, cb);
				}
			}
		};

		var manageExternalLinkAll = function manageExternalLinkAll(scope) {
			var ctx = scope && scope.nodeName ? scope : "";
			var linkTag = "a";
			var linkAll = ctx
				? ctx[getElementsByTagName](linkTag) || ""
				: document[getElementsByTagName](linkTag) || "";

			var handleExternalLink = function handleExternalLink(url, ev) {
				ev.stopPropagation();
				ev.preventDefault();
				var logicHandleExternalLink = openDeviceBrowser.bind(null, url);
				var debounceLogicHandleExternalLink = debounce(
					logicHandleExternalLink,
					200
				);
				debounceLogicHandleExternalLink();
			};

			var arrange = function arrange(e) {
				var externalLinkIsBindedClass = "external-link--is-binded";

				if (!e[classList].contains(externalLinkIsBindedClass)) {
					var url = e[getAttribute]("href") || "";

					if (
						url &&
						parseLink(url).isCrossDomain &&
						parseLink(url).hasHTTP
					) {
						e.title =
							"" +
							(parseLink(url).hostname || "") +
							" откроется в новой вкладке";

						if ("undefined" !== typeof getHTTP && getHTTP()) {
							e.target = "_blank";
							e.rel = "noopener";
						} else {
							e[_addEventListener](
								"click",
								handleExternalLink.bind(null, url)
							);
						}

						e[classList].add(externalLinkIsBindedClass);
					}
				}
			};

			if (linkAll) {
				var i, l;

				for (i = 0, l = linkAll[_length]; i < l; i += 1) {
					arrange(linkAll[i]);
				}

				i = l = null;
			}
		};

		manageExternalLinkAll();

		var handleDataSrcImageAll = function handleDataSrcImageAll(callback) {
			var cb = function cb() {
				return callback && "function" === typeof callback && callback();
			};

			var images = document[getElementsByClassName]("data-src-img") || "";
			var i = images[_length];
			var dataSrcImgIsBindedClass = "data-src-img--is-binded";

			while (i--) {
				var wH = root.innerHeight;
				var boundingRect = images[i].getBoundingClientRect();
				var offset = 100;
				var yPositionTop = boundingRect.top - wH;
				var yPositionBottom = boundingRect.bottom;

				if (
					!images[i][classList].contains(dataSrcImgIsBindedClass) &&
					yPositionTop <= offset &&
					yPositionBottom >= -offset
				) {
					images[i][classList].add(dataSrcImgIsBindedClass);
					images[i].src = images[i][dataset].src || "";
					images[i].srcset = images[i][dataset].srcset || "";
					images[i][classList].add(isActiveClass);
					cb();
				}
			}
		};

		var handleDataSrcImageAllWindow = function handleDataSrcImageAllWindow() {
			var throttleHandleDataSrcImageAll = throttle(
				handleDataSrcImageAll,
				100
			);
			throttleHandleDataSrcImageAll();
		};

		var manageDataSrcImageAll = function manageDataSrcImageAll() {
			root[_addEventListener]("scroll", handleDataSrcImageAllWindow, {
				passive: true
			});

			root[_addEventListener]("resize", handleDataSrcImageAllWindow, {
				passive: true
			});

			var timer = setTimeout(function() {
				clearTimeout(timer);
				timer = null;
				handleDataSrcImageAll();
			}, 100);
		};

		manageDataSrcImageAll();

		var handleDataSrcIframeAll = function handleDataSrcIframeAll(callback) {
			var cb = function cb() {
				return callback && "function" === typeof callback && callback();
			};

			var iframes =
				document[getElementsByClassName]("data-src-iframe") || "";
			var i = iframes[_length];
			var dataSrcIframeIsBindedClass = "data-src-iframe--is-binded";

			while (i--) {
				var wH = root.innerHeight;
				var boundingRect = iframes[i].getBoundingClientRect();
				var offset = 100;
				var yPositionTop = boundingRect.top - wH;
				var yPositionBottom = boundingRect.bottom;

				if (
					!iframes[i][classList].contains(
						dataSrcIframeIsBindedClass
					) &&
					yPositionTop <= offset &&
					yPositionBottom >= -offset
				) {
					iframes[i][classList].add(dataSrcIframeIsBindedClass);
					iframes[i].src = iframes[i][dataset].src || "";
					iframes[i][classList].add(isActiveClass);
					iframes[i][setAttribute]("frameborder", "no");
					iframes[i][setAttribute]("style", "border:none;");
					iframes[i][setAttribute]("webkitallowfullscreen", "true");
					iframes[i][setAttribute]("mozallowfullscreen", "true");
					iframes[i][setAttribute]("scrolling", "no");
					iframes[i][setAttribute]("allowfullscreen", "true");
					cb();
				}
			}
		};

		var handleDataSrcIframeAllWindow = function handleDataSrcIframeAllWindow() {
			var throttlehandleDataSrcIframeAll = throttle(
				handleDataSrcIframeAll,
				100
			);
			throttlehandleDataSrcIframeAll();
		};

		var manageDataSrcIframeAll = function manageDataSrcIframeAll() {
			root[_addEventListener]("scroll", handleDataSrcIframeAllWindow, {
				passive: true
			});

			root[_addEventListener]("resize", handleDataSrcIframeAllWindow, {
				passive: true
			});

			var timer = setTimeout(function() {
				clearTimeout(timer);
				timer = null;
				handleDataSrcIframeAll();
			}, 100);
		};

		manageDataSrcIframeAll();

		var manageDataQrcodeImageAll = function manageDataQrcodeImageAll(
			callback
		) {
			var cb = function cb() {
				return callback && "function" === typeof callback && callback();
			};

			var dataQrcodeImgClass = "data-qrcode-img";
			var img =
				document[getElementsByClassName](dataQrcodeImgClass) || "";

			var generateImg = function generateImg(e) {
				var qrcode = e[dataset].qrcode || "";
				qrcode = decodeURIComponent(qrcode);

				if (qrcode) {
					var imgSrc =
						forcedHTTP +
						"://chart.googleapis.com/chart?cht=qr&chld=M%7C4&choe=UTF-8&chs=512x512&chl=" +
						encodeURIComponent(qrcode);
					e.title = qrcode;
					e.alt = qrcode;

					if (root.QRCode) {
						if (
							"undefined" !== typeof earlySvgSupport &&
							"svg" === earlySvgSupport
						) {
							imgSrc = QRCode.generateSVG(qrcode, {
								ecclevel: "M",
								fillcolor: "#F3F3F3",
								textcolor: "#191919",
								margin: 4,
								modulesize: 8
							});
							var XMLS = new XMLSerializer();
							imgSrc = XMLS.serializeToString(imgSrc);
							imgSrc =
								"data:image/svg+xml;base64," +
								root.btoa(unescape(encodeURIComponent(imgSrc)));
							e.src = imgSrc;
						} else {
							imgSrc = QRCode.generatePNG(qrcode, {
								ecclevel: "M",
								format: "html",
								fillcolor: "#F3F3F3",
								textcolor: "#191919",
								margin: 4,
								modulesize: 8
							});
							e.src = imgSrc;
						}
					} else {
						e.src = imgSrc;
					}

					cb();
				}
			};

			if (img) {
				var i, l;

				for (i = 0, l = img[_length]; i < l; i += 1) {
					generateImg(img[i]);
				}

				i = l = null;
			}
		};

		var manageIframeLightboxLinkAll = function manageIframeLightboxLinkAll(
			linkClass
		) {
			var link = document[getElementsByClassName](linkClass) || "";

			var arrange = function arrange(e) {
				if (root.IframeLightbox) {
					e.lightbox = new IframeLightbox(e, {
						onLoaded: function onLoaded() {
							LoadingSpinner.hide();
						},
						onClosed: function onClosed() {
							LoadingSpinner.hide();
						},
						onOpened: function onOpened() {
							LoadingSpinner.show();
						},
						touch: false
					});
				}
			};

			if (link) {
				var i, l;

				for (i = 0, l = link[_length]; i < l; i += 1) {
					arrange(link[i]);
				}

				i = l = null;
			}
		};

		var manageImgLightboxLinkAll = function manageImgLightboxLinkAll(
			linkClass
		) {
			if (root.imgLightbox) {
				imgLightbox(linkClass, {
					onCreated: function onCreated() {
						LoadingSpinner.show();
					},
					onLoaded: function onLoaded() {
						LoadingSpinner.hide();
					},
					onError: function onError() {
						LoadingSpinner.hide();
					},
					touch: false
				});
			}
		};

		var manageReadMore = function manageReadMore() {
			var rmLink = document[getElementsByClassName]("rm-link") || "";

			var arrange = function arrange(e) {
				if (!e[classList].contains(isBindedClass)) {
					e[classList].add(isBindedClass);

					e[_addEventListener]("click", updateMinigrid);
				}
			};

			var initScript = function initScript() {
				if (root.$readMoreJS) {
					$readMoreJS.init({
						target: ".dummy",
						numOfWords: 10,
						toggle: true,
						moreLink: "БОЛЬШЕ",
						lessLink: "МЕНЬШЕ",
						inline: true,
						customBlockElement: "p"
					});
					var i, l;

					for (i = 0, l = rmLink[_length]; i < l; i += 1) {
						arrange(rmLink[i]);
					}

					i = l = null;
				}
			};

			if (rmLink) {
				var timer = setTimeout(function() {
					clearTimeout(timer);
					timer = null;
					initScript();
				}, 100);
			}
		};

		var manageExpandingLayers = function manageExpandingLayers() {
			var btn =
				document[getElementsByClassName]("btn-expand-hidden-layer") ||
				"";

			var arrange = function arrange(e) {
				var handleExpandingLayerAll = function handleExpandingLayerAll() {
					var _this = this;

					var s = _this.nextElementSibling || "";

					if (s) {
						_this[classList].toggle(isActiveClass);

						s[classList].toggle(isActiveClass);
						updateMinigrid();
					}

					return;
				};

				if (!e[classList].contains(isBindedClass)) {
					e[_addEventListener]("click", handleExpandingLayerAll);

					e[classList].add(isBindedClass);
				}
			};

			if (btn) {
				var i, l;

				for (i = 0, l = btn[_length]; i < l; i += 1) {
					arrange(btn[i]);
				}

				i = l = null;
			}
		};

		var isCollapsableClass = "is-collapsable";

		var manageLocationQrCodeImage = function manageLocationQrCodeImage() {
			var btn =
				document[getElementsByClassName](
					"btn-toggle-holder-qrcode"
				)[0] || "";
			var holder =
				document[getElementsByClassName]("holder-location-qrcode")[0] ||
				"";
			var locationHref = root.location.href || "";

			var hideLocationQrCodeImage = function hideLocationQrCodeImage() {
				holder[classList].remove(isActiveClass);
			};

			var handleLocationQrCodeButton = function handleLocationQrCodeButton(
				ev
			) {
				ev.stopPropagation();
				ev.preventDefault();
				manageOtherCollapsableAll(holder);

				var logicHandleLocationQrCodeButton = function logicHandleLocationQrCodeButton() {
					holder[classList].toggle(isActiveClass);
					var locationHref = root.location.href || "";
					var newImg = document[createElement]("img");
					var newTitle = document[title]
						? "Ссылка на страницу «" +
						  document[title].replace(/\[[^\]]*?\]/g, "").trim() +
						  "»"
						: "";
					var newSrc =
						forcedHTTP +
						"://chart.googleapis.com/chart?cht=qr&chld=M%7C4&choe=UTF-8&chs=512x512&chl=" +
						encodeURIComponent(locationHref);
					newImg.alt = newTitle;

					var initScript = function initScript() {
						if (root.QRCode) {
							if (
								"undefined" !== typeof earlySvgSupport &&
								"svg" === earlySvgSupport
							) {
								newSrc = QRCode.generateSVG(locationHref, {
									ecclevel: "M",
									fillcolor: "#FFFFFF",
									textcolor: "#212121",
									margin: 4,
									modulesize: 8
								});
								var XMLS = new XMLSerializer();
								newSrc = XMLS.serializeToString(newSrc);
								newSrc =
									"data:image/svg+xml;base64," +
									root.btoa(
										unescape(encodeURIComponent(newSrc))
									);
								newImg.src = newSrc;
							} else {
								newSrc = QRCode.generatePNG(locationHref, {
									ecclevel: "M",
									format: "html",
									fillcolor: "#FFFFFF",
									textcolor: "#212121",
									margin: 4,
									modulesize: 8
								});
								newImg.src = newSrc;
							}
						} else {
							newImg.src = newSrc;
						}

						newImg[classList].add("qr-code-img");
						newImg.title = newTitle;
						removeChildren(holder);
						appendFragment(newImg, holder);
					};

					initScript();
				};

				var debounceLogicHandleLocationQrCodeButton = debounce(
					logicHandleLocationQrCodeButton,
					200
				);
				debounceLogicHandleLocationQrCodeButton();
			};

			if (btn && holder && locationHref) {
				holder[classList].add(isCollapsableClass);

				if ("undefined" !== typeof getHTTP && getHTTP()) {
					btn[_addEventListener]("click", handleLocationQrCodeButton);

					if (appContentParent) {
						appContentParent[_addEventListener](
							"click",
							hideLocationQrCodeImage
						);
					}

					root[_addEventListener](
						"hashchange",
						hideLocationQrCodeImage
					);
				}
			}
		};

		manageLocationQrCodeImage();

		var manageMobileappsButton = function manageMobileappsButton() {
			var btn =
				document[getElementsByClassName](
					"btn-toggle-holder-mobileapps-buttons"
				)[0] || "";
			var holder =
				document[getElementsByClassName](
					"holder-mobileapps-buttons"
				)[0] || "";

			var handleMobileappsButton = function handleMobileappsButton(ev) {
				ev.stopPropagation();
				ev.preventDefault();

				var logicHandleMobileappsButton = function logicHandleMobileappsButton() {
					holder[classList].toggle(isActiveClass);
					holder[classList].add(isCollapsableClass);
					manageOtherCollapsableAll(holder);
				};

				var debounceLogicHandleMobileappsButton = debounce(
					logicHandleMobileappsButton,
					200
				);
				debounceLogicHandleMobileappsButton();
			};

			if (btn && holder) {
				if ("undefined" !== typeof getHTTP && getHTTP()) {
					btn[_addEventListener]("click", handleMobileappsButton);
				}
			}
		};

		manageMobileappsButton();
		var yshare;

		var manageShareButton = function manageShareButton() {
			var btn =
				document[getElementsByClassName](
					"btn-toggle-holder-share-buttons"
				)[0] || "";
			var yaShare2Id = "ya-share2";
			var yaShare2 = document[getElementById](yaShare2Id) || "";
			var holder =
				document[getElementsByClassName]("holder-share-buttons")[0] ||
				"";

			var handleShareButton = function handleShareButton(ev) {
				ev.stopPropagation();
				ev.preventDefault();

				var logicHandleShareButton = function logicHandleShareButton() {
					holder[classList].toggle(isActiveClass);
					holder[classList].add(isCollapsableClass);
					manageOtherCollapsableAll(holder);

					var initScript = function initScript() {
						if (root.Ya) {
							try {
								if (yshare) {
									yshare.updateContent({
										title: document[title] || "",
										description: document[title] || "",
										url: root.location.href || ""
									});
								} else {
									yshare = Ya.share2(yaShare2Id, {
										content: {
											title: document[title] || "",
											description: document[title] || "",
											url: root.location.href || ""
										}
									});
								}
							} catch (err) {
								throw new Error(
									"cannot yshare.updateContent or Ya.share2 " +
										err
								);
							}
						}
					};

					var jsUrl = forcedHTTP + "://yastatic.net/share2/share.js";

					if (!scriptIsLoaded(jsUrl)) {
						var load;
						load = new loadJsCss([jsUrl], initScript);
					} else {
						initScript();
					}
				};

				var debounceLogicHandleShareButton = debounce(
					logicHandleShareButton,
					200
				);
				debounceLogicHandleShareButton();
			};

			if (btn && holder && yaShare2) {
				if ("undefined" !== typeof getHTTP && getHTTP()) {
					btn[_addEventListener]("click", handleShareButton);
				}
			}
		};

		manageShareButton();
		var vlike;

		var manageVKLikeButton = function manageVKLikeButton() {
			var btn =
				document[getElementsByClassName](
					"btn-toggle-holder-vk-like"
				)[0] || "";
			var holder =
				document[getElementsByClassName]("holder-vk-like")[0] || "";
			var vkLikeId = "vk-like";
			var vkLike = document[getElementById](vkLikeId) || "";

			var handleVKLikeButton = function handleVKLikeButton(ev) {
				ev.stopPropagation();
				ev.preventDefault();

				var logicHandleVKLikeButton = function logicHandleVKLikeButton() {
					holder[classList].toggle(isActiveClass);
					holder[classList].add(isCollapsableClass);
					manageOtherCollapsableAll(holder);

					var initScript = function initScript() {
						if (root.VK && !vlike) {
							try {
								VK.init({
									apiId: vkLike[dataset].apiid || "",
									nameTransportPath: "/xd_receiver.htm",
									onlyWidgets: true
								});
								VK.Widgets.Like(vkLikeId, {
									type: "button",
									height: 24
								});
								vlike = true;
							} catch (err) {
								throw new Error("cannot VK.init " + err);
							}
						}
					};

					var jsUrl = forcedHTTP + "://vk.com/js/api/openapi.js?154";

					if (!scriptIsLoaded(jsUrl)) {
						var load;
						load = new loadJsCss([jsUrl], initScript);
					} else {
						initScript();
					}
				};

				var debounceLogicHandleVKLikeButton = debounce(
					logicHandleVKLikeButton,
					200
				);
				debounceLogicHandleVKLikeButton();
			};

			if (btn && holder && vkLike) {
				if ("undefined" !== typeof getHTTP && getHTTP()) {
					btn[_addEventListener]("click", handleVKLikeButton);
				}
			}
		};

		manageVKLikeButton();

		var initUiTotop = function initUiTotop() {
			var btnClass = "ui-totop";
			var btnTitle = "Наверх";
			var anchor = document[createElement]("a");

			var insertUpSvg = function insertUpSvg(targetObj) {
				var svg = document[createElementNS](
					"http://www.w3.org/2000/svg",
					"svg"
				);
				var use = document[createElementNS](
					"http://www.w3.org/2000/svg",
					"use"
				);
				svg[setAttribute]("class", "ui-icon");
				use[setAttributeNS](
					"http://www.w3.org/1999/xlink",
					"xlink:href",
					"#ui-icon-outline-arrow_upward"
				);
				svg[appendChild](use);
				targetObj[appendChild](svg);
			};

			var handleUiTotopAnchor = function handleUiTotopAnchor(ev) {
				ev.stopPropagation();
				ev.preventDefault();
				scroll2Top(0, 20000);
			};

			var handleUiTotopWindow = function handleUiTotopWindow(_this) {
				var logicHandleUiTotopWindow = function logicHandleUiTotopWindow() {
					var btn =
						document[getElementsByClassName](btnClass)[0] || "";
					var scrollPosition =
						_this.pageYOffset ||
						docElem.scrollTop ||
						docBody.scrollTop ||
						"";
					var windowHeight =
						_this.innerHeight ||
						docElem.clientHeight ||
						docBody.clientHeight ||
						"";

					if (scrollPosition && windowHeight && btn) {
						if (scrollPosition > windowHeight) {
							btn[classList].add(isActiveClass);
						} else {
							btn[classList].remove(isActiveClass);
						}
					}
				};

				var throttleLogicHandleUiTotopWindow = throttle(
					logicHandleUiTotopWindow,
					100
				);
				throttleLogicHandleUiTotopWindow();
			};

			anchor[classList].add(btnClass, "mui-btn");
			anchor[classList].add(btnClass, "mui-btn--fab");
			/* anchor[classList].add(btnClass, "mui-btn--primary"); */

			anchor[classList].add(btnClass, "ripple");
			/* anchor[setAttribute]("ripple-color", "rgba(0, 0, 0, 0.15)"); */

			anchor[setAttribute]("aria-label", "Навигация");
			/* jshint -W107 */

			anchor.href = "javascript:void(0);";
			/* jshint +W107 */

			anchor.title = btnTitle;
			insertUpSvg(anchor);
			docBody[appendChild](anchor);

			if (docBody) {
				anchor[_addEventListener]("click", handleUiTotopAnchor);

				root[_addEventListener]("scroll", handleUiTotopWindow, {
					passive: true
				});
			}
		};

		initUiTotop();
		var appContentId = "app-content";
		var appContent = document[getElementById](appContentId) || "";
		var appContentParent = appContent
			? appContent[parentNode]
				? appContent[parentNode]
				: ""
			: "";
		var sidedrawer = document[getElementById]("sidedrawer") || "";
		var activeClass = "active";
		var hideSidedrawerClass = "hide-sidedrawer";

		var hideSidedrawer = function hideSidedrawer() {
			docBody[classList].add(hideSidedrawerClass);
			sidedrawer[classList].remove(activeClass);
		};

		var manageOtherCollapsableAll = function manageOtherCollapsableAll(
			_self
		) {
			var _this = _self || this;

			var btn =
				document[getElementsByClassName](isCollapsableClass) || "";

			var removeActiveClass = function removeActiveClass(e) {
				if (_this !== e) {
					e[classList].remove(isActiveClass);
				}
			};

			if (btn) {
				var i, l;

				for (i = 0, l = btn[_length]; i < l; i += 1) {
					removeActiveClass(btn[i]);
				}

				i = l = null;
			}

			if (sidedrawer && _self !== sidedrawer) {
				hideSidedrawer();
			}
		};

		var manageCollapsableAll = function manageCollapsableAll() {
			if (appContentParent) {
				appContentParent[_addEventListener](
					"click",
					manageOtherCollapsableAll
				);
			}
		};

		manageCollapsableAll();

		root[_addEventListener]("hashchange", manageOtherCollapsableAll);

		var hideCurrentDropdownMenu = function hideCurrentDropdownMenu(e) {
			if (e) {
				if (e[classList].contains(isActiveClass)) {
					e[classList].remove(isActiveClass);
					manageOtherCollapsableAll(e);
				}
			}
		};

		var handleDropdownButton = function handleDropdownButton(evt) {
			evt.stopPropagation();
			evt.preventDefault();

			var _this = this;

			var dropdownMenu = _this.nextElementSibling;

			var dropdownButtonRect = _this.getBoundingClientRect();

			var top = dropdownButtonRect.top + dropdownButtonRect.height;
			var left = dropdownButtonRect.left;

			if (dropdownMenu) {
				dropdownMenu[style].top = top + "px";

				if (
					!dropdownMenu[classList].contains(
						"mui-dropdown__menu--right"
					)
				) {
					dropdownMenu[style].left = left + "px";
				}

				if (!dropdownMenu[classList].contains(isActiveClass)) {
					dropdownMenu[classList].add(isActiveClass);
				} else {
					dropdownMenu[classList].remove(isActiveClass);
				}

				manageOtherCollapsableAll(dropdownMenu);
				var linkAll = dropdownMenu[getElementsByTagName]("a") || "";

				if (linkAll) {
					var i, l;

					for (i = 0, l = linkAll[_length]; i < l; i += 1) {
						linkAll[i][_addEventListener](
							"click",
							hideCurrentDropdownMenu.bind(null, dropdownMenu)
						);
					}

					i = l = null;
				}
			}
		};

		var manageDropdownButtonAll = function manageDropdownButtonAll(scope) {
			var ctx = scope && scope.nodeName ? scope : "";
			var linkTag = "a";
			var linkAll = ctx
				? ctx[getElementsByTagName](linkTag) || ""
				: document[getElementsByTagName](linkTag) || "";
			var dropdownButtonAll = [];
			var j, m;

			for (j = 0, m = linkAll[_length]; j < m; j += 1) {
				if (linkAll[j][dataset].muiToggle) {
					dropdownButtonAll.push(linkAll[j]);
				}
			}

			j = m = null;

			if (dropdownButtonAll) {
				var i, l;

				for (i = 0, l = dropdownButtonAll[_length]; i < l; i += 1) {
					if (
						!dropdownButtonAll[i][classList].contains(
							isBindedClass
						) &&
						dropdownButtonAll[
							i
						].nextElementSibling.nodeName.toLowerCase() === "ul" &&
						dropdownButtonAll[i].nextElementSibling.nodeType === 1
					) {
						dropdownButtonAll[i][_addEventListener](
							"click",
							handleDropdownButton
						);

						dropdownButtonAll[i][classList].add(isBindedClass);
						dropdownButtonAll[i][classList].remove(isActiveClass);
						dropdownButtonAll[i].nextElementSibling[classList].add(
							isCollapsableClass
						);
					}
				}

				i = l = null;
			}
		};

		manageDropdownButtonAll();

		var hideDropdownMenuAll = function hideDropdownMenuAll() {
			var dropdownMenuAll =
				document[getElementsByClassName]("mui-dropdown__menu") || "";

			if (dropdownMenuAll) {
				var i, l;

				for (i = 0, l = dropdownMenuAll[_length]; i < l; i += 1) {
					if (dropdownMenuAll[i][classList].contains(isActiveClass)) {
						dropdownMenuAll[i][classList].remove(isActiveClass);
					}
				}

				i = l = null;
			}
		};

		var hideDropdownMenuAllOnNavigating = function hideDropdownMenuAllOnNavigating() {
			if (appContentParent) {
				appContentParent[_addEventListener](
					"click",
					hideDropdownMenuAll
				);
			}

			root[_addEventListener]("resize", hideDropdownMenuAll);
		};

		hideDropdownMenuAllOnNavigating();

		var manageHljsCodeAll = function manageHljsCodeAll(scope) {
			var ctx = scope && scope.nodeName ? scope : "";
			var codeTag = "code";
			var codeAll = ctx
				? ctx[getElementsByTagName](codeTag) || ""
				: document[getElementsByTagName](codeTag) || "";

			if (root.hljs) {
				var i, l;

				for (i = 0, l = codeAll[_length]; i < l; i += 1) {
					if (
						codeAll[i][classList].contains("hljs") &&
						!codeAll[i][classList].contains(isBindedClass)
					) {
						hljs.highlightBlock(codeAll[i]);
						codeAll[i][classList].add(isBindedClass);
					}
				}

				i = l = null;
			}
		};

		var manageRippleEffect = function manageRippleEffect() {
			if (root.ripple) {
				ripple.registerRipples();
			}
		};

		manageRippleEffect();
		var appEvents = new EventEmitter();
		var mgrid;

		var updateMinigrid = function updateMinigrid(delay) {
			var timeout = delay || 100;
			var logThis;

			logThis = function logThis() {
				console.log("updateMinigrid");
			};

			if (mgrid) {
				var timer = setTimeout(function() {
					clearTimeout(timer);
					timer = null;
					/* logThis(); */

					mgrid.mount();
				}, timeout);
			}
		};

		var updateMinigridThrottled = throttle(updateMinigrid, 2000);

		var setIsActiveClass = function setIsActiveClass(e) {
			if (e && e.nodeName && !e[classList].contains(isActiveClass)) {
				e[classList].add(isActiveClass);
			}
		};

		var triggerOnHeightChange = function triggerOnHeightChange(
			e,
			delay,
			tresholdHeight,
			callback
		) {
			var cb = function cb() {
				return callback && "function" === typeof callback && callback();
			};

			var keyHeight = tresholdHeight || 108;
			var logThis;

			logThis = function logThis(timer, slot, height) {
				console.log(
					"triggerOnHeightChange:",
					timer,
					slot,
					keyHeight,
					e.nodeName ? e.nodeName : "",
					e.className ? "." + e.className : "",
					e.id ? "#" + e.id : "",
					height
				);
			};
			/* destroy operation if for some time
      failed - you should multiply counter
      by set interval slot
      to get milliseconds */

			var counter = 8;
			var slot = delay || 100;
			var timer = setInterval(function() {
				counter--;

				if (counter === 0) {
					clearInterval(timer);
					timer = null;
				}

				var height = e.clientHeight || e.offsetHeight || "";
				/* logThis(timer, slot, height); */

				if (keyHeight < height) {
					clearInterval(timer);
					timer = null;
					/* logThis(timer, slot, height); */

					cb();
				}
			}, slot);
		};

		var minigridCardIsBindedClass = "minigrid-card--is-binded";

		var manageDisqusEmbed = function manageDisqusEmbed() {
			var disqusThread = document[getElementById]("disqus_thread") || "";
			var locationHref = root.location.href || "";
			var disqusThreadShortname = disqusThread
				? disqusThread[dataset].shortname || ""
				: "";

			var hideDisqusThread = function hideDisqusThread() {
				removeChildren(disqusThread);
				var replacementText = document[createElement]("p");
				replacementText[appendChild](
					document[createTextNode](
						"Комментарии доступны только в веб версии этой страницы."
					)
				);
				appendFragment(replacementText, disqusThread);
				disqusThread.removeAttribute("id");
			};

			var initScript = function initScript() {
				var setDisqusCSSClass = function setDisqusCSSClass() {
					disqusThread[classList].add(isActiveClass);
				};

				if (root.DISQUS) {
					try {
						DISQUS.reset({
							reload: true,
							config: function config() {
								this.page.identifier = disqusThreadShortname;
								this.page.url = locationHref;
							}
						});

						if (
							!disqusThread[parentNode][classList].contains(
								minigridCardIsBindedClass
							)
						) {
							disqusThread[parentNode][classList].add(
								minigridCardIsBindedClass
							);
							triggerOnHeightChange(
								disqusThread[parentNode],
								1000,
								null,
								setDisqusCSSClass
							);

							disqusThread[parentNode][_addEventListener](
								"onresize",
								updateMinigridThrottled,
								{
									passive: true
								}
							);
						}
					} catch (err) {
						throw new Error("cannot DISQUS.reset " + err);
					}
				}
			};

			if (disqusThread && disqusThreadShortname && locationHref) {
				if ("undefined" !== typeof getHTTP && getHTTP()) {
					var jsUrl =
						forcedHTTP +
						"://" +
						disqusThreadShortname +
						".disqus.com/embed.js";

					if (!scriptIsLoaded(jsUrl)) {
						var load;
						load = new loadJsCss([jsUrl], initScript);
					} else {
						initScript();
					}
				} else {
					hideDisqusThread();
				}
			}
		};

		var manageInstagramEmbeds = function manageInstagramEmbeds() {
			var instagramMedia =
				document[getElementsByClassName]("instagram-media")[0] || "";

			var initScript = function initScript() {
				if (root.instgrm) {
					try {
						var instagramMedia =
							document[getElementsByClassName](
								"instagram-media"
							) || "";

						if (instagramMedia) {
							instgrm.Embeds.process();
							var i, l;

							for (
								i = 0, l = instagramMedia[_length];
								i < l;
								i += 1
							) {
								if (
									!instagramMedia[i][parentNode][
										classList
									].contains(minigridCardIsBindedClass)
								) {
									instagramMedia[i][parentNode][
										classList
									].add(minigridCardIsBindedClass);
									triggerOnHeightChange(
										instagramMedia[i][parentNode],
										1000,
										null,
										setIsActiveClass.bind(
											null,
											instagramMedia[i][parentNode]
										)
									);

									instagramMedia[i][parentNode][
										_addEventListener
									]("onresize", updateMinigridThrottled, {
										passive: true
									});
								}
							}

							i = l = null;
						}
					} catch (err) {
						throw new Error("cannot instgrm.Embeds.process " + err);
					}
				}
			};

			if (instagramMedia) {
				var jsUrl = forcedHTTP + "://www.instagram.com/embed.js";

				if (!scriptIsLoaded(jsUrl)) {
					var load;
					load = new loadJsCss([jsUrl], initScript);
				} else {
					initScript();
				}
			}
		};

		var manageTwitterEmbeds = function manageTwitterEmbeds() {
			var twitterTweet =
				document[getElementsByClassName]("twitter-tweet")[0] || "";

			var initScript = function initScript() {
				if (root.twttr) {
					try {
						var twitterTweet =
							document[getElementsByClassName]("twitter-tweet") ||
							"";

						if (twitterTweet) {
							twttr.widgets.load();
							var i, l;

							for (
								i = 0, l = twitterTweet[_length];
								i < l;
								i += 1
							) {
								if (
									!twitterTweet[i][parentNode][
										classList
									].contains(minigridCardIsBindedClass)
								) {
									twitterTweet[i][parentNode][classList].add(
										minigridCardIsBindedClass
									);
									triggerOnHeightChange(
										twitterTweet[i][parentNode],
										1000,
										null,
										setIsActiveClass.bind(
											null,
											twitterTweet[i][parentNode]
										)
									);

									twitterTweet[i][parentNode][
										_addEventListener
									]("onresize", updateMinigridThrottled, {
										passive: true
									});
								}
							}

							i = l = null;
						}
					} catch (err) {
						throw new Error("cannot twttr.widgets.load " + err);
					}
				}
			};

			if (twitterTweet) {
				var jsUrl = forcedHTTP + "://platform.twitter.com/widgets.js";

				if (!scriptIsLoaded(jsUrl)) {
					var load;
					load = new loadJsCss([jsUrl], initScript);
				} else {
					initScript();
				}
			}
		};

		var manageVkEmbeds = function manageVkEmbeds() {
			var vkPost = document[getElementsByClassName]("vk-post")[0] || "";

			var initScript = function initScript() {
				var initVkPost = function initVkPost(
					element_id,
					owner_id,
					post_id,
					hash
				) {
					if (!VK.Widgets.Post(element_id, owner_id, post_id, hash)) {
						initVkPost();
					}
				};

				if (root.VK && VK.Widgets && VK.Widgets.Post) {
					try {
						var vkPost =
							document[getElementsByClassName]("vk-post") || "";

						if (vkPost) {
							var i, l;

							for (i = 0, l = vkPost[_length]; i < l; i += 1) {
								if (
									!vkPost[i][parentNode][classList].contains(
										minigridCardIsBindedClass
									)
								) {
									vkPost[i][parentNode][classList].add(
										minigridCardIsBindedClass
									);
									triggerOnHeightChange(
										vkPost[i][parentNode],
										1000,
										null,
										setIsActiveClass.bind(
											null,
											vkPost[i][parentNode]
										)
									);

									vkPost[i][parentNode][_addEventListener](
										"onresize",
										updateMinigridThrottled,
										{
											passive: true
										}
									);

									initVkPost(
										vkPost[i].id,
										vkPost[i][dataset].vkOwnerid,
										vkPost[i][dataset].vkPostid,
										vkPost[i][dataset].vkHash
									);
								}
							}

							i = l = null;
						}
					} catch (err) {
						throw new Error("cannot initVkPost " + err);
					}
				}
			};

			if (vkPost) {
				var jsUrl = forcedHTTP + "://vk.com/js/api/openapi.js?154";

				if (!scriptIsLoaded(jsUrl)) {
					var load;
					load = new loadJsCss([jsUrl], initScript);
				} else {
					initScript();
				}
			}
		};

		var cardWrapClass = "card-wrap";
		appEvents.addListeners("MinigridInited", [
			handleDataSrcIframeAll.bind(null, updateMinigridThrottled),
			handleDataSrcImageAll.bind(null, updateMinigridThrottled),
			manageDataQrcodeImageAll.bind(null, updateMinigridThrottled),
			scroll2Top.bind(null, 0, 20000),
			manageInstagramEmbeds,
			manageTwitterEmbeds,
			manageVkEmbeds,
			manageDisqusEmbed
		]);
		var cardGridClass = "card-grid";

		var initMinigrid = function initMinigrid() {
			var cardGrid =
				document[getElementsByClassName](cardGridClass)[0] || "";

			if (cardGrid) {
				try {
					if (mgrid) {
						mgrid = null;

						root[_removeEventListener]("resize", updateMinigrid);
					}

					mgrid = new Minigrid({
						container: "." + cardGridClass,
						item: "." + cardWrapClass,
						gutter: 20
					});
					mgrid.mount();
					cardGrid[classList].add(isActiveClass);

					root[_addEventListener]("resize", updateMinigrid, {
						passive: true
					});

					appEvents.emitEvent("MinigridInited");
				} catch (err) {
					throw new Error("cannot init Minigrid " + err);
				}
			}
		};

		appEvents.addListeners("MinigridCardsFound", [initMinigrid]);

		var manageMinigrid = function manageMinigrid() {
			return new Promise(function(resolve, reject) {
				var cardGrid =
					document[getElementsByClassName](cardGridClass)[0] || "";

				var handleCardGrid = function handleCardGrid() {
					var cardWrap =
						cardGrid[getElementsByClassName](cardWrapClass) || "";
					var cardWrapLength = cardWrap[_length] || 0;

					if (
						cardWrap &&
						!cardGrid[classList].contains(isActiveClass)
					) {
						scroll2Top(1, 20000);
						appEvents.emitEvent("MinigridCardsFound");
						resolve(
							"manageMinigrid: found " + cardWrapLength + " cards"
						);
					} else {
						reject("manageMinigrid: no cards found");
					}
				};

				if (root.Minigrid && cardGrid) {
					handleCardGrid();
				}
			});
		};

		var macy;

		var updateMacy = function updateMacy(delay) {
			var timeout = delay || 100;
			var logThis;

			logThis = function logThis() {
				console.log("updateMacy");
			};

			if (macy) {
				var timer = setTimeout(function() {
					clearTimeout(timer);
					timer = null;
					/* logThis(); */

					macy.recalculate(true, true);
				}, timeout);
			}
		};

		var updateMacyThrottled = throttle(updateMacy, 1000);
		appEvents.addListeners("MacyInited", [
			handleDataSrcIframeAll.bind(null, updateMacyThrottled),
			handleDataSrcImageAll.bind(null, updateMacyThrottled),
			scroll2Top.bind(null, 0, 20000)
		]);
		var macyGridClass = "macy-grid";

		var initMacy = function initMacy() {
			var macyContainer =
				document[getElementsByClassName](macyGridClass)[0] || "";

			if (macyContainer) {
				try {
					if (macy) {
						macy.remove();
					}

					macy = new Macy({
						container: "." + macyGridClass,
						trueOrder: false,
						waitForImages: false,
						margin: 0,
						columns: 5,
						breakAt: {
							1280: 5,
							1024: 4,
							960: 3,
							640: 2,
							480: 2,
							360: 1
						}
					});
					macyContainer[classList].add(isActiveClass);
					appEvents.emitEvent("MacyInited");
				} catch (err) {
					throw new Error("cannot init Macy " + err);
				}
			}
		};

		appEvents.addListeners("MacyImagesLoaded", [initMacy]);

		var manageMacy = function manageMacy() {
			return new Promise(function(resolve, reject) {
				var macyContainer =
					document[getElementsByClassName](macyGridClass)[0] || "";

				var handleMacyContainer = function handleMacyContainer() {
					var img = macyContainer[getElementsByTagName]("img") || "";
					var imgLength = img[_length] || 0;
					var imgCounter = 0;
					var onLoad;
					var onError;

					var addListeners = function addListeners(e) {
						e[_addEventListener]("load", onLoad, false);

						e[_addEventListener]("error", onError, false);
					};

					var removeListeners = function removeListeners(e) {
						e[_removeEventListener]("load", onLoad, false);

						e[_removeEventListener]("error", onError, false);
					};

					onLoad = function onLoad() {
						removeListeners(this);
						imgCounter++;

						if (imgCounter === imgLength) {
							scroll2Top(1, 20000);
							appEvents.emitEvent("MacyImagesLoaded");
							resolve(
								"manageMacy: all " +
									imgCounter +
									" images loaded"
							);
						}
					};

					onError = function onError() {
						removeListeners(this);
						reject("manageMacy: cannot load " + this.src);
					};

					if (
						img &&
						!macyContainer[classList].contains(isActiveClass)
					) {
						var i, l;

						for (i = 0, l = img[_length]; i < l; i += 1) {
							addListeners(img[i]);
						}

						i = l = null;
					}
				};

				if (root.Macy && macyContainer) {
					handleMacyContainer();
				}
			});
		};

		var handleSidedrawerCategory = function handleSidedrawerCategory(evt) {
			evt.stopPropagation();
			evt.preventDefault();

			var _this = this;

			var categoryItem = _this.nextElementSibling;

			if (categoryItem) {
				if (categoryItem[style].display === "none") {
					categoryItem[style].display = "block";
				} else {
					categoryItem[style].display = "none";
				}
			}
		};

		var manageSidedrawerCategoryAll = function manageSidedrawerCategoryAll() {
			var sidedrawerCategoryAll = sidedrawer
				? sidedrawer[getElementsByTagName]("strong") || ""
				: "";

			if (sidedrawerCategoryAll) {
				var i, l;

				for (i = 0, l = sidedrawerCategoryAll[_length]; i < l; i += 1) {
					if (
						!sidedrawerCategoryAll[i][classList].contains(
							isBindedClass
						) &&
						sidedrawerCategoryAll[
							i
						].nextElementSibling.nodeName.toLowerCase() === "ul" &&
						sidedrawerCategoryAll[i].nextElementSibling.nodeType ===
							1
					) {
						sidedrawerCategoryAll[i].nextElementSibling[
							style
						].display = "none";

						sidedrawerCategoryAll[i][_addEventListener](
							"click",
							handleSidedrawerCategory
						);

						sidedrawerCategoryAll[i][classList].add(isBindedClass);
					}
				}

				i = l = null;
			}
		};

		var hideSidedrawerOnNavigating = function hideSidedrawerOnNavigating() {
			var linkAll;

			if (sidedrawer) {
				linkAll = sidedrawer[getElementsByTagName]("a") || "";

				if (linkAll) {
					var i, l;

					for (i = 0, l = linkAll[_length]; i < l; i += 1) {
						if (!linkAll[i][classList].contains(isBindedClass)) {
							linkAll[i][_addEventListener](
								"click",
								hideSidedrawer
							);

							linkAll[i][classList].add(isBindedClass);
						}
					}

					i = l = null;
				}
			}

			if (appContentParent) {
				appContentParent[_addEventListener]("click", hideSidedrawer);
			}
		};

		var handleMenuButton = function handleMenuButton() {
			if (sidedrawer) {
				if (!docBody[classList].contains(hideSidedrawerClass)) {
					docBody[classList].add(hideSidedrawerClass);
				} else {
					docBody[classList].remove(hideSidedrawerClass);
				}

				if (!sidedrawer[classList].contains(activeClass)) {
					sidedrawer[classList].add(activeClass);
				} else {
					sidedrawer[classList].remove(activeClass);
				}

				manageOtherCollapsableAll(sidedrawer);
			}
		};

		var manageSidedrawer = function manageSidedrawer() {
			var menuButtonAll =
				document[getElementsByClassName]("sidedrawer-toggle") || "";

			if (menuButtonAll) {
				var i, l;

				for (i = 0, l = menuButtonAll[_length]; i < l; i += 1) {
					if (!menuButtonAll[i][classList].contains(isBindedClass)) {
						menuButtonAll[i][_addEventListener](
							"click",
							handleMenuButton
						);

						menuButtonAll[i][classList].add(isBindedClass);
					}
				}

				i = l = null;
			}
		};

		manageSidedrawer();

		var highlightSidedrawerItem = function highlightSidedrawerItem() {
			var sidedrawerCategoriesList =
				document[getElementById]("render_sitedrawer_categories") || "";
			var items = sidedrawerCategoriesList
				? sidedrawerCategoriesList[getElementsByTagName]("a") || ""
				: "";
			var locationHref = root.location.href || "";

			var addItemHandler = function addItemHandler(e) {
				if (locationHref === e.href) {
					e[classList].add(isActiveClass);
				} else {
					e[classList].remove(isActiveClass);
				}
			};

			var addItemHandlerAll = function addItemHandlerAll() {
				var i, l;

				for (i = 0, l = items[_length]; i < l; i += 1) {
					addItemHandler(items[i]);
				}

				i = l = null;
			};

			if (sidedrawerCategoriesList && items && locationHref) {
				addItemHandlerAll();
			}
		};

		root[_addEventListener]("hashchange", highlightSidedrawerItem);

		var appBar = document[getElementsByTagName]("header")[0] || "";
		var appBarHeight = appBar.offsetHeight || 0;
		var isFixedClass = "is-fixed";
		var isHiddenClass = "is-hidden";

		var hideAppBar = function hideAppBar() {
			var logic = function logic() {
				appBar[classList].remove(isFixedClass);

				if (
					(document[body].scrollTop || docElem.scrollTop || 0) >
					appBarHeight
				) {
					appBar[classList].add(isHiddenClass);
				} else {
					appBar[classList].remove(isHiddenClass);
				}
			};

			var throttleLogic = throttle(logic, 100);
			throttleLogic();
		};

		var revealAppBar = function revealAppBar() {
			var logic = function logic() {
				appBar[classList].remove(isHiddenClass);

				if (
					(document[body].scrollTop || docElem.scrollTop || 0) >
					appBarHeight
				) {
					appBar[classList].add(isFixedClass);
				} else {
					appBar[classList].remove(isFixedClass);
				}
			};

			var throttleLogic = throttle(logic, 100);
			throttleLogic();
		};

		var resetAppBar = function resetAppBar() {
			var logic = function logic() {
				if (
					(document[body].scrollTop || docElem.scrollTop || 0) <
					appBarHeight
				) {
					appBar[classList].remove(isHiddenClass);
					appBar[classList].remove(isFixedClass);
				}
			};

			var throttleLogic = throttle(logic, 100);
			throttleLogic();
		};

		if (appBar) {
			root[_addEventListener]("scroll", resetAppBar, {
				passive: true
			});

			if (hasTouch) {
				if (root.tocca) {
					document[_addEventListener]("swipeup", hideAppBar, {
						passive: true
					});

					document[_addEventListener]("swipedown", revealAppBar, {
						passive: true
					});
				}
			} else {
				if (hasWheel) {
					if (root.WheelIndicator) {
						var indicator;
						indicator = new WheelIndicator({
							elem: root,
							callback: function callback(e) {
								if ("down" === e.direction) {
									hideAppBar();
								}

								if ("up" === e.direction) {
									revealAppBar();
								}
							},
							preventMouse: false
						});
					}
				}
			}
		}

		var managePrevNextLinks = function managePrevNextLinks(jsonObj) {
			var btnPrevPage =
				document[getElementsByClassName]("btn-prev-page")[0] || "";
			var btnNextPage =
				document[getElementsByClassName]("btn-next-page")[0] || "";

			if (btnPrevPage && btnNextPage) {
				var locationHash = root.location.hash || "";
				var prevHash;
				var nextHash;

				if (locationHash) {
					var i, l;

					for (i = 0, l = jsonObj.hashes[_length]; i < l; i += 1) {
						if (locationHash === jsonObj.hashes[i].href) {
							prevHash =
								i > 0
									? jsonObj.hashes[i - 1].href
									: jsonObj.hashes[
											jsonObj.hashes[_length] - 1
									  ].href;
							nextHash =
								jsonObj.hashes[_length] > i + 1
									? jsonObj.hashes[i + 1].href
									: jsonObj.hashes[0].href;
							break;
						}
					}

					i = l = null;
				} else {
					prevHash = jsonObj.hashes[jsonObj.hashes[_length] - 1].href;
					nextHash = jsonObj.hashes[1].href;
				}

				if (prevHash && nextHash) {
					btnPrevPage.href = prevHash;
					btnNextPage.href = nextHash;
				}
			}
		};

		var jhrouter;
		jhrouter = new JsonHashRouter(
			"./libs/mytushino-muicss/json/navigation.min.json",
			appContentId,
			{
				jsonHomePropName: "home",
				jsonNotfoundPropName: "notfound",
				jsonHashesPropName: "hashes",
				jsonHrefPropName: "href",
				jsonUrlPropName: "url",
				jsonTitlePropName: "title",
				onJsonParsed: function onJsonParsed(jsonResponse) {
					var sidedrawerCategoriesTemplateId =
						"template_sitedrawer_categories";

					if (root.t) {
						sidedrawerCategoriesTemplateId =
							"t_template_sitedrawer_categories";
					} else {
						if (root.Mustache) {
							sidedrawerCategoriesTemplateId =
								"mustache_template_sitedrawer_categories";
						}
					}

					var sidedrawerCategoriesTemplate =
						document[getElementById](
							sidedrawerCategoriesTemplateId
						) || "";
					var sidedrawerCategoriesRenderId =
						"render_sitedrawer_categories";
					var sidedrawerCategoriesRender =
						document[getElementById](
							sidedrawerCategoriesRenderId
						) || "";

					if (
						sidedrawerCategoriesTemplate &&
						sidedrawerCategoriesRender
					) {
						insertFromTemplate(
							jsonResponse,
							sidedrawerCategoriesTemplateId,
							sidedrawerCategoriesRenderId,
							function() {
								manageSidedrawerCategoryAll();
								hideSidedrawerOnNavigating();
							},
							true
						);
					}

					var dropdownContactsTemplateId =
						"template_dropdown_contacts";

					if (root.t) {
						dropdownContactsTemplateId =
							"t_template_dropdown_contacts";
					} else {
						if (root.Mustache) {
							dropdownContactsTemplateId =
								"mustache_template_dropdown_contacts";
						}
					}

					var dropdownContactsTemplate =
						document[getElementById](dropdownContactsTemplateId) ||
						"";
					var dropdownContactsRenderId = "render_dropdown_contacts";
					var dropdownContactsRender =
						document[getElementById](dropdownContactsRenderId) ||
						"";

					if (dropdownContactsTemplate && dropdownContactsRender) {
						insertFromTemplate(
							jsonResponse,
							dropdownContactsTemplateId,
							dropdownContactsRenderId,
							function() {
								manageDropdownButtonAll();
								manageExternalLinkAll();
							},
							true
						);
					}

					var dropdownAdsTemplateId = "template_dropdown_ads";

					if (root.t) {
						dropdownAdsTemplateId = "t_template_dropdown_ads";
					} else {
						if (root.Mustache) {
							dropdownAdsTemplateId =
								"mustache_template_dropdown_ads";
						}
					}

					var dropdownAdsTemplate =
						document[getElementById](dropdownAdsTemplateId) || "";
					var dropdownAdsRenderId = "render_dropdown_ads";
					var dropdownAdsRender =
						document[getElementById](dropdownAdsRenderId) || "";

					if (dropdownAdsTemplate && dropdownAdsRender) {
						insertFromTemplate(
							jsonResponse,
							dropdownAdsTemplateId,
							dropdownAdsRenderId,
							function() {
								manageDropdownButtonAll();
								manageExternalLinkAll();
							},
							true
						);
					}
				},
				onContentInserted: function onContentInserted(
					jsonObj,
					titleString
				) {
					document[title] =
						(titleString ? titleString + " - " : "") +
						(initialDocumentTitle
							? initialDocumentTitle +
							  (userBrowsingDetails ? userBrowsingDetails : "")
							: "");

					if (appContentParent) {
						managePrevNextLinks(jsonObj);
						manageExternalLinkAll(appContentParent);
						manageImgLightboxLinkAll("img-lightbox-link");
						manageIframeLightboxLinkAll("iframe-lightbox-link");
						manageDropdownButtonAll(appContentParent);
						manageHljsCodeAll(appContentParent);
						manageRippleEffect();
						highlightSidedrawerItem();
						manageReadMore();
						manageExpandingLayers();
						manageMacy()
							.then(function(result) {
								console.log(result);
							})
							/* .then(function () {
          	handleDataSrcImageAll(updateMacyThrottled);
          }).then(function () {
          	handleDataSrcIframeAll(updateMacyThrottled);
          }).then(function () {
          	scroll2Top(0, 20000);
          }) */
							.catch(function(err) {
								console.log(err);
							});
						manageMinigrid()
							.then(function(result) {
								console.log(result);
							})
							/* .then(function () {
          	handleDataSrcImageAll(updateMacyThrottled);
          }).then(function () {
          	handleDataSrcIframeAll(updateMacyThrottled);
          }).then(function () {
          	manageDataQrcodeImageAll(updateMinigridThrottled);
          }).then(function () {
          	scroll2Top(0, 20000);
          }).then(function () {
          	manageInstagramEmbeds();
          }).then(function () {
          	manageTwitterEmbeds();
          }).then(function () {
          	manageVkEmbeds();
          }).then(function () {
          	manageDisqusEmbed();
          }) */
							.catch(function(err) {
								console.log(err);
							});
					}

					LoadingSpinner.hide();
					scroll2Top(0, 20000);
				},
				onBeforeContentInserted: function onBeforeContentInserted() {
					LoadingSpinner.show();
				}
			}
		);
	};
	/* var scripts = [
  			"../../fonts/roboto-fontfacekit/2.137/css/roboto.css",
  			"../../fonts/roboto-mono-fontfacekit/2.0.986/css/roboto-mono.css",
  			"../../cdn/mui/0.9.39/css/mui.css",
  			"../../cdn/iframe-lightbox/0.2.8/css/iframe-lightbox.fixed.css",
  			"../../cdn/img-lightbox/0.2.1/css/img-lightbox.fixed.css"
  ]; */

	var scripts = [
		/* "./libs/mytushino-muicss/css/vendors.min.css", */
		"./libs/mytushino-muicss/css/bundle.min.css"
	];

	var supportsPassive = (function() {
		var support = false;

		try {
			var opts =
				Object[defineProperty] &&
				Object[defineProperty]({}, "passive", {
					get: function get() {
						support = true;
					}
				});

			root[_addEventListener]("test", function() {}, opts);
		} catch (err) {}

		return support;
	})();

	var needsPolyfills = (function() {
		return (
			!String.prototype.startsWith ||
			!supportsPassive ||
			!root.requestAnimationFrame ||
			!root.matchMedia ||
			("undefined" === typeof root.Element && !("dataset" in docElem)) ||
			!("classList" in document[createElement]("_")) ||
			(document[createElementNS] &&
				!(
					"classList" in
					document[createElementNS]("http://www.w3.org/2000/svg", "g")
				)) ||
			/* !document.importNode || */

			/* !("content" in document[createElement]("template")) || */
			(root.attachEvent && !root[_addEventListener]) ||
			!("onhashchange" in root) ||
			!Array.prototype.indexOf ||
			!root.Promise ||
			!root.fetch ||
			!document[querySelectorAll] ||
			!document[querySelector] ||
			!Function.prototype.bind ||
			(Object[defineProperty] &&
				Object[getOwnPropertyDescriptor] &&
				Object[getOwnPropertyDescriptor](
					Element.prototype,
					"textContent"
				) &&
				!Object[getOwnPropertyDescriptor](
					Element.prototype,
					"textContent"
				).get) ||
			!(
				"undefined" !== typeof root.localStorage &&
				"undefined" !== typeof root.sessionStorage
			) ||
			!root.WeakMap ||
			!root.MutationObserver
		);
	})();

	if (needsPolyfills) {
		scripts.push("./cdn/polyfills/js/polyfills.fixed.min.js");
	}
	/* var scripts = [
  			"./bower_components/iframe-lightbox/iframe-lightbox.js",
  			"../../cdn/img-lightbox/0.2.1/js/img-lightbox.fixed.js",
  			"../../cdn/qrjs2/0.1.7/js/qrjs2.fixed.js",
  			"../../cdn/Tocca.js/2.0.1/js/Tocca.fixed.js",
  			"../../cdn/wheel-indicator/1.1.4/js/wheel-indicator.fixed.js",
  			"../../cdn/resize/1.0.0/js/any-resize-event.fixed.js",
  			"./node_modules/macy/dist/macy.js",
  			"../../cdn/mustache/2.3.0/js/mustache.fixed.js",
  			"../../cdn/EventEmitter/5.2.5/js/EventEmitter.fixed.js",,
  			"../../cdn/minigrid/3.1.1/js/minigrid.fixed.js",
  			"../../cdn/ripple-js/1.4.4/js/ripple.fixed.js",
  			"../../cdn/ReadMore.js/1.0.0/js/readMoreJS.fixed.js"
  ]; */

	scripts.push("./libs/mytushino-muicss/js/vendors.min.js");
	/*!
	 * load scripts after webfonts loaded using doesFontExist
	 */

	var supportsCanvas;

	supportsCanvas = (function() {
		var elem = document[createElement]("canvas");
		return !!(elem.getContext && elem.getContext("2d"));
	})();

	var onFontsLoadedCallback = function onFontsLoadedCallback() {
		var slot;

		var onFontsLoaded = function onFontsLoaded() {
			if (slot) {
				clearInterval(slot);
				slot = null;
			}
			/* progressBar.increase(20); */

			var load;
			load = new loadJsCss(scripts, run);
		};

		var checkFontIsLoaded;

		checkFontIsLoaded = function checkFontIsLoaded() {
			/*!
			 * check only for fonts that are used in current page
			 */
			if (
				doesFontExist("Roboto")
				/* && doesFontExist("Roboto Mono") */
			) {
				onFontsLoaded();
			}
		};
		/* if (supportsCanvas) {
    	slot = setInterval(checkFontIsLoaded, 100);
    } else {
    	slot = null;
    	onFontsLoaded();
    } */

		onFontsLoaded();
	};

	var loadDeferred = function loadDeferred() {
		var timer;

		var logic = function logic() {
			clearTimeout(timer);
			timer = null;
			var load;
			load = new loadJsCss(
				[
					/* forcedHTTP + "://fonts.googleapis.com/css?family=Roboto+Mono%7CRoboto:300,400,500,700&subset=cyrillic,latin-ext", */
					"./libs/mytushino-muicss/css/vendors.min.css"
				],
				onFontsLoadedCallback
			);
		};

		var req;

		var raf = function raf() {
			cancelAnimationFrame(req);
			timer = setTimeout(logic, 0);
		};

		if (root.requestAnimationFrame) {
			req = requestAnimationFrame(raf);
		} else {
			root[_addEventListener]("load", logic);
		}
	};

	loadDeferred();
	/*!
	 * load scripts after webfonts loaded using webfontloader
	 */

	/* root.WebFontConfig = {
  	google: {
  		families: [
  			"Roboto:300,400,500,700:cyrillic",
  			"Roboto Mono:400:cyrillic,latin-ext"
  		]
  	},
  	listeners: [],
  	active: function () {
  		this.called_ready = true;
  		var i;
  		for (i = 0; i < this.listeners[_length]; i++) {
  			this.listeners[i]();
  		}
  		i = null;
  	},
  	ready: function (callback) {
  		if (this.called_ready) {
  			callback();
  		} else {
  			this.listeners.push(callback);
  		}
  	}
  };
  	var onFontsLoadedCallback = function () {
  		var onFontsLoaded = function () {
  		progressBar.increase(20);
  			var load;
  		load = new loadJsCss(scripts, run);
  	};
  		root.WebFontConfig.ready(onFontsLoaded);
  };
  	var load;
  load = new loadJsCss(
  		[forcedHTTP + "://cdn.jsdelivr.net/npm/webfontloader@1.6.28/webfontloader.min.js"],
  		onFontsLoadedCallback
  	); */
})("undefined" !== typeof window ? window : this, document);
