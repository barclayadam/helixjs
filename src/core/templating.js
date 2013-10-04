hx.singleton('$templating', ['$ajax'], function($ajax) {
    var templating = {};

    /**
     * A `template source` that will use the `hx.templating.templates` object
     * as storage of a named template.
     *
     * @class StringTemplateSource
     */
    function StringTemplateSource(templateText) {
        this.templateText = ko.observable(templateText);
        this.parsedNodes = ko.observable(ko.utils.parseHtmlFragment('<div>' + templateText + '</div>')[0]);
    }

    StringTemplateSource.prototype.set = function(templateText) {
        this.templateText(templateText);
        this.parsedNodes(ko.utils.parseHtmlFragment('<div>' + templateText + '</div>')[0]);
    }

    StringTemplateSource.prototype.text = function (value) {
        return this.templateText();
    };

    StringTemplateSource.prototype.nodes = function (value) {
        return this.parsedNodes();
    };

    function loadExternalTemplate(templateName) {
        if (templating.templates[templateName]) {
            return templating.templates[templateName];
        }
        
        templating.set(templateName, templating.loadingTemplate);

        templating.loadExternalTemplate(templateName).done(function(templateText) {
            templating.set(templateName, templateText);
        });

        return templating.templates[templateName];
    }

    /**
      Creates the custom `HelixJS` templating engine by augmenting the given templating
      engine with a new `makeTemplateSource` function that first sees if
      a template has been added via. `hx.templating.add` and returns a
      `StringTemplateSource` if found, attempts to create an external
      template source (see `hx.templating.isExternal`) or falls back 
      to the original method if not.
    */
    templating.createEngine = function(templateEngine) {
        var originalMakeTemplateSource = templateEngine.makeTemplateSource;

        templateEngine.makeTemplateSource = function (template, templateDocument) {
            var templateElement;

            if (template.text && template.data) {
                // Already a template source
                return template;
            } else if (templating.templates[template] != null) {
                return templating.templates[template];
            } else if (template.nodeType === 1 || template.nodeType === 8) {
                return new ko.templateSources.anonymousTemplate(template);
            } else if (_.isString(template)) {
                templateElement = (templateDocument || document).getElementById(template);

                if (!templateElement) {
                    return loadExternalTemplate(template);
                } else {
                    return new ko.templateSources.domElement(templateElement);
                }
            } else {
                throw new Error("Unknown template type: " + template);
            }
        };

        return templateEngine;
    };

    /**
     The public API of the custom templating support built on-top of the
     native `knockout` templating engine, providing support for string and
     external templates.

     String templates are used most often throughout this library to add
     templates used by the various UI elements, although could be used by
     clients of this library to add small templates through script (for
     most needs external templates or those already defined via a standard
     method available from `knockout` is the recommended approach).

     External templates are templates that are loaded from an external source,
     and would typically be served up by the same server that delivered the initial 
     application.

     The template that is to be used when loading an external template,
     set immediately whenever an external template that has not yet been
     loaded is used and bound to, automatically being replaced once the
     template has been successfully loaded.
    */
    templating.loadingTemplate = '<div class="template-loading">Loading...</div>';

    /**
     The location from which to load external templates, with a `{name}`
     token indicating the location into which to inject the name of the
     template being added.

     For example, given an `externalPath` of `/Templates/{name}` and a template
     name of `Contact Us` the template will be loaded from `/Templates/Contact Us`.

     This property is used from the default implementation of
     `hx.templating.loadExternalTemplate`, which can be completely overriden
     if this simple case does not suffice for a given project.
    */
    templating.externalPath = '/Templates/{name}';

    templating.loadExternalTemplate = function (name) {
        var path = templating.externalPath.replace('{name}', name);

        return $ajax.url(path).get();
    };

    templating.remove = function (name) {
        templating.templates[name] = null;
    };

    /**
     Sets a named template, which may be an observable value, making that
     named template available throughout the application using the standard
     knockout 'template' binding handler.

     If the value is an observable, when using that template it will be
     automatically re-rendered when the value of the observable changes.

     * `name`: The name of the template to add.
     * `template`: The string value (may be an `observable`) to set as the
       contents of the template.
    */
    templating.set = function (name, template) {
        if (templating.templates[name]) {
            templating.templates[name].set(template);
        } else {
            templating.templates[name] = new StringTemplateSource(template);
        }

        return templating.templates[name];
    };

    templating.templates = {
        _data: {}
    };

    return templating;
});

hx.config(['$templating'], function($templating) {    
    ko.setTemplateEngine($templating.createEngine(new ko.nativeTemplateEngine()));
})