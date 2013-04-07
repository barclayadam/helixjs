(function() {
    hx.instantiate('$templating', function($templating) {
        $templating.set('$hx-pager',
            ' <!-- ko if: pageCount() > 0 -->' +
            '    <a href="#" class="hx-pager--first" data-bind="enable: !isFirstPage(), click: goToFirstPage">First</a>' +
            '    <a href="#" class="hx-pager--previous" data-bind="enable: !isFirstPage(), click: goToPreviousPage">Previous</a>' +
            '' +
            '    <ol class="hx-pager--pages" data-bind="foreach: pages">' +
            '        <li data-bind="click: $parent.page, css: { \'is-selected\': $data == $parent.page(), \'hx-pager--page\': true }"><a href="#" data-bind="text: $data"></a></li>' +
            '    </ol>' +
            '' +
            '    <a href="#" class="hx-pager--next" data-bind="enable: !isLastPage(), click: goToNextPage">Next</a>' +
            '    <a href="#" class="hx-pager--last" data-bind="enable: !isLastPage(), click: goToLastPage">Last</a>' +
            ' <!-- /ko -->'
        );
    });

    function createModel(data) {
        return {
            pageCount: data.pageCount,
            page: data.page,

            isFirstPage: ko.computed(function() {
                return data.page() === 1;
            }),

            isLastPage: ko.computed(function() {
                return data.page() === data.pageCount();
            }),

            goToFirstPage: function() { data.page(1); },
            goToPreviousPage: function() { data.page(data.page() - 1); },

            goToNextPage: function() { return data.page(data.page() + 1); },
            goToLastPage: function() { return data.page(data.pageCount()); },

            pages: ko.computed(function() {
                var pageCount = data.pageCount(),
                    pageNumber = data.page(),
                    maximumPages = data.maximumPages;

                if (pageCount > 0) {
                    var startPage = pageNumber - (maximumPages / 2);
                    startPage = Math.max(1, Math.min(pageCount - maximumPages + 1, startPage));

                    var endPage = Math.min(startPage + maximumPages, pageCount + 1);

                    return _.range(startPage, endPage);
                } else {
                  return [];
                }
            })
        }
    }

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
     *
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
    koBindingHandlers.pager = {
        tag: 'pager->div',

        init: function(element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            value.maximumPages = value.maximumPages || 10;

            ko.utils.toggleDomNodeCssClass(element, 'hx-pager', true);

            ko.computed(function() {
                ko.utils.toggleDomNodeCssClass(element, 'no-pages', value.pageCount() == 0);
            })

            ko.renderTemplate('$hx-pager', createModel(value), {}, element, 'replaceChildren');

            return { "controlsDescendantBindings" : true }
        }
    }
}());