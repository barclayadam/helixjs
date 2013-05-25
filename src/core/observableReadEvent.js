(function() {
    /**
     * Overrides the dependency detection mechanism to provide a means
     * of raising a 'read' event on observables so that it is possible
     * to intercept reads to keep off another process, such as loading
     * the 'real' value from a server, or doing some expensive calculations.
     *
     * By deferring this work an observable can be created immediately and then
     * filled in only when actually read.
     */
    var koRegisterDependency = ko.dependencyDetection.registerDependency;

    ko.dependencyDetection.registerDependency = function(subscribable) {
        subscribable.notifySubscribers(subscribable, 'read');

        koRegisterDependency(subscribable);
    }
}());