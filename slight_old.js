/*
 * Slight.js v1.0
 * (c) @artisangang, 2014
 * author: Harcharan Singh <artisangang@gmail.com>
 * git: https://github.com/artisangang/slightjs
 * License: GNU 2
 */

var slight = function() {
    var slightObject = this;
    this.vars = {};
    this.controller = {};
    this.route = null;
    this.collection = [];
    this.controllerActions = {};

    var currentController = '';

    var _oldHash = window.location.hash;

    window.onload = function() {
        // on click event for slight
        $(document).on("click", "a[data-role='slight']", function(e) {
            e.preventDefault();
            linkClick(this);
            url = $(this).attr("href");
            currentURL = window.location.toString();
            // when current url is not equal to base url
            if (currentURL !== slightObject.vars.baseURL + "/") {
                // force browser to use hashbang routing
                if (typeof slightObject.vars.force !== 'undefined' && slightObject.vars.force === true) {
                    // change window hash
                    if (typeof $(this).data('link') !== 'undefined') {
                        moveTo = $(this).data('link');
                        // change window hash
                        window.location = slightObject.vars.baseURL + "/" + "#!/" + moveTo;
                    }
                }

                // if force is false, redirect user to plain url
                if (currentURL.indexOf("#") < 0 && typeof slightObject.vars.force !== 'undefined' && slightObject.vars.force === false) {
                    // if hash not found, redirect user to plain url
                    window.location = url;
                    return true;
                }

            }
            // if data link property is not undefined
            if (typeof $(this).data('link') !== 'undefined') {
                url = $(this).data('link');
                // change window hash
                window.location.hash = "!/" + url;
            } else {
                // redirect to plain url if data-link not defined
                window.location = url;
            }

        });
        // dispatch event on window load
        dispatch();
    };
    // on hash change, dispatch event
    window.onhashchange = function() {
        dispatch();
    };
    // if browser does not support hash change event
    if (!'onhashchange' in window) {
        // check for hash change 5 times in second
        setInterval(function() {
            var _newHash = window.location.hash;
            if (_oldHash !== _newHash)
            {
                dispatch();
            }
        }, 200);
    }

    function dispatch() {
        // store current hash
        hash = window.location.hash;
        // if hash not set
        if (hash === '') {
            return false;
        }
        // get hash url with query string
        url_with_params = hash.substr(3, hash.length);
        // find query params
        if (url_with_params.indexOf('?') > 0) {
            // extarct url and query params and store then to different variabless
            url = url_with_params.substr(0, url_with_params.indexOf('?'));
            q_params = url_with_params.substr(url_with_params.indexOf('?'));
        }
        else {
            // incase of query string not set
            url = url_with_params;
            q_params = '';
        }
        final_url = [];
        final_route = null;
        // loop routes to find match
        for (route in slightObject.collection) {
            pattern_ext = route.split('/');
            url_ext = url.split('/');
            final_url = [];
            for (item in pattern_ext) {
                value = pattern_ext[item];
                // extract placeholder if found
                if (pattern_ext[item] === "*") {
                    value = url_ext[item];
                }
                final_url.push(value);
            }
            // find final url
            if (final_url.join("/") === url) {
                final_route = route;
            }

        }
        // if final url is null
        if (final_route === null) {
            onFailuer();
            return;
        }
        // note these properties can be declared in config, controller or on the time of action
        // find controller container
        container = slightObject.vars.container !== 'undefined' ? slightObject.vars.container : '';
        // find controller content type
        contentType = slightObject.vars.contentType !== 'undefined' ? slightObject.vars.contentType : '';
        // find current route action
        routeAction = slightObject.collection[final_route];
        // explode route
        routeController = routeAction.split('.');
        // extarct controller
        currentController = routeController[0];
        // find curent controller properties
        params = slightObject.controller[currentController];
        if (typeof params !== "undefined")
        {
            // override container and content type with controller properties
            container = params.container;
            contentType = params.contentType;
        }
        // extract current action
        currentAction = routeController[1];
        // find current action properties
        controllerParams = slightObject.controllerActions[routeAction];
        if (typeof controllerParams !== "undefined" && typeof controllerParams.container !== 'undefined' && typeof controllerParams.contentType !== "undefined") {
            // override controller properties
            container = controllerParams.container;
            contentType = controllerParams.contentType;
        }
        // listen to before events
        beforeCallback();
        // show progress meter
        $(slightObject.vars.progressContainer).css('display', 'block');
        $.ajax({
            xhr: function()
            {
                // prepare progress bar
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = evt.loaded / evt.total;
                        percentComplete = parseInt(percentComplete * 100);
                        $(slightObject.vars.progressMeter).css("width", percentComplete + "%");
                        $(slightObject.vars.progressMeter).attr("aria-valuenow", percentComplete);

                    }
                }, false);

                return xhr;
            },
            url: slightObject.vars.baseURL + '/' + url + q_params,
            type: 'get',
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            processData: true,
            success: function(res) {
                var outPutJson = false;
                /*if (typeof controllerParams['contentType'] === 'json') {
                 outPutJson = true;
                 }
                 
                 if (typeof slightObject.controller[currentController]['contentType'] === 'json') {
                 outPutJson = true;
                 }*/

                if (typeof res.redirect !== "undefined")
                {
                    window.location = res.redirect;
                }
                $(container).html(res);
                // listen to success events
                onSuccess();
            }
        }).done(function() {
            // listen to complete events
            onCompleted();

        }).fail(function(xhtr, status, error, code) {
            // listen to failuer events
            onFailuer(xhtr, status, error);

        });
    }

    function beforeCallback() {

        if (typeof slightObject.vars.before === 'function')
        {
            beforeRequest = slightObject.vars.before;
            beforeRequest();
        }

        // first look in controller action to find before calback
        if (typeof controllerParams !== "undefined" && typeof controllerParams['before'] === 'function') {
            beforeController = controllerParams['before'];
            beforeController();
            return;
        }
        // if user have not decalre controller before event return from here
        if (typeof slightObject.controller[currentController] === "undefined")
        {
            return false;
        }
        if (typeof slightObject.controller[currentController]['before'] === 'function') {
            beforeController = slightObject.controller[currentController]['before'];
            beforeController();
        }



    }

    function onSuccess() {

        // attach script
        if (typeof controllerParams !== "undefined" && typeof controllerParams['attachScript'] !== "undefined") {
            if (controllerParams['attachScript'] instanceof Array) {
                scripts = controllerParams['attachScript'];
                for (item in scripts) {
                    script_url = script[item];
                    var script = document.createElement('script');
                    script.src = script_url;
                    $("body").append(script);
                }
            }
            else {
                alert('here');
                script_url = controllerParams['attachScript'];
                var script = document.createElement('script');
                script.src = script_url;
                $("body").append(script);
            }
        }
        // first look in controller action to find success calback
        if (typeof controllerParams !== "undefined" && typeof controllerParams['onSuccess'] === 'function') {
            successController = controllerParams['onSuccess'];
            successController();
        }
        // if user have not decalre controller success event return from here
        if (typeof slightObject.controller[currentController] === "undefined")
        {
            return false;
        }
        if (typeof slightObject.controller[currentController]['onSuccess'] === 'function') {
            successController = slightObject.controller[currentController]['onSuccess'];
            successController();
        }
    }

    function onFailuer(xhtr, status, error) {
        $(slightObject.vars.progressContainer).css('display', 'none');
        $(slightObject.vars.progressMeter).css("width", "0%");
        $(slightObject.vars.progressMeter).attr("aria-valuenow", 0);

        // first look in controller action to find failure calback
        if (typeof controllerParams !== "undefined" && typeof controllerParams['onFailure'] === 'function') {
            failureController = controllerParams['onFailure'];
            failureController(xhtr, status, error);
        }

        // if user have not decalre controller success event return from here
        if (typeof slightObject.controller[currentController] === "undefined")
        {
            return false;
        }
        if (typeof slightObject.controller[currentController]['onFailure'] === 'function') {
            failureController = slightObject.controller[currentController]['onFailure'];
            failureController(xhtr, status, error);
        }

    }

    function onCompleted() {
        $(slightObject.vars.progressContainer).css('display', 'none');
        $(slightObject.vars.progressMeter).css("width", "0%");
        $(slightObject.vars.progressMeter).attr("aria-valuenow", 0);

        if (typeof slightObject.vars.after === 'function')
        {
            afterRequest = slightObject.vars.after;
            afterRequest();
        }

        // first look in controller action to find failure calback
        if (typeof controllerParams !== "undefined" && typeof controllerParams['after'] === 'function') {
            afterController = controllerParams['after'];
            afterController();
        }
        // if user have not decalre controller success event return from here
        if (typeof slightObject.controller[currentController] === "undefined")
        {
            return false;
        }
        if (typeof slightObject.controller[currentController]['after'] === 'function') {
            afterController = slightObject.controller[currentController]['after'];
            afterController();
        }
    }

    // user can bind there own events on click of slight element
    function linkClick(object) {
        linkClouser = slightObject.vars.onClick;
        if (typeof linkClouser === "function") {
            linkClouser(object);
        }
    }
    // return slight object
    return this;
}
;
// set application config
slight.prototype.config = function(config) {
    for (key in config) {
        this.vars[key] = config[key];
    }
};
// setup application routes
slight.prototype.routes = function(params) {
    this.collection = params;
};
// create new controller
var slightController = function(slight, controller, params) {
    this.slight = slight;
    this.controller = controller;
    slight.controller[controller] = params;
    return this;
};
// add controller action
slightController.prototype.add = function(action, params) {

    this.slight.controllerActions[this.controller + '.' + action] = params;
};