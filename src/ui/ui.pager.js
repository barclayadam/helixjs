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
    },

    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var name = valueAccessor(),
            overridingPartTemplate = bindingContext['$override-for-' + name];

        if (overridingPartTemplate) {
            ko.renderTemplate(overridingPartTemplate, bindingContext, {}, element, 'replaceNode');

            return { "controlsDescendantBindings" : true };
        }
    }
});


/**
 * @bindingHandler pager
 * @bindingHandlerTag pager->div
 *
 * The pager binding handler is used to provide a number of links that allows navigating
 * through a data source that has been paged.
 *
 * Given `pageCount` and `page` observables as parameters to the binding handler first, previous,
 * next and last links are provided, as are a number of direct page links (up to a specified
 * `maximumPages` value).
 *
 * @example
 *
 *  <pager data-option="{ page: pageObservable, pageCount: pageCountObservable, maximumPages: 5 }" />
 *
 *   =>
 *
 *  <div class="hx-pager">
 *    <a href="#" class="hx-pager--first">First</a>
 *    <a href="#" class="hx-pager--previous">Previous</a>

 *    <ol class="hx-pager--pages">' +
 *      <li class="hx-pager--page is-selected"><a href="#">1</a></li>
 *      <li class="hx-pager--page"><a href="#">2</a></li>
 *      <li class="hx-pager--page"><a href="#">3</a></li>
 *      <li class="hx-pager--page"><a href="#">4</a></li>
 *      <li class="hx-pager--page"><a href="#">5</a></li>
 *    </ol>
 *
 *    <a href="#" class="hx-pager--next">Next</a>
 *    <a href="#" class="hx-pager--last">Last</a>
 *  </div>
 */
hx.bindingHandler('pager', '$templating', function($templating) {
    $templating.set('$hx-pager',
        ' <!-- ko if: pageCount() > 0 -->' +
        '   <ol class="hx-pager--pages">' +
        '     <part data-option="\'backward-links\'">' +
        '      <li class="hx-pager--page hx-pager--first" data-bind="css: { disabled: isFirstPage() }, click: firstPage"><a href="#">&laquo;</a></li>' +
        '      <li class="hx-pager--page hx-pager--previous" data-bind="css: { disabled: isFirstPage() }, click: previousPage"><a href="#">&lsaquo;</a></li>' +
        '     </part>' +
        '' +
        '     <part data-option="\'page-links\'">' +
        '       <!-- ko foreach: pages -->' +
        '         <li class="hx-pager--page" data-bind="click: $parent.page, css: { \'is-selected\': $data == $parent.page() }"><a href="#" data-bind="text: $data"></a></li>' +
        '       <!-- /ko -->' +
        '     </part>' +
        '' +
        '     <part data-option="\'forward-links\'">' +
        '      <li class="hx-pager--page"  class="hx-pager--next" data-bind="css: { disabled: isLastPage() }, click: nextPage"><a href="#">&rsaquo;</a></li>' +
        '      <li class="hx-pager--page"  class="hx-pager--last" data-bind="css: { disabled: isLastPage() }, click: lastPage"><a href="#">&raquo;</a></li>' +
        '     </part>' +
        '   </ol>' +
        ' <!-- /ko -->'
    );


    function createModel(data) {
        return {
            pageCount: ko.computed({ 
                read: function() { return data.pageCount(); },

                write: function(value) { data.pageCount(value); }
            }),

            page: ko.computed({ 
                read: function() { return data.page(); },

                write: function(value) { data.page(value); }
            }),

            isFirstPage: ko.computed(function() {
                return data.page() === 1;
            }),

            isLastPage: ko.computed(function() {
                return data.page() === data.pageCount();
            }),

            firstPage: function() { data.page(1); },
            previousPage: function() { data.page(data.page() - 1); },

            nextPage: function() { return data.page(data.page() + 1); },
            lastPage: function() { return data.page(data.pageCount()); },

            pages: ko.computed(function() {
                var pageCount = data.pageCount(),
                    pageNumber = data.page(),
                    maximumPages = data.maximumPages,
                    startPage, endPage;

                if (pageCount === undefined || pageNumber === undefined) {
                    return [];
                }

                startPage = pageNumber - (maximumPages / 2);
                startPage = Math.max(1, Math.min(pageCount - maximumPages + 1, startPage));

                endPage = Math.min(startPage + maximumPages, pageCount + 1);

                return _.range(startPage, endPage);
            })
        }
    }
    
    return {
        tag: 'pager',

        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            value.maximumPages = value.maximumPages || 10;

            ko.utils.toggleDomNodeCssClass(element, 'hx-pager', true);

            ko.computed(function() {
                ko.utils.toggleDomNodeCssClass(element, 'no-pages', value.pageCount() == 0);
            })

            koBindingHandlers.part.prepare(element, bindingContext);

            ko.renderTemplate('$hx-pager', bindingContext.createChildContext(createModel(value)), {}, element, 'replaceChildren');

            return { "controlsDescendantBindings" : true }
        }
    }
});