(function() {
    var tagToBindingHandlerNames = {},
        requiresReplace = {};

    function processTag(tagName) {
        if(requiresReplace[tagName] === undefined) {            
            var div = document.createElement('div');
            div.innerHTML = '<' + tagName + '></' + tagName + '>';

            requiresReplace[tagName] = div.childNodes.length === 0;

            if (window.html5) {
                if (window.html5.elements.indexOf(tagName) === -1) {
                    //change the html5shiv options object 
                    window.html5.elements += ' ' + tagName;

                    //and re-invoke the `shivDocument` method
                    html5.shivDocument(document);
                }
            }
        }
    }

    function processBindingHandlerTags(name, bindingHandler) {
        if(bindingHandler.tag) {
            var tags = _.isArray(bindingHandler.tag) ? bindingHandler.tag : [bindingHandler.tag];

            _.each(tags, function(t) {
                var lowerCaseTag = t.toLowerCase();

                tagToBindingHandlerNames[lowerCaseTag] = tagToBindingHandlerNames[lowerCaseTag] || [];
                tagToBindingHandlerNames[lowerCaseTag].push(name); 

                processTag(lowerCaseTag);
            });
        }
    }

    function mergeAllAttributes (source, destination) {
        if (document.body.mergeAttributes) {
            destination.mergeAttributes(source, false);
        } else { 
            for (var i = 0; i < source.attributes.length; i++) {
                destination.setAttribute(source.attributes[i].name, source.attributes[i].value);
            }
        }
    }

    function preprocessNode (node) {
        if (node.nodeType === 1) {
            var nodeTagNameLower = node.tagName.toLowerCase(),
                tagHandlers = tagToBindingHandlerNames[nodeTagNameLower],
                dataOption = node.getAttribute('data-option'),
                dataBind = node.getAttribute('data-bind') || '';

            if (tagHandlers && tagHandlers.length > 0) {
                // When applied as tag we allow using data-option attribute to avoid repeating binding
                // handler name in data-bind (e.g. data-option="{ prop: value }" is equivalent to 
                // data-bind="handlerName: { prop: value }"). Integration of tag-based binding handlers
                // is done by creating a data-bind that would have been used had the binding handler been applied
                // manually.
                for (var i = 0; i < tagHandlers.length; i++) {
                    var tagBindingHandlerName = tagHandlers[i];

                    // Do not override anything explicitly added
                    if (dataBind.indexOf(tagBindingHandlerName + ':') === -1)  {
                        if (dataBind.length > 0) {
                            dataBind += ', ';
                        }

                        if (dataOption && tagBindingHandlerName.toLowerCase() === nodeTagNameLower) {
                            dataBind += tagBindingHandlerName + ': ' + dataOption;
                        } else {
                            dataBind += tagBindingHandlerName + ': true';
                        }
                    }
                }
                
                node.removeAttribute('data-option');
                node.setAttribute('data-bind', dataBind);

                if (requiresReplace[nodeTagNameLower] === true) {
                    var nodeReplacement = document.createElement('div');
                    mergeAllAttributes(node, nodeReplacement);

                    // Copy all children across to new element
                    while (node.hasChildNodes()) {
                        nodeReplacement.appendChild(node.removeChild(node.firstChild));
                    }

                    ko.utils.replaceDomNodes(node, [nodeReplacement]);

                    return [nodeReplacement];
                }
            }
        }
    };

    function registerBindingHandler(name, bindingHandler) {
        koBindingHandlers[name] = bindingHandler;
        processBindingHandlerTags(name, bindingHandler);
    }

    /**
     * Registers a binding handler of the given name, a binding handler that may have dependencies
     * or is registered as a 'tag' binding handler, one that can be automatically applied to
     * elements (e.g. to all `input` elements, or even custom elements such as `tab` or `region`).
     */
    hx.bindingHandler = function(name, bindingHandlerOrDependencies, bindingHandler) {
        hx.config(function() {
            registerBindingHandler(name, hx.get('$injector').instantiate(bindingHandlerOrDependencies, bindingHandler));
        })
    }

    ko.bindingProvider.instance.preprocessNode = preprocessNode;
}());