var gulp = require('gulp');

var order = require('gulp-order');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var jasmine = require('gulp-jasmine');

var sass = require('gulp-sass');


gulp.task('scripts', function() {
    return gulp.src('src/js/*.js')
        .pipe(order([
            'src/js/brd.js',
            'src/js/*.js'
        ], {base: '.'}))
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('sass', function() {
    gulp.src('src/sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('src/sass/css'));
});

gulp.task('test', function() {
    return gulp.src('spec/*.js')
        .pipe(jasmine());
});

gulp.task('watch', function() {
    gulp.watch(['src/js/*.js', 'src/sass/*.scss'], ['scripts', 'sass', 'test']);
});

gulp.task('default', ['scripts', 'sass', 'test', 'watch']);