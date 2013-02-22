hx.provide('$validationBindingHandlers', hx.instantiate(['$router'], function($router) {

	koBindingHandlers.navigate = {
		init: function(element, valueAccessor, allBindingsAccessor) {
			var routeName = ko.utils.unwrapObservable(valueAccessor()),
				parameters = allBindingsAccessor()['parameters'];

			ko.utils.registerEventHandler(element, 'click', function(event) {
				$router.navigateTo(routeName, parameters);

				if (event.preventDefault)
                    event.preventDefault();
                else
                    event.returnValue = false;
			})
		},

		update: function(element, valueAccessor, allBindingsAccessor) {
			var routeName = ko.utils.unwrapObservable(valueAccessor()),
				parameters = allBindingsAccessor()['parameters'];
				url = $router.buildUrl(routeName, parameters);

			element.setAttribute('href', url);
		}
	}
}));