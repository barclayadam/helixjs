var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream')
var browserify = require('browserify');
var es6Transform = require('./gulp/es6-transform');

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

    if (isFatal(level)) {
        process.exit(1);
    }
}
 
// Convenience handler for error-level errors.
function onError(error) { handleError.call(this, 'error', error);}

// Convenience handler for warning-level errors.
function onWarning(error) { handleError.call(this, 'warning', error);}

// Basic usage
gulp.task('scripts', function() {
    var bundleStream = browserify()
                .transform(es6Transform.configure(/^(?!.*node_modules)+.+\.js$/))
                .require(require.resolve('./src/app.js'), { entry: true })
                .bundle({ debug: true })

    // Single entry point to browserify
    return bundleStream
      .on('error', onError)
      .pipe(source('hx.js'))
      .pipe(gulp.dest('./build/'));
});

// Basic usage
gulp.task('tests', function() {
    var bundleStream = browserify()
                .transform(es6Transform.configure(/^(?!.*node_modules)+.+\.js$/))
                .require(require.resolve('./test/app.tests.js'), { entry: true })
                .bundle({ debug: true })

    // Single entry point to browserify
    return bundleStream
      .on('error', onError)
      .pipe(source('hx.tests.js'))
      .pipe(gulp.dest('./build/'));
});