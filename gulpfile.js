var gulp = require('gulp');
var runSequence = require('run-sequence');

// gulpディレクトリのタスク読み込み
var tasks = require('./gulp/load');
global.__CONFIG = tasks.config;
global.__IS_PRODUCTION = false;
global.$ = tasks.plugins;

/**
 * watch
 */
gulp.task('watch', function () {
    gulp.watch(__CONFIG.path.ejs.watch, ['ejs']);
    gulp.watch(__CONFIG.path.html.src, ['html']);
    gulp.watch(__CONFIG.path.style.watch, ['style']);
    gulp.watch(__CONFIG.path.js.watch, ['script']);

    var copyWatches = [];
    // 複製タスクはループで回して監視対象とする
    if (__CONFIG.path.copy) {
        __CONFIG.path.copy.forEach(function(src) {
            copyWatches.push(src.from);
        });
        gulp.watch(copyWatches, ['copy']);
    }
});

/**
 * build
 */
gulp.task('build', function (callback) {
  return runSequence(['ejs', 'style', 'script', 'copy'], callback);
});

/**
 * dist
 */
gulp.task('dist',function (callback) {
  global.__IS_PRODUCTION = true;
  return runSequence('build', callback);
});

/**
 * default
 */
gulp.task('default', ['clean'], function () {
  return runSequence('build', 'server', 'watch');
});
