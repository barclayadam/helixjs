hx.provide('$templating', hx.instantiate(['$ajax'], function($ajax) {
    var templating = {};

    /**
      A `template source` that will use the `hx.templating.templates` object
      as storage of a named template.
    */
    function StringTemplateSource(templateName) {
        this.templateName = templateName;
    }

    StringTemplateSource.prototype.text = function (value) {
        return ko.utils.unwrapObservable(templating.templates[this.templateName]);
    };

    function ExternalTemplateSource(templateName) {
        this.templateName = templateName;
        this.stringTemplateSource = new StringTemplateSource(this.templateName);
    }

    ExternalTemplateSource.prototype.text = function (value) {
        var loadingPromise, template;

        if (templating.templates[this.templateName] === void 0) {
            template = ko.observable(templating.loadingTemplate);
            templating.set(this.templateName, template);

            loadingPromise = templating.loadExternalTemplate(this.templateName);

            loadingPromise.done(template);
        }

        return this.stringTemplateSource.text(arguments);
    };

    /**
      Creates the custom `HelixJS` templating engine by augmenting the given templating
      engine with a new `makeTemplateSource` function that first sees if
      a template has been added via. `hx.templating.add` and returns a
      `StringTemplateSource` if found, attempts to create an external
      template source (see `hx.templating.isExternal`) or falls back 
      to the original method if not.
    */
    function createCustomEngine(templateEngine) {
        var originalMakeTemplateSource = templateEngine.makeTemplateSource;

        templateEngine.makeTemplateSource = function (template, templateDocument) {
            var templateElement;

            if (templating.templates[template] != null) {
                return new StringTemplateSource(template);
            } else if (template.nodeType === 1 || template.nodeType === 8) {
                return new ko.templateSources.anonymousTemplate(template);
            } else if (_.isString(template)) {
                templateElement = (templateDocument || document).getElementById(template);

                if (!templateElement) {
                    return new ExternalTemplateSource(template);
                } else {
                    return new ko.templateSources.domElement(elem);
                }
            } else {
                throw new Error("Unknown template type: " + template);
            }
        };

        return templateEngine;
    };

    ko.setTemplateEngine(createCustomEngine(new ko.nativeTemplateEngine()));

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

    /**
     Resets the templating support by removing all data and templates
     that have been previously added.
    */
    templating.reset = function () {
        templating.templates = {
            _data: {}
        };
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
        if (ko.isWriteableObservable(templating.templates[name])) {
            templating.templates[name](template);
        } else {
            templating.templates[name] = template;
        }
    };

    templating.reset();

    return templating;
}));