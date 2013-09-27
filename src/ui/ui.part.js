/**
 * @bindingHandler part
 *
 * A part binding handler is used in widgets to provide an easy method of overriding parts of
 * the widget output, allowing greater control over the final output of a widget should a
 * section of the generated HTML not quite fit a particular need.
 *
 * For widgets that support 'parts' they will render a template that makes use of this
 * binding handler (i.e. it is not designed to work outside widgets / components), specifying
 * parts of the final output with particular ids.
 *
 * A consumer of the widget can then override these parts by specifying them as children
 * of the widget using the 'part' tag.
 *
 * @example
 *
 * ###Widget template
 *
 *  <part data-option="'header'">
 *   <h1>This is the widget heading by default</h1>
 *  </part>
 *
 * ###Binding Handler
 *
 * ko.bindingHandlers.myWidget = {
 *      init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
 *          ko.bindingHandlers.part.prepare(element, bindingContext)
 *      },
 *
 *      update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
 *          ko.renderTemplate('myWidgetTemplate', viewModel, {}, element, 'replaceChildren');
 *      }
 * }
 *
 * ###Using the widget
 *
 * <myWidget data-option="aNeededValue">
 *   <part id="header">
 *      <h1>This is my overriden header</h1>
 *   </part>
 * </myWidget>
 */
hx.bindingHandler('part', {
    tag: 'part',

    prepare: function(element, bindingContext) {
        var child, nextChild = element.firstChild;

        while (child = nextChild) {
            nextChild = child.nextSibling;

            if (child.nodeType === 1 && child.tagName.toLowerCase() === "part") {
                var id = child.id;

                if(id) {
                    // It's an anonymous template - store the element contents, then clear the element
                    var templateNodes = child.nodeType == 1 ? child.childNodes : ko.virtualElements.childNodes(element),
                        container = ko.utils.moveCleanedNodesToContainerElement(templateNodes); // This also removes the nodes from their current parent

                    new ko.templateSources.anonymousTemplate(container)['nodes'](container);
                    
                    bindingContext['$override-for-' + id] = container;
                }
            }
        }

        if (element.childNodes.length) {
            // It's an anonymous template - store the element contents, then clear the element
            var templateNodes = element.nodeType == 1 ? element.childNodes : ko.virtualElements.childNodes(element),
                container = ko.utils.moveCleanedNodesToContainerElement(templateNodes); // This also removes the nodes from their current parent

            new ko.templateSources.anonymousTemplate(container)['nodes'](container);
            
            bindingContext['$override-for-content'] = container;
        }
    },

    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var name = valueAccessor() === true ? element.id : valueAccessor(),
            overridingPartTemplate = bindingContext['$override-for-' + name];

        if (overridingPartTemplate) {
            ko.renderTemplate(overridingPartTemplate, bindingContext, {}, element, 'replaceNode');

            return { "controlsDescendantBindings" : true };
        }
    }
});