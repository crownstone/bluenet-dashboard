var argv = require('yargs').argv;
var gulp = require('gulp');
var fs = require('fs');
var gutil = require('gulp-util');
var rimraf = require('rimraf');
var webpack = require('webpack');
var uglify = require('uglify-js');
const notifier = require('node-notifier');

var filenameData = {
  distFolder: '/dist',
  bundleName: 'bluenetDashboard.js',
  bundleNameMin: 'bluenetDashboard.min.js',
  bundleNameMap: 'bluenetDashboard.map',
}

module.exports = filenameData;

var webpackConfig = require('./webpack.config');
var uglifyConfig = {
  outSourceMap: filenameData.bundleNameMap,
  output: {
    comments: /@license/
  }
};


var compiler = webpack(webpackConfig);


function handleCompilerCallback (err, stats) {
  if (err) {
    console.log("ERROR", err.toString())
    gutil.log('ERROR:',err.toString());
  }

  if (stats && stats.compilation && stats.compilation.errors) {
    // output soft errors
    stats.compilation.errors.forEach(function (err) {
      // gutil.log(err.toString());
      console.log(err.message)
    });

    if (err || stats.compilation.errors.length > 0) {
      err = err || stats.compilation.errors[0];
      notifier.notify({
        'title': 'Error:' + (err.file || err.module.rawRequest) + ' (l: ' + (err && err.location && err.location.line) + ', c: ' + (err && err.location && err.location.character) + ')',
        'message': err.rawMessage
      });
      console.log('Error:' + (err.file || err.module.rawRequest) + ' (l: ' + (err && err.location && err.location.line) + ', c: ' + (err && err.location && err.location.character) + ')', err.rawMessage);
      gutil.beep()
    }
  }
}

gulp.task('bundle', function(callback) {
  // place code for your default task here

  compiler.run(function (err, stats) {
    handleCompilerCallback(err, stats);
    callback();
  });
});

// clean the dist/img directory
gulp.task('clean', function (callback) {
  rimraf(filenameData.distFolder, callback);
});

gulp.task('minify', ['bundle'], function (callback) {
  var result = uglify.minify(['.' + filenameData.distFolder + '/' + filenameData.bundleName], uglifyConfig);

  // note: we add a newline '\n' to the end of the minified file to prevent
  //       any issues when concatenating the file downstream (the file ends
  //       with a comment).
  fs.writeFileSync('.' + filenameData.distFolder + '/' + filenameData.bundleNameMin, result.code + '\n');
  fs.writeFileSync('.' + filenameData.distFolder + '/' + filenameData.bundleNameMap, result.map.replace(/"\.\/dist\//g, '"'));

  callback();
});


// read command line arguments --bundle and --minify
var bundle = 'bundle' in argv;
var minify = 'minify' in argv;
var watchTasks = [];
if (bundle || minify) {
  // do bundling and/or minifying only when specified on the command line
  watchTasks = [];
  if (bundle) watchTasks.push('bundle');
  if (minify) watchTasks.push('minify');
}
else {
  // by default, do both bundling and minifying
  watchTasks = ['bundle', 'minify'];
}

gulp.task('watch', watchTasks, function () {
  gulp.watch(['./src/**/*'], watchTasks);
});