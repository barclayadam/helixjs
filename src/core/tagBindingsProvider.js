/**
  A binding handler that identifies it should directly apply to any
  elements with a given name with should have a `tag` property that
  is either a `string` or an `object`. 
 
  A string representation takes the form of
  `appliesToTagName[->replacedWithTagName]`, for example 'input'
  or 'tab->div' to indicate a binding handler that applies to
  an input element but requires no transformation and a binding
  handler that should replace any `tab` elements with a `div` element.

  An object can be specified instead of a string which consists of the
  following properties:

  * `appliesTo`: The name of the tag (*must be uppercase*) the binding
   handler applies to and should be data-bound to in all cases.
 
  * `replacedWith`: An optional property that identifies the name of the
   tag that the element should be replaced with. This is needed to support
   older versions of IE that can not properly support custom, non-standard
   elements out-of-the-box.
*/
var tagBindingProvider = function () {
    var realBindingProvider = new ko.bindingProvider();

    /*
      The definition of what tag to apply a binding handler, and the
      optional replacement element name can be defined as a string
      which needs to be parsed.
    */
    function processBindingHandlerTagDefinition(bindingHandler) {
        var split;

        if (_.isString(bindingHandler.tag)) {
            split = bindingHandler.tag.split("->");

            if (split.length === 1) {
                bindingHandler.tag = {
                    appliesTo: split[0].toUpperCase()
                };
            } else {
                bindingHandler.tag = {
                    appliesTo: split[0].toUpperCase(),
                    replacedWith: split[1]
                };
            }
        }
    };

    function mergeAllAttributes (source, destination) {
        var attr, _i, _len, _ref, _results;
        if (document.body.mergeAttributes) {
            return destination.mergeAttributes(source, false);
        } else {
            _ref = source.attributes;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                attr = _ref[_i];
                _results.push(destination.setAttribute(attr.name, attr.value));
            }
            return _results;
        }
    };

    function findTagCompatibleBindingHandlerNames (node) {
        var tagName;
        if (node.tagHandlers != null) {
            return node.tagHandlers;
        } else {
            tagName = node.tagName;
            if (tagName != null) {
                return _.filter(_.keys(koBindingHandlers), function (key) {
                    var bindingHandler, _ref;
                    bindingHandler = koBindingHandlers[key];
                    processBindingHandlerTagDefinition(bindingHandler);
                    return ((_ref = bindingHandler.tag) != null ? _ref.appliesTo : void 0) === tagName;
                });
            } else {
                return [];
            }
        }
    };
     
    function processOptions (node, tagBindingHandlerName, bindingContext) {
        var options = true, 
            optionsAttribute = node.getAttribute('data-option');

        if (optionsAttribute) {
            // To use the built-in parsing logic we will create a binding
            // string that would be used if this binding handler was being used
            // in a normal data-bind context. With the parsed options we can then
            // extract the value that would be passed for the valueAccessor.
            optionsAttribute = "" + tagBindingHandlerName + ": " + optionsAttribute;
            options = realBindingProvider.parseBindingsString(optionsAttribute, bindingContext);
            options = options[tagBindingHandlerName];
        }

        return options;
    };

    this.preprocessNode = function (node) {
        var nodeReplacement, replacementRequiredBindingHandlers, tagBindingHandler, tagBindingHandlerNames;
        tagBindingHandlerNames = findTagCompatibleBindingHandlerNames(node);

        // We assume that if this is for a 'tag binding handler' it refers to an unknown
        // node so we use the specified replacement node from the binding handler's
        // tag option.
        if (tagBindingHandlerNames.length > 0) {
            node.tagHandlers = tagBindingHandlerNames;

            replacementRequiredBindingHandlers = _.filter(tagBindingHandlerNames, function (key) {
                var _ref;
                return ((_ref = koBindingHandlers[key].tag) != null ? _ref.replacedWith : void 0) != null;
            });

            if (replacementRequiredBindingHandlers.length > 1) {
                throw new Error("More than one binding handler specifies a replacement node for the node with name '" + node.tagName + "'.");
            }

            if (replacementRequiredBindingHandlers.length === 1) {
                tagBindingHandler = koBindingHandlers[replacementRequiredBindingHandlers[0]];

                nodeReplacement = document.createElement(tagBindingHandler.tag.replacedWith);
                mergeAllAttributes(node, nodeReplacement);

                ko.utils.replaceDomNodes(node, [nodeReplacement]);

                nodeReplacement.tagHandlers = tagBindingHandlerNames;
                nodeReplacement.originalTagName = node.tagName;

                return nodeReplacement;
            }
        }
    };

    this.nodeHasBindings = function (node, bindingContext) {
        var tagBindingHandlers = findTagCompatibleBindingHandlerNames(node),
            isCompatibleTagHandler = tagBindingHandlers.length > 0;

        return isCompatibleTagHandler || realBindingProvider.nodeHasBindings(node, bindingContext);
    };

    this.getBindings = function (node, bindingContext) {
        var existingBindings, tagBindingHandlerName, tagBindingHandlerNames, _i, _len;

        // parse the bindings with the 'real' binding provider
        existingBindings = (realBindingProvider.getBindings(node, bindingContext)) || {};
        tagBindingHandlerNames = findTagCompatibleBindingHandlerNames(node);

        if (tagBindingHandlerNames.length > 0) {
            for (_i = 0, _len = tagBindingHandlerNames.length; _i < _len; _i++) {
                tagBindingHandlerName = tagBindingHandlerNames[_i];
                existingBindings[tagBindingHandlerName] = processOptions(node, tagBindingHandlerName, bindingContext);
            }
        }

        return existingBindings;
    };

    return this;
};

ko.bindingProvider.instance = new tagBindingProvider();