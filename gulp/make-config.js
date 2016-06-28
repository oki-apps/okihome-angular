'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var gulpNgConfig = require('gulp-ng-config');

var browserSync = require('browser-sync');

var $ = require('gulp-load-plugins')();


gulp.task('makecfg-reload', function() {
  return makeConfig()
    .pipe(browserSync.stream());
});

gulp.task('makecfg', function() {
  return makeConfig();
});

function makeConfig() {
  return gulp.src('okihome-config.json')
    .pipe(gulpNgConfig('okihome',{
      createModule: false, 
      wrap: true, 
      pretty: true, 
      environment: conf.env}))
    .pipe(gulp.dest(path.join(conf.paths.src, '/app/')));
};
