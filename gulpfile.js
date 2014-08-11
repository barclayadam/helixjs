var gulp = require('gulp');
var glob = require("glob");
var path = require('path');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var factor = require('factor-bundle');
var tsify = require('tsify');

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
function onError(error) { handleError.call(this, 'error', error); }

// Convenience handler for warning-level errors.
function onWarning(error) { handleError.call(this, 'warning', error); }

function onBrowserifyError(error) {
    // With a fileName we can assume this is a TypeScript error
    if (error.fileName) {
        gutil.log(path.relative(__DIRNAME, error.fileName) + ':' + error.line + ' ' + error.message);
    } else {
        gutil.log(error);
    }

    process.exit(1);
}

// Basic usage
gulp.task('scripts', function () {
    var bundleStream = browserify()
        .add('./src/app.ts')
        .plugin('tsify', { noImplicitAny: true })
        .on('error', onBrowserifyError)
        .bundle({ debug: true });

    // Single entry point to browserify
    return bundleStream
      .pipe(source('hx.js'))
      .pipe(gulp.dest('./build/'));
});

// Basic usage
gulp.task('tests', function () {
    var tests = glob.sync('./tests/**/*.ts'),
        bundleStream = browserify({
            entries: tests
        })
        .plugin(tsify, { noImplicitAny: true })
        .plugin(factor, {
            o: tests.map(function (source) {
                return source.replace('.ts', '.spec.js').replace('/tests', '/build/tests');
            })
        })
        .on('error', onBrowserifyError)
        .bundle({ debug: true });

    // Single entry point to browserify
    return bundleStream
      .pipe(source('hx.tests.deps.js'))
      .pipe(gulp.dest('./build/tests'));
});