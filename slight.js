if ("undefined" === typeof jQuery)
    throw new Error("Slight requires jQuery to work");

var Slight = Slight || {};
var SlightPlugin = SlightPlugin || {};


function SlightPlugin(options) {

	var defaults = {

		url: 'http://localhost/',
		after: function() {},
		before: function() {},
		success: function() {},
		fallback: "HASH_ROUTING",
		cache: true,
		csrf: false,
		token: false,
		pageClass: '.slight-body',
	};

	this.__config  = $.extend( {}, defaults, options || {} );
	
	this.__routes = [];
	
	this.__notFound = {};
	
	this.__routesLastIndex = 0;

	this.__queryString = {};

	progress_meter = document.createElement("div");
	progress_meter.setAttribute("class", "slight-progress-meter");
	progress_meter.style.display = "none";

	progress_bar = document.createElement("div");
	progress_bar.setAttribute("class", "progress-bar");
	progress_bar.setAttribute("data-role", "slight-progress-meter");
	progress_bar.setAttribute("data-pos", "0");
	progress_bar.style.width = "0%";

	progress_meter.appendChild(progress_bar);

	$("body").append(progress_meter);

}

SlightPlugin.prototype.config = function(key, value) {
	
	if (typeof value === 'undefined') {
		return typeof this.__config[key] === 'undefined' ? null : this.__config[key];
	} else {
		this.__config[key] = value;
	}
	
};

SlightPlugin.prototype.query = function(key) {
		
		if (typeof key === "undefined") return this.__queryString;

		if (typeof this.__queryString[key] !== undefined) {
			return this.__queryString[key];
		}

		return;
			
};

SlightPlugin.prototype.router = function(pattren, func) {

	var route = {pattren: pattren, func: func, after: function() {}, before: function() {}, scripts:[], css:[]};

	this.__routes.push(route);
	
	var routesLastIndex = this.__routes.length - 1;
	
	var instance = this;
	
	var hooks = {
		
		after: function(func) {
			if (typeof func !== "function") {
				throw new Error("After hook must be a Closure.");
			}
			instance.__routes[routesLastIndex].after = func;
			return hooks;
		},
		before: function(func) {
			if (typeof func !== "function") {
				throw new Error("After hook must be a Closure.");
			}
			instance.__routes[routesLastIndex].before = func;
			return hooks;
		},
		scripts: function(scripts) {
			if (typeof scripts !== "object") {
				throw new Error("Scripts must be provided in array.");
			}
			instance.__routes[routesLastIndex].scripts = scripts;
			return hooks;
		},
		css: function(css) {
			if (typeof css !== "object") {
				throw new Error("CSS must be provided in array.");
			}
			instance.__routes[routesLastIndex].css = css;
			return hooks;
		},
		cache: function() {

		}
	};
	
	return hooks;
	
};

SlightPlugin.prototype.notFound = function(func) {
	if (typeof func === "function") {
		this.__notFound = func;
		return;
	}
	throw new Error("Not found action must be function");
};


