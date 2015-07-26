var gulp = require('gulp');

var order = require('gulp-order');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

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

gulp.task('watch', function() {
    gulp.watch('src/js/*.js', ['scripts']);
});

gulp.task('default', ['scripts', 'watch']);