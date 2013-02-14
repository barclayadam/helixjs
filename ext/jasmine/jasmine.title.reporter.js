// Original: https://github.com/andrewtimberlake/jasmine-document-title-reporter/blob/master/passed.ico

var DocumentTitleReporter = function() {
    var self = this,
        passed = 0;
    
    var updateTitle = function(text) {
		document.title = text;
    }

    var setShortcutIcon = function(icon) {
		var head = document.getElementsByTagName('head')[0],
			linkTag = document.createElement('link');

		linkTag.setAttribute('rel', 'shortcut icon');
		linkTag.setAttribute('type', 'image/x-icon');
		linkTag.setAttribute('href', '/ext/jasmine/' + icon + '.ico');
		head.appendChild(linkTag);
    }

    self.reportRunnerStarting = function(runner) {
		updateTitle("Running... ");
    }

    self.reportRunnerResults = function(runner) {
		var results = runner.results();

		if(results.failedCount == 0) {
		    setShortcutIcon('passed');
		    updateTitle(passed + " passes");
		} else {
		    setShortcutIcon('failed');
		    updateTitle(results.failedCount + ' failures');
		}
    }

    self.reportSpecResults = function(spec) {
		var results = spec.results();

		if(results.failedCount == 0) {
		    passed++;
		}
    }
}

jasmine.getEnv().addReporter(new DocumentTitleReporter())