SlightPlugin.prototype.listen = function() {
	
	var instance = this;

	var parameters = [];

	var _onLoad = function() {
		var fallback = instance.config('fallback');
		
		if (fallback === "HASH_ROUTING" && !history) {
			alert(window.location.hash);
		} 

	};

	var _serve = function(slight_url, query_string) {

			query_bundles = query_string.split("&");
			if (query_bundles.length > 0) {
				for(index in query_bundles) {
					bundle = query_bundles[index];
					single_object = bundle.split("=");
					
					if (single_object.length == 2) {
						instance.__queryString[single_object[0]] = single_object[1];
					} else if (single_object.length == 1) {
						instance.__queryString[single_object[0]] = "";
					}
				}
			}
		
		routes = instance.__routes;
		
		for (index in routes) {
			route = routes[index];

			var route_pattren = route.pattren;
			replace_required_params = route_pattren.replace(/:[^\s/]+/g, '([\\w-]+)');
			final_pattren = replace_required_params.replace(/\?[^\s/]+/g, '?(.*)');
			
			var regExpObject = new RegExp(final_pattren);
		
			matchedResults = slight_url.match(regExpObject);
		
			if (matchedResults !== null && matchedResults.length > 0) {
				final_url = matchedResults[0];

				if (matchedResults.length > 1) {
					parameters = matchedResults.slice(1);
					/*for(index in arguments) {
						argument = arguments[index];
						parameters.push(argument.replace('/',''));
					}*/
				}
				
				if (final_url == slight_url) {
					route.url = final_url;
					return route;
				}
				
			}

		}
		
		return false;
	};
	
	var _render = function(path, options) {

		    options = $.extend({}, {
				    dataType: "html",
				    cache: false,
				    url: path
		  		},  options || {});
		 
		  // Return the jqXHR object so we can chain callbacks
		  return $.ajax( options );
	}

	var _dispatch = function(href, slight_url) {
        
        var before = instance.config('before');
		before();
                
		query_string = "";
		filtered_url = slight_url;
		if (slight_url.indexOf("?") >= 1){
			filtered_url = slight_url.substr(0, slight_url.indexOf("?"));
			query_string = slight_url.split("?").pop();
		}

		var route = _serve(filtered_url, query_string);
		var url = instance.config('url');
		var fallback = instance.config('fallback');
		
		if (fallback === "HASH_ROUTING" || fallback === "DEFAULT_ROUTING") {
			fallback_state = fallback;
		} else {
			fallback_state = "DEFAULT_ROUTING";
		}
		
		if (history && history.pushState){
				window.history.pushState(null, null, route.url);
		} else if(fallback_state === "HASH_ROUTING") {
			window.location.hash = "!" + route.url;
		} else {
			window.location = href;
		}
		
		if (route) {
			before = route.before;
			before();

			if (route.scripts.length > 0) {

				for(index in route.scripts) {
					script = route.scripts[index];
					_render(url + script, {dataType: "script", cache: true});
				}

			}

			if (route.css.length > 0) {
				for(index in route.css) {
					css = route.css[index];
					link = '<link href="' + url + css + '" rel="stylesheet" type="text/css">';
					$("head").append(link);
				}
			}

			$(".slight-progress-meter .progress-bar").data("pos", "0").css("width", "0%");
			$(".slight-progress-meter").show();

			_render(slight_url, { 
					 xhr: function()
	                {
	            
	                    var xhr = new window.XMLHttpRequest();
	                    xhr.upload.addEventListener("progress", function(evt) {
	                        if (evt.lengthComputable) {
	                            var percentComplete = evt.loaded / evt.total;
	                            percentCompleted = parseInt(percentComplete * 100);
	                            $(".slight-progress-meter .progress-bar").css("width", percentCompleted + "%");
	                            $(".slight-progress-meter .progress-bar").data("pos", percentCompleted);
	                        }
	                    }, false);

	                    
						xhr.addEventListener("progress", function(evt){
						  if (evt.lengthComputable) {
						    var percentComplete = evt.loaded / evt.total;
						     percentCompleted = parseInt(percentComplete * 100);
                            $(".slight-progress-meter .progress-bar").css("width", percentCompleted + "%");
                            $(".slight-progress-meter .progress-bar").data("pos", percentCompleted);

						  }
						}, false);

	                    return xhr;
	                },
					success: function(response) {
		    		    
		    		success = instance.config('success');
	    			$(instance.config('pageClass')).html(response);
	    			success();
		    		
		    	},
		    	method:"get"

			}).done(function(data, textStatus, jqXHR){

				$(".slight-progress-meter .progress-bar").data("pos", "0").css("width", "0%");
				$(".slight-progress-meter").hide();
                
                after = route.after;
                after();
				
                after = instance.config('after');
                after();
		  		
		  	}).fail(function(jqXHR, textStatus, errorThrown){

		  	});

			
		} else {
			
		}
		
		
	}
	
	window.onload = function() {

		_onLoad();

		if($("html").hasClass('slight')) {
			alert("has slight");
		}
		
		$(document).on("click", "a[data-role='slight']", function(e) {

            e.preventDefault();
			url = $(this).attr("href");
			slight_url = $(this).data("url") ? $(this).data("url") :  $(this).attr("href");
			_dispatch(url, slight_url);	
		
		});
		
	};
	
};