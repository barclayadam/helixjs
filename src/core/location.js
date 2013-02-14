var currentFragment, hasPushState, location, nativeHistory, nativePushState, nativeReplaceState, routeStripper, updateUri, uri, windowHistory, windowLocation;

location = hx.location = {};

windowHistory = window.history;
windowLocation = window.location;

// Cached regex for cleaning leading hashes and slashes.
routeStripper = /^[#\/]/;

hasPushState = !! (windowHistory && windowHistory.pushState);

/* Gets the true hash value. Cannot use location.hash directly due to bug
   in Firefox where location.hash will always be decoded. */
function _getHash() {
    var match;
    match = windowLocation.href.match(/#(.*)$/);
    if (match) {
        return match[1];
    } else {
        return "";
    }
};

/* Get the cross-browser normalized URL fragment, either from the URL or
   the hash. */
function _getFragment() {
    var fragment;

    if (hasPushState) {
        fragment = windowLocation.pathname;
        fragment += windowLocation.search || '';
    } else {
        fragment = _getHash();
    }

    fragment.replace(routeStripper, "");
    fragment = fragment.replace(/\/\//g, '/');

    if (fragment.charAt(0) !== '/') {
        fragment = "/" + fragment;
    }

    return decodeURI(fragment);
};

/** 
  ## History Management

  The history management APIs provide a higher-level abstraction of
  history and URL manipulation than the low-level `pushState` and
  `replaceState`.

  The history manager will handle the updating of the URL, publishing
  of URL change messages, and managing variables which may be set as
  query string parameters for allowing the application to be
  bookmarkable.
*/
uri = location.uri = ko.observable();

updateUri = function () {
    return location.uri(new hx.Uri(document.location.toString()));
};

updateUri();

location.host = function () {
    return uri().host;
};

location.path = ko.computed(function () {
    return uri().path;
});

location.fragment = ko.computed(function () {
    return uri().fragment || '';
});

location.query = ko.computed(function () {
    return uri().query;
});

location.variables = ko.computed(function () {
    return uri().variables;
});

/**
  `routeVariables` represents the current route variables, which may not
  represent the current URL's `variables` property as this uses
  whatever browser mechanism is available to update these values, which
  in non `pushState` browsers means the query is actually part of the
  hash (e.g. `hx.location.routePath` is used to construct the
  variables).
*/
location.routeVariables = ko.computed({
    read: function () {
        // We are dependent on the current URI
        uri();

        return new hx.Uri(_getFragment()).variables;
    },

    deferEvaluation: true
});

location.routeVariables.set = function (key, value, options) {
    var currentUri = new hx.Uri(location.routePath());
    currentUri.variables[key] = value;

    location.routePath(currentUri.toString(), {
        replace: options.history === false
    });
};


/**
  Provides an abstraction of the path of the URI to handle the difference
  between pushState and non-pushState browsers. This is the observable that
  routing uses to manage the URL, the one that represents the 'path' the
  user is at, regardless of what the actual URL is (it will read the fragment
  when the browser does not support push-state).
*/
location.routePath = ko.computed({
    read: function () {
        // We are dependent on the current URI
        uri();

        return new hx.Uri(_getFragment()).path;
    },

    /**
      Goes to the specified path, which will typically have been created using
      the routing system, although that is not a requirement.
    
      Will push a new history entry (`windowHistory.pushState`) and publish
      a `urlChanged:internal` message with the new URL & route path and `external` 
      set to `false`.
    */
    write: function (newPath, options) {
        // Not actually changing anything
        if (options == null) {
            options = {};
        }

        if (location.routePath() === newPath) {
            return false;
        }

        if (options.replace === true) {
            windowHistory.replaceState(null, document.title, newPath);
        } else {
            windowHistory.pushState(null, document.title, newPath);
        }

        updateUri();

        hx.bus.publish('urlChanged:internal', {
            url: _getFragment(),
            path: location.routePath(),
            variables: location.routeVariables(),
            external: false
        });
    }
});

// Testing purposes only
location.reset = function () {
    return updateUri();
};

/**
  Initialises the location subsystem, to be called when the application is
  ready to begin receiving messages (`urlChanged:external` messages).
*/
location.initialise = function () {
    hx.log.info("Initialising location services");

    location.initialised = true;

    hx.bus.publish('urlChanged:external', {
        url: _getFragment(),
        path: location.routePath(),
        variables: location.routeVariables(),
        external: true
    });
};

/*
  Bind to the popstate event, and convert
  it into a message that is published on the bus for others to
  listen to.
*/
ko.utils.registerEventHandler(window, 'popstate', function () {
    updateUri();

    if (location.initialised) {
        hx.bus.publish('urlChanged:external', {
            url: _getFragment(),
            path: location.routePath(),
            variables: location.routeVariables(),
            external: true
        });
    }
});

// pushState & replaceState polyfill
if (!hasPushState) {
    currentFragment = void 0;

    // If a native popstate would not have been fired then polyfill
    // by triggering a `popstate` event on the `window`.
    if (!hasPushState && window.onhashchange !== void 0) {
        ko.utils.registerEventHandler(window, 'hashchange', function () {
            var current = _getFragment();

            if (current !== currentFragment) {
                if (!hasPushState) {
                    ko.utils.triggerEvent(window, 'popstate');
                }

                currentFragment = current;
            }
        });
    }
    windowHistory.pushState = function (_, title, frag) {
        windowLocation.hash = frag;
        document.title = title;

        updateUri();
    };

    windowHistory.replaceState = function (_, title, frag) {
        windowLocation.replace(windowLocation.toString().replace(/#.*$/, '') + '#' + frag);
        document.title = title;

        updateUri();
    };
} else {
    // TODO: This should probably be removed. The API does not require this to be set so change
    // the polyfill not to do it.

    // We override native implementations to augment them with `document.title`
    // changing to make use of the title property seemingly ignored in most
    // browsers implementing push/replaceState natively, as well as 
    // calling `updateUri` to update all observables of the `location` API.
    nativeHistory = windowHistory;
    nativePushState = windowHistory.pushState;
    nativeReplaceState = windowHistory.replaceState;

    windowHistory.pushState = function (state, title, frag) {
        nativePushState.call(nativeHistory, state, title, frag);
        document.title = title;
        updateUri();
    };

    windowHistory.replaceState = function (state, title, frag) {
        nativeReplaceState.call(nativeHistory, state, title, frag);
        document.title = title;
        updateUri();
    };
}