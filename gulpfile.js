var gulp = require('gulp');
var glob = require("glob");
var path = require('path');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var tsify = require('tsify');
var resolve = require('resolve').sync;
var open = require("gulp-open");
var logger = require('./gulp/logger');

var configuration = {
    testSource: function() { return glob.sync('./tests/**/*.ts'); },

    testSourceBuilt: function() {
        return configuration.testSource().map(function(source) {
            return source.replace('.ts', '.spec.js').replace('/tests', '/build/tests');
        });
    },

    testRunner: './tests/runner.html',
    testServerPort: 4000,
    testLiveReloadPort: 4002
}

gulp.task('scripts', function () {
    var bundleStream = browserify()
        .add('./src/app.ts')
        .plugin('tsify', { noImplicitAny: true })
        .on('error', logger.onBrowserifyError)
        .bundle({ debug: true });

    return bundleStream
      .pipe(source('hx.js'))
      .pipe(gulp.dest('./build/'));
});

gulp.task('test-files', function () {
    var bundleStream = browserify({
            entries: configuration.testSource()
        })
        .plugin(tsify, { noImplicitAny: true })
        .on('error', logger.onBrowserifyError)
        .bundle({ debug: true });

    return bundleStream
      .pipe(source('hx.tests.js'))
      .pipe(gulp.dest('./build/'));
});

gulp.task('test-suite', ['test-files'], function() {
    var ui = 'bdd',
        reporter = 'html',
        compiled = configuration.testSourceBuilt();

    function mochaFile(filename) {
        return path.relative(__dirname,
            resolve('mocha/' + filename, { basedir: __dirname })
        );
    }

    var lines = [
        '<!doctype html>',
        '<html><head><meta charset="utf-8"></head>',
        ' <body>',
        ' <script src="../' + mochaFile('mocha.js') + '"></script>',
        ' <link rel=stylesheet href="../' + mochaFile('mocha.css') + '"></script>',
        ' <script>mocha.setup(' + JSON.stringify({ ui: ui, reporter: reporter }) + ')</script>',
        ' <script src="../build/tests/hx.tests.js"></script>',
        ' <div id=mocha></div>',
        ' <script>mocha.run()</script>',
        ' </body>',
        '</html>'
    ];

    return require('fs').writeFile(configuration.testRunner, lines.join('\n'));
});

gulp.task('express', function () {
    var express = require('express');
    var app = express();

    app.use(require('connect-livereload')({ port: configuration.testLiveReloadPort }));
    app.use(express.static(__dirname));
    app.listen(configuration.testServerPort);
});

var tinylr;

gulp.task('livereload', function () {
    tinylr = require('tiny-lr')();
    tinylr.listen(configuration.testLiveReloadPort);
});

function notifyLiveReload(event) {
    var fileName = require('path').relative(__dirname, event.path);

    tinylr.changed({
        body: {
            files: [fileName]
        }
    });
}

gulp.task('watch', function () {
    gulp.watch('tests/**/*.ts', ['test-suite']);
    gulp.watch('src/**/*.ts', ['test-suite']);

    gulp.watch(configuration.testRunner, notifyLiveReload);
});

gulp.task('open-test-runner', function () {
    var options = {
        url: "http://localhost:" + configuration.testServerPort + configuration.testRunner.substr(1),
    };

    return gulp.src(configuration.testRunner)
        .pipe(open("", options));
});

gulp.task('tests', ['test-suite', 'express', 'livereload', 'watch'/*, 'open-test-runner'*/]);