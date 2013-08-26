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
    var hasProcessed = false,
        tagNameToBindingHandlers = {};

    function processBindingHandlerTagDefinitionInstance(tag, bindingHandler, name) {
        var description = { name: name, bindingHandler: bindingHandler};

        if(_.isString(tag)) {
            var split = tag.split("->"),
                appliesToTag = split[0];

            description.appliesTo = appliesToTag;

            if (split.length === 2) {
                description.replacedWith = split[1];
            }
        } else {
            description.appliesTo = tag.appliesTo;
            description.replacedWith = tag.replacedWith;
        }

        description.appliesTo = description.appliesTo.toUpperCase();

        if(tagNameToBindingHandlers[description.appliesTo]) {
            tagNameToBindingHandlers[description.appliesTo].push(description);
        } else {
            tagNameToBindingHandlers[description.appliesTo] = [description];
        }
    }

    /*
      The definition of what tag to apply a binding handler, and the
      optional replacement element name can be defined as a string
      which needs to be parsed.

      In addition we store the mapping from tagName to bindingHandler
      for quick lookups.
    */
    function processBindingHandlerTagDefinition(bindingHandler, name) {
        if (bindingHandler.tag) {
            if(_.isArray(bindingHandler.tag)) {
                _.each(bindingHandler.tag, function(t) {
                    processBindingHandlerTagDefinitionInstance(t, bindingHandler, name);
                });
            } else {
                processBindingHandlerTagDefinitionInstance(bindingHandler.tag, bindingHandler, name);
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

    function findTagCompatibleBindingHandlers (node) {
        return tagNameToBindingHandlers[node.tagName] || [];
    };
     
    function applyTagBasedDataBindValues(node, additionalDataBindValues) {
        var asDataBindString = '',
            originalDataBindAttribute = node.getAttribute('data-bind');

        for(var dataBindKey in additionalDataBindValues) {
            if(asDataBindString.length > 0) {
                asDataBindString += ', ';
            }
            
            asDataBindString += dataBindKey + ': ' + additionalDataBindValues[dataBindKey];
        }

        if(originalDataBindAttribute) {
            node.setAttribute('data-bind', asDataBindString + ', ' + originalDataBindAttribute);
        } else {
            node.setAttribute('data-bind', asDataBindString);
        }
    }

    /**
     * Preprocesses a node by looking for any binding handlers that have been specified
     * as tag replacement handlers, those that will change a tag not supported by standard
     * HTML (e.g. <tab>) into a supported tag (e.g. <div>)
     *
     * @param {Element} node - The node that is being processed
     */
    function preprocessNode (node) {
        processAllBindingHandlers();

        if(node.nodeType === 1) {
            var tagBindingHandlers = findTagCompatibleBindingHandlers(node),
                nodeReplacement,
                replacementRequiredBindingHandlers;

            // We assume that if this is for a 'tag binding handler' it refers to an unknown
            // node so we use the specified replacement node from the binding handler's
            // tag option.
            if (tagBindingHandlers.length > 0) {
                var additionalDataBindValues = {};

                for (var i = 0; i < tagBindingHandlers.length; i++) {
                    var tagBindingHandlerName = tagBindingHandlers[i].name;

                    additionalDataBindValues[tagBindingHandlerName] = 'true';
                }

                replacementRequiredBindingHandlers = _.filter(tagBindingHandlers, function (description) {
                    return description.replacedWith != null;
                });

                if (replacementRequiredBindingHandlers.length > 1) {
                    throw new Error("More than one binding handler specifies a replacement node for the node with name '" + node.tagName + "'.");
                }

                if (replacementRequiredBindingHandlers.length === 1) {
                    // A replacement tag binding handler exists so we must create a new node, copy across any
                    // attributes, apply the otehr tag binding handlers and then return this replacement
                    nodeReplacement = document.createElement(replacementRequiredBindingHandlers[0].replacedWith);
                    mergeAllAttributes(node, nodeReplacement);

                    // Copy all children across to new element
                    while (node.hasChildNodes()) {
                        nodeReplacement.appendChild(node.removeChild(node.firstChild));
                    }

                    if(node.getAttribute('data-option')) {
                        additionalDataBindValues[replacementRequiredBindingHandlers[0].name] = node.getAttribute('data-option');
                    }

                    applyTagBasedDataBindValues(nodeReplacement, additionalDataBindValues);

                    ko.utils.replaceDomNodes(node, [nodeReplacement]);

                    return [nodeReplacement];
                } else {
                    // We just want to apply the tag-based data-bind attributes here
                    applyTagBasedDataBindValues(node, additionalDataBindValues);
                }
            }
        }
    };

    /** @namespace $hxBindingsProvider */
    return {
        /**
         * Configures the `ko.bindingProvider` instance to be a new instance of the tag binding provider,
         * a binding provider that supports the ability of using custom tags in the HTML source that are
         * transformed into 'standard' elements when binding.
         *
         * @memberOf $hxBindingsProvider
         */
        configure: function() {
            hasProcessed = false;
            tagNameToBindingHandlers = {};

            ko.bindingProvider.instance.preprocessNode = preprocessNode;
        }
    }
})

hx.config(['$hxBindingsProvider'], function($hxBindingsProvider) {
    $hxBindingsProvider.configure();
});
