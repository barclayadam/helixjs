hx.provide('$RouteTable', ['$bus', '$log', '$location'], function ($bus, $log, $location) {
    /**
     Represents a single route within an application, the definition of a URL
     that may contain a set of parameters that can be used to navigate
     between screens within the application.

     A route is defined by its name (which is unique within an application) plus
     a route definition, which is a static URL which may contain any number
     of parameters, plus an optional, single 'splat' parameter.

     Example: /Email/Show/{id}

     The above URL has a single parameter, 'id', which must be present for
     this route to match an incoming URL, such as '/Email/Show/1254', where id would be
     1254. These parameter types will match until the end of the URL or the next 
     forward slash. Any characters will be consumed, no checking is done at a route level.

     A 'splat' parameter allow capturing of any characters from a given point to the end
     of the URL, consuming any forward slashes, unlike normal parameters:

     Example: /File/{*filePath}

     The above URL has a single splat parameter, 'filePath', that will match all characters
     in a URL after the /File/ prefix, such as '/File/root/pictures/myPicture.png', where
     filePath would be 'root/pictures/myPicture.png'.
    */
    var Route = (function () {
        var paramRegex = /{(\*?)(\w+)}/g;

        /** Constructs a new route, with a name and route url. */
        function Route(name, url, callbackOrOptions, options) {
            var routeDefinitionAsRegex,
            _this = this;

            this.name = name;
            this.url = url;
            this.callbackOrOptions = callbackOrOptions;
            this.options = options;
            this.title = options.title;
            this.requiredParams = [];
            this.paramNames = [];

            routeDefinitionAsRegex = this.url.replace(paramRegex, function (_, mode, name) {
                _this.paramNames.push(name);

                if (mode !== '*') {
                    _this.requiredParams.push(name);
                }

                if (mode === '*') {
                    return '(.*)';
                } else {
                    return '([^/]*)';
                }
            });

            if (routeDefinitionAsRegex.length > 1 && routeDefinitionAsRegex.charAt(0) === '/') {
                routeDefinitionAsRegex = routeDefinitionAsRegex.substring(1);
            }

            this.incomingMatcher = new RegExp("" + routeDefinitionAsRegex + "/?$", "i");
        }

        Route.prototype.match = function (path) {
            var index, matches, name, params, _i, _len, _ref;
            matches = path.match(this.incomingMatcher);

            if (matches) {
                params = {};
                _ref = this.paramNames;

                for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
                    name = _ref[index];
                    params[name] = matches[index + 1];
                }

                return params;
            }
        };

        Route.prototype.buildUrl = function (parameters) {
            if (parameters == null) {
                parameters = {};
            }

            if (this._allRequiredParametersPresent(parameters)) {
                return this.url.replace(paramRegex, function (_, mode, name) {
                    return ko.utils.unwrapObservable(parameters[name] || '');
                });
            }
        };

        Route.prototype._allRequiredParametersPresent = function (parameters) {
            return _.all(this.requiredParams, function (p) {
                return parameters[p] != null;
            });
        };

        Route.prototype.toString = function () {
            return "" + this.name + ": " + this.url;
        };

        return Route;

    })();

    // Defines the root of this application, which will typically be the
    // root of the address (e.g. /). This can be set to a subdirectory if
    // required to ensure that when reading and writing to the URL fragment
    // (which in `pushState` enabled browsers is the path of the URL) the
    // root is ignored and maintained.

    // TODO: Take this into account, spec it out etc.
    // root = '/';

    /**
     * A route table that manages a number of routes, providing the ability
     * to get a route from a URL or creating a URL from a named route and
     * set of parameters.
     */
    function RouteTable() {
        var _this = this;
        this._routes = {};

        // Handle messages that are raised by the location component
        // to indicate the URL has changed, that the user has navigated
        // to a new page (which is also raised on first load).
        $bus.subscribe('urlChanged:external', function (msg) {
            var matchedRoute = _this.getRouteFromUrl(msg.url);

            if (!matchedRoute) {
                $bus.publish('routeNotFound', {
                    url: msg.url
                });
            } else {
                _this._doNavigate(msg.url, matchedRoute.route, matchedRoute.parameters);
            }
        });
    }

    RouteTable.prototype._doNavigate = function (url, route, parameters) {
        var msg;
        this.currentUrl = url;
        this.currentRoute = route;
        this.currentParameters = _.extend(parameters, new hx.Uri(url).variables);

        msg = {
            route: route,
            parameters: parameters
        };

        if (_.isFunction(route.callbackOrOptions)) {
            route.callbackOrOptions(parameters);
        } else if (route.callbackOrOptions != null) {
            msg.options = route.callbackOrOptions;
        }

        $bus.publish("routeNavigated:" + route.name, msg);
    };

    /**
     * Adds the specified named route to this route table. If a route
     * of the same name already exists then it will be overriden
     * with the new definition.
     *
     * The URL *must* be a relative definition, the route table will
     * not take into account absolute URLs in any case.
     */
    RouteTable.prototype.route = function (name, url, callbackOrOptions, options) {
        if (options == null) {
            options = {
                title: name
            };
        }

        this._routes[name] = new Route(name, url, callbackOrOptions, options);

        return this;
    };

    /**
     * Given a *relative* URL will attempt to find the
     * route that matches that URL, returning an object that represents
     * the found route with parameters as:
     * 
     * {
     *  `route`: The route object that matched the given URL
     *  `parameters`: The parameters that were matched based on route, or
     *     an empty object for no parameters.
     * }
     *
     * Routing will ignore preceeding and trailing slashes, treating
     * them as optional, meaning for the incoming URL and route definitions
     * the following are considered equal:
     *
     * * /Contact Us
     * * /Contact Us/
     * * Contact Us/
     * * Contact Us
     */
    RouteTable.prototype.getRouteFromUrl = function (url) {
        var match, matchedParams, name, path, r, _ref;

        path = new hx.Uri(url, {
            decode: true
        }).path;

        _ref = this._routes;

        for (name in _ref) {
            r = _ref[name];
            matchedParams = r.match(path);

            if (matchedParams != null) {
                match = {
                    route: r,
                    parameters: matchedParams
                };
            }
        }

        return match;
    };

    /**
     * Gets the named route, or `undefined` if no such route
     * exists.
     *
     * @param {string} name The name of the route to get
     */
    RouteTable.prototype.getNamedRoute = function (name) {
        return this._routes[name];
    };

    RouteTable.prototype.navigateTo = function (name, parameters) {
        if (parameters == null) {
            parameters = {};
        }

        var url = this.buildUrl(name, parameters);

        if (url) {
            this._doNavigate(url, this.getNamedRoute(name), parameters);

            $location.routePath(url);

            return true;
        }

        return false;
    };

    /**
     * Builds a URL based on a named route and a set of parameters, or
     * `undefined` if no such route exists or the parameters do not
     * match.
     */
    RouteTable.prototype.buildUrl = function (name, parameters) {
        var route = this.getNamedRoute(name),
            url = route != null ? route.buildUrl(parameters) : void 0;

        if (!route) {
            $log.warn("The route '" + name + "' could not be found.");
            return;
        }

        if (!url) {
            $log.warn("The parameters specified are not valid for the '" + name + "' route.");
            return;
        }

        return url;
    };

    return RouteTable;
});

/**
 * Declares a singleton router that is an instance of a `$RouteTable` that provides
 * the ability to declare routes (e.g. URL constructs) and respond to the change
 * in browser URL (history) and to navigate to those routes, changing the URL
 * using the `$location` service 
 */
hx.singleton('$router', ['$RouteTable'], function($RouteTable) {
    return new $RouteTable();
});