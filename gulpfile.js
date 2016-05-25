'use strict';

const gulp = require('gulp');
// To remove? const pug = require('gulp-pug');
const sass = require('gulp-sass');
var browserSync = require('browser-sync').create();

const sassSrc = './*.scss';
const dataSrc = 'src/data.txt';
const pugSrc = 'src/index.pug';
// const pugDest = 'dest'
// const pugOpts = {
//   pretty: true
// };

gulp.task('sass', () => {
  return gulp.src(sassSrc)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dest'))
    .pipe(browserSync.stream());
});

gulp.task('sass:watch', () => {
  gulp.watch(sassSrc, ['sass']);
});

gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: 'dests'
    }
  });
});

gulp.task('serve', ['sass'], () => {
  browserSync.init({
    server: 'dest'
  });

  gulp.watch(sassSrc, ['sass']);
  gulp.watch([dataSrc, pugSrc], ['pug']);
  gulp.watch('dest/*.html').on('change', browserSync.reload);
});


// gulp.task('pug', () => {
//   return gulp.src(pugSrc)
//     .pipe(pug(pugOpts))
//     .pipe(gulp.dest(pugDest));
// });

gulp.task('pug', () => {
  return require('./render')();
});

gulp.task('default', ['pug', 'serve']);