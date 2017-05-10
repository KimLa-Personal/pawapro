/**
 * スクリプトタスク
 * JSファイルをwebpackを使ってコンパイルして出力する
 */
var gulp = require('gulp'),
    // path = require('path'),
    webpack = require("gulp-webpack");
    // named = require('vinyl-named');
var conf = require('../webpack.config.js');

/**
 * webpackコンパイル開始
 * @param watch
 * @returns {*}
 */
function exeWebPack(watch) {
  conf.watch = watch;
  return gulp.src(__CONFIG.path.js.src)
    // .pipe(named())
    // .pipe(webpack(conf))
    // .pipe($.uglify()) //圧縮します
    .pipe(gulp.dest(__CONFIG.path.js.dest))
    .pipe($.browser.stream());
}

/**
 * スクリプトコンパイルタスク
 */
gulp.task('script', function() {
  return exeWebPack(false);
});

/**
 * スクリプト監視タスク
 */
gulp.task('watchScript', function() {
  return exeWebPack(true);
});
