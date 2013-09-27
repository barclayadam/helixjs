/**
 * @bindingHandler expandable
 * @bindingHandlerTag expandable
 *
 * The expandable binding handler is used to show a panel that can have its visibility toggled
 * through the clicking of a header panel.
 *
 * The header area by default will just show a title (data-option="{ title: 'My Panel Title' }"), but
 * can be overriden by using a part with the ID 'header'
 *
 * @example
 *
 *  <expandable data-option="{ title: 'My Panel Title' }">
 *   <p>This is the content of the panel</p>
 *  </expandable>
 *
 *   =>
 *
 *  <expandable[div] class="expandable">
 *	  <header data-bind="click: toggle">
 *   	<span class=title data-bind="text: title">My Panel Title</span>
 *     </header>
 *   
 *     <div class=panel data-bind="visible: open">
 *       <p>This is the content of the panel</p>
 *     </div>
 *  </expandable>
 */
 hx.bindingHandler('expandable', '$templating', function($templating) {
    $templating.set('$hx-expandable',    	    	
    	'<header data-bind="click: toggle">' +
    	'  <part id=header>' + 
    	'    <span class=title data-bind="text: title"></span>' +
    	'  </part>' +
    	'</header>' +    	
    	'' +
    	'<div class=panel data-bind="visible: open">' +
    	'  <part id=content></part>' +
    	'</div>'
    	);

	function createModel(data) {
        return {
            title: data.title || '',

            open: data.open || ko.observable(false),

            toggle: function() {
            	this.open(!this.open());
            }
        }
    }

    return {
    	tag: 'expandable',

        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) { 
            var value = ko.utils.unwrapObservable(valueAccessor());

            ko.utils.toggleDomNodeCssClass(element, 'expandable', true);

            koBindingHandlers.part.prepare(element, bindingContext);
            ko.renderTemplate('$hx-expandable', bindingContext.createChildContext(createModel(value)), {}, element, 'replaceChildren');

            return { "controlsDescendantBindings" : true }
        }
    }
});