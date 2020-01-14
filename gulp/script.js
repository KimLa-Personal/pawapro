/**
 * スクリプトタスク
 * JSファイルをコンパイルして出力する
 */
var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    concat = require('gulp-concat'),
    named = require('vinyl-named');

/**
 * コンパイル開始
 * @returns {*}
 */
function exeWebPack() {
  return gulp.src(__CONFIG.path.jsconcat.src)
    .pipe(named())
    .pipe(plumber())
    .pipe(concat(__CONFIG.path.jsconcat.filename))
    //.pipe($.uglify()) //圧縮します
    .pipe(gulp.dest(__CONFIG.path.jsconcat.dest))
    .pipe($.browser.stream());
}

function exeScript() {
  return gulp.src(__CONFIG.path.js.src)
    .pipe(named())
    //.pipe($.uglify()) //圧縮します
    .pipe(gulp.dest(__CONFIG.path.js.dest))
    .pipe($.browser.stream());
}

function taskScript() {
  exeWebPack();
  exeScript();
  return;
}

/**
 * スクリプトコンパイルタスク
 */
gulp.task('script', function() {
  return taskScript();
});

/**
 * スクリプト監視タスク
 */
gulp.task('watchScript', function() {
  return taskScript();
});
