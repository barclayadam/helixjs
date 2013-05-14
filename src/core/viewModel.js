var __hasProp = {}.hasOwnProperty;

hx.ViewModel = {
  extend: function(definition) {
    var key, value, viewModel;
    viewModel = function() {};

    for (key in definition) {
      if (!__hasProp.call(definition, key)) continue;
      value = definition[key];
      if (!_.isFunction(value)) {
        viewModel.prototype[key] = value;
      }
    }

    return viewModel;
  }
};

/**

 ** View Model Lifecycle **

         ┌──────────────────────────────┐
 init →  │ → beforeShow → show → hide ↓ │ → destroy
         │ ↑  ←  ←  ←  ←  ←  ←  ←  ←  ← │
         └──────────────────────────────┘
contactUs = hx.ViewModel.create
    template: 'e:Contact Us' 

    # The very first time this view model is accessed. Should
    # be used to set-up any one-time data.
    init: () ->

    # When this view model is shown, executed
    # every time the view model is to be shown to the
    # user after having been disposed / deactivated / hidden.
    #
    # Any promises returned from this method will have to be
    # executed before the view this view model represents is
    # actually shown to the user, to avoid the flash of
    # content being shown, followed by further loading screens to
    # load data required by this view model.
    beforeShow: (parameters) ->

    # Once this view model has been shown this method is called,
    # to allow further work to be performed that does not
    # need to be done before actually showing this view to the user.
    #
    # This method will be called once all work of the beforeShow method
    # has been completed and the view has been bound to the view model.
    show: (parameters) ->

    # Called when the view this view model is bound to is being hidden from
    # the user, used to dispose of resources this view model may be holding
    # on to which are no longer required.
    #
    # Note that a hidden view may be shown once again in the future, starting
    # the lifecycle from the `beforeShow` method.
    hide: ->

    # Called when this view model should be completely destroyed, such
    # that it will never be shown again to the user (a different view model
    # instance will need to be recreated to use the view model again).
    destroy: ->

$router
    .route('View User', '/Users/{userId}/View', -> $app.show(viewUser))
    .route('Edit User', '/Users/{userId}/Edit', -> $app.show(editUser))
    .route('Edit User', '/Users/{userId}/Edit', function() {
       $regionManager.show(ViewUserViewModel);
       // OR: $regionManager.show([{ viewModel: ViewUserViewModel, region: 'main' }, ...], params);
     });

 We want to register in to the sitemap. This puts a /Users/View element
 that will, when clicked, navigate to the 'View User' route. Sitemap
 would listen for routeNavigated events for determining current
 route being shown for breadcrumb purposes.

$sitemap
    .register '/Users/View', 'View User'
    .register '/Users/Edit', 'Edit User'
*/