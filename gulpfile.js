var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var shell = require("gulp-shell");
var reload      = browserSync.reload;


// static server
gulp.task('rt-coverage', function(){
    browserSync.init({
        server: {
            baseDir: "./coverage/lcov-report/"
        }
    });

    gulp.watch("test/*",['update-coverage']);
});

gulp.task('update-coverage', function(){
   console.log("reload");
   shell('npm run coverage');
    reload();
});



