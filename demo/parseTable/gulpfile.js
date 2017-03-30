
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;


// static server
gulp.task('browser-sync', function(){
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch("*").on("change", reload);
});