/**
 * スタイルタスク
 * stylをコンパイルしてAutoprefixerをかける。プロダクションリリース時には圧縮する
 */
var gulp = require('gulp');
var _ = require('lodash');
var jsonminify = require('gulp-jsonminify');
var minifyHTML = require('gulp-minify-html');

module.exports = function () {
  gulp.task('minify:img', function() {
    return gulp.src(path.tmp+'/img/**/*')
      .pipe($.size({title: 'images:before'}))
      .pipe($.imagemin({
        progressive: true
      }))
      .pipe(gulp.dest(path.dist+'/img/'))
      .pipe($.size({title: 'images:after'}));
  });

  gulp.task('minify:js', function() {
    return gulp.src(path.tmp+'/js/*.js')
      .pipe($.uglify({
        preserveComments: saveLicense
      }))
      .pipe(gulp.dest(path.dist+'/js/'));
  });

  gulp.task('minify:json', function () {
    return gulp.src(path.tmp+'/json/*.json')
      .pipe(jsonminify())
      .pipe(gulp.dest(path.dist+'/json/'));
  });

  gulp.task('minify:html', function() {
    var opts = {
      conditionals: true,
      spare:true
    };
    return gulp.src([
        path.tmp+'/*.html',
        path.tmp+'/**/*.html'
      ])
      .pipe(minifyHTML(opts))
      .pipe(gulp.dest(path.dist+'/'));
  });

  gulp.task('minify:css', function() {
    return gulp.src(path.tmp+'/css/**/*.css')
      .pipe($.pleeease())
      .pipe(gulp.dest(path.dist+'/css/'));
  });
}();
