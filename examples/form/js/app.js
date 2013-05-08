hx.config(['$log'],  function( $log) { $log.enabled = true; });

hx.provide('eventsEditor', ['$ajax'], function($ajax) {
	function TrainingEvent(data) {
		this.EventCode = ko.observable(data.EventCode).addValidationRules({ required: true });
		this.EventType = ko.observable(data.EventType).addValidationRules({ required: true });
		this.Title = ko.observable(data.Title).addValidationRules({ required: true });
		this.Overview = ko.observable(data.Overview).addValidationRules({ required: true });
		this.CourseLengthDays = ko.observable(data.CourseLengthDays).addValidationRules({ required: true });
		this.TotalPlaces = ko.observable(data.TotalPlaces).addValidationRules({ required: true });
		this.PriceExVat = ko.observable(data.PriceExVat);
		this.Instances = ko.observable(_.map(data.Instances, function(i) { return new TrainingEventInstance(i); }));
		this.WhoShouldAttend = ko.observable(data.WhoShouldAttend);
		this.PreRequisites = ko.observable(data.PreRequisites);
		this.MaterialCovered = ko.observable(data.MaterialCovered);
		this.Partner = ko.observable(data.Partner);
		this.Technologies = ko.observable(data.Technologies).addValidationRules({ required: true });
		this.Tags = ko.observable(data.Tags).addValidationRules({ required: true });

		this.expanded = ko.observable(false);

		this.toggleExpansion = function() {
			this.expanded(!this.expanded());
		}
	}

	function TrainingEventInstance(data) {
		this.StartDate = ko.observable(data.StartDate).addValidationRules({ required: true });
		this.Location = ko.observable(data.Location).addValidationRules({ required: true });
		this.PlacesLeft = ko.observable(data.PlacesLeft).addValidationRules({ required: true });
		this.RegistrationUrl = ko.observable(data.RegistrationUrl);
		this.PartnerEventId = ko.observable(data.PartnerEventId);
	}

    return { 
    	save: function() {
    		this.validate();
    	},

        show: function() {
        	$ajax.url('/examples/form/data/events.json').get().done(function(loadedEvents) {
        		this.events = _.map(loadedEvents, function(e) { return new TrainingEvent(e); });
        	}.bind(this));

           hx.validation.mixin(this);
        }
    };
});