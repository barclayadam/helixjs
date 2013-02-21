hx.singleton('$hxBindingsProvider', function() {

    /**
     * A binding handler that identifies it should directly apply to any
     * elements with a given name with should have a `tag` property that
     * is either a `string` or an `object`. 
     *
     * A string representation takes the form of
     * `appliesToTagName[->replacedWithTagName]`, for example 'input'
     * or 'tab->div' to indicate a binding handler that applies to
     * an input element but requires no transformation and a binding
     * handler that should replace any `tab` elements with a `div` element.
     *
     * An object can be specified instead of a string which consists of the
     * following properties:
     * 
     * * `appliesTo`: The name of the tag the binding handler applies to and should be
     *    data-bound to in all cases.
     * 
     * * `replacedWith`: An optional property that identifies the name of the
     *    tag that the element should be replaced with. This is needed to support
     *    older versions of IE that can not properly support custom, non-standard
     *    elements out-of-the-box.
    */
    var tagBindingProvider = function () {
        var realBindingProvider = new ko.bindingProvider(),
            hasProcessed = false,
            tagNameToBindingHandlerNames = {};

        /*
          The definition of what tag to apply a binding handler, and the
          optional replacement element name can be defined as a string
          which needs to be parsed.

          In addition we store the mapping from tagName to bindingHandler
          for quick lookups.
        */
        function processBindingHandlerTagDefinition(bindingHandler, name) {
            if (bindingHandler.tag) {
                if(_.isString(bindingHandler.tag)) {
                    var split = bindingHandler.tag.split("->"),
                        appliesToTag = split[0].toUpperCase();

                    if (split.length === 1) {
                        bindingHandler.tag = {
                            appliesTo: appliesToTag
                        };
                    } else {
                        bindingHandler.tag = {
                            appliesTo: appliesToTag,
                            replacedWith: split[1]
                        };
                    }
                }

                var appliesToTag = bindingHandler.tag.appliesTo.toUpperCase();

                if(tagNameToBindingHandlerNames[appliesToTag]) {
                    tagNameToBindingHandlerNames[appliesToTag].push(name);
                } else {
                    tagNameToBindingHandlerNames[appliesToTag] = [name];
                }
            }
        };

        function processAllBindingHandlers() {
            if(hasProcessed == false) {
                _.each(koBindingHandlers, processBindingHandlerTagDefinition);

                hasProcessed = true
            }
        }

        function mergeAllAttributes (source, destination) {
            if (document.body.mergeAttributes) {
                destination.mergeAttributes(source, false);
            } else {
                var attr, _i, _len;

                for (_i = 0, _len = source.attributes.length; _i < _len; _i++) {
                    attr = source.attributes[_i];
                    destination.setAttribute(attr.name, attr.value);
                }
            }
        };

        function findTagCompatibleBindingHandlerNames (node) {
            if (node.tagHandlers != null) {
                return node.tagHandlers;
            } else {            
                return tagNameToBindingHandlerNames[node.tagName] || [];
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
                optionsAttribute = tagBindingHandlerName + ":" + optionsAttribute;
                options = realBindingProvider.parseBindingsString(optionsAttribute, bindingContext);
                options = options[tagBindingHandlerName];
            }

            return options;
        };

        /**
         * Preprocesses a node by looking for any binding handlers that have been specified
         * as tag replacement handlers, those that will change a tag not supported by standard
         * HTML (e.g. <tab>) into a supported tag (e.g. <div>)
         *
         * @param {Element} node - The node that is being processed
         */
        this.preprocessNode = function (node) {
            var nodeReplacement, replacementRequiredBindingHandlers, tagBindingHandler, tagBindingHandlerNames;
            tagBindingHandlerNames = findTagCompatibleBindingHandlerNames(node);

            // We assume that if this is for a 'tag binding handler' it refers to an unknown
            // node so we use the specified replacement node from the binding handler's
            // tag option.
            if (tagBindingHandlerNames.length > 0) {
                node.tagHandlers = tagBindingHandlerNames;

                replacementRequiredBindingHandlers = _.filter(tagBindingHandlerNames, function (key) {
                    return koBindingHandlers[key].tag.replacedWith != null;
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
            processAllBindingHandlers();

            var tagBindingHandlers = findTagCompatibleBindingHandlerNames(node),
                isCompatibleTagHandler = tagBindingHandlers.length > 0;

            return isCompatibleTagHandler || realBindingProvider.nodeHasBindings(node, bindingContext);
        };

        this.getBindings = function (node, bindingContext) {
            processAllBindingHandlers();

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

    return {
        /**
         * Configures the `ko.bindingProvider` instance to be a new instance of the tag binding provider,
         * a binding provider that supports the ability of using custom tags in the HTML source that are
         * transformed into 'standard' elements when binding.
         */
        configure: function() {
            ko.bindingProvider.instance = new tagBindingProvider();
        }
    }

})

hx.config(['$hxBindingsProvider'], function($hxBindingsProvider) {
    $hxBindingsProvider.configure();
});
