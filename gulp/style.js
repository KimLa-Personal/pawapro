/**
 * スタイルタスク
 * stylをコンパイルしてAutoprefixerをかける。プロダクションリリース時には圧縮する
 */
var gulp = require('gulp');
var _ = require('lodash');
var nib = require('nib');

module.exports = function () {
  gulp.task('style', function() {
    return gulp.src(__CONFIG.path.style.src)
      .pipe($.plumber({errorHandler: $.notify.onError('<%= error.message %>')}))
      .pipe($.stylus({
        use: nib()
      }))
      .pipe($.pleeease({
        fallbacks: {autoprefixer: ['last 4 versions']},
        minifier: false
      }))
      .pipe(gulp.dest(__CONFIG.path.style.dest))
      .pipe($.browser.stream());
  });
}();
