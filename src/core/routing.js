hx.provide('$RouteTable', ['$bus', '$log', '$location', '$injector', '$authoriser'], function ($bus, $log, $location, $injector, $authoriser) {
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
        function Route(options) {
            var routeDefinitionAsRegex,
            _this = this;

            this.name = options.name;
            this.url = options.url || '';
            this.callback = options.callback;
            this.options = options;

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
                    return '([^/]+)';
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

        Route.prototype.getComponents = function() {
            return this.options.component;
        }

        return Route;
    })();

    function createComponent(component) {
        return _.isString(component) ? $injector.get(component) : component;
    }

    function MatchedRoute(route, url, parameters) {
        this.route = route;
        this.url = url;
        this.parameters = ko.toJS(parameters || {});
    }

    /**
     * Returns a promise that will indicate whether or not the current user
     * is authorised to view this route, which is defined as being authorised to
     * view all of the components that this route represents.
     */
    MatchedRoute.prototype.authorise = function() {
        if(this.route.options.component) {
            return $authoriser.authorise(createComponent(this.route.options.component), this.parameters);
        } else {
            return Promise.resolve(true);
        }
    }

    // Defines the root of this application, which will typically be the
    // root of the address (e.g. /). This can be set to a subdirectory if
    // required to ensure that when reading and writing to the URL fragment
    // (which in `pushState` enabled browsers is the path of the URL) the
    // root is ignored and maintained.

    // TODO: Take this into account, spec it out etc.
    // root = '/';

    /**
     * A route table manages a number of routes, providing the ability
     * to get a route from a URL or creating a URL from a named route and
     * set of parameters.
     *
     * @class $RouteTable
     */
    function RouteTable() {
        var self = this;
        this._routes = {};

        this.current = ko.observable({});

        // Handle messages that are raised by the location component
        // to indicate the URL has changed, that the user has navigated
        // to a new page (which is also raised on first load).
        $bus.subscribe('urlChanged:external', function (msg) {
            var matchedRoute = self.getMatchedRouteFromUrl(msg.url);            

            if (!matchedRoute) {
                $bus.publish('routeNotFound', { url: msg.url });
            } else {
                self._doNavigate(matchedRoute);
            }
        });
    }

    RouteTable.prototype._doNavigate = function (match) {
        var self = this,
            msg = {
                route: match.route,
                parameters: match.parameters
            };

        return match.authorise()
            .then(function(isAuthorised) {
                if (isAuthorised) {
                    self.current(match);

                    if (match.route.callback && match.route.callback(match.parameters) === false) {
                        return;
                    }

                    $bus.publish("routeNavigated:" + match.route.name, msg);
                } else {
                    $bus.publish("unauthorisedRoute:" + match.route.name, msg);
                }
            });
    };

    /**
     * Adds the specified named route to this route table. If a route
     * of the same name already exists then it will be overriden
     * with the new definition.
     *
     * The URL *must* be a relative definition, the route table will
     * not take into account absolute URLs in any case.
     *
     * @member route
     */
    RouteTable.prototype.route = function (options) {
        this._routes[options.name] = new Route(options);

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
     *
     * @member getRouteFromUrl
     */
    RouteTable.prototype.getMatchedRouteFromUrl = function (url) {
        var parsedUri = new hx.Uri(url, { decode: true }),
            match;

        for (var name in this._routes) {
            var r = this._routes[name],
                matchedParams = r.match(parsedUri.path);

            if (matchedParams != null) {
                match = new MatchedRoute(r, url, _.extend(matchedParams, parsedUri.variables));
            }
        }

        return match;
    };

    /**
     * Builds a URL based on a named route and a set of parameters, or
     * `undefined` if no such route exists or the parameters do not
     * match.
     *
     * @member buildUrl
     */
    RouteTable.prototype.buildMatchedRoute = function (name, parameters) {
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

        return new MatchedRoute(route, url, parameters);
    };

    /**
     * Gets the named route, or `undefined` if no such route
     * exists.
     *
     * @member getNamedRoute
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

        var match = this.buildMatchedRoute(name, parameters);

        if (match) {
            this._doNavigate(match).then(function(didNavigate) {
                if (didNavigate) {
                    $location.routePath(match.url);
                }
            });
        }
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