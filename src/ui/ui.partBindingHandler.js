/**
 # Overview

 A key component of any `HelixJS` application, the `part` binding handler
 is responsible for managing a section of a page, to provide simple
 lifecycle management for showing `parts`.

 A part is the lowest level of abstraction for view model and view rendering,
 providing only a small amount of functionality on the top of the `template`
 binding handler in `knockout`, as described in details below.

 A part is defined by a template (either named or anonymous) and a
 `view model`, a view model being defined as nothing more than a 
 simple object with optional methods and properties that can affect
 the rendering and hook in to simple lifecycle management.

 A part takes a single parameter, which is the `view model` that is to
 be shown. If this property is an observable that if that observable is
 updated the binding handler will `hide` the currently bound view model
 and bind the new one and (optionally) switch out the template.

 ## Part Manager Integration

 Typically an app will use a `part manager` to manage the parts within the
 system, to provide further semantics on top of a `part` binding handler to integrate
 with the routing system and provide features such as checking for the dirty
 state of parts and managing multiple parts within an application.

 ## Lifecycle

             ┌──────────────────────────────┐
 set part →  │ → show → afterShow → hide →  │  → part unset 
             └──────────────────────────────┘

 The lifecycle hooks that the `part` binding handler provides are very
 simple, providing no automatic management such as garbage collection or
 unregistering events, it is the responsibility of the `view model`
 itself to perform these actions, typically aided by using the `hx.ViewModel`
 class and associated methods to provide more structure for view models.

 The above diagram demonstrates the lifecycle methods that, if found on the
 `view model` will be invoked when this binding handler binds to it.

 Each method will be called in turn, as demonstrated above, with the following
 behaviours for each:

 * `beforeShow`: This function will be called before the template is bound / shown
    to the user. It is expected this is where most processing will occur, where
    data required for the view will be loaded. It is for this reason that this
    binding handler will wait until all AJAX requests have completed before
    continuining execution. This automatic listening of all AJAX requests relies on the
    `hx.ajax.listen` functionality, which means only AJAX requests executed through
    the `hx.ajax` methods will be listened to.

 * `show`: Once the `beforeShow` function has continued execution the template
    will be rendered, with the `view model` set as the data context. Once the
    template has been rendered by `knockout` the `show` function of the `view model`
    will be called.
*/
koBindingHandlers.part = {
    init: function (element, valueAccessor) {
        var templateValueAccessor, viewModel;
        viewModel = ko.utils.unwrapObservable(valueAccessor() || {});

        templateValueAccessor = function () {
            return {
                data: viewModel,
                name: viewModel.templateName
            };
        };

        return koBindingHandlers.template.init(element, templateValueAccessor);
    },

    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var deferred, lastViewModel;
        viewModel = ko.utils.unwrapObservable(valueAccessor());

        if (!(viewModel != null)) {
            return;
        }

        lastViewModel = ko.utils.domData.get(element, '__part__lastViewModel');

        if ((lastViewModel != null) && (lastViewModel.hide != null)) {
            lastViewModel.hide();
        }

        deferred = new $.Deferred();

        if (viewModel.show != null) {
            deferred = hx.ajax.listen(function () {
                viewModel.show();
            });
        } else {
            // Resolve immediately, nothing to wait for
            deferred.resolve();
        }

        deferred.done(function () {
            var templateValueAccessor = function () {
                return {
                    data: viewModel,
                    name: viewModel.templateName
                };
            };

            koBindingHandlers.template.update(element, templateValueAccessor, allBindingsAccessor, viewModel, bindingContext);

            if (viewModel.afterShow != null) {
                viewModel.afterShow();
            }

            ko.utils.domData.set(element, '__part__lastViewModel', viewModel);
        });
    }
};