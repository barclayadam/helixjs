var path = require('path');
var gutil = require('gulp-util');

var ERROR_LEVELS = ['error', 'warning'];

// Return true if the given level is equal to or more severe than
// the configured fatality error level.
// If the fatalLevel is 'off', then this will always return false.
// Defaults the fatalLevel to 'error'.
function isFatal(level) {
    return ERROR_LEVELS.indexOf(level) <= ERROR_LEVELS.indexOf('error');
}

// Handle an error based on its severity level.
// Log all levels, and exit the process for fatal levels.
function handleError(level, error) {
    gutil.log(error);
}

// Convenience handler for error-level errors.
exports.onError = function(error) { handleError.call(this, 'error', error); };

// Convenience handler for warning-level errors.
exports.onWarning = function(error) { handleError.call(this, 'warning', error); };

exports.onBrowserifyError = function (error) {
    var errorStyle = gutil.colors.bold.red;

    // With a fileName we can assume this is a TypeScript error
    if (error.fileName) {
        gutil.log(errorStyle(path.relative('./', error.fileName) + ':' + error.line + ' ' + error.message));
    } else {
        gutil.log(errorStyle(error));
    }

    gutil.beep();

    this.emit('end');
};