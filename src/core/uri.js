hx.Uri = (function () {
    var decode = decodeURIComponent, 
        encode = encodeURIComponent, 
        standardPorts = {
            http: 80,
            https: 443
        };

     function queryStringVariable(name, value) {
        var t;
        t = encode(name);
        value = value.toString();
        if (value.length > 0) {
            t += "=" + encode(value);
        }
        return t;
    };

    function objectToQuery(variables) {
        var name, tmp, v, val, _i, _len;
        tmp = [];

        for (name in variables) {
            val = variables[name];

            if (val !== null) {
                if (_.isArray(val)) {
                    for (_i = 0, _len = val.length; _i < _len; _i++) {
                        v = val[_i];
                        if (v !== null) {
                            tmp.push(queryStringVariable(name, v));
                        }
                    }
                } else {
                    tmp.push(queryStringVariable(name, val));
                }
            }
        }

        return tmp.length && tmp.join("&");
    };

    function convertToType(value) {
        var asNumber, valueLower;

        if (!(value != null)) {
            return undefined;
        }

        valueLower = value.toLowerCase();

        if (valueLower === 'true' || valueLower === 'false') {
            return value === 'true';
        }

        asNumber = parseFloat(value);
        
        if (!_.isNaN(asNumber)) {
            return asNumber;
        }
        
        return value;
    };

    function queryToObject (qs) {
        var key, p, query, split, value, _i, _len, _ref;

        if (!qs) {
            return {};
        }

        qs = qs.replace(/^[^?]*\?/, '');
        qs = qs.replace(/&$/, '');
        qs = qs.replace(/\+/g, ' ');

        query = {};

        _ref = qs.split('&');

        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            p = _ref[_i];

            split = p.split('=');
            key = decode(split[0]);
            value = convertToType(decode(split[1]));

            if (query[key]) {
                if (!_.isArray(query[key])) {
                    query[key] = [query[key]];
                }

                query[key].push(value);
            } else {
                query[key] = value;
            }
        }

        return query;
    };

    function Uri(uri, options) {
        var anchor, _ref, _ref1;

        if (options == null) {
            options = {
                decode: true
            };
        }

        this.variables = {};

        anchor = document.createElement('a');
        anchor.href = uri;

        this.path = anchor.pathname;

        if (options.decode === true) {
            this.path = decode(this.path);
        }

        if (this.path.charAt(0) !== '/') {
            this.path = "/" + this.path;
        }

        this.fragment = (_ref = anchor.hash) != null ? _ref.substring(1) : void 0;
        this.query = (_ref1 = anchor.search) != null ? _ref1.substring(1) : void 0;
        this.variables = queryToObject(this.query);

        if (uri.charAt(0) === '/' || uri.charAt(0) === '.') {
            this.isRelative = true;
        } else {
            this.isRelative = false;
            this.scheme = anchor.protocol;
            this.scheme = this.scheme.substring(0, this.scheme.length - 1);
            this.port = parseInt(anchor.port, 10);
            this.host = anchor.hostname;

            if (standardPorts[this.scheme] === this.port) {
                this.port = null;
            }
        }
    }

    Uri.prototype.clone = function () {
        return new hx.Uri(this.toString());
    };

    Uri.prototype.toString = function () {
        var q = objectToQuery(this.variables), 
            s = "";

        if (this.scheme) {
            s = this.scheme + "://";
        }
        if (this.host) {
            s += this.host;
        }
        if (this.port) {
            s += ":" + this.port;
        }
        if (this.path) {
            s += this.path;
        }
        if (q) {
            s += "?" + q;
        }
        if (this.fragment) {
            s += "#" + this.fragment;
        }

        return s;
    };

    return Uri;
})();